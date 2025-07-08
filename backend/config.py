import os
from dotenv import load_dotenv

load_dotenv()

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

DATABASE = "sqlite:///app.db"

# Free LLM API via OpenRouter (Claude, Mistral, etc.)
LLM_API_BASE = "https://openrouter.ai/api/v1/chat/completions"
LLM_API_KEY = os.getenv("OPENROUTER_API_KEY")  # Set this in your environment
LLM_MODEL = "mistralai/mistral-7b-instruct:free"
