import os
from typing import Optional, Dict, Any
from werkzeug.utils import secure_filename
from services import extractor, pdf_parser
from database.db import (
    insert_document,
    get_documents,
    get_document_by_id,
    update_document_metadata
)

ALLOWED_EXTENSIONS = {'pdf'}


def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def process_upload(file, upload_folder: str, host_url: str) -> Dict[str, Any]:
    filename = secure_filename(file.filename)

    if not allowed_file(filename):
        raise ValueError("Unsupported file type")

    path = os.path.join(upload_folder, filename)

    # Resolve filename conflicts
    if os.path.exists(path):
        base, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(path):
            filename = f"{base}_{counter}{ext}"
            path = os.path.join(upload_folder, filename)
            counter += 1

    file.save(path)

    try:
        text = pdf_parser.extract_text_from_pdf(path)
        metadata = extractor.extract_metadata_from_text(text)
    except Exception as e:
        if os.path.exists(path):
            os.remove(path)
        raise RuntimeError(f"Failed to extract metadata: {str(e)}")

    base_url = host_url.rstrip('/')
    file_url = f"{base_url}/files/{filename}"

    return {"metadata": metadata, "file_url": file_url}


def list_documents(page: str, per_page: str, search: Optional[str] = ''):
    try:
        page = int(page)
        per_page = int(per_page)
    except Exception:
        raise ValueError("Page and per_page must be integers")

    if page < 1 or per_page < 1:
        raise ValueError("Page and per_page must be positive integers")

    offset = (page - 1) * per_page
    return get_documents(offset=offset, limit=per_page, search_query=search)


def save_document(data: Dict[str, Any]) -> None:
    if not isinstance(data, dict):
        raise ValueError("Invalid data format")

    file_url = data.get("file_url")
    metadata = data.get("metadata")

    if not file_url or not isinstance(file_url, str):
        raise ValueError("Missing or invalid file_url")

    if not metadata or not isinstance(metadata, dict):
        raise ValueError("Missing or invalid metadata")

    insert_document(file_url, metadata)


def get_document(doc_id: int):
    if not isinstance(doc_id, int) or doc_id < 1:
        raise ValueError("Invalid document ID")

    return get_document_by_id(doc_id)


def update_document(doc_id: int, data: Dict[str, Any]) -> None:
    if not isinstance(doc_id, int) or doc_id < 1:
        raise ValueError("Invalid document ID")

    if not isinstance(data, dict):
        raise ValueError("Invalid data format")

    metadata = data.get("metadata")

    if not metadata or not isinstance(metadata, dict):
        raise ValueError("Missing or invalid metadata")

    update_document_metadata(doc_id, metadata)
