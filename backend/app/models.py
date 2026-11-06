# app/models.py
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base

class ServiceModel(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    environment = Column(String, default="production")
    status = Column(String, default="healthy")  # healthy, warning, critical
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
