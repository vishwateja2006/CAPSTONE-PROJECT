import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base
from app.models.supabase_models import Disaster

class HazardZone(Base):
    __tablename__ = "hazard_zones"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=False)
    name = Column(String, nullable=False)
    risk_level = Column(String, default="RED", nullable=False)  # RED (Evacuate), ORANGE (High Risk), YELLOW (Advisory)
    boundary_geojson = Column(Text, nullable=False)  # GeoJSON Polygon / MultiPolygon string
    is_passable = Column(Boolean, default=False)
    road_blockages_json = Column(Text, default="[]")  # List of blocked points / road segments

    disaster = relationship("Disaster", back_populates="hazard_zones")

