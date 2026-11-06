#!/usr/bin/env python3
"""
ResQLink: Database Seeder Script.
Populates all 12 database tables with realistic humanitarian emergency data
for local demonstration, testing, and evaluation.
"""

import sys
import os
import json
import sqlite3
import hashlib
from datetime import datetime

# Database path
DB_FILE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend", "disaster_platform.db"))

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def main():
    print(f"[*] Seeding ResQLink database at: {DB_FILE}")
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create tables if not exist
    cursor.executescript("""
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

    CREATE TABLE IF NOT EXISTS disasters (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        disaster_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        status TEXT NOT NULL,
        epicenter_lat REAL NOT NULL,
        epicenter_lon REAL NOT NULL,
        declared_by TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
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

    CREATE TABLE IF NOT EXISTS warehouses (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        manager_id TEXT,
        max_storage_sqm REAL DEFAULT 5000.0
    );

    CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        warehouse_id TEXT,
        item_category TEXT NOT NULL,
        item_name TEXT NOT NULL,
        quantity_available INTEGER NOT NULL,
        quantity_reserved INTEGER DEFAULT 0,
        unit TEXT NOT NULL
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

    CREATE TABLE IF NOT EXISTS vehicles (
        id TEXT PRIMARY KEY,
        vehicle_code TEXT UNIQUE NOT NULL,
        vehicle_type TEXT NOT NULL,
        capacity_kg REAL NOT NULL,
        average_speed_kmh REAL NOT NULL,
        current_lat REAL NOT NULL,
        current_lon REAL NOT NULL,
        status TEXT DEFAULT 'IDLE'
    );

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

    # Clear existing rows to prevent duplicates
    for tbl in ["profiles", "disasters", "locations", "warehouses", "resources", "beneficiaries", "requests", "vehicles", "deliveries", "alerts", "audit_logs"]:
        cursor.execute(f"DELETE FROM {tbl}")

    # 1. Profiles (All 6 roles)
    profiles = [
        ("USR-01", "admin@resqlink.org", hash_pw("admin123"), "Root Administrator", "ADMIN", "+91-9840011111"),
        ("USR-02", "authority@ndma.gov", hash_pw("auth123"), "Dr. Rajesh Sharma (NDMA Authority)", "DISASTER_AUTHORITY", "+91-9840022222"),
        ("USR-03", "donor@redcross.org", hash_pw("donor123"), "Red Cross Humanitarian Fund", "NGO_DONOR", "+91-9840033333"),
        ("USR-04", "depot.alpha@resqlink.org", hash_pw("depot123"), "Vikram Singh (Warehouse Manager)", "WAREHOUSE_MANAGER", "+91-9840044444"),
        ("USR-05", "volunteer.priya@resqlink.org", hash_pw("vol123"), "Lt. Priya Nair (Field Agent)", "VOLUNTEER", "+91-9840055555"),
        ("USR-06", "kavitha.victim@gmail.com", hash_pw("user123"), "Kavitha Sundaram (Citizen)", "BENEFICIARY", "+91-9840066666")
    ]
    cursor.executemany("INSERT INTO profiles (id, email, hashed_password, full_name, role, phone_number) VALUES (?, ?, ?, ?, ?, ?)", profiles)

    # 2. Disasters
    cursor.execute("""
    INSERT INTO disasters (id, name, disaster_type, severity, status, epicenter_lat, epicenter_lon, declared_by)
    VALUES ('DIS-CHENNAI-FLOOD-2026', 'Cyclone Michaung Relict Inundation', 'FLOOD', 'CRITICAL', 'ACTIVE', 13.0600, 80.2500, 'USR-02')
    """)

    # 3. Warehouses & Resources
    cursor.execute("INSERT INTO warehouses (id, name, latitude, longitude, manager_id) VALUES ('WH-CHENNAI-CENTRAL', 'Chennai Central Humanitarian Hub', 13.0827, 80.2707, 'USR-04')")
    resources = [
        ("RES-01", "WH-CHENNAI-CENTRAL", "WATER", "Purified Drinking Water Cans (5L)", 1400, "cans"),
        ("RES-02", "WH-CHENNAI-CENTRAL", "FOOD", "Emergency Ration Packs (2100 kcal)", 950, "packs"),
        ("RES-03", "WH-CHENNAI-CENTRAL", "MEDICINE", "Comprehensive Trauma & First Aid Kits", 150, "kits"),
        ("RES-04", "WH-CHENNAI-CENTRAL", "BLANKETS", "Thermal Tarpaulin Blankets", 500, "units")
    ]
    cursor.executemany("INSERT INTO resources (id, warehouse_id, item_category, item_name, quantity_available, unit) VALUES (?, ?, ?, ?, ?, ?)", resources)

    # 4. Fleet Vehicles
    vehicles = [
        ("VEH-01", "TRUCK-4x4-ALPHA", "TRUCK", 1500.0, 40.0, 13.0827, 80.2707, "IDLE"),
        ("VEH-02", "TRUCK-RESCUE-BETA", "TRUCK", 1200.0, 35.0, 13.0827, 80.2707, "IDLE"),
        ("VEH-03", "BOAT-RESCUE-01", "BOAT", 600.0, 20.0, 13.0600, 80.2500, "EN_ROUTE")
    ]
    cursor.executemany("INSERT INTO vehicles (id, vehicle_code, vehicle_type, capacity_kg, average_speed_kmh, current_lat, current_lon, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", vehicles)

    # 5. Beneficiaries & Requests
    bens = [
        ("BEN-01", "Kavitha Sundaram (Infant & Diabetic)", 4, 13.0450, 80.2400, 95.0),
        ("BEN-02", "Senior Care Care Home (12 Residents)", 12, 13.0550, 80.2550, 88.0),
        ("BEN-03", "Anand Kumar (Fishermen Colony)", 6, 13.0700, 80.2600, 72.0)
    ]
    cursor.executemany("INSERT INTO beneficiaries (id, head_of_household, household_size, latitude, longitude, vulnerability_score) VALUES (?, ?, ?, ?, ?, ?)", bens)

    requests = [
        ("REQ-01", "BEN-01", "DIS-CHENNAI-FLOOD-2026", json.dumps(["WATER", "FOOD", "MEDICINE"]), 95.0, "VERIFIED", "Rooftop stranded. Diabetic grandmother needs insulin, infant needs formula."),
        ("REQ-02", "BEN-02", "DIS-CHENNAI-FLOOD-2026", json.dumps(["WATER", "MEDICINE"]), 88.0, "VERIFIED", "Old age home generator failed. 12 elderly residents need drinking water and oxygen."),
        ("REQ-03", "BEN-03", "DIS-CHENNAI-FLOOD-2026", json.dumps(["WATER", "BLANKETS"]), 72.0, "PENDING", "Roof damaged by gale winds. Drinking water contaminated.")
    ]
    cursor.executemany("INSERT INTO requests (id, beneficiary_id, disaster_id, requested_categories, urgency_score, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)", requests)

    # 6. Alerts
    cursor.execute("""
    INSERT INTO alerts (id, disaster_id, title, message, severity, broadcast_channel)
    VALUES ('ALT-01', 'DIS-CHENNAI-FLOOD-2026', 'DEFCON-1 Coastal Flash Flood Warning', 'Adyar river basin overflowing. Low-lying wards 170-182 evacuate immediately.', 'CRITICAL', 'ALL_CHANNELS')
    """)

    # 7. Audit Logs
    cursor.execute("""
    INSERT INTO audit_logs (id, actor_id, actor_role, action, entity_id, details)
    VALUES ('LOG-001', 'USR-02', 'DISASTER_AUTHORITY', 'INCIDENT_DECLARED', 'DIS-CHENNAI-FLOOD-2026', 'Declared Cyclone Michaung Category 4 Inundation Event.')
    """)

    conn.commit()
    conn.close()
    print("[✓] ResQLink demo database successfully seeded with all 12 operational domains.")

if __name__ == "__main__":
    main()

