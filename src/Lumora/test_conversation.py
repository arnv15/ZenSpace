from app import app  # Import Flask app
from utils.ai_utils import conversation_helper  # Import AI conversation helper
import os
from dotenv import load_dotenv  # For loading environment variables
import openai  # OpenAI API

load_dotenv()  # Load environment variables from .env
# openai.api_key = os.environ.get("OPENAI_API_KEY")
openai.api_key = "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"  # Set OpenAI API key directly

# --- Format study spot answers for display ---
def format_study_spots(spots):
    if not spots:
        return "Sorry, I couldn't find any matching study spots."
    answer = "Here are some of the best study spots I found:\n"
    for i, spot in enumerate(spots[:5]):
        name = spot['name']
        location = spot['location']
        quiet = spot.get('noise_level', 'unknown')
        answer += f"{i+1}. Name: {name}\n   Location: {location}\n   Quieteness: {quiet}\n"
    return answer

# --- Format recreation spot answers for display ---
def format_recreation_spots(spots):
    if not spots:
        return "Sorry, I couldn't find any matching recreation spots."
    answer = "Here are some recreation spots you might like:\n"
    for i, spot in enumerate(spots[:5]):
        name = spot['name']
        location = spot['location']
        activity = spot.get('activity', 'unknown')
        amenities = spot.get('amenities', 'unknown')
        answer += f"{i+1}. Name: {name}\n   Location: {location}\n   Activity: {activity}\n   Amenities: {amenities}\n"
    return answer

# --- Main interactive loop for Lumora chatbot ---
with app.app_context():
    print("Lumora: Hi! I'm Lumora, your campus study and recreation assistant.")
    print("Select a mode:")
    print("1. Spot Finder (study/recreation spots)")
    print("2. Chatbot/Homework Helper")
    mode = input("Enter 1 or 2: ").strip()
    print("Type your question (type 'exit' to quit):")
    while True:
        user_query = input('User: ')
        if user_query.lower() == 'exit':
            break
        result = conversation_helper(user_query)
        if mode == '1':
            # Only answer spot queries
            if result and result[0]['type'] == 'study':
                # Filter by noise level keyword if present
                noise_keywords = ["quiet", "moderate", "medium", "loud", "silent"]
                found_noise = None
                for k in noise_keywords:
                    if k in user_query.lower():
                        found_noise = k
                        break
                filtered = result
                if found_noise:
                    filtered = [spot for spot in result if spot['noise_level'] and found_noise in spot['noise_level'].lower()]
                if filtered:
                    print('Lumora: Here are some specific study spots you can try:')
                    for i, spot in enumerate(filtered):
                        print(f"{i+1}. {spot['name']} - {spot['location']} (Quieteness: {spot['noise_level']})")
                else:
                    print('Lumora:', "Sorry, I couldn't find any matching study spots for your noise preference.")
            elif result and result[0]['type'] == 'recreation':
                print('Lumora:', format_recreation_spots(result))
            else:
                print('Lumora:', "Sorry, I couldn't find any matching spots.")
        elif mode == '2':
            # Only answer study questions
            if result and result[0]['type'] == 'study_answer':
                print('Lumora:', result[0]['answer'])
            else:
                print('Lumora:', "Sorry, I can only help with study questions in this mode.")
