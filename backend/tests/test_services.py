from fastapi.testclient import TestClient
from app.main import app

# TestClient è un "finto browser" ultraveloce che interroga la nostra app FastAPI
client = TestClient(app)

def test_read_root():
    """Verifica che l'endpoint base risponda con status 200 e stato 'ok'."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "version": "0.1.0"}

def test_create_service():
    """Verifica la registrazione corretta di un nuovo servizio."""
    payload = {
        "name": "Database-Postgres-Replica",
        "environment": "production",
        "status": "healthy",
        "cpu_usage": 15.4,
        "memory_usage": 45.0
    }
    response = client.post("/api/v1/services", json=payload)
    assert response.status_code == 201
    
    data = response.json()
    assert data["name"] == "Database-Postgres-Replica"
    assert data["status"] == "healthy"
    assert "id" in data
    assert "updated_at" in data

def test_list_services():
    """Verifica che la lista dei servizi restituisca codice 200 e una lista."""
    response = client.get("/api/v1/services")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_service_not_found():
    """Verifica che la richiesta di un ID inesistente restituisca 404."""
    response = client.get("/api/v1/services/999999")
    assert response.status_code == 404
    assert response.json()["detail"] == "Servizio non trovato"

def test_validation_error():
    """Verifica che l'invio di dati errati (es. stringa invece di numero) restituisca 422."""
    payload = {
        "name": "Server-Test-Errato",
        "cpu_usage": "NON_UN_NUMERO"  # Errore intenzionale
    }
    response = client.post("/api/v1/services", json=payload)
    assert response.status_code == 422
