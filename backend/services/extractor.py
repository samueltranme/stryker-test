import requests
import json
from config import LLM_API_BASE, LLM_API_KEY, LLM_MODEL

def extract_metadata_from_text(text):
    prompt = f"""
        Extract the following fields from the text in the exact order below, and respond strictly in JSON format without extra text or explanation:

        {{
        "ProductID": "",
        "Name": "",
        "ProductNumber": "",
        "MakeFlag": "",
        "FinishedGoodsFlag": "",
        "Color": "",
        "StandardCost": "",
        "ListPrice": "",
        "Size": "",
        "ProductLine": "",
        "Class": "",
        "Style": "",
        "ProductSubcategoryID": "",
        "ProductModelID": ""
        }}

        If any field is missing in the text, return an empty string ("") for that field. Do not include any explanations, comments, or additional text.


        Text:
        {text}
    """

    headers = {
        "Authorization": f"Bearer {LLM_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": LLM_MODEL,
        "messages": [
            {"role": "system", "content": "You are a document information extractor."},
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(LLM_API_BASE, headers=headers, json=body)

    if response.status_code != 200:
        raise Exception(f"LLM API Error: {response.text}")

    content = response.json()["choices"][0]["message"]["content"]

    parsed_data = json.loads(content)

    return parsed_data

