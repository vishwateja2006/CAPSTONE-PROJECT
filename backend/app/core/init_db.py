import json
from datetime import datetime
from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
import app.models  # Ensures all canonical models (Profile, Location, Warehouse, etc.) are registered
from app.models.user import User, UserRole
from app.models.disaster import Disaster, HazardZone
from app.models.resource import ReliefCenter, InventoryItem, ReliefVehicle
from app.models.sos import SOSRequest
from app.models.supabase_models import Profile

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # Seed Admin & Volunteer profiles for RBAC / Auth endpoints
        if not db.query(Profile).filter(Profile.email == "admin@resqai.org").first():
            admin_profile = Profile(
                email="admin@resqai.org",
                username="admin",
                hashed_password=get_password_hash("Admin@1234"),
                full_name="National Disaster Coordinator",
                role="ADMIN",
                phone="+91-9876543210"
            )
            volunteer_profile = Profile(
                email="volunteer@resqai.org",
                username="volunteer",
                hashed_password=get_password_hash("Volunteer@1234"),
                full_name="Rapid Response Team Alpha",
                role="VOLUNTEER",
                phone="+91-9876543211"
            )
            db.add_all([admin_profile, volunteer_profile])
            db.commit()

        # 1. Admin & Coordinator Legacy Users
        if not db.query(User).first():
            admin_user = User(
                email="admin@resqai.org",
                hashed_password=get_password_hash("Admin@1234"),
                full_name="National Disaster Coordinator",
                role=UserRole.ADMIN.value,
                phone="+91-9876543210"
            )
            responder_user = User(
                email="volunteer@resqai.org",
                hashed_password=get_password_hash("Volunteer@1234"),
                full_name="Rapid Response Team Alpha",
                role=UserRole.RESPONDER.value,
                phone="+91-9876543211"
            )
            db.add_all([admin_user, responder_user])
            db.commit()

        # 2. Active Disaster: Coastal Super-Cyclone & Urban Flood
        disaster = db.query(Disaster).first()
        if not disaster:
            disaster = Disaster(
                name="Hyderabad Urban Flash Floods & Musi River Basin Breach",
                disaster_type="FLOOD",
                status="ACTIVE",
                severity="CRITICAL",
                epicenter_lat=17.3850,
                epicenter_lon=78.4867,
                radius_km=30.0,
                description="Severe urban cloudburst and Musi River surge with extensive inundation across low-lying Hyderabad sectors."
            )
            db.add(disaster)
            db.commit()
            db.refresh(disaster)

        # 3. Hazard Zone (Red Zone - Severely Inundated / Impassable)
        if not db.query(HazardZone).first():
            hazard = HazardZone(
                disaster_id=disaster.id,
                name="Zone A - Flooded Musi River Causeway Sector",
                risk_level="RED",
                boundary_geojson=json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [78.470, 17.360],
                        [78.530, 17.360],
                        [78.530, 17.395],
                        [78.470, 17.395],
                        [78.470, 17.360]
                    ]]
                }),
                is_passable=False,
                road_blockages_json=json.dumps(["Bridges 3 and 4 submerged", "NH-45 South lane blocked"])
            )
            db.add(hazard)
            db.commit()

        # 3b. Canonical Location for DisasterOut serialization
        from app.models.supabase_models import Location as SupabaseLocation
        if not db.query(SupabaseLocation).first():
            loc = SupabaseLocation(
                disaster_id=disaster.id,
                name="Zone A - Flooded Musi River Causeway Sector",
                district="Hyderabad",
                state="Telangana",
                risk_level="RED",
                boundary_geojson=json.dumps({
                    "type": "Polygon",
                    "coordinates": [[
                        [78.470, 17.360],
                        [78.530, 17.360],
                        [78.530, 17.395],
                        [78.470, 17.395],
                        [78.470, 17.360]
                    ]]
                }),
                is_accessible=False,
                road_blockage_notes="Bridges 3 and 4 submerged, NH-45 South lane blocked"
            )
            db.add(loc)
            db.commit()

        # 4. Central Relief Center / Depot
        depot = db.query(ReliefCenter).first()
        if not depot:
            depot = ReliefCenter(
                disaster_id=disaster.id,
                name="Central Emergency Relief Base Alpha",
                location_name="Jawaharlal Nehru Stadium Complex",
                latitude=13.0837,
                longitude=80.2785,
                contact_person="Col. Rajesh Sharma",
                phone="+91-9444012345",
                capacity_people=2500,
                current_occupancy=450
            )
            db.add(depot)
            db.commit()
            db.refresh(depot)

        # 5. Inventory Stock at Central Depot
        if not db.query(InventoryItem).first():
            inv_items = [
                InventoryItem(relief_center_id=depot.id, item_category="FOOD", item_name="Emergency Dry Ration Packs", quantity_available=850, unit="packets"),
                InventoryItem(relief_center_id=depot.id, item_category="WATER", item_name="Purified Water Cans (5L)", quantity_available=1200, unit="cans"),
                InventoryItem(relief_center_id=depot.id, item_category="MEDICAL", item_name="Trauma & First Aid Field Kits", quantity_available=150, unit="kits"),
                InventoryItem(relief_center_id=depot.id, item_category="SHELTER", item_name="Thermal Blankets & Tents", quantity_available=300, unit="units"),
                InventoryItem(relief_center_id=depot.id, item_category="SANITATION", item_name="Chlorine Tablets & Hygiene Kits", quantity_available=400, unit="kits")
            ]
            db.add_all(inv_items)
            db.commit()

        # 6. Fleet of Relief Vehicles
        if not db.query(ReliefVehicle).first():
            vehicles = [
                ReliefVehicle(
                    vehicle_code="RESCUE-TRUCK-01",
                    vehicle_type="TRUCK",
                    capacity_kg=1500.0,
                    current_lat=13.0837,
                    current_lon=80.2785,
                    status="IDLE",
                    assigned_driver="Officer Vikram Singh",
                    speed_kmh=35.0
                ),
                ReliefVehicle(
                    vehicle_code="BOAT-RESCUE-02",
                    vehicle_type="BOAT",
                    capacity_kg=600.0,
                    current_lat=13.0720,
                    current_lon=80.2600,
                    status="IDLE",
                    assigned_driver="Capt. Manikandan",
                    speed_kmh=20.0
                ),
                ReliefVehicle(
                    vehicle_code="RAPID-4X4-03",
                    vehicle_type="4X4",
                    capacity_kg=800.0,
                    current_lat=13.0837,
                    current_lon=80.2785,
                    status="IDLE",
                    assigned_driver="Lt. Priya Nair",
                    speed_kmh=45.0
                )
            ]
            db.add_all(vehicles)
            db.commit()

        # 7. Incoming SOS Emergency Reports
        if not db.query(SOSRequest).first():
            sos_list = [
                SOSRequest(
                    disaster_id=disaster.id,
                    victim_name="Kavitha Sundaram",
                    contact_phone="+91-9840112233",
                    latitude=17.3780,
                    longitude=78.4910,
                    address="12 Musi Causeway Road, Chaderghat Lowlands, Hyderabad",
                    people_count=4,
                    urgency_level="CRITICAL",
                    urgency_score=92.0,
                    special_needs=json.dumps(["infant", "insulin-dependent"]),
                    category_needs=json.dumps(["FOOD", "WATER", "MEDICAL"]),
                    description="Water reached first floor, baby needs formula milk and mother needs cold storage insulin urgently. Trapped.",
                    status="PENDING"
                ),
                SOSRequest(
                    disaster_id=disaster.id,
                    victim_name="Ramesh Babu & Elderly Community",
                    contact_phone="+91-9840556677",
                    latitude=13.0450,
                    longitude=80.2400,
                    address="Senior Care Annex, T. Nagar",
                    people_count=12,
                    urgency_level="CRITICAL",
                    urgency_score=88.5,
                    special_needs=json.dumps(["elderly", "oxygen-cylinder", "wheelchair"]),
                    category_needs=json.dumps(["MEDICAL", "WATER", "EVACUATION"]),
                    description="12 elderly residents stranded. Backup generator failed, oxygen concentrator offline.",
                    status="PENDING"
                ),
                SOSRequest(
                    disaster_id=disaster.id,
                    victim_name="Anand Kumar",
                    contact_phone="+91-9840998811",
                    latitude=13.0950,
                    longitude=80.2850,
                    address="Fishermen Colony, Kasimedu",
                    people_count=6,
                    urgency_level="HIGH",
                    urgency_score=72.0,
                    special_needs=json.dumps(["pregnant"]),
                    category_needs=json.dumps(["FOOD", "WATER"]),
                    description="Roof damaged by heavy gale winds. Drinking water contaminated.",
                    status="PENDING"
                ),
                SOSRequest(
                    disaster_id=disaster.id,
                    victim_name="Dr. Farooq",
                    contact_phone="+91-9840334455",
                    latitude=13.0550,
                    longitude=80.2750,
                    address="Royapettah High Road",
                    people_count=8,
                    urgency_level="HIGH",
                    urgency_score=68.0,
                    special_needs=json.dumps(["injured"]),
                    category_needs=json.dumps(["MEDICAL", "FOOD"]),
                    description="Minor injuries from shattered glass. First aid supplies exhausted.",
                    status="PENDING"
                )
            ]
            db.add_all(sos_list)
            db.commit()

        # 8. Canonical Warehouse, Resources, Fleet & Requests
        from app.models.supabase_models import (
            Warehouse as SWarehouse,
            Resource as SResource,
            Vehicle as SVehicle,
            Beneficiary as SBeneficiary,
            Request as SRequest
        )
        canonical_wh = db.query(SWarehouse).first()
        if not canonical_wh:
            canonical_wh = SWarehouse(
                disaster_id=disaster.id,
                name="Central Emergency Relief Base Alpha",
                location_name="Jawaharlal Nehru Stadium Complex",
                latitude=13.0837,
                longitude=80.2785,
                manager_id=admin_profile.id,
                contact_phone="+91-9444012345",
                capacity_sqft=25000.0,
                is_active=True
            )
            db.add(canonical_wh)
            db.commit()
            db.refresh(canonical_wh)

        if not db.query(SResource).first():
            wh_resources = [
                SResource(warehouse_id=canonical_wh.id, item_category="FOOD", item_name="Emergency Dry Ration Packs", quantity_available=850, unit="packets"),
                SResource(warehouse_id=canonical_wh.id, item_category="WATER", item_name="Purified Water Cans (5L)", quantity_available=1200, unit="cans"),
                SResource(warehouse_id=canonical_wh.id, item_category="MEDICAL", item_name="Trauma & First Aid Field Kits", quantity_available=150, unit="kits"),
                SResource(warehouse_id=canonical_wh.id, item_category="SHELTER", item_name="Thermal Blankets & Tents", quantity_available=300, unit="units"),
                SResource(warehouse_id=canonical_wh.id, item_category="SANITATION", item_name="Chlorine Tablets & Hygiene Kits", quantity_available=400, unit="kits")
            ]
            db.add_all(wh_resources)
            db.commit()

        if not db.query(SVehicle).first():
            canonical_vehicles = [
                SVehicle(vehicle_code="RESCUE-TRUCK-01", vehicle_type="TRUCK", capacity_kg=1500.0, current_lat=13.0837, current_lon=80.2785, status="IDLE", speed_kmh=35.0, driver_id=admin_profile.id),
                SVehicle(vehicle_code="BOAT-RESCUE-02", vehicle_type="BOAT", capacity_kg=600.0, current_lat=13.0720, current_lon=80.2600, status="IDLE", speed_kmh=20.0, driver_id=volunteer_profile.id),
                SVehicle(vehicle_code="RAPID-4X4-03", vehicle_type="4X4", capacity_kg=800.0, current_lat=13.0837, current_lon=80.2785, status="IDLE", speed_kmh=45.0, driver_id=volunteer_profile.id)
            ]
            db.add_all(canonical_vehicles)
            db.commit()

        ben = db.query(SBeneficiary).first()
        if not ben:
            ben = SBeneficiary(
                head_of_household="Kavitha Sundaram",
                contact_phone="+91-9840112233",
                address="12 Musi Causeway Road, Hyderabad",
                latitude=17.3780,
                longitude=78.4910,
                people_count=4,
                special_needs=["infant", "insulin-dependent"]
            )
            db.add(ben)
            db.commit()
            db.refresh(ben)

        if not db.query(SRequest).first():
            req = SRequest(
                disaster_id=disaster.id,
                beneficiary_id=ben.id,
                urgency_level="CRITICAL",
                urgency_score=92.0,
                category_needs=["FOOD", "WATER", "MEDICAL"],
                description="Water reached first floor, infant formula and insulin required.",
                status="PENDING"
            )
            db.add(req)
            db.commit()

        print("Initial demonstration disaster data successfully seeded!")
    finally:
        db.close()

