from typing import Dict, Any, Optional
from pydantic import BaseModel
from fastapi import APIRouter
from app.services.evaluation_engine import (
    HistoricalBacktestingEngine,
    DiscreteEventSimulationEngine,
    ShadowModeValidationEngine
)

router = APIRouter()

class DiscreteSimulationInput(BaseModel):
    road_closure: Optional[bool] = True
    vehicle_failure: Optional[bool] = True
    unexpected_sos_influx: Optional[int] = 40

@router.get("/benchmarks")
def get_all_evaluation_benchmarks() -> Dict[str, Any]:
    """
    Phase 11: Retrieve academic evaluation benchmarks across all models:
    - Demand Forecast MAPE / RMSE
    - Damage Vision IoU / F1-Score
    - NLP Triage Precision / Recall
    - Shadow-Mode Operational Comparisons
    """
    demand_eval = HistoricalBacktestingEngine.run_demand_forecasting_backtest()
    vision_eval = HistoricalBacktestingEngine.run_damage_vision_backtest()
    nlp_eval = HistoricalBacktestingEngine.run_nlp_triage_backtest()
    shadow_eval = ShadowModeValidationEngine.get_shadow_mode_comparisons()

    return {
        "status": "EVALUATION_BENCHMARKS_COMPILED",
        "academic_metrics": {
            "model1_demand_forecasting": demand_eval,
            "model2_damage_vision": vision_eval,
            "model3_nlp_triage": nlp_eval,
            "shadow_mode_comparison": shadow_eval
        }
    }

@router.post("/run-discrete-simulation")
def execute_discrete_event_simulation(payload: DiscreteSimulationInput) -> Dict[str, Any]:
    """Phase 11: Execute discrete-event stochastic disruption simulation with road closures & fleet breakdowns."""
    return DiscreteEventSimulationEngine.run_disruption_simulation(
        road_closure_active=payload.road_closure if payload.road_closure is not None else True,
        vehicle_failure_active=payload.vehicle_failure if payload.vehicle_failure is not None else True,
        unexpected_sos_influx=payload.unexpected_sos_influx or 40
    )

@router.get("/shadow-mode")
def get_shadow_mode_comparison() -> Dict[str, Any]:
    """Phase 11: Retrieve statistical comparison between traditional manual relief operations and ResQLink AI."""
    return ShadowModeValidationEngine.get_shadow_mode_comparisons()
