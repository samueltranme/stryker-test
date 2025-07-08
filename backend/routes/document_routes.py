from flask import Blueprint, request, jsonify, send_from_directory, current_app, abort
from flasgger import swag_from
from services.document_services import (
    process_upload,
    list_documents,
    save_document,
    get_document,
    update_document
)

document_bp = Blueprint('document', __name__)

@document_bp.route('/upload', methods=['POST'])
@swag_from({
    'tags': ['Document'],
    'consumes': ['multipart/form-data'],
    'parameters': [
        {
            'name': 'file',
            'in': 'formData',
            'type': 'file',
            'required': True,
            'description': 'PDF file to upload'
        }
    ],
    'responses': {
        201: {
            'description': 'Metadata and file URL',
            'schema': {
                'type': 'object',
                'properties': {
                    'metadata': {'type': 'object'},
                    'file_url': {'type': 'string'}
                }
            }
        },
        400: {'description': 'Invalid input'},
        500: {'description': 'Internal server error'}
    }
})
def upload():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    try:
        result = process_upload(file, current_app.config['UPLOAD_FOLDER'], request.host_url)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@document_bp.route('/documents', methods=['GET'])
@swag_from({
    'tags': ['Document'],
    'parameters': [
        {'name': 'page', 'in': 'query', 'type': 'string', 'required': False, 'default': '1'},
        {'name': 'per_page', 'in': 'query', 'type': 'string', 'required': False, 'default': '10'},
        {'name': 'search', 'in': 'query', 'type': 'string', 'required': False}
    ],
    'responses': {
        200: {
            'description': 'List of documents',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer'},
                        'metadata': {'type': 'object'},
                        'file_url': {'type': 'string'}
                    }
                }
            }
        },
        400: {'description': 'Invalid input'},
        500: {'description': 'Failed to list documents'}
    }
})
def list_all_documents():
    page = request.args.get('page', '1')
    per_page = request.args.get('per_page', '10')
    search = request.args.get('search', '').lower()

    try:
        documents = list_documents(page, per_page, search)
        return jsonify(documents), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Failed to list documents"}), 500


@document_bp.route('/save', methods=['POST'])
@swag_from({
    'tags': ['Document'],
    'consumes': ['application/json'],
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'file_url': {'type': 'string'},
                    'metadata': {'type': 'object'}
                },
                'required': ['file_url', 'metadata']
            }
        }
    ],
    'responses': {
        201: {'description': 'Metadata saved'},
        400: {'description': 'Missing fields'},
        500: {'description': 'Failed to save document'}
    }
})
def save():
    data = request.get_json()
    try:
        save_document(data)
        return jsonify({"message": "Metadata saved"}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Failed to save document"}), 500


@document_bp.route('/document/<int:doc_id>', methods=['GET'])
@swag_from({
    'tags': ['Document'],
    'parameters': [
        {'name': 'doc_id', 'in': 'path', 'type': 'integer', 'required': True}
    ],
    'responses': {
        200: {
            'description': 'Document object',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer'},
                    'metadata': {'type': 'object'},
                    'file_url': {'type': 'string'}
                }
            }
        },
        404: {'description': 'Document not found'},
        400: {'description': 'Invalid ID'}
    }
})
def get(doc_id):
    try:
        doc = get_document(doc_id)
        if not doc:
            abort(404, description="Document not found")
        return jsonify(doc), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@document_bp.route('/document/<int:doc_id>', methods=['PUT'])
@swag_from({
    'tags': ['Document'],
    'parameters': [
        {'name': 'doc_id', 'in': 'path', 'type': 'integer', 'required': True},
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'metadata': {'type': 'object'}
                },
                'required': ['metadata']
            }
        }
    ],
    'responses': {
        200: {'description': 'Document updated'},
        400: {'description': 'Missing metadata'},
        500: {'description': 'Failed to update document'}
    }
})
def update(doc_id):
    data = request.get_json()
    try:
        update_document(doc_id, data)
        return jsonify({"message": "Document updated"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception:
        return jsonify({"error": "Failed to update document"}), 500


@document_bp.route('/files/<filename>')
def serve_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
