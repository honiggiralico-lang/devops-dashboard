from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from . import models, schemas, crud
from .database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DevOps Metrics & Services API",
    description="API per il monitoraggio dello stato dei microservizi e metriche di sistema",
    version="0.1.0"
)

# Abilita il CORS per consentire a React di chiamare le API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", tags=["General"])
def read_root():
    return {"status": "ok", "version": "0.1.0"}

@app.get("/api/v1/services", response_model=List[schemas.ServiceResponse], tags=["Services"])
def list_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_services(db, skip=skip, limit=limit)

@app.post("/api/v1/services", response_model=schemas.ServiceResponse, status_code=status.HTTP_201_CREATED, tags=["Services"])
def register_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    return crud.create_service(db=db, service=service)

@app.get("/api/v1/services/{service_id}", response_model=schemas.ServiceResponse, tags=["Services"])
def read_service(service_id: int, db: Session = Depends(get_db)):
    service = crud.get_service_by_id(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servizio non trovato")
    return service

@app.patch("/api/v1/services/{service_id}", response_model=schemas.ServiceResponse, tags=["Services"])
def update_service_metrics(service_id: int, service_update: schemas.ServiceUpdate, db: Session = Depends(get_db)):
    service = crud.update_service(db, service_id=service_id, service_update=service_update)
    if not service:
        raise HTTPException(status_code=404, detail="Servizio non trovato")
    return service

@app.delete("/api/v1/services/{service_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Services"])
def remove_service(service_id: int, db: Session = Depends(get_db)):
    service = crud.delete_service(db, service_id=service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Servizio non trovato")
    return None
