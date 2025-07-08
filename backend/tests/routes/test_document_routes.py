import io
import os
import pytest
from reportlab.pdfgen import canvas

UPLOAD_FOLDER = "tests/uploads"

def create_sample_pdf():
    buffer = io.BytesIO()
    p = canvas.Canvas(buffer)
    p.drawString(100, 750, "test pdf content")
    p.showPage()
    p.save()
    buffer.seek(0)
    return buffer

@pytest.fixture(scope="module", autouse=True)
def setup_upload_folder():
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    yield
    # Cleanup uploaded files after tests (optional)
    for f in os.listdir(UPLOAD_FOLDER):
        os.remove(os.path.join(UPLOAD_FOLDER, f))

def test_upload_success(client):
    pdf_file = create_sample_pdf()
    data = {
        'file': (pdf_file, 'testfile.pdf')
    }
    response = client.post('/upload', data=data, content_type='multipart/form-data')
    assert response.status_code == 201
    json_data = response.get_json()
    assert "metadata" in json_data
    assert "file_url" in json_data

def test_upload_no_file(client):
    response = client.post('/upload', data={}, content_type='multipart/form-data')
    assert response.status_code == 400
    assert response.get_json()["error"] == "No file part in the request"

def test_upload_empty_filename(client):
    data = {
        'file': (io.BytesIO(b""), '')
    }
    response = client.post('/upload', data=data, content_type='multipart/form-data')
    assert response.status_code == 400
    assert response.get_json()["error"] == "No file selected"

def test_list_documents(client):
    # Assuming some documents already uploaded in previous test or fixture
    response = client.get('/documents')
    assert response.status_code == 200
    docs = response.get_json()
    assert isinstance(docs, list)
    if docs:
        doc = docs[0]
        assert "id" in doc
        assert "metadata" in doc
        assert "file_url" in doc

def test_save_document_missing_fields(client):
    response = client.post('/save', json={})
    assert response.status_code == 400

def test_save_document_success(client):
    data = {
        "file_url": "http://example.com/testfile.pdf",
        "metadata": {"title": "Test Doc"}
    }
    response = client.post('/save', json=data)
    assert response.status_code == 201
    assert response.get_json()["message"] == "Metadata saved"

def test_get_document_not_found(client):
    response = client.get('/document/999999')  # assuming this ID does not exist
    assert response.status_code == 404

def test_get_document_success(client):
    # First create document
    save_data = {
        "file_url": "http://example.com/testfile2.pdf",
        "metadata": {"title": "Get Test"}
    }
    save_resp = client.post('/save', json=save_data)
    assert save_resp.status_code == 201

    # List documents and get an ID
    list_resp = client.get('/documents')
    doc_id = list_resp.get_json()[0]["id"]

    response = client.get(f'/document/{doc_id}')
    assert response.status_code == 200
    doc = response.get_json()
    assert doc["id"] == doc_id
    assert "metadata" in doc
    assert "file_url" in doc

def test_update_document_missing_metadata(client):
    # Create a document first
    save_data = {
        "file_url": "http://example.com/testfile3.pdf",
        "metadata": {"title": "Update Test"}
    }
    save_resp = client.post('/save', json=save_data)
    assert save_resp.status_code == 201

    list_resp = client.get('/documents')
    doc_id = list_resp.get_json()[0]["id"]

    # Try update with empty JSON
    response = client.put(f'/document/{doc_id}', json={})
    assert response.status_code == 400

def test_update_document_success(client):
    # Create document
    save_data = {
        "file_url": "http://example.com/testfile4.pdf",
        "metadata": {"title": "Old Title"}
    }
    save_resp = client.post('/save', json=save_data)
    assert save_resp.status_code == 201

    list_resp = client.get('/documents')
    doc_id = list_resp.get_json()[0]["id"]

    update_data = {
        "metadata": {"title": "Updated Title"}
    }
    response = client.put(f'/document/{doc_id}', json=update_data)
    assert response.status_code == 200
    assert response.get_json()["message"] == "Document updated"

def test_serve_file(client):
    # Upload file to serve
    pdf_file = create_sample_pdf()
    data = {
        'file': (pdf_file, 'serve_test.pdf')
    }
    upload_resp = client.post('/upload', data=data, content_type='multipart/form-data')
    assert upload_resp.status_code == 201
    filename = 'serve_test.pdf'

    response = client.get(f'/files/{filename}')
    assert response.status_code == 200

