from database.db import (
    insert_document,
    get_documents,
    get_document_by_id,
    update_document_metadata,
)

def test_insert_and_get_document(session):
    metadata = {"title": "Test Document", "author": "Tester"}
    file_url = "http://example.com/test.pdf"

    # Insert document
    doc_id = insert_document(file_url, metadata)
    assert isinstance(doc_id, int)

    # Get document by id
    doc = get_document_by_id(doc_id)
    assert doc is not None
    assert doc["file_url"] == file_url
    assert doc["metadata"] == metadata

def test_get_documents(session):
    # Insert multiple documents
    insert_document("url1", {"title": "Doc One"})
    insert_document("url2", {"title": "Doc Two"})
    insert_document("url3", {"title": "Another Doc"})

    # No search query, get first 2 docs
    docs = get_documents(offset=0, limit=2)
    assert len(docs) == 2

    # Search for 'doc'
    docs_search = get_documents(search_query="doc")
    assert all("doc" in doc["metadata"]["title"].lower() for doc in docs_search)

def test_update_document_metadata(session):
    metadata = {"title": "Original"}
    file_url = "url"
    doc_id = insert_document(file_url, metadata)

    new_metadata = {"title": "Updated"}
    update_document_metadata(doc_id, new_metadata)

    updated_doc = get_document_by_id(doc_id)
    assert updated_doc["metadata"]["title"] == "Updated"

def test_get_document_by_id_not_found(session):
    doc = get_document_by_id(9999)  # Non-existing ID
    assert doc is None
