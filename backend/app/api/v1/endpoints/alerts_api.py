from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Alert, Disaster
from app.schemas.api_schemas import AlertCreate, AlertOut
from app.core.security import require_authority
from app.services.alert_service import alert_manager

router = APIRouter()

@router.get("/", response_model=List[AlertOut])
def list_active_alerts(
    disaster_id: Optional[str] = None,
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    """Retrieve all emergency broadcast alerts and localized warnings."""
    query = db.query(Alert)
    if disaster_id:
        query = query.filter(Alert.disaster_id == disaster_id)
    if active_only:
        query = query.filter(Alert.is_active == True)
    return query.order_by(Alert.created_at.desc()).all()

@router.post("/", response_model=AlertOut, status_code=status.HTTP_201_CREATED)
async def generate_emergency_alert(
    alert_in: AlertCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Publish an emergency evacuation warning or crisis alert (Authority or Admin only)."""
    disaster = db.query(Disaster).filter(Disaster.id == alert_in.disaster_id).first()
    if not disaster:
        raise HTTPException(status_code=404, detail="Disaster incident not found.")

    alert = Alert(**alert_in.dict(), is_active=True)
    db.add(alert)
    db.commit()
    db.refresh(alert)

    # Broadcast real-time push alert
    await alert_manager.broadcast({
        "type": "EMERGENCY_BROADCAST_ALERT",
        "data": {
            "id": alert.id,
            "title": alert.title,
            "message": alert.message,
            "severity": alert.severity,
            "district": alert.target_area_district,
            "channel": alert.broadcast_channel
        }
    })

    return alert

@router.patch("/{alert_id}/deactivate", response_model=AlertOut)
def deactivate_alert(
    alert_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_authority)
):
    """Deactivate an alert once danger has subsided."""
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")

    alert.is_active = False
    db.commit()
    db.refresh(alert)
    return alert

