from flask import Blueprint, request, jsonify
from models import Spot

spots_bp = Blueprint('spots', __name__)

@spots_bp.route('/study', methods=['GET'])
def get_study_spots():
    filters = request.args
    query = Spot.query.filter_by(type='study')
    if 'noise_level' in filters:
        query = query.filter_by(noise_level=filters['noise_level'])
    if 'location' in filters:
        query = query.filter_by(location=filters['location'])
    spots = query.all()
    return jsonify([spot_to_dict(s) for s in spots])

@spots_bp.route('/recreation', methods=['GET'])
def get_recreation_spots():
    activity = request.args.get('activity')
    query = Spot.query.filter_by(type='recreation')
    if activity:
        query = query.filter_by(activity=activity)
    spots = query.all()
    return jsonify([spot_to_dict(s) for s in spots])

def spot_to_dict(spot):
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
