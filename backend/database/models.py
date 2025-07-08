from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import declarative_base
import json

Base = declarative_base()

class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    meta_json = Column("metadata", Text, nullable=False)
    file_url = Column(String, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "metadata": json.loads(self.meta_json),
            "file_url": self.file_url,
        }
