import os  # For environment variables

# --- Configuration class for Flask app ---
class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'devkey')  # Secret key for sessions
    SQLALCHEMY_DATABASE_URI = 'sqlite:///app.db'  # SQLite database URI
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # Disable modification tracking
