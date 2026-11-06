from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.models.supabase_models import Resource, Warehouse, AuditLog
from app.schemas.api_schemas import (
    ResourceCreate, ResourceUpdate, ResourceOut,
    WarehouseCreate, WarehouseOut
)
from app.core.security import require_warehouse_manager, require_admin, require_ngo, get_current_user

router = APIRouter()

class InboundDonationInput(BaseModel):
    warehouse_id: str
    donor_org: str
    item_category: str  # WATER, FOOD, MEDICAL, SHELTER, SANITATION, COMMUNICATION
    item_name: str
    quantity: int
    unit: str = "units"
    minimum_threshold: int = 100

class OutboundDistributionInput(BaseModel):
    warehouse_id: str
    item_id: str
    quantity: int
    target_delivery_mission_id: Optional[str] = None

# ----------------- Resources (Stock Items) -----------------
@router.get("/", response_model=List[ResourceOut])
def list_resources(
    warehouse_id: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all available relief resources, optionally filtered by warehouse or category."""
    query = db.query(Resource)
    if warehouse_id:
        query = query.filter(Resource.warehouse_id == warehouse_id)
    if category:
        query = query.filter(Resource.item_category == category.upper())
    return query.all()

@router.post("/", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def add_resource_item(
    item_in: ResourceCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_warehouse_manager)
):
    """Add new resource inventory to a warehouse (Warehouse Manager or Admin)."""
    wh = db.query(Warehouse).filter(Warehouse.id == item_in.warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Target warehouse does not exist.")

    existing = db.query(Resource).filter(
        Resource.warehouse_id == item_in.warehouse_id,
        Resource.item_category == item_in.item_category.upper(),
        Resource.item_name == item_in.item_name
    ).first()

    if existing:
        existing.quantity_available += item_in.quantity_available
        db.commit()
        db.refresh(existing)
        return existing

    resource = Resource(
        warehouse_id=item_in.warehouse_id,
        item_category=item_in.item_category.upper(),
        item_name=item_in.item_name,
        quantity_available=item_in.quantity_available,
        quantity_reserved=item_in.quantity_reserved,
        unit=item_in.unit,
        minimum_threshold=item_in.minimum_threshold,
        expiry_date=item_in.expiry_date
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)
    return resource

@router.post("/donations/record", response_model=ResourceOut, status_code=status.HTTP_201_CREATED)
def record_inbound_donation(
    payload: InboundDonationInput,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Record an incoming aid donation pledge from an NGO/Donor and update warehouse inventory."""
    wh = db.query(Warehouse).filter(Warehouse.id == payload.warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Target warehouse not found.")

    existing = db.query(Resource).filter(
        Resource.warehouse_id == payload.warehouse_id,
        Resource.item_category == payload.item_category.upper(),
        Resource.item_name == payload.item_name
    ).first()

    if existing:
        existing.quantity_available += payload.quantity
        res = existing
    else:
        res = Resource(
            warehouse_id=payload.warehouse_id,
            item_category=payload.item_category.upper(),
            item_name=payload.item_name,
            quantity_available=payload.quantity,
            unit=payload.unit,
            minimum_threshold=payload.minimum_threshold
        )
        db.add(res)

    # Log to audit_logs
    audit = AuditLog(
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="INBOUND_DONATION_LOGGED",
        entity_table="resources",
        details=f"Pledged {payload.quantity} {payload.unit} of {payload.item_name} by {payload.donor_org}"
    )
    db.add(audit)
    db.commit()
    db.refresh(res)
    return res

@router.post("/distribute", response_model=ResourceOut)
def record_outbound_distribution(
    payload: OutboundDistributionInput,
    db: Session = Depends(get_db),
    current_user = Depends(require_warehouse_manager)
):
    """Deduct inventory when relief supplies are loaded onto vehicles for distribution."""
    res = db.query(Resource).filter(
        Resource.id == payload.item_id,
        Resource.warehouse_id == payload.warehouse_id
    ).first()
    if not res:
        raise HTTPException(status_code=404, detail="Resource item not found in warehouse.")

    if payload.quantity > res.quantity_available:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient inventory: requested {payload.quantity}, only {res.quantity_available} available."
        )

    res.quantity_available -= payload.quantity
    db.commit()
    db.refresh(res)
    return res

@router.patch("/{resource_id}", response_model=ResourceOut)
def update_resource_stock(
    resource_id: str,
    update_in: ResourceUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_warehouse_manager)
):
    """Update stock quantities for a resource (Warehouse Manager or Admin)."""
    resource = db.query(Resource).filter(Resource.id == resource_id).first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource item not found.")
    
    if update_in.quantity_available is not None:
        resource.quantity_available = update_in.quantity_available
    if update_in.quantity_reserved is not None:
        resource.quantity_reserved = update_in.quantity_reserved
    
    db.commit()
    db.refresh(resource)
    return resource

@router.get("/low-stock", response_model=List[ResourceOut])
def list_low_stock_resources(db: Session = Depends(get_db)):
    """List all resources currently below their minimum safety thresholds."""
    return db.query(Resource).filter(Resource.quantity_available <= Resource.minimum_threshold).all()

# ----------------- Warehouses -----------------
@router.get("/warehouses", response_model=List[WarehouseOut])
def list_warehouses(disaster_id: Optional[str] = None, db: Session = Depends(get_db)):
    """List all registered disaster warehouses and forward depots."""
    query = db.query(Warehouse)
    if disaster_id:
        query = query.filter(Warehouse.disaster_id == disaster_id)
    return query.all()

@router.post("/warehouses", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(
    wh_in: WarehouseCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Register a new distribution warehouse (Admin only)."""
    warehouse = Warehouse(**wh_in.dict())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.get("/warehouses/{warehouse_id}/summary")
def get_warehouse_inventory_summary(warehouse_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Retrieve full warehouse inventory metrics, category totals, and low-stock count."""
    wh = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Warehouse not found.")

    resources = db.query(Resource).filter(Resource.warehouse_id == warehouse_id).all()
    total_stock = sum(r.quantity_available for r in resources)
    low_stock_count = sum(1 for r in resources if r.quantity_available <= r.minimum_threshold)

    category_breakdown = {}
    for r in resources:
        category_breakdown[r.item_category] = category_breakdown.get(r.item_category, 0) + r.quantity_available

    return {
        "warehouse_id": wh.id,
        "warehouse_name": wh.name,
        "location": wh.location_name,
        "total_available_stock": total_stock,
        "low_stock_alerts_count": low_stock_count,
        "category_totals": category_breakdown
    }
