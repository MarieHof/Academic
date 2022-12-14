from api import db
from sqlalchemy import func


class Token(db.Model):
    __tablename__ = 'tokens'
    token = db.Column(db.String(), primary_key=True, nullable=False)
    user_id = db.Column(db.Integer(), db.ForeignKey('users.id'), nullable=False)
    activated = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def __init__(self, token, user_id):
        self.token = token
        self.user_id = user_id

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def __repr__(self):
        return '{}: {}'.format(self.token, self.user_id)
