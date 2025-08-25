from db import db  # SQLAlchemy database instance
from flask_login import UserMixin  # For user authentication

# --- User model ---
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)  # Unique user ID
    username = db.Column(db.String(80), unique=True, nullable=False)  # Username
    password = db.Column(db.String(200), nullable=False)  # Hashed password
    preferences = db.Column(db.JSON)  # User preferences (JSON)

# --- Spot model (study or recreation spot) ---
class Spot(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique spot ID
    name = db.Column(db.String(120), nullable=False)  # Spot name
    type = db.Column(db.String(20), nullable=False)  # 'study' or 'recreation'
    location = db.Column(db.String(120), nullable=False)  # Address or location
    activity = db.Column(db.String(50))  # Activity type (for recreation)
    hours = db.Column(db.String(50))  # Opening hours
    noise_level = db.Column(db.String(20))  # Noise level (for study spots)
    seating = db.Column(db.String(50))  # Seating info
    amenities = db.Column(db.String(120))  # Amenities available

# --- StudySession model ---
class StudySession(db.Model):
    id = db.Column(db.Integer, primary_key=True)  # Unique session ID
    subject = db.Column(db.String(120), nullable=False)  # Study subject
    spot_id = db.Column(db.Integer, db.ForeignKey('spot.id'))  # Linked spot
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))  # Creator user
    joined_users = db.Column(db.JSON)  # List of joined users (JSON)
