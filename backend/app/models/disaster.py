import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Disaster(Base):
    __tablename__ = "disasters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, index=True)
    disaster_type = Column(String, nullable=False)  # FLOOD, EARTHQUAKE, CYCLONE, WILDFIRE, LANDSLIDE
    status = Column(String, default="ACTIVE", nullable=False)  # ALERT, ACTIVE, RECOVERY, RESOLVED
    severity = Column(String, default="HIGH", nullable=False)  # CRITICAL, HIGH, MODERATE, LOW
    epicenter_lat = Column(Float, nullable=False)
    epicenter_lon = Column(Float, nullable=False)
    radius_km = Column(Float, default=25.0)
    description = Column(Text, nullable=True)
    declared_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    hazard_zones = relationship("HazardZone", back_populates="disaster", cascade="all, delete-orphan")
    relief_centers = relationship("ReliefCenter", back_populates="disaster", cascade="all, delete-orphan")


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

