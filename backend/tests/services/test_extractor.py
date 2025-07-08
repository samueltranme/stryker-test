import pytest
import json
from unittest.mock import patch, MagicMock

import services.extractor as extractor  # adjust import path if needed


def test_extract_metadata_success():
    fake_response_content = json.dumps({
        "ProductID": "123",
        "Name": "Test Product",
        "ProductNumber": "TP-001",
        "MakeFlag": "1",
        "FinishedGoodsFlag": "1",
        "Color": "Red",
        "StandardCost": "100",
        "ListPrice": "150",
        "Size": "M",
        "ProductLine": "A",
        "Class": "B",
        "Style": "Modern",
        "ProductSubcategoryID": "10",
        "ProductModelID": "20"
    })

    # This is how the API's JSON response looks like
    fake_api_response = {
        "choices": [
            {
                "message": {
                    "content": fake_response_content
                }
            }
        ]
    }

    with patch("services.extractor.requests.post") as mock_post:
        mock_post.return_value.status_code = 200
        mock_post.return_value.json.return_value = fake_api_response

        text = "Dummy text for extraction"
        result = extractor.extract_metadata_from_text(text)

        assert isinstance(result, dict)
        assert result["Name"] == "Test Product"
        assert result["ProductID"] == "123"


def test_extract_metadata_api_failure():
    with patch("services.extractor.requests.post") as mock_post:
        mock_post.return_value.status_code = 500
        mock_post.return_value.text = "Internal Server Error"

        with pytest.raises(Exception) as excinfo:
            extractor.extract_metadata_from_text("some text")

        assert "LLM API Error" in str(excinfo.value)


def test_extract_metadata_invalid_json():
    with patch("services.extractor.requests.post") as mock_post:
        mock_post.return_value.status_code = 200
        # Return invalid JSON in content
        fake_api_response = {
            "choices": [
                {
                    "message": {
                        "content": "not a json"
                    }
                }
            ]
        }
        mock_post.return_value.json.return_value = fake_api_response

        with pytest.raises(json.JSONDecodeError):
            extractor.extract_metadata_from_text("some text")
