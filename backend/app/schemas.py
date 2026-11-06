# app/schemas.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict

# Dati base condivisi
class ServiceBase(BaseModel):
    name: str
    environment: str = "production"
    status: str = "healthy"
    cpu_usage: float = 0.0
    memory_usage: float = 0.0

# Dati richiesti durante la creazione (uguali a Base)
class ServiceCreate(ServiceBase):
    pass

# Dati inviati per aggiornare uno stato
class ServiceUpdate(BaseModel):
    status: str | None = None
    cpu_usage: float | None = None
    memory_usage: float | None = None

# Risposta completa inviata al frontend (include id e data)
class ServiceResponse(ServiceBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
