from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base, Document
from config import DATABASE
import json

engine = create_engine(DATABASE, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)

def insert_document(file_url: str, metadata: dict) -> int:
    session = SessionLocal()
    try:
        doc = Document(file_url=file_url, meta_json=json.dumps(metadata))
        session.add(doc)
        session.commit()
        return doc.id
    finally:
        session.close()

def get_documents(offset=0, limit=10, search_query=''):
    session = SessionLocal()
    try:
        query = session.query(Document)
        if search_query:
            query = query.filter(Document.meta_json.ilike(f"%{search_query.lower()}%"))
        documents = query.order_by(Document.id).offset(offset).limit(limit).all()
        return [doc.to_dict() for doc in documents]
    finally:
        session.close()

def get_document_by_id(doc_id: int):
    session = SessionLocal()
    try:
        doc = session.get(Document, doc_id)
        return doc.to_dict() if doc else None
    finally:
        session.close()

def update_document_metadata(doc_id: int, metadata: dict):
    session = SessionLocal()
    try:
        doc = session.get(Document, doc_id)
        if doc:
            doc.meta_json = json.dumps(metadata)
            session.commit()
    finally:
        session.close()