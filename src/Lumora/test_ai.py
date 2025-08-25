from app import app
from utils.ai_utils import match_study_sessions, categorize_spot

with app.app_context():
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
