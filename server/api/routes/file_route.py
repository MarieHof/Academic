from subprocess import CREATE_NEW_CONSOLE
from flask import Blueprint, jsonify, request
from api.database.file import PdfFile, file_schema, files_schema
from flask_jwt_extended import decode_token
from api.routes.auth import permission_needed
from flask import current_app
import os
from werkzeug.utils import secure_filename
from PyPDF2 import PdfReader
from nltk.util import ngrams



def compare_ngrams(trigrams1, trigrams2):
    trigrams1 = list(trigrams1)
    trigrams2 = list(trigrams2)
    common=[]
    # gram is a list of one tuple [(,,...)]
    for gram in trigrams1:
        if gram in trigrams2:
            common.append(gram)
    return common

bp = Blueprint('file', __name__, url_prefix='/api')


@bp.route('/plagiarism', methods=['POST'])
@permission_needed
def get_file(): 
    """
    example: POST: host/api/plagiarism
    """
    access_token = request.headers.get('Authorization')

    if not request.is_json:
        return jsonify(message='Request did not contain valid JSON'), 400

    editor_content = request.get_json()
   

    if editor_content:
        if 'text' in editor_content: 
            content = editor_content['text']
        if 'ngram' in editor_content: 
            ngram = editor_content['ngram']
    print('editor_content:')
    print(content)
    print('#####################################')
    decoded_token = decode_token(access_token)
    author_id = decoded_token['sub']

#---------------------------------------------------------------------------------
   
    all_files = PdfFile.get_all(user_id=author_id)
    #for each file from all files
    #get full path for the file using below
    #full path = os.path.join(current_app.config['UPLOAD_FOLDER'], file.name)
    # read file content
    files_content = []
    if all_files:
        for file in all_files:
            path = os.path.join(current_app.config['UPLOAD_FOLDER'], file.name)
            reader = PdfReader(path)
            files_content.append({
                'fileName': file.name,
                'content' : ''.join([page.extract_text() for page in reader.pages])
            })
    
    # files_content contain all content from all pages from all files as list of string
    print(files_content)
  
    # detect plagiarism code here
    common = []
    for item in files_content: 
        trigrams1 = ngrams(content.lower().split(), ngram)
        trigrams2 = ngrams(item['content'].lower().split(), ngram)
        match_list = compare_ngrams(trigrams1, trigrams2)
        for match in match_list: 
            common.append({
            'match': ' '.join(match),
            'fileName': item['fileName']
            })
    
    return jsonify(plagiarism = common), 200




@bp.route('/file', methods=['POST'])
@permission_needed
def add_file():
    """
    example: POST: host/api/file
    """


    access_token = request.headers.get('Authorization')



    if 'file' not in request.files:
            return jsonify(message='No file part'), 400
    file = request.files['file']
    if file.filename == '':
            return jsonify(message='No selected file'), 400


    if file and allowed_file(file.filename):
                decoded_token = decode_token(access_token)
                author_id = decoded_token['sub']
                filename = secure_filename(file.filename)
                file.save(os.path.join(current_app.config['UPLOAD_FOLDER'], filename))

                file, errors = file_schema.load({'author_id':str(author_id), 'name': str(filename)})
                if errors:
                    return jsonify(errors), 400



                if author_id != file.author_id:
                    return jsonify(message='No authorization'), 401

                file.save()

                return jsonify(message='File has been uploaded successfully'), 200

    return jsonify(message='No file detected'), 400


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']
