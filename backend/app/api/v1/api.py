from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.v1.endpoints import (
    auth,
    disasters_api,
    resources_api,
    beneficiaries_api,
    requests_api,
    vehicles_api,
    deliveries_api,
    predictions_api,
    routes_api,
    alerts_api,
    decision_api,
    analytics_api,
    evaluation_api
)
from app.services.alert_service import alert_manager

api_router = APIRouter()

# Authentication & RBAC
api_router.include_router(auth.router, prefix="/auth", tags=["1. Authentication & RBAC"])

# Core Domain APIs
api_router.include_router(disasters_api.router, prefix="/disasters", tags=["2. Disasters Management"])
api_router.include_router(resources_api.router, prefix="/resources", tags=["3. Resources & Warehouses"])
api_router.include_router(beneficiaries_api.router, prefix="/beneficiaries", tags=["4. Beneficiaries"])
api_router.include_router(requests_api.router, prefix="/requests", tags=["5. Aid Requests & Triage"])
api_router.include_router(vehicles_api.router, prefix="/vehicles", tags=["6. Vehicles & Fleet"])
api_router.include_router(deliveries_api.router, prefix="/deliveries", tags=["7. Deliveries & Tracking"])
api_router.include_router(predictions_api.router, prefix="/predictions", tags=["8. AI Predictions"])
api_router.include_router(routes_api.router, prefix="/routes", tags=["9. Route Optimization & Fair Allocation"])
api_router.include_router(alerts_api.router, prefix="/alerts", tags=["10. Emergency Alerts"])

# Phase 8: Optimization & Decision Engine
api_router.include_router(decision_api.router, prefix="/decision-engine", tags=["11. Optimization & Decision Engine"])

# Phase 10: Tracking, Notifications & Analytics
api_router.include_router(analytics_api.router, prefix="/analytics", tags=["12. Tracking, Notifications & Analytics"])

# Phase 11: Testing & Academic Evaluation
api_router.include_router(evaluation_api.router, prefix="/evaluation", tags=["13. Testing & Academic Evaluation"])

@api_router.websocket("/ws/alerts")
async def websocket_alert_endpoint(websocket: WebSocket):
    """Real-time live WebSocket feed for operational dashboards and field units."""
    await alert_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f'{{"type":"ACK","received":"{data}"}}')
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)
