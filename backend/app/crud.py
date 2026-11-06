# app/crud.py
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from . import models, schemas

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ServiceModel).offset(skip).limit(limit).all()

def get_service_by_id(db: Session, service_id: int):
    return db.query(models.ServiceModel).filter(models.ServiceModel.id == service_id).first()

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.ServiceModel(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: int, service_update: schemas.ServiceUpdate):
    db_service = get_service_by_id(db, service_id)
    if not db_service:
        return None
    
    update_data = service_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_service, key, value)
    
    db_service.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(db_service)
    return db_service

def delete_service(db: Session, service_id: int):
    db_service = get_service_by_id(db, service_id)
    if not db_service:
        return None
    db.delete(db_service)
    db.commit()
    return db_service
