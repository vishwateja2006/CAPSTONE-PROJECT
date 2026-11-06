import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Prediction
from app.schemas.api_schemas import PredictionCreate, PredictionOut
from app.services.ai_model import DisasterAIEngine

router = APIRouter()

@router.get("/", response_model=List[PredictionOut])
def list_predictions(
    disaster_id: Optional[str] = None,
    model_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve historical AI model predictions and evaluation logs."""
    query = db.query(Prediction)
    if disaster_id:
        query = query.filter(Prediction.disaster_id == disaster_id)
    if model_type:
        query = query.filter(Prediction.model_type == model_type.upper())
    return query.order_by(Prediction.created_at.desc()).all()

@router.post("/", response_model=PredictionOut, status_code=status.HTTP_201_CREATED)
def record_prediction(pred_in: PredictionCreate, db: Session = Depends(get_db)):
    """Log an AI model inference output into the database."""
    prediction = Prediction(**pred_in.dict())
    db.add(prediction)
    db.commit()
    db.refresh(prediction)
    return prediction

# Model 1: Demand Prediction
@router.get("/demand-forecast")
def predict_resource_demand(
    population: int = Query(500, ge=1),
    days_ahead: int = Query(3, ge=1, le=14),
    severity_multiplier: float = Query(1.2, ge=1.0, le=2.5)
) -> Dict[str, Any]:
    """Execute Model 1: Predict 24h-72h food, water, medical kit demands based on displaced population."""
    return DisasterAIEngine.forecast_resource_demand(
        displaced_population=population,
        days_ahead=days_ahead,
        weather_severity_multiplier=severity_multiplier
    )

# Model 3: Emergency NLP Triage
@router.post("/nlp-triage")
def classify_emergency_message(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Model 3: Classify unstructured distress SMS/text into emergency categories & urgency score."""
    text = payload.get("text", "")
    people_count = payload.get("people_count", 1)
    special_needs = payload.get("special_needs", [])
    category_needs = payload.get("category_needs", ["FOOD", "WATER"])

    score, level = DisasterAIEngine.calculate_urgency_score(
        people_count=people_count,
        special_needs=special_needs,
        category_needs=category_needs,
        description=text
    )

    return {
        "text": text,
        "assessed_urgency_score": score,
        "urgency_level": level,
        "recommended_priority": "IMMEDIATE" if score >= 80 else "STANDARD",
        "benchmark_dataset": "Appen / Figure Eight Multilingual Disaster Corpus"
    }
