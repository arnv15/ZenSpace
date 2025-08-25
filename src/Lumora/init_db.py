from app import app
from db import db
from models import Spot

with app.app_context():
    db.create_all()
    # Add sample study spot
    spot1 = Spot(
        name='Quiet Coffee House',
        type='study',
        location='Downtown',
        activity=None,
        hours='8am-8pm',
        noise_level='quiet',
        seating='tables, couches',
        amenities='coffee, wifi'
    )
    # Add sample recreation spot
    spot2 = Spot(
        name='Central Park Basketball Court',
        type='recreation',
        location='Central Park',
        activity='basketball',
        hours='6am-10pm',
        noise_level='outdoor',
        seating='benches',
        amenities='basketball, water fountain'
    )
    db.session.add(spot1)
    db.session.add(spot2)
    db.session.commit()
    print('Database initialized and sample spots added.')
