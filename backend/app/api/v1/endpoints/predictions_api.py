import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Prediction
from app.schemas.api_schemas import PredictionCreate, PredictionOut
from app.ml.model_registry import ModelRegistry

router = APIRouter()

@router.get("/models")
def get_ai_models_catalog() -> List[Dict[str, Any]]:
    """Retrieve metadata and operational status for all 5 ResQLink AI/ML models."""
    return ModelRegistry.get_models_metadata()

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
    disaster_type: str = Query("FLOOD"),
    days_ahead: int = Query(3, ge=1, le=14),
    severity_multiplier: float = Query(1.2, ge=1.0, le=2.5)
) -> Dict[str, Any]:
    """Execute Model 1: Predict 24h-72h food, water, medical kit demands using LSTM & Sphere Standards."""
    return ModelRegistry.demand_forecaster.predict_demand(
        displaced_population=population,
        disaster_type=disaster_type,
        forecast_horizon_days=days_ahead,
        weather_severity_multiplier=severity_multiplier
    )

# Model 2: Damage Detection
@router.post("/damage-vision")
def detect_satellite_damage(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Model 2: Optical/multispectral satellite flood extent segmentation and road obstruction identification."""
    ndwi_threshold = payload.get("ndwi_threshold", 0.3)
    frame_metadata = payload.get("frame_metadata", {
        "tile_id": payload.get("tile_id", "SENTINEL2-INUNDATION-DEMO"),
        "center_lat": payload.get("center_lat", 13.0600),
        "center_lon": payload.get("center_lon", 80.2500),
        "spectral_water_index_mean": payload.get("spectral_water_index_mean", 0.48),
        "cloud_cover_percent": payload.get("cloud_cover_percent", 5.0)
    })
    return ModelRegistry.damage_detector.analyze_satellite_frame(frame_metadata, ndwi_threshold=ndwi_threshold)

# Model 3: Emergency NLP Triage
@router.post("/nlp-triage")
def classify_emergency_message(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Model 3: Classify unstructured distress SMS/text into 36 Appen categories & priority urgency score."""
    text = payload.get("text", payload.get("description", ""))
    return ModelRegistry.message_classifier.classify_message(text=text)

# Model 4: Intelligent Route Optimization
@router.post("/route-optimizer")
def solve_route_optimization(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Model 4: Solve Capacitated Vehicle Routing Problem with hazard detour avoidance."""
    depot = payload.get("depot", {
        "id": "DEPOT-01", "name": "Central Hub", "latitude": 13.0827, "longitude": 80.2707
    })
    vehicles = payload.get("vehicles", [
        {"id": "V1", "code": "TRUCK-1", "capacity_kg": 1500.0, "speed_kmh": 40.0}
    ])
    requests = payload.get("requests", [])
    hazard_polygons = payload.get("hazard_polygons", [])
    return ModelRegistry.route_optimizer.solve_cvrp_mission(
        depot=depot,
        vehicles=vehicles,
        requests=requests,
        hazard_polygons=hazard_polygons
    )

# Model 5: Fair Resource Allocation
@router.post("/fair-allocation")
def solve_fair_allocation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Execute Model 5: Max-Min Constrained Linear Program with Gini coefficient calculation."""
    inventory = payload.get("available_inventory", {"FOOD": 100, "WATER": 100})
    demands = payload.get("demands", [])
    return ModelRegistry.fair_allocator.solve_fair_allocation(
        available_inventory=inventory,
        demands=demands
    )

