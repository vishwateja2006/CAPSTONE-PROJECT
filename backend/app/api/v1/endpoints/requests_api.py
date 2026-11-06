import json
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Request, Beneficiary
from app.schemas.api_schemas import RequestCreate, RequestUpdate, RequestOut
from app.services.ai_model import DisasterAIEngine
from app.services.alert_service import alert_manager
from app.core.security import require_volunteer, require_authority

router = APIRouter()

@router.post("/", response_model=RequestOut, status_code=status.HTTP_201_CREATED)
async def submit_aid_request(req_in: RequestCreate, db: Session = Depends(get_db)):
    """
    Submit an emergency aid request for a beneficiary household.
    Automatically applies AI NLP triage to calculate an urgency score (0-100).
    """
    beneficiary = db.query(Beneficiary).filter(Beneficiary.id == req_in.beneficiary_id).first()
    if not beneficiary:
        raise HTTPException(status_code=404, detail="Referenced beneficiary household not found.")

    # Parse special vulnerabilities
    special_needs = []
    try:
        special_needs = json.loads(beneficiary.medical_conditions or "[]")
    except Exception:
        pass
    if beneficiary.infants_count > 0:
        special_needs.append("infant")
    if beneficiary.elderly_count > 0:
        special_needs.append("elderly")
    if beneficiary.disabled_or_injured_count > 0:
        special_needs.append("injured")

    # Parse requested categories
    category_needs = ["FOOD", "WATER"]
    try:
        category_needs = json.loads(req_in.requested_categories or "[\"FOOD\", \"WATER\"]")
    except Exception:
        pass

    # AI Model Urgency Scoring
    calculated_score, assessed_level = DisasterAIEngine.calculate_urgency_score(
        people_count=beneficiary.household_size,
        special_needs=special_needs,
        category_needs=category_needs,
        description=req_in.description or ""
    )

    aid_request = Request(
        beneficiary_id=req_in.beneficiary_id,
        disaster_id=req_in.disaster_id,
        requested_categories=req_in.requested_categories or json.dumps(category_needs),
        urgency_level=assessed_level,
        urgency_score=calculated_score,
        description=req_in.description,
        status="PENDING",
        requested_at=datetime.utcnow()
    )

    db.add(aid_request)
    db.commit()
    db.refresh(aid_request)

    # Broadcast urgent request alert
    await alert_manager.broadcast({
        "type": "NEW_AID_REQUEST",
        "data": {
            "id": aid_request.id,
            "disaster_id": aid_request.disaster_id,
            "beneficiary": beneficiary.head_of_household,
            "people_count": beneficiary.household_size,
            "urgency_score": aid_request.urgency_score,
            "urgency_level": aid_request.urgency_level
        }
    })

    return aid_request

@router.get("/", response_model=List[RequestOut])
def list_aid_requests(
    disaster_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    min_urgency: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """List all aid requests, ordered by AI urgency score and timestamp."""
    query = db.query(Request)
    if disaster_id:
        query = query.filter(Request.disaster_id == disaster_id)
    if status_filter:
        query = query.filter(Request.status == status_filter.upper())
    if min_urgency is not None:
        query = query.filter(Request.urgency_score >= min_urgency)

    return query.order_by(Request.urgency_score.desc(), Request.requested_at.desc()).all()

@router.get("/{request_id}", response_model=RequestOut)
def get_aid_request(request_id: str, db: Session = Depends(get_db)):
    """Retrieve full details of an emergency aid request."""
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Aid request not found.")
    return req

@router.patch("/{request_id}/status", response_model=RequestOut)
async def update_request_status(
    request_id: str,
    status_update: RequestUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_volunteer)
):
    """Update aid request fulfillment status (Volunteer, Authority or Admin)."""
    req = db.query(Request).filter(Request.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Aid request not found.")

    if status_update.status:
        req.status = status_update.status.upper()
        if req.status in ["DELIVERED"]:
            req.fulfilled_at = datetime.utcnow()
    if status_update.assigned_warehouse_id:
        req.assigned_warehouse_id = status_update.assigned_warehouse_id

    db.commit()
    db.refresh(req)

    await alert_manager.broadcast({
        "type": "REQUEST_STATUS_UPDATED",
        "data": {
            "request_id": req.id,
            "status": req.status
        }
    })

    return req
