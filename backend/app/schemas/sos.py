from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class SOSCreate(BaseModel):
    disaster_id: Optional[str] = None
    victim_name: str
    contact_phone: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    people_count: int = 1
    urgency_level: Optional[str] = "HIGH"  # CRITICAL, HIGH, MEDIUM, LOW
    special_needs: Optional[List[str]] = []  # ["infant", "elderly", "insulin", "injured"]
    category_needs: Optional[List[str]] = ["FOOD", "WATER"]  # ["FOOD", "WATER", "MEDICAL", "EVACUATION"]
    description: Optional[str] = None

class SOSUpdate(BaseModel):
    status: Optional[str] = None  # PENDING, ASSIGNED, IN_TRANSIT, DELIVERED, RESOLVED, CANCELLED
    assigned_vehicle_id: Optional[str] = None
    urgency_score: Optional[float] = None

class SOSOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    disaster_id: Optional[str] = None
    victim_name: str
    contact_phone: str
    latitude: float
    longitude: float
    address: Optional[str] = None
    people_count: int
    urgency_level: str
    urgency_score: float
    special_needs: str  # JSON string
    category_needs: str  # JSON string
    description: Optional[str] = None
    status: str
    assigned_vehicle_id: Optional[str] = None
    requested_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

