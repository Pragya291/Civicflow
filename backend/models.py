from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    mobile = db.Column(db.String(20), nullable=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), default='citizen', nullable=False) # 'citizen' or 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    complaints = db.relationship('Complaint', backref='reporter', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'mobile': self.mobile,
            'role': self.role,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None
        }


class Department(db.Model):
    __tablename__ = 'departments'

    id = db.Column(db.Integer, primary_key=True)
    department_name = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship
    assignments = db.relationship('Assignment', backref='department', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'department_name': self.department_name
        }


class Complaint(db.Model):
    __tablename__ = 'complaints'

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.String(30), unique=True, nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    description = db.Column(db.Text, nullable=False)
    severity = db.Column(db.String(20), default='Medium', nullable=False) # 'Low', 'Medium', 'High'
    photo = db.Column(db.String(255), nullable=True)
    location_name = db.Column(db.String(255), nullable=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(30), default='Pending', nullable=False) # 'Pending', 'In Progress', 'Resolved'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship with Assignment
    assignments = db.relationship('Assignment', backref='complaint', cascade='all, delete-orphan', lazy=True)

    def to_dict(self):
        # Get active assigned department if any
        latest_assignment = Assignment.query.filter_by(complaint_id=self.id).order_by(Assignment.assigned_at.desc()).first()
        assigned_dept_name = latest_assignment.department.department_name if latest_assignment and latest_assignment.department else 'Not Assigned'
        assigned_dept_id = latest_assignment.department_id if latest_assignment else None

        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'user_id': self.user_id,
            'reporter_name': self.reporter.name if self.reporter else 'Anonymous Citizen',
            'reporter_email': self.reporter.email if self.reporter else None,
            'reporter_mobile': self.reporter.mobile if self.reporter else None,
            'description': self.description,
            'severity': self.severity,
            'photo': self.photo,
            'location_name': self.location_name or f"Lat: {self.latitude:.4f}, Lng: {self.longitude:.4f}",
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'assigned_department': assigned_dept_name,
            'assigned_department_id': assigned_dept_id,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
            'updated_at': self.updated_at.strftime('%Y-%m-%d %H:%M:%S') if self.updated_at else None
        }


class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True)
    complaint_id = db.Column(db.Integer, db.ForeignKey('complaints.id'), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'), nullable=False)
    notes = db.Column(db.String(255), nullable=True)
    assigned_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'complaint_id': self.complaint_id,
            'department_id': self.department_id,
            'department_name': self.department.department_name if self.department else None,
            'notes': self.notes,
            'assigned_at': self.assigned_at.strftime('%Y-%m-%d %H:%M:%S') if self.assigned_at else None
        }
