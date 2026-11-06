import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from app.core.database import Base

class SOSRequest(Base):
    __tablename__ = "sos_requests"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=True)
    victim_name = Column(String, nullable=False)
    contact_phone = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    address = Column(String, nullable=True)
    people_count = Column(Integer, default=1, nullable=False)
    urgency_level = Column(String, default="HIGH", nullable=False)  # CRITICAL, HIGH, MEDIUM, LOW
    urgency_score = Column(Float, default=75.0)  # AI-scored from 0.0 to 100.0
    special_needs = Column(Text, default="[]")  # JSON string: e.g. ["infant", "elderly", "insulin", "injured"]
    category_needs = Column(Text, default="[]")  # JSON string: e.g. ["FOOD", "WATER", "MEDICAL"]
    description = Column(Text, nullable=True)
    status = Column(String, default="PENDING", nullable=False)  # PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, RESOLVED, CANCELLED
    assigned_vehicle_id = Column(String, ForeignKey("relief_vehicles.id"), nullable=True)
    requested_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
