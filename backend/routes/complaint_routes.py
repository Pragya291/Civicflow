import os
import time
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from werkzeug.utils import secure_filename
from models import db, Complaint, Assignment, Department, User

complaint_bp = Blueprint('complaint_bp', __name__)

def generate_complaint_id():
    """Generate MBMC-PTH-XXX sequential complaint ID"""
    last_complaint = Complaint.query.order_by(Complaint.id.desc()).first()
    next_num = (last_complaint.id + 1) if last_complaint else 1
    return f"MBMC-PTH-{next_num:03d}"

def is_allowed_file(filename):
    allowed_exts = current_app.config.get('ALLOWED_EXTENSIONS', {'png', 'jpg', 'jpeg', 'webp', 'gif'})
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_exts

@complaint_bp.route('', methods=['POST'])
def submit_complaint():
    # Handle both multipart/form-data and application/json
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        identity = get_jwt_identity()
        if identity:
            user_id = int(identity)
    except Exception:
        user_id = None

    photo_filename = None

    if request.is_json:
        data = request.get_json() or {}
        description = data.get('description', '').strip()
        severity = data.get('severity', 'Medium')
        location_name = data.get('location_name', '').strip()
        latitude = data.get('latitude')
        longitude = data.get('longitude')
        photo_filename = data.get('photo', None)
    else:
        # multipart/form-data
        description = request.form.get('description', '').strip()
        severity = request.form.get('severity', 'Medium')
        location_name = request.form.get('location_name', '').strip()
        latitude = request.form.get('latitude')
        longitude = request.form.get('longitude')
        
        # Check if citizen passed user_id in form if not in jwt
        form_user_id = request.form.get('user_id')
        if not user_id and form_user_id:
            try:
                user_id = int(form_user_id)
            except ValueError:
                pass

        if 'photo' in request.files:
            file = request.files['photo']
            if file and file.filename != '' and is_allowed_file(file.filename):
                clean_name = secure_filename(file.filename)
                unique_name = f"pothole_{int(time.time())}_{clean_name}"
                upload_dir = current_app.config['UPLOAD_FOLDER']
                os.makedirs(upload_dir, exist_ok=True)
                file.save(os.path.join(upload_dir, unique_name))
                photo_filename = unique_name

    if not description:
        return jsonify({'error': 'Pothole description is required.'}), 400

    try:
        lat = float(latitude)
        lng = float(longitude)
    except (TypeError, ValueError):
        # Default fallback to Mira-Bhayandar center if missing
        lat = 19.2952
        lng = 72.8544

    if severity not in ['Low', 'Medium', 'High']:
        severity = 'Medium'

    complaint_id = generate_complaint_id()

    complaint = Complaint(
        complaint_id=complaint_id,
        user_id=user_id,
        description=description,
        severity=severity,
        photo=photo_filename,
        location_name=location_name or f"Mira-Bhayandar ({lat:.4f}, {lng:.4f})",
        latitude=lat,
        longitude=lng,
        status='Pending'
    )

    db.session.add(complaint)
    db.session.commit()

    return jsonify({
        'message': 'Complaint submitted successfully.',
        'complaint_id': complaint.complaint_id,
        'complaint': complaint.to_dict()
    }), 201


@complaint_bp.route('', methods=['GET'])
def get_complaints():
    status = request.args.get('status')
    severity = request.args.get('severity')
    user_id = request.args.get('user_id')
    search = request.args.get('search', '').strip().lower()

    query = Complaint.query

    if status and status != 'All':
        query = query.filter_by(status=status)

    if severity and severity != 'All':
        query = query.filter_by(severity=severity)

    if user_id:
        query = query.filter_by(user_id=int(user_id))

    if search:
        query = query.filter(
            (Complaint.complaint_id.ilike(f'%{search}%')) |
            (Complaint.description.ilike(f'%{search}%')) |
            (Complaint.location_name.ilike(f'%{search}%'))
        )

    complaints = query.order_by(Complaint.created_at.desc()).all()
    return jsonify({
        'complaints': [c.to_dict() for c in complaints],
        'total': len(complaints)
    }), 200


@complaint_bp.route('/<complaint_ref>', methods=['GET'])
def get_complaint(complaint_ref):
    """Fetch by complaint_id (e.g. MBMC-PTH-001) or primary key id"""
    complaint = None
    if complaint_ref.isdigit():
        complaint = Complaint.query.get(int(complaint_ref))
    
    if not complaint:
        complaint = Complaint.query.filter(
            Complaint.complaint_id.ilike(complaint_ref.strip())
        ).first()

    if not complaint:
        return jsonify({'error': f'Complaint with reference "{complaint_ref}" not found.'}), 404

    # Include assignment history
    assignments = [a.to_dict() for a in complaint.assignments]
    comp_dict = complaint.to_dict()
    comp_dict['assignment_history'] = assignments

    return jsonify({'complaint': comp_dict}), 200


@complaint_bp.route('/map', methods=['GET'])
def get_map_markers():
    """Retrieve lightweight data for map view"""
    complaints = Complaint.query.all()
    markers = []
    for c in complaints:
        markers.append({
            'id': c.id,
            'complaint_id': c.complaint_id,
            'description': c.description[:80] + ('...' if len(c.description) > 80 else ''),
            'severity': c.severity,
            'status': c.status,
            'latitude': c.latitude,
            'longitude': c.longitude,
            'location_name': c.location_name,
            'photo': c.photo,
            'created_at': c.created_at.strftime('%Y-%m-%d') if c.created_at else ''
        })
    return jsonify({'markers': markers, 'count': len(markers)}), 200
