import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="session")
def client_with_model():
    """TestClient that enters the app lifespan, loading model artifacts."""
    with TestClient(app) as client:
        yield client
