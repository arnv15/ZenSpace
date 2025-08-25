from app import app
from db import db
from models import User, StudySession, Spot
from utils.ai_utils import match_study_sessions, categorize_spot

with app.app_context():
    # Add sample users and study sessions
    db.create_all()
    user1 = User(username='alice', password='pass', preferences={'subjects': ['AP Calculus']})
    user2 = User(username='bob', password='pass', preferences={'subjects': ['AP Calculus', 'Physics']})
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()

    session1 = StudySession(subject='AP Calculus', spot_id=None, user_id=user1.id, joined_users=[user1.id])
    session2 = StudySession(subject='Physics', spot_id=None, user_id=user2.id, joined_users=[user2.id])
    db.session.add(session1)
    db.session.add(session2)
    db.session.commit()

    # Test study session matching
    user_input = {
        'subject': 'AP Calculus',
        'topic': 'Derivatives',
        'difficulty': 'Advanced',
        'time': 'Evening'
    }
    matches = match_study_sessions(user_input)
    print('Study Session Matches:')
    for m in matches:
        print(m)

    # Test recreation spot categorization
    name = 'Miller Park'
    description = 'A large field, great for soccer and running.'
    activity = categorize_spot(name, description)
    print(f'Recreation Spot Activity: {activity}')

    name2 = 'City Pool'
    description2 = 'Indoor pool, open for swimming and lessons.'
    activity2 = categorize_spot(name2, description2)
    print(f'Recreation Spot Activity: {activity2}')
