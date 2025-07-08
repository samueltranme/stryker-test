import io
import os
import pytest
from unittest.mock import patch, MagicMock

import services.document_services as ds


def test_allowed_file():
    assert ds.allowed_file("file.pdf")
    assert not ds.allowed_file("file.txt")
    assert not ds.allowed_file("filepdf")
    assert not ds.allowed_file("file.PDFX")


@patch("services.document_services.secure_filename", side_effect=lambda x: x)
@patch("services.document_services.os.path.exists", side_effect=[True, True, False])
@patch("services.document_services.pdf_parser.extract_text_from_pdf")
@patch("services.document_services.extractor.extract_metadata_from_text")
def test_process_upload_success(mock_extract_meta, mock_extract_text, mock_exists, mock_secure):
    class DummyFile:
        filename = "test.pdf"
        def save(self, path):
            # simulate saving file
            open(path, 'wb').write(b"dummy pdf content")

    mock_extract_text.return_value = "some extracted text"
    mock_extract_meta.return_value = {"title": "doc title"}

    upload_folder = "tests/uploads"
    os.makedirs(upload_folder, exist_ok=True)
    dummy_file = DummyFile()

    result = ds.process_upload(dummy_file, upload_folder, "http://localhost")
    assert "metadata" in result and result["metadata"]["title"] == "doc title"
    assert "file_url" in result and result["file_url"].endswith("/files/test.pdf")

    # Cleanup
    os.remove(os.path.join(upload_folder, "test.pdf"))


def test_process_upload_unsupported_file():
    class DummyFile:
        filename = "badfile.txt"
        def save(self, path):
            pass

    with pytest.raises(ValueError, match="Unsupported file type"):
        ds.process_upload(DummyFile(), "any_folder", "http://localhost")


def test_process_upload_extraction_failure():
    class DummyFile:
        filename = "fail.pdf"
        def save(self, path):
            with open(path, "wb") as f:
                f.write(b"content")

    dummy_file = DummyFile()
    upload_folder = "tests/uploads"
    os.makedirs(upload_folder, exist_ok=True)

    with patch("services.document_services.pdf_parser.extract_text_from_pdf", side_effect=Exception("fail")), \
         patch("services.document_services.extractor.extract_metadata_from_text"):

        with pytest.raises(RuntimeError, match="Failed to extract metadata"):
            ds.process_upload(dummy_file, upload_folder, "http://localhost")

        # File should be removed after failure
        path = os.path.join(upload_folder, "fail.pdf")
        assert not os.path.exists(path)


def test_list_documents_valid_and_invalid():
    # Mock get_documents to test pagination params
    with patch("services.document_services.get_documents") as mock_get_docs:
        mock_get_docs.return_value = [{"id": 1}]
        res = ds.list_documents("1", "5", "")
        assert isinstance(res, list)
        mock_get_docs.assert_called_with(offset=0, limit=5, search_query="")

        # invalid page/per_page raises
        with pytest.raises(ValueError):
            ds.list_documents("a", "5")
        with pytest.raises(ValueError):
            ds.list_documents("0", "5")


def test_save_document_invalid_and_valid():
    with patch("services.document_services.insert_document") as mock_insert:
        # Invalid types
        with pytest.raises(ValueError):
            ds.save_document("string instead of dict")

        # Missing file_url
        with pytest.raises(ValueError):
            ds.save_document({"metadata": {}})

        # Missing metadata
        with pytest.raises(ValueError):
            ds.save_document({"file_url": "url"})

        # Valid
        ds.save_document({"file_url": "url", "metadata": {"a": 1}})
        mock_insert.assert_called_once_with("url", {"a": 1})


def test_get_document_invalid_and_valid():
    with patch("services.document_services.get_document_by_id") as mock_get_doc:
        # invalid id
        with pytest.raises(ValueError):
            ds.get_document(0)
        with pytest.raises(ValueError):
            ds.get_document("abc")

        mock_get_doc.return_value = {"id": 1}
        res = ds.get_document(1)
        assert res == {"id": 1}


def test_update_document_invalid_and_valid():
    with patch("services.document_services.update_document_metadata") as mock_update:
        # Invalid doc_id
        with pytest.raises(ValueError):
            ds.update_document(0, {"metadata": {}})

        # Invalid data format
        with pytest.raises(ValueError):
            ds.update_document(1, "not a dict")

        # Missing metadata
        with pytest.raises(ValueError):
            ds.update_document(1, {})

        # Valid
        ds.update_document(1, {"metadata": {"a": 1}})
        mock_update.assert_called_once_with(1, {"a": 1})
