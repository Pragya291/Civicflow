import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'mbmc-pothole-governance-secret-key-2025')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'mbmc-jwt-super-secret-key-2025')
    
    # SQLite Database inside backend/database folder
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'pothole_governance.db')
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL', f'sqlite:///{DATABASE_PATH}')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Upload folder
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB max limit
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
