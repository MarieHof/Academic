from flask import Blueprint, jsonify, request
from api.database.deadline import Deadline,deadline_schema,deadlines_schema
from flask_jwt_extended import decode_token
from api.routes.auth import permission_needed


bp = Blueprint('deadline', __name__, url_prefix='/api')


@bp.route('/deadline', methods=['GET'])
@permission_needed
def get_deadline():
    """
    example: GET: host/api/deadline?id=1
    """

    id = request.args.get('id', default=None, type=int)
    date = request.args.get('date', default=None, type=int)
    access_token = request.headers.get('Authorization')

    decoded_token = decode_token(access_token)
    author_id = decoded_token['sub']
    if id:

        deadline = Deadline.query.get(id)
        if not deadline:
            return jsonify(message='Deadline could not be found'), 400


        return deadline_schema.jsonify(deadline), 200

    if date:
       week_deadlines = Deadline.get_by_date()
       result = deadlines_schema.dump(week_deadlines)
       return jsonify(result.data), 200

    all_deadline = Deadline.get_all(user_id=author_id)
    result = deadlines_schema.dump(all_deadline)
    return jsonify(result.data), 200




@bp.route('/deadline', methods=['POST'])
@permission_needed
def add_deadline():
    """
    example: POST: host/api/deadline
    """

    access_token = request.headers.get('Authorization')

    if not request.is_json:
        return jsonify(message='Request did not contain valid JSON'), 400

    deadline, errors = deadline_schema.load(request.get_json())
    if errors:
        return jsonify(errors), 400

    decoded_token = decode_token(access_token)
    author_id = decoded_token['sub']

    if author_id != deadline.author_id:
        return jsonify(message='No Authorization'), 401

    deadline.save()


    return deadline_schema.jsonify(deadline), 200


@bp.route('/deadline', methods=['PUT'])
def deadline_update():
    """
    example: PUT: host/api/deadline?id=1
    """

    id = request.args.get('id', default=None, type=int)
    access_token = request.headers.get('Authorization')
    deadline = Deadline.query.get(id)


    if not deadline:
        return jsonify(message='Deadline was not found'), 400

    data = request.get_json()
    data.pop('id', None)
    errors = deadline_schema.validate(data, partial=True)

    if errors:
        return jsonify(errors), 400

    decoded_token = decode_token(access_token)
    author_id = decoded_token['sub']

    if author_id != deadline.author_id:
         return jsonify(message='No Authorization'), 401

    deadline.update(**data)

    return jsonify(message='Deadline was successfully updated'), 200


@bp.route('/deadline', methods=['DELETE'])
def deadline_delete():
    """
    example: DELETE: host/api/deadline?id=1
    """

    id = request.args.get('id', default=None, type=int)
    access_token = request.headers.get('Authorization')

    deadline = Deadline.query.get(id)

    if not deadline:
        return jsonify(message='Deadline was not found'), 400

    decoded_token = decode_token(access_token)
    print(" decoded_token .. delete" , (decoded_token))
    author_id = decoded_token['sub']

    if author_id != deadline.author_id:
        return jsonify(message='No Authorization'), 401

    deadline.delete()

    return jsonify(message='Deadline has been successfully removed'), 200
