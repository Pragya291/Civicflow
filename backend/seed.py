import os
from datetime import datetime, timedelta
from app import create_app
from models import db, User, Department, Complaint, Assignment

def create_sample_image(upload_folder, filename, label, color):
    """Create a clean SVG placeholder image for demo complaints"""
    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#1e293b"/>
  <rect x="20" y="20" width="560" height="360" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2"/>
  <path d="M 80 260 Q 150 180 240 220 T 380 280 T 520 200" fill="none" stroke="#64748b" stroke-width="8" stroke-dasharray="10 10"/>
  <ellipse cx="300" cy="240" rx="140" ry="60" fill="#020617" stroke="{color}" stroke-width="4"/>
  <ellipse cx="300" cy="245" rx="110" ry="40" fill="#18181b"/>
  <circle cx="260" cy="235" r="18" fill="#27272a"/>
  <circle cx="340" cy="250" r="22" fill="#27272a"/>
  <text x="300" y="80" font-family="system-ui, sans-serif" font-size="22" font-weight="bold" fill="#f8fafc" text-anchor="middle">MBMC Pothole Inspection Photo</text>
  <rect x="180" y="110" width="240" height="30" rx="15" fill="{color}" opacity="0.2"/>
  <text x="300" y="130" font-family="system-ui, sans-serif" font-size="14" font-weight="600" fill="{color}" text-anchor="middle">{label}</text>
  <text x="300" y="350" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">Mira-Bhayandar Municipal Corporation &bull; Civic Incident Log</text>
</svg>'''
    filepath = os.path.join(upload_folder, filename)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    return filename

def seed_database():
    app = create_app()
    with app.app_context():
        # Clear existing data for fresh seeding
        db.drop_all()
        db.create_all()
        print("Initialized database schema.")

        upload_dir = app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)

        # Seed sample photos
        img1 = create_sample_image(upload_dir, 'sample_pothole_1.svg', 'High Severity: Deep Asphalt Pit', '#ef4444')
        img2 = create_sample_image(upload_dir, 'sample_pothole_2.svg', 'Medium Severity: Edge Cracks', '#f59e0b')
        img3 = create_sample_image(upload_dir, 'sample_pothole_3.svg', 'High Severity: Flyover Crater', '#ef4444')
        img4 = create_sample_image(upload_dir, 'sample_pothole_4.svg', 'Resolved: Bitumen Patch Done', '#10b981')
        img5 = create_sample_image(upload_dir, 'sample_pothole_5.svg', 'Low Severity: Surface Erosion', '#3b82f6')

        # 1. Seed Users
        admin = User(
            name='MBMC Municipal Officer',
            email='admin@mbmc.gov.in',
            mobile='9820011223',
            role='admin'
        )
        admin.set_password('admin123')

        citizen1 = User(
            name='Rajesh Sharma',
            email='citizen@example.com',
            mobile='9892044556',
            role='citizen'
        )
        citizen1.set_password('citizen123')

        citizen2 = User(
            name='Pragya Desai',
            email='pragya@civicflow.in',
            mobile='9769123456',
            role='citizen'
        )
        citizen2.set_password('citizen123')

        db.session.add_all([admin, citizen1, citizen2])
        db.session.commit()
        print("Seeded Users: Admin (admin@mbmc.gov.in / admin123) and Citizens (citizen@example.com / citizen123).")

        # 2. Seed Departments
        dept_road = Department(department_name='Road Department')
        dept_eng = Department(department_name='Municipal Engineering Department')
        dept_ward4 = Department(department_name='Ward 4 Infrastructure Unit')
        dept_drain = Department(department_name='Drainage & Pavement Cell')

        db.session.add_all([dept_road, dept_eng, dept_ward4, dept_drain])
        db.session.commit()
        print("Seeded Departments.")

        # 3. Seed Sample Complaints in Mira-Bhayandar
        # Coordinates around Mira-Bhayandar area (Lat: 19.28 - 19.31, Lng: 72.84 - 72.87)
        now = datetime.utcnow()

        c1 = Complaint(
            complaint_id='MBMC-PTH-001',
            user_id=citizen1.id,
            description='Severe deep pothole near Shanti Nagar Sector 4 entrance. Multiple two-wheelers slipping during morning peak hours.',
            severity='High',
            photo=img1,
            location_name='Shanti Nagar Sector 4, Mira Road East',
            latitude=19.2831,
            longitude=72.8682,
            status='In Progress',
            created_at=now - timedelta(days=3)
        )

        c2 = Complaint(
            complaint_id='MBMC-PTH-002',
            user_id=citizen2.id,
            description='Cluster of road surface cracks and potholes developing after heavy water logging near Beverly Park junction.',
            severity='Medium',
            photo=img2,
            location_name='Beverly Park Main Road, Kanakia, Mira Road',
            latitude=19.2894,
            longitude=72.8625,
            status='Pending',
            created_at=now - timedelta(days=2)
        )

        c3 = Complaint(
            complaint_id='MBMC-PTH-003',
            user_id=citizen1.id,
            description='Large crater on flyover descending ramp near Bhayandar West station. High risk of bus and auto-rickshaw axle breakdown.',
            severity='High',
            photo=img3,
            location_name='Bhayandar West Station Flyover Ramp',
            latitude=19.3082,
            longitude=72.8521,
            status='In Progress',
            created_at=now - timedelta(days=4)
        )

        c4 = Complaint(
            complaint_id='MBMC-PTH-004',
            user_id=citizen2.id,
            description='Damaged bitumen and open aggregate on Silver Park signal crossing repaired with quick set cold mix.',
            severity='Medium',
            photo=img4,
            location_name='Silver Park Junction, Mira-Bhayandar Road',
            latitude=19.2945,
            longitude=72.8590,
            status='Resolved',
            created_at=now - timedelta(days=6)
        )

        c5 = Complaint(
            complaint_id='MBMC-PTH-005',
            user_id=citizen1.id,
            description='Small uneven dips and minor potholes near Hatkesh Udyog Nagar commercial lane.',
            severity='Low',
            photo=img5,
            location_name='Hatkesh Industrial Area, Mira Road',
            latitude=19.2785,
            longitude=72.8720,
            status='Resolved',
            created_at=now - timedelta(days=7)
        )

        c6 = Complaint(
            complaint_id='MBMC-PTH-006',
            user_id=None, # anonymous
            description='Hazardous edge excavation and pothole on Kashimira junction bypass heading towards Ghodbunder road.',
            severity='High',
            photo=img1,
            location_name='Kashimira Naka Junction, Western Express Hwy',
            latitude=19.2680,
            longitude=72.8795,
            status='Pending',
            created_at=now - timedelta(hours=14)
        )

        c7 = Complaint(
            complaint_id='MBMC-PTH-007',
            user_id=citizen2.id,
            description='Loose stones and bumpy road depression in front of Maxus Mall Bhayandar West.',
            severity='Low',
            photo=img5,
            location_name='Near Maxus Mall, Bhayandar West',
            latitude=19.3040,
            longitude=72.8465,
            status='Pending',
            created_at=now - timedelta(hours=5)
        )

        db.session.add_all([c1, c2, c3, c4, c5, c6, c7])
        db.session.commit()
        print("Seeded Complaints.")

        # 4. Seed Assignments
        a1 = Assignment(
            complaint_id=c1.id,
            department_id=dept_road.id,
            notes='Inspection team dispatched with cold asphalt mix. Patchwork underway.',
            assigned_at=now - timedelta(days=2)
        )

        a3 = Assignment(
            complaint_id=c3.id,
            department_id=dept_eng.id,
            notes='Structural survey completed. Heavy paver block reinforcement required on flyover slope.',
            assigned_at=now - timedelta(days=3)
        )

        a4 = Assignment(
            complaint_id=c4.id,
            department_id=dept_road.id,
            notes='Pothole permanently filled and resurfaced. Verified by ward engineer.',
            assigned_at=now - timedelta(days=5)
        )

        a5 = Assignment(
            complaint_id=c5.id,
            department_id=dept_ward4.id,
            notes='Paver blocks re-aligned and leveled.',
            assigned_at=now - timedelta(days=6)
        )

        db.session.add_all([a1, a3, a4, a5])
        db.session.commit()
        print("Seeded Assignments.")

        print("\n=== Seeding Completed Successfully! ===")
        print(f"Total Complaints: {Complaint.query.count()}")
        print(f"Total Users: {User.query.count()}")
        print(f"Total Departments: {Department.query.count()}")

if __name__ == '__main__':
    seed_database()
