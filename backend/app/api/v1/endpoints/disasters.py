from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.disaster import Disaster, HazardZone
from app.schemas.disaster import DisasterCreate, DisasterUpdate, DisasterOut, HazardZoneBase, HazardZoneCreate, HazardZoneOut
from app.services.alert_service import alert_manager

router = APIRouter()

@router.get("/", response_model=List[DisasterOut])
def get_all_disasters(status_filter: str = None, db: Session = Depends(get_db)):
    query = db.query(Disaster)
    if status_filter:
        query = query.filter(Disaster.status == status_filter.upper())
    return query.order_by(Disaster.declared_at.desc()).all()

@router.post("/", response_model=DisasterOut, status_code=status.HTTP_201_CREATED)
async def create_disaster(disaster_in: DisasterCreate, db: Session = Depends(get_db)):
    disaster = Disaster(**disaster_in.dict())
    db.add(disaster)
    db.commit()
    db.refresh(disaster)

    # Broadcast real-time alert to connected dashboards
    await alert_manager.broadcast({
        "type": "DISASTER_DECLARED",
        "data": {
            "id": disaster.id,
            "name": disaster.name,
            "disaster_type": disaster.disaster_type,
            "severity": disaster.severity,
            "epicenter": [disaster.epicenter_lat, disaster.epicenter_lon]
        }
    })
    return disaster

@router.get("/{disaster_id}", response_model=DisasterOut)
def get_disaster_by_id(disaster_id: str, db: Session = Depends(get_db)):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster incident not found.")
    return disaster

@router.patch("/{disaster_id}", response_model=DisasterOut)
def update_disaster(disaster_id: str, disaster_update: DisasterUpdate, db: Session = Depends(get_db)):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster incident not found.")
    
    update_data = disaster_update.dict(exclude_unset=True)
    for field, val in update_data.items():
        setattr(disaster, field, val)
    
    db.commit()
    db.refresh(disaster)
    return disaster

@router.post("/{disaster_id}/hazard-zones", response_model=HazardZoneOut, status_code=status.HTTP_201_CREATED)
async def add_hazard_zone(disaster_id: str, zone_in: HazardZoneBase, db: Session = Depends(get_db)):
    disaster = db.query(Disaster).filter(Disaster.id == disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster incident not found.")
    
    hazard_zone = HazardZone(
        disaster_id=disaster_id,
        name=zone_in.name,
        risk_level=zone_in.risk_level,
        boundary_geojson=zone_in.boundary_geojson,
        is_passable=zone_in.is_passable,
        road_blockages_json=zone_in.road_blockages_json or "[]"
    )
    db.add(hazard_zone)
    db.commit()
    db.refresh(hazard_zone)

    await alert_manager.broadcast({
        "type": "HAZARD_ZONE_UPDATED",
        "data": {
            "disaster_id": disaster_id,
            "zone_id": hazard_zone.id,
            "name": hazard_zone.name,
            "risk_level": hazard_zone.risk_level
        }
    })
    return hazard_zone
