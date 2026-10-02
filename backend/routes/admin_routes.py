from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, Complaint, Department, Assignment, User

admin_bp = Blueprint('admin_bp', __name__)

@admin_bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    total = Complaint.query.count()
    pending = Complaint.query.filter_by(status='Pending').count()
    in_progress = Complaint.query.filter_by(status='In Progress').count()
    resolved = Complaint.query.filter_by(status='Resolved').count()
    high_severity = Complaint.query.filter_by(severity='High').count()
    medium_severity = Complaint.query.filter_by(severity='Medium').count()
    low_severity = Complaint.query.filter_by(severity='Low').count()

    # Department breakdown
    departments = Department.query.all()
    dept_stats = []
    for dept in departments:
        # count how many complaints currently assigned to this department
        assigned_count = db.session.query(Assignment).filter_by(department_id=dept.id).count()
        dept_stats.append({
            'department_name': dept.department_name,
            'count': assigned_count
        })

    return jsonify({
        'total': total,
        'pending': pending,
        'in_progress': in_progress,
        'resolved': resolved,
        'high_severity': high_severity,
        'medium_severity': medium_severity,
        'low_severity': low_severity,
        'department_stats': dept_stats
    }), 200


@admin_bp.route('/complaints/<int:complaint_id>/status', methods=['PUT'])
def update_complaint_status(complaint_id):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Complaint not found.'}), 404

    data = request.get_json() or {}
    new_status = data.get('status')
    if new_status not in ['Pending', 'In Progress', 'Resolved']:
        return jsonify({'error': 'Invalid status value. Must be Pending, In Progress, or Resolved.'}), 400

    complaint.status = new_status
    complaint.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': f'Status updated to {new_status}.',
        'complaint': complaint.to_dict()
    }), 200


@admin_bp.route('/complaints/<int:complaint_id>/assign', methods=['POST'])
def assign_department(complaint_id):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Complaint not found.'}), 404

    data = request.get_json() or {}
    department_id = data.get('department_id')
    notes = data.get('notes', 'Assigned for road inspection and repair work.')

    dept = Department.query.get(department_id)
    if not dept:
        return jsonify({'error': 'Invalid department ID.'}), 400

    assignment = Assignment(
        complaint_id=complaint.id,
        department_id=dept.id,
        notes=notes,
        assigned_at=datetime.utcnow()
    )
    
    # If complaint is still pending, automatically set status to 'In Progress' upon assignment
    if complaint.status == 'Pending':
        complaint.status = 'In Progress'
        
    complaint.updated_at = datetime.utcnow()

    db.session.add(assignment)
    db.session.commit()

    return jsonify({
        'message': f'Complaint successfully assigned to {dept.department_name}.',
        'complaint': complaint.to_dict()
    }), 200


@admin_bp.route('/complaints/<int:complaint_id>', methods=['DELETE'])
def delete_complaint(complaint_id):
    complaint = Complaint.query.get(complaint_id)
    if not complaint:
        return jsonify({'error': 'Complaint not found.'}), 404

    complaint_ref = complaint.complaint_id
    db.session.delete(complaint)
    db.session.commit()

    return jsonify({
        'message': f'Complaint {complaint_ref} successfully deleted.'
    }), 200


@admin_bp.route('/departments', methods=['GET'])
def get_departments():
    depts = Department.query.all()
    return jsonify({
        'departments': [d.to_dict() for d in depts]
    }), 200


@admin_bp.route('/departments', methods=['POST'])
def add_department():
    data = request.get_json() or {}
    name = data.get('department_name', '').strip()
    if not name:
        return jsonify({'error': 'Department name is required.'}), 400

    if Department.query.filter(Department.department_name.ilike(name)).first():
        return jsonify({'error': 'Department already exists.'}), 409

    dept = Department(department_name=name)
    db.session.add(dept)
    db.session.commit()

    return jsonify({
        'message': 'Department created.',
        'department': dept.to_dict()
    }), 201
