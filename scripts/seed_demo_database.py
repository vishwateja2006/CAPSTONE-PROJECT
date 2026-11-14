#!/usr/bin/env python3
"""
ResQLink: Unified Database Seeder Script.
Populates all operational and analytical database tables with realistic
humanitarian disaster relief data for local demonstration, testing, and evaluation.
Supports both SQLAlchemy core schema (sos_requests, relief_centers, inventory_items, relief_vehicles)
and administrative Supabase schema (profiles, disasters, warehouses, resources, requests, audit_logs).
"""

import sys
import os
import json
import sqlite3
import hashlib
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
DB_FILE = os.path.join(PROJECT_ROOT, "backend", "disaster_platform.db")

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def main():
    print(f"[*] Seeding ResQLink unified database at: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # 1. Clean Re-creation of All Tables
    all_tables = [
        "profiles", "users", "disasters", "relief_centers", "warehouses",
        "inventory_items", "resources", "relief_vehicles", "vehicles",
        "sos_requests", "beneficiaries", "requests", "hazard_zones",
        "locations", "deliveries", "alerts", "audit_logs"
    ]
    for tbl in all_tables:
        cursor.execute(f"DROP TABLE IF EXISTS {tbl}")

    cursor.executescript("""
    -- Profiles / Authentication
    CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone_number TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL,
        phone TEXT,
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Disasters
    CREATE TABLE IF NOT EXISTS disasters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        disaster_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        epicenter_lat REAL NOT NULL,
        epicenter_lon REAL NOT NULL,
        radius_km REAL DEFAULT 30.0,
        description TEXT,
        declared_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Relief Centers & Warehouses
    CREATE TABLE IF NOT EXISTS relief_centers (
        id TEXT PRIMARY KEY,
        disaster_id TEXT,
        name TEXT NOT NULL,
        location_name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        contact_person TEXT,
        phone TEXT,
        capacity_people INTEGER DEFAULT 500,
        current_occupancy INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS warehouses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        manager_id TEXT,
        max_storage_sqm REAL DEFAULT 5000.0
    );

    -- Inventory Items & Resources
    CREATE TABLE IF NOT EXISTS inventory_items (
        id TEXT PRIMARY KEY,
        relief_center_id TEXT NOT NULL,
        item_category TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity_available INTEGER NOT NULL DEFAULT 0,
        quantity_reserved INTEGER DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'units',
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT,
        item_category TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity_available INTEGER NOT NULL DEFAULT 0,
        quantity_reserved INTEGER DEFAULT 0,
        unit TEXT NOT NULL DEFAULT 'units'
    );

    -- Relief Vehicles (Fleet)
    CREATE TABLE IF NOT EXISTS relief_vehicles (
        id TEXT PRIMARY KEY,
        vehicle_code TEXT UNIQUE NOT NULL,
        vehicle_type TEXT NOT NULL DEFAULT 'TRUCK',
        capacity_kg REAL NOT NULL DEFAULT 1000.0,
        current_lat REAL NOT NULL,
        current_lon REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'IDLE',
        assigned_driver TEXT,
        speed_kmh REAL DEFAULT 35.0
    );

    CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        vehicle_code TEXT UNIQUE NOT NULL,
        vehicle_type TEXT NOT NULL,
        capacity_kg REAL NOT NULL,
        average_speed_kmh REAL NOT NULL,
        current_lat REAL NOT NULL,
        current_lon REAL NOT NULL,
        status TEXT DEFAULT 'IDLE',
        assigned_driver TEXT
    );

    -- SOS Requests & Beneficiary Distress Signals
    CREATE TABLE IF NOT EXISTS sos_requests (
        id TEXT PRIMARY KEY,
        disaster_id TEXT,
        victim_name TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        address TEXT,
        people_count INTEGER NOT NULL DEFAULT 1,
        urgency_level TEXT NOT NULL DEFAULT 'HIGH',
        urgency_score REAL NOT NULL DEFAULT 75.0,
        special_needs TEXT DEFAULT '[]',
        category_needs TEXT DEFAULT '[]',
        description TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        assigned_vehicle_id TEXT,
        requested_at TEXT DEFAULT CURRENT_TIMESTAMP,
        resolved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS beneficiaries (
        id TEXT PRIMARY KEY,
        head_of_household TEXT NOT NULL,
        household_size INTEGER NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        vulnerability_score REAL DEFAULT 50.0
    );

    CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        beneficiary_id TEXT,
        disaster_id TEXT,
        requested_categories TEXT,
        urgency_score REAL NOT NULL,
        status TEXT DEFAULT 'PENDING',
        description TEXT
    );

    -- Hazard Zones
    CREATE TABLE IF NOT EXISTS hazard_zones (
        id TEXT PRIMARY KEY,
        disaster_id TEXT,
        name TEXT NOT NULL,
        risk_level TEXT NOT NULL,
        boundary_geojson TEXT,
        is_passable INTEGER DEFAULT 0,
        road_blockages_json TEXT
    );

    CREATE TABLE IF NOT EXISTS locations (
        id TEXT PRIMARY KEY,
        disaster_id TEXT,
        name TEXT NOT NULL,
        location_type TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        is_accessible INTEGER DEFAULT 1,
        boundary_geojson TEXT
    );

    -- Deliveries, Alerts, and Audit Logs
    CREATE TABLE IF NOT EXISTS deliveries (
        id TEXT PRIMARY KEY,
        disaster_id TEXT,
        vehicle_id TEXT,
        warehouse_id TEXT,
        total_distance_km REAL,
        estimated_duration_mins REAL,
        status TEXT DEFAULT 'STAGED',
        waypoints_json TEXT
    );

    CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        disaster_id TEXT,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        severity TEXT NOT NULL,
        broadcast_channel TEXT NOT NULL,
        is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        actor_id TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        entity_id TEXT,
        details TEXT
    );
    """)

    # Clear tables before re-seeding
    all_tables = [
        "profiles", "users", "disasters", "relief_centers", "warehouses",
        "inventory_items", "resources", "relief_vehicles", "vehicles",
        "sos_requests", "beneficiaries", "requests", "hazard_zones",
        "locations", "deliveries", "alerts", "audit_logs"
    ]
    for tbl in all_tables:
        cursor.execute(f"DELETE FROM {tbl}")

    # 1. Profiles & Users (Admin & Citizen Roles)
    profiles = [
        ("USR-01", "admin@resqlink.org", hash_pw("admin123"), "Root Administrator", "ADMIN", "+91-9840011111"),
        ("USR-02", "authority@ndma.gov", hash_pw("auth123"), "Dr. Rajesh Sharma (NDMA Authority)", "DISASTER_AUTHORITY", "+91-9840022222"),
        ("USR-03", "donor@redcross.org", hash_pw("donor123"), "Red Cross Humanitarian Fund", "NGO_DONOR", "+91-9840033333"),
        ("USR-04", "depot.alpha@resqlink.org", hash_pw("depot123"), "Vikram Singh (Warehouse Manager)", "WAREHOUSE_MANAGER", "+91-9840044444"),
        ("USR-05", "volunteer.priya@resqlink.org", hash_pw("vol123"), "Lt. Priya Nair (Field Agent)", "VOLUNTEER", "+91-9840055555"),
        ("USR-06", "citizen@resqlink.org", hash_pw("citizen123"), "Citizen / Community User", "CITIZEN", "+91-9840066666")
    ]
    cursor.executemany("INSERT INTO profiles (id, email, hashed_password, full_name, role, phone_number) VALUES (?, ?, ?, ?, ?, ?)", profiles)
    cursor.executemany("INSERT INTO users (id, email, hashed_password, full_name, role, phone) VALUES (?, ?, ?, ?, ?, ?)", profiles)

    # 2. Active Disaster
    cursor.execute("""
    INSERT INTO disasters (id, name, disaster_type, severity, status, epicenter_lat, epicenter_lon, radius_km, description, declared_by)
    VALUES ('DIS-CHENNAI-FLOOD-2026', 'Cyclone Michaung Relict Inundation', 'FLOOD', 'CRITICAL', 'ACTIVE', 13.0600, 80.2500, 30.0, 'Category 4 Surge Surge breach with severe low-lying inundation.', 'USR-02')
    """)

    # 3. Relief Centers & Warehouses
    relief_centers = [
        ("RC-01", "DIS-CHENNAI-FLOOD-2026", "Chennai Central Humanitarian Relief Hub", "Jawaharlal Nehru Stadium Complex", 13.0827, 80.2707, "Col. Rajesh Sharma", "+91-9444012345", 2500, 450),
        ("RC-02", "DIS-CHENNAI-FLOOD-2026", "South Chennai Emergency Depot Beta", "Velachery Flood Relief Center", 13.0450, 80.2400, "Vikram Singh", "+91-9444054321", 1200, 320)
    ]
    cursor.executemany("INSERT INTO relief_centers (id, disaster_id, name, location_name, latitude, longitude, contact_person, phone, capacity_people, current_occupancy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", relief_centers)

    cursor.execute("INSERT INTO warehouses (id, name, latitude, longitude, manager_id) VALUES ('WH-CHENNAI-CENTRAL', 'Chennai Central Humanitarian Hub', 13.0827, 80.2707, 'USR-04')")
    cursor.execute("INSERT INTO warehouses (id, name, latitude, longitude, manager_id) VALUES ('WH-CHENNAI-SOUTH', 'South Chennai Emergency Depot Beta', 13.0450, 80.2400, 'USR-04')")

    # 4. Inventory Stocks
    inventory = [
        ("INV-01", "RC-01", "WATER", "Purified Drinking Water Cans (5L)", 1400, 0, "cans"),
        ("INV-02", "RC-01", "FOOD", "Emergency Ration Packs (2100 kcal)", 950, 0, "packs"),
        ("INV-03", "RC-01", "MEDICAL", "Comprehensive Trauma & First Aid Kits", 150, 0, "kits"),
        ("INV-04", "RC-01", "SHELTER", "Thermal Tarpaulin Blankets & Tents", 500, 0, "units"),
        ("INV-05", "RC-02", "WATER", "Purified Water (5L)", 800, 0, "cans"),
        ("INV-06", "RC-02", "FOOD", "Food Rations", 600, 0, "packs")
    ]
    cursor.executemany("INSERT INTO inventory_items (id, relief_center_id, item_category, item_name, quantity_available, quantity_reserved, unit) VALUES (?, ?, ?, ?, ?, ?, ?)", inventory)

    resources = [
        ("RES-01", "WH-CHENNAI-CENTRAL", "WATER", "Purified Drinking Water Cans (5L)", 1400, 0, "cans"),
        ("RES-02", "WH-CHENNAI-CENTRAL", "FOOD", "Emergency Ration Packs (2100 kcal)", 950, 0, "packs"),
        ("RES-03", "WH-CHENNAI-CENTRAL", "MEDICINE", "Comprehensive Trauma & First Aid Kits", 150, 0, "kits"),
        ("RES-04", "WH-CHENNAI-CENTRAL", "BLANKETS", "Thermal Tarpaulin Blankets", 500, 0, "units")
    ]
    cursor.executemany("INSERT INTO resources (id, warehouse_id, item_category, item_name, quantity_available, quantity_reserved, unit) VALUES (?, ?, ?, ?, ?, ?, ?)", resources)

    # 5. Relief Vehicles
    fleet = [
        ("VEH-01", "TRUCK-4x4-ALPHA", "TRUCK", 1500.0, 13.0827, 80.2707, "IDLE", "Officer Vikram Singh", 40.0),
        ("VEH-02", "TRUCK-RESCUE-BETA", "TRUCK", 1200.0, 13.0827, 80.2707, "IDLE", "Lt. Priya Nair", 35.0),
        ("VEH-03", "BOAT-RESCUE-01", "BOAT", 600.0, 13.0600, 80.2500, "EN_ROUTE", "Capt. Manikandan", 20.0)
    ]
    cursor.executemany("INSERT INTO relief_vehicles (id, vehicle_code, vehicle_type, capacity_kg, current_lat, current_lon, status, assigned_driver, speed_kmh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", fleet)

    vehicles_supa = [
        ("VEH-01", "TRUCK-4x4-ALPHA", "TRUCK", 1500.0, 40.0, 13.0827, 80.2707, "IDLE", "Officer Vikram Singh"),
        ("VEH-02", "TRUCK-RESCUE-BETA", "TRUCK", 1200.0, 35.0, 13.0827, 80.2707, "IDLE", "Lt. Priya Nair"),
        ("VEH-03", "BOAT-RESCUE-01", "BOAT", 600.0, 20.0, 13.0600, 80.2500, "EN_ROUTE", "Capt. Manikandan")
    ]
    cursor.executemany("INSERT INTO vehicles (id, vehicle_code, vehicle_type, capacity_kg, average_speed_kmh, current_lat, current_lon, status, assigned_driver) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", vehicles_supa)

    # 6. SOS Requests
    sos_records = [
        ("sos-01", "DIS-CHENNAI-FLOOD-2026", "Kavitha Sundaram (Infant & Diabetic)", "+91-9840112233", 13.0650, 80.2550, "12 Canal Bank Road, Kotturpuram", 4, "CRITICAL", 95.0, json.dumps(["infant", "insulin-dependent"]), json.dumps(["FOOD", "WATER", "MEDICAL"]), "Water reached first floor. Diabetic grandmother needs cold-storage insulin, infant needs formula.", "PENDING", None),
        ("sos-02", "DIS-CHENNAI-FLOOD-2026", "Senior Care Care Home (Ramesh Babu)", "+91-9840556677", 13.0450, 80.2400, "Senior Care Annex, T. Nagar", 12, "CRITICAL", 88.5, json.dumps(["elderly", "oxygen-cylinder", "wheelchair"]), json.dumps(["MEDICAL", "WATER", "EVACUATION"]), "Old age home generator failed. 12 elderly residents stranded without drinking water or oxygen.", "PENDING", None),
        ("sos-03", "DIS-CHENNAI-FLOOD-2026", "Anand Kumar (Fishermen Colony)", "+91-9840998811", 13.0950, 80.2850, "Fishermen Colony, Kasimedu", 6, "HIGH", 72.0, json.dumps(["pregnant"]), json.dumps(["FOOD", "WATER"]), "Roof damaged by gale winds. Drinking water contaminated by tidal seawater intrusion.", "PENDING", None),
        ("sos-04", "DIS-CHENNAI-FLOOD-2026", "Dr. Farooq (Community Clinic)", "+91-9840334455", 13.0550, 80.2750, "Royapettah High Road", 8, "HIGH", 68.0, json.dumps(["injured", "trauma"]), json.dumps(["MEDICAL", "FOOD"]), "Trauma victims taking shelter in clinic lobby. Running out of clean bandages and antipyretics.", "PENDING", None)
    ]
    cursor.executemany("INSERT INTO sos_requests (id, disaster_id, victim_name, contact_phone, latitude, longitude, address, people_count, urgency_level, urgency_score, special_needs, category_needs, description, status, assigned_vehicle_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", sos_records)

    # 7. Beneficiaries & Requests for Supabase Schema
    bens = [
        ("BEN-01", "Kavitha Sundaram (Infant & Diabetic)", 4, 13.0650, 80.2550, 95.0),
        ("BEN-02", "Senior Care Care Home (12 Residents)", 12, 13.0450, 80.2400, 88.5),
        ("BEN-03", "Anand Kumar (Fishermen Colony)", 6, 13.0950, 80.2850, 72.0),
        ("BEN-04", "Dr. Farooq (Community Clinic)", 8, 13.0550, 80.2750, 68.0)
    ]
    cursor.executemany("INSERT INTO beneficiaries (id, head_of_household, household_size, latitude, longitude, vulnerability_score) VALUES (?, ?, ?, ?, ?, ?)", bens)

    requests = [
        ("REQ-01", "BEN-01", "DIS-CHENNAI-FLOOD-2026", json.dumps(["WATER", "FOOD", "MEDICAL"]), 95.0, "PENDING", "Water reached first floor. Insulin and baby formula needed."),
        ("REQ-02", "BEN-02", "DIS-CHENNAI-FLOOD-2026", json.dumps(["MEDICAL", "WATER"]), 88.5, "PENDING", "12 elderly residents stranded without drinking water."),
        ("REQ-03", "BEN-03", "DIS-CHENNAI-FLOOD-2026", json.dumps(["WATER", "FOOD"]), 72.0, "PENDING", "Roof damaged by gale winds. Drinking water contaminated."),
        ("REQ-04", "BEN-04", "DIS-CHENNAI-FLOOD-2026", json.dumps(["MEDICAL", "FOOD"]), 68.0, "PENDING", "Trauma victims taking shelter in clinic lobby.")
    ]
    cursor.executemany("INSERT INTO requests (id, beneficiary_id, disaster_id, requested_categories, urgency_score, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)", requests)

    # 8. Hazard Zones
    hazard_zones = [
        ("HZ-01", "DIS-CHENNAI-FLOOD-2026", "Zone A - Adyar Basin Flooded Sector", "RED", json.dumps({"type": "Polygon", "coordinates": [[[80.245, 13.010], [80.265, 13.010], [80.265, 13.035], [80.245, 13.035], [80.245, 13.010]]]}), 0, json.dumps(["Adyar Estuary Bridge Link submerged (3.2ft flood depth)"]))
    ]
    cursor.executemany("INSERT INTO hazard_zones (id, disaster_id, name, risk_level, boundary_geojson, is_passable, road_blockages_json) VALUES (?, ?, ?, ?, ?, ?, ?)", hazard_zones)

    # 9. Alerts
    cursor.execute("""
    INSERT INTO alerts (id, disaster_id, title, message, severity, broadcast_channel)
    VALUES ('ALT-01', 'DIS-CHENNAI-FLOOD-2026', 'DEFCON-1 Coastal Flash Flood Warning', 'Adyar river basin overflowing. Low-lying wards 170-182 evacuate immediately.', 'CRITICAL', 'ALL_CHANNELS')
    """)

    # 10. Audit Logs
    cursor.execute("""
    INSERT INTO audit_logs (id, actor_id, actor_role, action, entity_id, details)
    VALUES ('LOG-001', 'USR-02', 'DISASTER_AUTHORITY', 'INCIDENT_DECLARED', 'DIS-CHENNAI-FLOOD-2026', 'Declared Cyclone Michaung Category 4 Inundation Event.')
    """)

    conn.commit()
    conn.close()
    print("[✓] ResQLink unified database seeded successfully with synchronized schemas.")

if __name__ == "__main__":
    main()
