import openai  # OpenAI API for AI features
import os
from dotenv import load_dotenv  # For loading environment variables
load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")  # Set OpenAI API key

from models import Spot, User, StudySession  # Import database models
import json  # For reading JSON spot data

# --- Helper to parse user queries using OpenAI ---
def parse_query(query):
    """
    Uses OpenAI to extract structured info from a user's request.
    Returns a dict with type, noise_level, amenities, activity, subject.
    """
    prompt = f"""
    Extract the following information from the user's request:
    - type: study or recreation
    - noise_level (if mentioned)
    - amenities (if mentioned)
    - activity (if recreation)
    - subject (if study)
    Return as a JSON object.
    User request: {query}
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        print(f"OpenAI error: {e}")
        noise = 'quiet' if 'quiet' in query else None
        amenities = 'coffee' if 'coffee' in query else None
        return {'type': 'study', 'noise_level': noise, 'amenities': amenities}

# --- Recommend spots based on parsed query ---
def recommend_spots(parsed):
    """
    Query the Spot database for matching study or recreation spots.
    """
    query = Spot.query.filter_by(type=parsed.get('type', 'study'))
    if parsed.get('noise_level'):
        query = query.filter_by(noise_level=parsed['noise_level'])
    if parsed.get('amenities'):
        query = query.filter(Spot.amenities.contains(parsed['amenities']))
    if parsed.get('activity'):
        query = query.filter_by(activity=parsed['activity'])
    spots = query.all()
    return [spot_to_dict(s) for s in spots]

# --- Convert Spot model to dictionary ---
def spot_to_dict(spot):
    """
    Convert a Spot SQLAlchemy object to a dictionary.
    """
    return {
        'id': spot.id,
        'name': spot.name,
        'type': spot.type,
        'location': spot.location,
        'activity': spot.activity,
        'hours': spot.hours,
        'noise_level': spot.noise_level,
        'seating': spot.seating,
        'amenities': spot.amenities
    }

# --- Match study sessions using embeddings ---
def match_study_sessions(user_input):
    """
    Use OpenAI embeddings to match user input to study sessions.
    """
    sessions = StudySession.query.all()
    try:
        input_text = f"{user_input.get('subject','')} {user_input.get('topic','')} {user_input.get('difficulty','')}"
        input_emb = openai.embeddings.create(input=[input_text], model="text-embedding-ada-002").data[0].embedding
        matches = []
        for session in sessions:
            session_text = f"{session.subject}"
            session_emb = openai.embeddings.create(input=[session_text], model="text-embedding-ada-002").data[0].embedding
            sim = cosine_similarity(input_emb, session_emb)
            if sim > 0.8:
                matches.append(session_to_dict(session))
        return matches
    except Exception as e:
        print(f"OpenAI error: {e}")
        matches = [session_to_dict(s) for s in sessions if user_input.get('subject','').lower() in s.subject.lower()]
        return matches

# --- Cosine similarity for embeddings ---
def cosine_similarity(vec1, vec2):
    """
    Compute cosine similarity between two vectors.
    """
    import numpy as np
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

# --- Convert StudySession model to dictionary ---
def session_to_dict(session):
    """
    Convert a StudySession SQLAlchemy object to a dictionary.
    """
    return {
        'id': session.id,
        'subject': session.subject,
        'spot_id': session.spot_id,
        'user_id': session.user_id,
        'joined_users': session.joined_users
    }

# --- Categorize recreation spots using OpenAI ---
def categorize_spot(name, description):
    """
    Use OpenAI to classify a recreation spot's activity.
    """
    prompt = f"""
    Classify the following spot into one of these activities: soccer, basketball, swimming, tennis, running, gym, park, other.
    Return only the activity name.
    Spot: {name}
    Description: {description}
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        activity = response.choices[0].message.content.strip().lower()
        return activity
    except Exception as e:
        print(f"OpenAI error: {e}")
        return "other"

# --- Main conversation helper for Lumora chatbot ---
def conversation_helper(user_query):
    """
    Main helper function for Lumora chatbot to process user queries.
    Determines if the query is about study, recreation, or a general question.
    """
    # Keywords for different types of queries
    study_keywords = ["solve", "explain", "help", "question", "math", "science", "history", "english", "biology", "physics", "chemistry", "calculate", "who", "what", "when", "where", "why", "how"]
    location_keywords = ["location", "where", "place", "spot", "specific", "library", "milpitas", "san jose", "online"]
    recreation_keywords = ["recreation", "play", "park", "basketball", "pickleball", "tennis", "hiking", "hang-gliding", "dog park"]

    # Load study and recreation spots from JSON file
    with open("backend/spots.json", "r") as f:
        data = json.load(f)

    # If it's a study question and not a location query, use OpenAI to answer
    if any(word in user_query.lower() for word in study_keywords) and not any(word in user_query.lower() for word in location_keywords):
        prompt = f"You are Lumora, a friendly campus assistant. Help the student with their study question: {user_query}"
        client = openai.OpenAI()
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are Lumora, a helpful assistant for kids. Answer study questions clearly and simply."},
                {"role": "user", "content": user_query}
            ]
        )
        return [{"type": "study_answer", "answer": response.choices[0].message.content}]

    # If the query is about study spots (location-specific), return from JSON
    if any(word in user_query.lower() for word in location_keywords):
        result = []
        for spot in data["study_spots"]:
            result.append({
                "type": "study",
                "name": spot["name"],
                "location": spot["location"],
                "noise_level": spot.get("noise_level", "unknown")
            })
        return result

    # If the query is about recreation spots, return from JSON
    if any(word in user_query.lower() for word in recreation_keywords):
        result = []
        for spot in data["recreation_spots"]:
            result.append({
                "type": "recreation",
                "name": spot["name"],
                "location": spot["location"],
                "activity": spot.get("activity", "unknown"),
                "amenities": spot.get("amenities", "unknown")
            })
        return result

    prompt = f"""
    You are an assistant for a campus app. Given a user's question, extract:
    - type: study or recreation
    - activity (if recreation)
    - subject (if study)
    - location (if mentioned)
    - any other relevant filters (noise_level, amenities)
    Return as a JSON object.
    
    Examples:
    Q: What are good spots for studying calculus?
    A: {{"type": "study", "subject": "calculus"}}
    Q: Where can I play basketball near campus?
    A: {{"type": "recreation", "activity": "basketball", "location": "campus"}}
    Q: I want a quiet place to study with Wi-Fi.
    A: {{"type": "study", "noise_level": "quiet", "amenities": "wifi"}}
    Q: Where can I swim in Milpitas?
    A: {{"type": "recreation", "activity": "swimming", "location": "Milpitas"}}
    Q: Find a coffee shop for group study.
    A: {{"type": "study", "amenities": "coffee", "seating": "group"}}
    
    User question: {user_query}
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        content = response.choices[0].message.content
        params = json.loads(content)
        # Use params to query spots
        query = Spot.query
        if params.get('type'):
            query = query.filter_by(type=params['type'])
        if params.get('activity'):
            query = query.filter_by(activity=params['activity'])
        if params.get('subject'):
            query = query.filter(Spot.amenities.contains(params['subject']))
        if params.get('location'):
            query = query.filter_by(location=params['location'])
        if params.get('noise_level'):
            query = query.filter_by(noise_level=params['noise_level'])
        if params.get('amenities'):
            query = query.filter(Spot.amenities.contains(params['amenities']))
        if params.get('seating'):
            query = query.filter(Spot.seating.contains(params['seating']))
        spots = query.all()
        return [spot_to_dict(s) for s in spots]
    except Exception as e:
        print(f"OpenAI error: {e}")
        return []
