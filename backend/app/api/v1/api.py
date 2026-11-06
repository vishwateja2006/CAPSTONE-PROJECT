from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.v1.endpoints import auth, disasters, resources, sos, routes, analytics
from app.services.alert_service import alert_manager

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
api_router.include_router(disasters.router, prefix="/disasters", tags=["Disaster Management"])
api_router.include_router(resources.router, prefix="/resources", tags=["Relief Resources & Vehicles"])
api_router.include_router(sos.router, prefix="/sos", tags=["SOS Requests & AI Triage"])
api_router.include_router(routes.router, prefix="/routes", tags=["Route Optimization & Fair Allocation"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Situational Analytics & Forecasting"])

@api_router.websocket("/ws/alerts")
async def websocket_alert_endpoint(websocket: WebSocket):
    """Real-time live WebSocket feed for operational dashboards and field units."""
    await alert_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive & listen for client pings/messages
            data = await websocket.receive_text()
            # Echo heartbeat or client ack if needed
            await websocket.send_text(f'{{"type":"ACK","received":"{data}"}}')
    except WebSocketDisconnect:
        alert_manager.disconnect(websocket)
