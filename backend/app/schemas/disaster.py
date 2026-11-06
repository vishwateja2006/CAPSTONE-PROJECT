from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class HazardZoneBase(BaseModel):
    name: str
    risk_level: str = "RED"  # RED, ORANGE, YELLOW
    boundary_geojson: str  # GeoJSON string
    is_passable: bool = False
    road_blockages_json: Optional[str] = "[]"

class HazardZoneCreate(HazardZoneBase):
    disaster_id: str

class HazardZoneOut(HazardZoneBase):
    id: str
    disaster_id: str

    class Config:
        from_attributes = True

class DisasterBase(BaseModel):
    name: str
    disaster_type: str  # FLOOD, EARTHQUAKE, CYCLONE, WILDFIRE, LANDSLIDE
    status: str = "ACTIVE"
    severity: str = "HIGH"
    epicenter_lat: float
    epicenter_lon: float
    radius_km: float = 25.0
    description: Optional[str] = None

class DisasterCreate(DisasterBase):
    pass

class DisasterUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None
    severity: Optional[str] = None
    radius_km: Optional[float] = None
    description: Optional[str] = None

class DisasterOut(DisasterBase):
    id: str
    declared_at: datetime
    updated_at: datetime
    hazard_zones: List[HazardZoneOut] = []

    class Config:
        from_attributes = True

