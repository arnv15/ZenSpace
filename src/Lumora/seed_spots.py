from app import app  # Import Flask app
from db import db  # Import database instance
from models import Spot  # Import Spot model
import json  # For reading JSON spot data

with app.app_context():  # Run within Flask app context
    db.create_all()  # Create all tables if not exist
    with open("backend/spots.json", "r") as f:
        data = json.load(f)  # Load spot data from JSON file

    # Add study spots to database
    for spot in data["study_spots"]:
        db.session.add(Spot(
            name=spot["name"],
            location=spot["location"],
            type="study",
            noise_level=spot.get("noise_level", "unknown")
        ))
    # Add recreation spots to database
    for spot in data["recreation_spots"]:
        db.session.add(Spot(
            name=spot["name"],
            location=spot["location"],
            type="recreation",
            activity=spot.get("activity", "unknown"),
            amenities=spot.get("amenities", "unknown")
        ))
    db.session.commit()  # Save changes to database
    print("Seeded study and recreation spots from spots.json.")  # Confirmation message
