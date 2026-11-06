import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.sos import SOSRequest
from app.schemas.sos import SOSCreate, SOSUpdate, SOSOut
from app.services.ai_model import DisasterAIEngine
from app.services.alert_service import alert_manager

router = APIRouter()

@router.post("/", response_model=SOSOut, status_code=status.HTTP_201_CREATED)
async def submit_sos_request(sos_in: SOSCreate, db: Session = Depends(get_db)):
    """
    Ingest emergency SOS report.
    Automatically applies AI Natural Language Triage & Urgency Scoring.
    """
    special_needs_list = sos_in.special_needs or []
    category_needs_list = sos_in.category_needs or ["FOOD", "WATER"]

    # AI Model Urgency Scoring
    calculated_score, assessed_level = DisasterAIEngine.calculate_urgency_score(
        people_count=sos_in.people_count,
        special_needs=special_needs_list,
        category_needs=category_needs_list,
        description=sos_in.description or "",
        hours_elapsed=0.0
    )

    sos_obj = SOSRequest(
        disaster_id=sos_in.disaster_id,
        victim_name=sos_in.victim_name,
        contact_phone=sos_in.contact_phone,
        latitude=sos_in.latitude,
        longitude=sos_in.longitude,
        address=sos_in.address,
        people_count=sos_in.people_count,
        urgency_level=assessed_level,
        urgency_score=calculated_score,
        special_needs=json.dumps(special_needs_list),
        category_needs=json.dumps(category_needs_list),
        description=sos_in.description,
        status="PENDING",
        requested_at=datetime.utcnow()
    )

    db.add(sos_obj)
    db.commit()
    db.refresh(sos_obj)

    # Broadcast real-time urgent incident alert
    await alert_manager.broadcast({
        "type": "NEW_SOS_REQUEST",
        "data": {
            "id": sos_obj.id,
            "victim_name": sos_obj.victim_name,
            "people_count": sos_obj.people_count,
            "urgency_score": sos_obj.urgency_score,
            "urgency_level": sos_obj.urgency_level,
            "latitude": sos_obj.latitude,
            "longitude": sos_obj.longitude,
            "category_needs": category_needs_list
        }
    })

    return sos_obj

@router.get("/", response_model=List[SOSOut])
def list_sos_requests(
    disaster_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    min_urgency: Optional[float] = None,
    db: Session = Depends(get_db)
):
    query = db.query(SOSRequest)
    if disaster_id:
        query = query.filter(SOSRequest.disaster_id == disaster_id)
    if status_filter:
        query = query.filter(SOSRequest.status == status_filter.upper())
    if min_urgency is not None:
        query = query.filter(SOSRequest.urgency_score >= min_urgency)

    return query.order_by(SOSRequest.urgency_score.desc(), SOSRequest.requested_at.desc()).all()

@router.get("/{sos_id}", response_model=SOSOut)
def get_sos_request(sos_id: str, db: Session = Depends(get_db)):
    sos = db.query(SOSRequest).filter(SOSRequest.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found.")
    return sos

@router.patch("/{sos_id}", response_model=SOSOut)
async def update_sos_status(sos_id: str, update_in: SOSUpdate, db: Session = Depends(get_db)):
    sos = db.query(SOSRequest).filter(SOSRequest.id == sos_id).first()
    if not sos:
        raise HTTPException(status_code=404, detail="SOS request not found.")

    if update_in.status:
        sos.status = update_in.status.upper()
        if sos.status in ["DELIVERED", "RESOLVED"]:
            sos.resolved_at = datetime.utcnow()
    if update_in.assigned_vehicle_id:
        sos.assigned_vehicle_id = update_in.assigned_vehicle_id
    if update_in.urgency_score is not None:
        sos.urgency_score = update_in.urgency_score

    db.commit()
    db.refresh(sos)

    await alert_manager.broadcast({
        "type": "SOS_STATUS_UPDATED",
        "data": {
            "id": sos.id,
            "status": sos.status,
            "assigned_vehicle_id": sos.assigned_vehicle_id
        }
    })

    return sos
