from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from routes.document_routes import document_bp
from database.db import init_db

def create_app():
    app = Flask(__name__)
    app.json.sort_keys = False
    app.config['UPLOAD_FOLDER'] = 'uploads'

    CORS(app)
    Swagger(app)

    init_db()
    app.register_blueprint(document_bp)

    return app

# Run normally
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, use_reloader=False)
