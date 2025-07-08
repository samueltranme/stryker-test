import pytest
import json
from database.models import Document

def test_document_to_dict():
    metadata_dict = {"title": "Sample", "author": "Tester"}
    json_str = json.dumps(metadata_dict)
    file_url = "http://example.com/sample.pdf"

    doc = Document(id=1, meta_json=json_str, file_url=file_url)

    result = doc.to_dict()

    assert result["id"] == 1
    assert result["metadata"] == metadata_dict
    assert result["file_url"] == file_url
