from flask import Blueprint, request, jsonify
import os
from werkzeug.utils import secure_filename
from utils.ai_utils import parse_query, recommend_spots

ai_bp = Blueprint('ai', __name__)

UPLOAD_FOLDER = 'instance/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

# Ensure upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@ai_bp.route('/', methods=['POST'])
def recommend():
    print("recommend endpoint hit")
    data = request.json
    user_query = data.get('query')
    # Use OpenAI to answer general homework questions
    import openai
    import os
    openai.api_key = os.getenv("OPENAI_API_KEY")
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": user_query}]
        )
        answer = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"OpenAI error: {e}")
        answer = "Sorry, I couldn't answer that question."
    return jsonify({"answer": answer})

@ai_bp.route('/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        return jsonify({'message': 'File uploaded successfully', 'filepath': filepath}), 200
    else:
        return jsonify({'error': 'Invalid file type'}), 400
