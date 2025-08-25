from flask import Flask  # Flask web framework
from flask_cors import CORS  # Enable CORS for cross-origin requests
from db import db  # Import database instance

app = Flask(__name__)  # Create Flask app
app.config.from_object('config.Config')  # Load config from config.py

# Initialize database with app
db.init_app(app)
# Enable CORS
CORS(app)

# --- Register API blueprints ---
def register_blueprints(app):
    from routes.auth import auth_bp  # Auth routes
    from routes.spots import spots_bp  # Study/recreation spot routes
    from routes.sessions import sessions_bp  # Study session routes
    from routes.ai import ai_bp  # AI recommendation routes
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(spots_bp, url_prefix='/api/spots')
    app.register_blueprint(sessions_bp, url_prefix='/api/sessions')
    app.register_blueprint(ai_bp, url_prefix='/api/recommend')

# --- Main entry point ---
if __name__ == '__main__':
    with app.app_context():
        register_blueprints(app)  # Register all routes
        app.run(debug=True)  # Start Flask server
