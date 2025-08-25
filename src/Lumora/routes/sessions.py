from flask import Blueprint, request, jsonify
from models import db, StudySession

sessions_bp = Blueprint('sessions', __name__)

@sessions_bp.route('/', methods=['POST'])
def create_session():
    data = request.json
    session = StudySession(subject=data['subject'], spot_id=data['spot_id'], user_id=data['user_id'], joined_users=[data['user_id']])
    db.session.add(session)
    db.session.commit()
    return jsonify({'message': 'Session created', 'session_id': session.id})

@sessions_bp.route('/join', methods=['POST'])
def join_session():
    data = request.json
    session = StudySession.query.get(data['session_id'])
    if session:
        session.joined_users.append(data['user_id'])
        db.session.commit()
        return jsonify({'message': 'Joined session'})
    return jsonify({'message': 'Session not found'}), 404
