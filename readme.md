# 📄 Document Extraction App – Customer Intelligence Demo
This is a full-stack demo application built for the Customer Intelligence team to extract structured metadata from various document types using LLMs. Users can upload documents, extract fields automatically, manually correct them, and manage the documents via a user-friendly interface.

# 🛠️ Technologies Used
- Frontend: Next.js, React, Material UI
- Backend: Flask, SQLite, OpenAI LLM API
- Swagger UI: API documentation and live testing
- Testing: Jest + React Testing Library (Frontend), Pytest (Backend)

# 🚀 Getting Started
## ✅ Prerequisites
- Node.js ≥ 16
- Python ≥ 3.9
- pip and venv/virtualenv
- OpenAI API Key (https://platform.openai.com)

## 🖥️ Frontend Setup
```
cd frontend
npm install
npm run dev
Visit: http://localhost:3000
```

## 🧪 Frontend Testing
```
npm run test
Tests are located in frontend/src/__tests__/.
```

## 🧰 Backend Setup
```
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
```

## 🔑 Environment Variables
Create a .env file in the backend directory:
```
OPENAI_API_KEY=your-openai-api-key
```
## ▶️ Run Backend Server
```
python app.py
Visit the API: http://localhost:5000
```

## 🧪 Backend Testing
```
python -m pytest
Tests are located in backend/tests/.
```

## 🔍 API Documentation with Swagger
Swagger UI is enabled by default.
Visit: http://localhost:5000/apidocs
From Swagger, you can:
- Upload documents
- Extract metadata using LLM
- Save or update extracted metadata
- List/search documents

## 🧑‍💻 Using the App
1. View Uploaded Documents
- Go to the homepage: http://localhost:3000
- See all documents
- Search metadata
- Preview or edit extracted info

2. Upload & Extract Document
- Go to: http://localhost:3000/upload
- Drag and drop or select a file
- Click "Upload & Extract"
- Review and optionally edit metadata
- Click "Save" to persist to backend

## 📁 Folder Structure
```
pgsql
Copy
Edit
project-root/
│
├── backend/
│   ├── routes/
│   ├── database/
│   ├── services/
│   ├── tests/
│   ├── app.py
│   └── requirements.txt
│
├── frontend/
│   ├── pages/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── __tests__/
│   └── package.json
```

# 📏 Scaling Strategy & Production Readiness
## 📈 Handle High Volume
Replace SQLite with PostgreSQL or MongoDB
Store files in S3 or GCP Storage
Add pagination and backend search filtering

## 🧠 Smarter Metadata Extraction
Fine-tune LLMs or use different prompts for each document type
Introduce schema validation and fallback rules
Add confidence scores per field

## ⚙️ Asynchronous Workflows
Use Celery with Redis for background processing
Implement WebSocket or polling for progress updates

## 🔐 Security Enhancements
Add user authentication (e.g., Auth0 or NextAuth)
Sanitize uploaded files
Rate-limit endpoints

## 🚀 Deployment
Dockerize both frontend and backend
Deploy frontend via Vercel or Netlify
Deploy backend via Render, Railway, or AWS EC2
Use GitHub Actions for CI/CD

## 📊 Monitoring
Use Sentry for error monitoring
Log requests and system metrics via Prometheus/Grafana