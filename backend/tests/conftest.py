import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import create_app
from database.models import Base
from database.db import SessionLocal

@pytest.fixture
def app():
    app = create_app()
    app.config['UPLOAD_FOLDER'] = 'tests/uploads'
    yield app

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()


@pytest.fixture(scope="function")
def session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    TestingSessionLocal = sessionmaker(bind=engine)

    # Create all tables
    Base.metadata.create_all(bind=engine)

    # Monkeypatch SessionLocal in your module (if your app uses it globally)
    import database.db as db_module
    original_SessionLocal = db_module.SessionLocal
    db_module.SessionLocal = TestingSessionLocal

    # Provide the session to the test
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
        db_module.SessionLocal = original_SessionLocal
