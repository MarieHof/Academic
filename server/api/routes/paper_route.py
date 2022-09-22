from flask import Blueprint, jsonify, request
from api.database.paper import Paper, papers_schema, paper_schema
from flask_jwt_extended import decode_token
from api.routes.auth import permission_needed


bp = Blueprint('paper', __name__, url_prefix='/api')


@bp.route('/paper', methods=['GET'])
@permission_needed
def get_paper():
    """
    example: GET: host/api/paper?id=1 or with category_id
    """

    id = request.args.get('id', default=None, type=int)
    category_id = request.args.get('category_id', default=None, type=int)

    if id:

        paper = Paper.query.get(id)
        if not paper:
            return jsonify(message='Paper could not be found'), 400


        return paper_schema.jsonify(paper), 200

    if category_id:
        all_paper = Paper.get_all(category_id=category_id)
        result = papers_schema.dump(all_paper)
        return jsonify(result.data), 200

    return jsonify(message='No paper'), 200



@bp.route('/paper', methods=['POST'])
@permission_needed
def add_paper():
    """
    example: POST: host/api/paper
    """

    access_token = request.headers.get('Authorization')

    if not request.is_json:
        return jsonify(message='Request did not contain valid JSON'), 400

    paper, errors = paper_schema.load(request.get_json())
    if errors:
        return jsonify(errors), 400

    decoded_token = decode_token(access_token)
    author_id = decoded_token['sub']

    # if author_id != paper.category.author_id:
    #     return jsonify(message='Keine Berechtigung'), 401

    paper.save()

    result = paper_schema.dump(paper)
    return jsonify(result.data), 200


@bp.route('/paper', methods=['PUT'])
def paper_update():
    """
    example: PUT: host/api/paper?id=1
    """

    id = request.args.get('id', default=None, type=int)
    access_token = request.headers.get('Authorization')
    paper = Paper.query.get(id)


    if not paper:
        return jsonify(message='Paper Not found'), 400

    data = request.get_json()
    data.pop('id', None)
    errors = paper_schema.validate(data, partial=True)

    if errors:
        return jsonify(errors), 400

    decoded_token = decode_token(access_token)
    print(" decoded_token .. update" , (decoded_token))
    author_id = decoded_token['sub']

    # if author_id != paper.category.author_id:
    #      return jsonify(message='Keine Berechtigung'), 401

    paper.update(**data)

    result = paper_schema.dump(paper)
    return jsonify(result.data), 200


@bp.route('/paper', methods=['DELETE'])
def paper_delete():
    """
    example: DELETE: host/api/paper?id=1
    """

    id = request.args.get('id', default=None, type=int)
    access_token = request.headers.get('Authorization')

    paper = Paper.query.get(id)

    if not paper:
        return jsonify(message='Paper not found'), 400

    decoded_token = decode_token(access_token)
    print(" decoded_token .. delete" , (decoded_token))
    author_id = decoded_token['sub']

    # if author_id != paper.category.author_id:
    #     return jsonify(message='Keine Berechtigung'), 401

    paper.delete()

    return jsonify(message='Paper has been removed successfully'), 200
