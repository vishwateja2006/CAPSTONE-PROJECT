from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.supabase_models import Resource, Warehouse
from app.schemas.api_schemas import (
    ResourceCreate, ResourceUpdate, ResourceOut,
    WarehouseCreate, WarehouseOut
)
from app.core.security import require_warehouse_manager, require_admin

router = APIRouter()

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

    # Check if this exact item exists, if so increment available
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
