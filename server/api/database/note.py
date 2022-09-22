from api import db, ma
from marshmallow import post_load
from sqlalchemy import func

class Note(db.Model):
    __tablename__ = 'notes'

    id = db.Column(db.Integer(), primary_key=True, nullable=False)
    author_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    content = db.Column(db.Text(), nullable=True)
    created = db.Column(db.DateTime(timezone=True), server_default=func.now(), nullable=False)

    def __init__(self, author_id, content):
        self.author_id = author_id
        self.content = content


    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)
        db.session.commit()

    @staticmethod
    def get_all(user_id):
        return Note.query.filter_by(author_id=user_id).all()

    def __repr__(self):
        return 'Note: {}'.format(self.content)


class NoteSchema(ma.Schema):
    id = ma.Integer(required=False, dump_only=True)
    author_id = ma.Integer(required=True)
    content = ma.String(required=True)
    created = ma.DateTime(required=False, dump_only=True)

    @post_load
    def load_note(self, data, **kwargs):
        return Note(**data)


note_schema = NoteSchema(many=False)
notes_schema = NoteSchema(many=True)
