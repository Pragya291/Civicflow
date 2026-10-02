import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db
from routes.auth_routes import auth_bp
from routes.complaint_routes import complaint_bp
from routes.admin_routes import admin_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Ensure uploads directory and database directory exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.dirname(app.config['DATABASE_PATH']), exist_ok=True)

    # Initialize extensions
    CORS(app, resources={r"/*": {"origins": "*"}})
    JWTManager(app)
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(complaint_bp, url_prefix='/api/complaints')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')

    # Serve uploaded pothole photographs
    @app.route('/uploads/<path:filename>')
    def serve_uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Common convenience endpoints
    @app.route('/api/stats/dashboard', methods=['GET'])
    def common_dashboard_stats():
        # Alias to admin stats for easy public landing page consumption
        from routes.admin_routes import get_dashboard_stats
        return get_dashboard_stats()

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'portal': 'Mira-Bhayandar Pothole Management Portal (MBMC)',
            'version': '1.0.0'
        }), 200

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == '__main__':
    # Listen on port 5000 for backend
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
