import pytest
from unittest.mock import patch, MagicMock
from services import pdf_parser

def test_extract_text_from_pdf_mocked():
    mock_page1 = MagicMock()
    mock_page1.extract_text.return_value = "Hello "
    mock_page2 = MagicMock()
    mock_page2.extract_text.return_value = "World"

    mock_reader = MagicMock()
    mock_reader.pages = [mock_page1, mock_page2]

    with patch('services.pdf_parser.PdfReader', return_value=mock_reader) as mock_pdf_reader:
        result = pdf_parser.extract_text_from_pdf("dummy_path.pdf")

    assert result == "Hello World"
    mock_pdf_reader.assert_called_once_with("dummy_path.pdf")
