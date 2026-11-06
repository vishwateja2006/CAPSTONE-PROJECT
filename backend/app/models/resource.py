import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class ReliefCenter(Base):
    __tablename__ = "relief_centers"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    disaster_id = Column(String, ForeignKey("disasters.id"), nullable=True)
    name = Column(String, nullable=False)
    location_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_person = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    capacity_people = Column(Integer, default=500)
    current_occupancy = Column(Integer, default=0)

    disaster = relationship("Disaster", back_populates="relief_centers")
    inventory_items = relationship("InventoryItem", back_populates="relief_center", cascade="all, delete-orphan")


class InventoryItem(Base):
    __tablename__ = "inventory_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    relief_center_id = Column(String, ForeignKey("relief_centers.id"), nullable=False)
    item_category = Column(String, nullable=False)  # FOOD, WATER, MEDICAL, SHELTER, SANITATION
    item_name = Column(String, nullable=False)
    quantity_available = Column(Integer, default=0, nullable=False)
    quantity_reserved = Column(Integer, default=0, nullable=False)
    unit = Column(String, default="units")  # rations, liters, kits, tents
    expiry_date = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    relief_center = relationship("ReliefCenter", back_populates="inventory_items")


class ReliefVehicle(Base):
    __tablename__ = "relief_vehicles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_code = Column(String, unique=True, nullable=False)
    vehicle_type = Column(String, default="TRUCK", nullable=False)  # TRUCK, 4X4, BOAT, DRONE, HELICOPTER
    capacity_kg = Column(Float, default=1000.0)
    current_lat = Column(Float, nullable=False)
    current_lon = Column(Float, nullable=False)
    status = Column(String, default="IDLE", nullable=False)  # IDLE, EN_ROUTE, RETURNING, MAINTENANCE
    assigned_driver = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    speed_kmh = Column(Float, default=40.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
