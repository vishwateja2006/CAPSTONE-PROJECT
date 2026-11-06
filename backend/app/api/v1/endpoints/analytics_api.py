from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from app.services.tracking_and_analytics_service import (
    TrackingAndAnalyticsService,
    CryptographicAuditLedger
)
from app.services.alert_service import alert_manager
from app.core.security import require_volunteer, require_authority

router = APIRouter()

class ProofOfDeliveryInput(BaseModel):
    delivery_id: str
    waypoint_id: str
    beneficiary_id: str
    delivered_items: Dict[str, int]
    confirmation_code: Optional[str] = "CONFIRMED"

class LowStockCheckInput(BaseModel):
    warehouse_id: str
    warehouse_name: str
    inventory: List[Dict[str, Any]]

class OfflineSyncInput(BaseModel):
    agent_id: str
    offline_records: List[Dict[str, Any]]

@router.get("/system-overview")
def get_system_overview_analytics() -> Dict[str, Any]:
    """Phase 10: Retrieve unified operational KPIs, stock levels, delivery metrics, and ledger status."""
    return TrackingAndAnalyticsService.get_system_analytics_summary()

@router.get("/audit-ledger")
def get_cryptographic_audit_ledger(limit: int = 50) -> Dict[str, Any]:
    """Phase 10: Retrieve the cryptographic audit chain and verify mathematical integrity."""
    integrity = CryptographicAuditLedger.verify_integrity()
    blocks = CryptographicAuditLedger.get_ledger(limit=limit)
    return {
        "integrity_status": integrity,
        "total_returned": len(blocks),
        "blocks": blocks
    }

@router.post("/verify-delivery-proof")
async def generate_proof_of_delivery(
    payload: ProofOfDeliveryInput,
    current_user = Depends(require_volunteer)
) -> Dict[str, Any]:
    """Phase 10: Create a verifiable, cryptographic Proof-of-Delivery receipt for a completed aid stop."""
    pod = TrackingAndAnalyticsService.generate_proof_of_delivery(
        delivery_id=payload.delivery_id,
        waypoint_id=payload.waypoint_id,
        beneficiary_id=payload.beneficiary_id,
        delivered_items=payload.delivered_items,
        agent_id=current_user.id,
        confirmation_code=payload.confirmation_code or "CONFIRMED"
    )

    # Broadcast event via WebSocket
    await alert_manager.broadcast({
        "type": "PROOF_OF_DELIVERY_CONFIRMED",
        "data": pod
    })

    return pod

@router.post("/check-low-stock")
async def check_warehouse_low_stock(payload: LowStockCheckInput) -> Dict[str, Any]:
    """Phase 10: Scan warehouse inventory and trigger emergency low-stock alerts."""
    alerts = TrackingAndAnalyticsService.check_low_stock_thresholds(
        warehouse_id=payload.warehouse_id,
        warehouse_name=payload.warehouse_name,
        inventory=payload.inventory
    )

    for a in alerts:
        await alert_manager.broadcast({
            "type": "LOW_STOCK_EMERGENCY",
            "data": a
        })

    return {
        "warehouse_id": payload.warehouse_id,
        "scanned_items": len(payload.inventory),
        "alerts_triggered": len(alerts),
        "alerts": alerts
    }

@router.post("/offline-sync")
def sync_offline_field_batch(
    payload: OfflineSyncInput,
    current_user = Depends(require_volunteer)
) -> Dict[str, Any]:
    """Phase 10: Ingest and merge batches recorded by field agents during offline disconnected operations."""
    return TrackingAndAnalyticsService.process_offline_sync_batch(
        agent_id=payload.agent_id or current_user.id,
        offline_records=payload.offline_records
    )
