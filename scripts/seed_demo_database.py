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

    # 3. Relief Centers & Warehouses (5 Regional Strategic Depots)
    relief_centers = [
        ("RC-01", "DIS-CHENNAI-FLOOD-2026", "Chennai Central Humanitarian Relief Base Alpha", "Jawaharlal Nehru Stadium Complex", 13.0827, 80.2707, "Col. Rajesh Sharma (Logistics Cmdr)", "+91-9444012345", 3000, 450),
        ("RC-02", "DIS-CHENNAI-FLOOD-2026", "South Chennai Emergency Staging Depot Beta", "Guindy SIDCO Logistics Hub", 13.0067, 80.2026, "Capt. Sundar Raman (Ops Head)", "+91-9444054321", 2000, 320),
        ("RC-03", "DIS-CHENNAI-FLOOD-2026", "North Coastal Maritime Relief Depot Gamma", "Kasimedu Fishing Harbour Forward Base", 13.1250, 80.2970, "Officer K. Annamalai (Maritime Cmdr)", "+91-9444078901", 1500, 210),
        ("RC-04", "DIS-CHENNAI-FLOOD-2026", "Western Inundation Relief Depot Delta", "Tambaram Airfield Perimeter Park", 12.9249, 80.1278, "Wing Cmdr. Arpitha Sen (Air Logistics)", "+91-9444099887", 3500, 580),
        ("RC-05", "DIS-CHENNAI-FLOOD-2026", "Velachery Flood Response Hub Epsilon", "Velachery Lowland Basin Command Center", 12.9815, 80.2180, "Insp. David Pushparaj (Flood Command)", "+91-9444033221", 1800, 390)
    ]
    cursor.executemany("INSERT INTO relief_centers (id, disaster_id, name, location_name, latitude, longitude, contact_person, phone, capacity_people, current_occupancy) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", relief_centers)

    warehouses = [
        ("WH-CHENNAI-CENTRAL", "Chennai Central Humanitarian Relief Base Alpha", 13.0827, 80.2707, "USR-04", 6000.0),
        ("WH-CHENNAI-SOUTH", "South Chennai Emergency Staging Depot Beta", 13.0067, 80.2026, "USR-04", 4500.0),
        ("WH-CHENNAI-NORTH", "North Coastal Maritime Relief Depot Gamma", 13.1250, 80.2970, "USR-05", 3500.0),
        ("WH-CHENNAI-WEST", "Western Inundation Relief Depot Delta", 12.9249, 80.1278, "USR-04", 7500.0),
        ("WH-CHENNAI-VELACHERY", "Velachery Flood Response Hub Epsilon", 12.9815, 80.2180, "USR-05", 4000.0)
    ]
    cursor.executemany("INSERT INTO warehouses (id, name, latitude, longitude, manager_id, max_storage_sqm) VALUES (?, ?, ?, ?, ?, ?)", warehouses)

    # 4. Respected Warehouse Inventory (Comprehensive Stock across all categories: WATER, FOOD, MEDICAL, SHELTER, HYGIENE)
    inventory = [
        # Depot Alpha (Central)
        ("INV-01", "RC-01", "WATER", "Purified Drinking Water Cans (5L)", 1400, 50, "cans"),
        ("INV-02", "RC-01", "WATER", "Emergency 20L Jerry Cans", 600, 20, "cans"),
        ("INV-03", "RC-01", "FOOD", "MRE High-Calorie Ration Packs (2,100 kcal)", 1250, 45, "packs"),
        ("INV-04", "RC-01", "FOOD", "Infant Baby Formula & Milk Powder", 420, 15, "tins"),
        ("INV-05", "RC-01", "MEDICAL", "Comprehensive Trauma & Hemostatic Kits", 180, 10, "kits"),
        ("INV-06", "RC-01", "MEDICAL", "Cold-Chain Insulin & Glucose Vials", 260, 25, "vials"),
        ("INV-07", "RC-01", "SHELTER", "Thermal Tarpaulin Blankets & Ground Sheets", 550, 30, "units"),
        ("INV-08", "RC-01", "SHELTER", "Rapid Inflatable Family Shelter Tents", 140, 10, "units"),
        ("INV-09", "RC-01", "HYGIENE", "Sanitation & Disinfection Care Kits", 480, 20, "kits"),
        ("INV-10", "RC-01", "HYGIENE", "Solar LED Flashlights & Emergency Powerbanks", 320, 15, "units"),

        # Depot Beta (Guindy South)
        ("INV-11", "RC-02", "WATER", "Packaged Mineral Drinking Water (1L Bottles)", 3200, 120, "bottles"),
        ("INV-12", "RC-02", "WATER", "Aquatabs Chlorine Water Purification Tablets", 1800, 50, "strips"),
        ("INV-13", "RC-02", "FOOD", "High-Calorie Nutritious Energy Biscuits", 1950, 80, "cartons"),
        ("INV-14", "RC-02", "FOOD", "Ready-to-Eat Rice & Dal Meal Pouches", 1150, 40, "packs"),
        ("INV-15", "RC-02", "MEDICAL", "Burn & Fracture Splint Emergency Packs", 210, 15, "kits"),
        ("INV-16", "RC-02", "MEDICAL", "Portable Medical Oxygen Cylinders", 45, 5, "cylinders"),
        ("INV-17", "RC-02", "SHELTER", "Heavy Duty PVC Waterproof Ground Tarps", 680, 30, "sheets"),
        ("INV-18", "RC-02", "SHELTER", "Water-Resistant Sleeping Mats & Bed Rolls", 420, 20, "units"),
        ("INV-19", "RC-02", "HYGIENE", "Antiseptic Hand Rubs & Medical Disinfectant (5L)", 360, 25, "cans"),
        ("INV-20", "RC-02", "HYGIENE", "N95 Protective Biohazard Masks", 2800, 100, "units"),

        # Depot Gamma (Kasimedu Maritime North)
        ("INV-21", "RC-03", "WATER", "Seawater Desalination Sachets & Water Cans (5L)", 950, 40, "cans"),
        ("INV-22", "RC-03", "WATER", "Electrolyte Oral Rehydration Salts (ORS)", 2200, 100, "sachets"),
        ("INV-23", "RC-03", "FOOD", "Maritime High-Energy Compact Ration Bars", 1350, 60, "packs"),
        ("INV-24", "RC-03", "FOOD", "Vacuum-Sealed Long-Life Grain & Rice Sacks (10kg)", 380, 20, "sacks"),
        ("INV-25", "RC-03", "MEDICAL", "Marine Shock & Hypothermia Trauma Kits", 175, 12, "kits"),
        ("INV-26", "RC-03", "MEDICAL", "Broad-Spectrum Emergency Antibiotics", 850, 35, "packs"),
        ("INV-27", "RC-03", "SHELTER", "Stormproof High-Wind Geodesic Tents", 90, 8, "units"),
        ("INV-28", "RC-03", "SHELTER", "Emergency Aluminized Foil Space Blankets", 1300, 50, "sheets"),
        ("INV-29", "RC-03", "HYGIENE", "Waterproof Bio-Sanitation Pouch Sets", 520, 25, "sets"),
        ("INV-30", "RC-03", "HYGIENE", "Waterproof Floating Distress Beacons", 160, 10, "units"),

        # Depot Delta (Tambaram West)
        ("INV-31", "RC-04", "WATER", "Bulk Water Tanker Refill Canisters (25L)", 800, 30, "canisters"),
        ("INV-32", "RC-04", "WATER", "Rapid Microbial Gravity Filtration Straws", 450, 20, "kits"),
        ("INV-33", "RC-04", "FOOD", "Fortified Cereal & Dehydrated Nutrition Meals", 1700, 70, "packs"),
        ("INV-34", "RC-04", "FOOD", "Infant Weaning Porridge & Toddler Food", 580, 25, "packs"),
        ("INV-35", "RC-04", "MEDICAL", "Mobile Surgical Field Trauma Deployment Packs", 95, 6, "units"),
        ("INV-36", "RC-04", "MEDICAL", "Pediatric Emergency Medicine Care Kits", 150, 10, "kits"),
        ("INV-37", "RC-04", "SHELTER", "Modular Quick-Deploy Community Shelter Tarps", 460, 25, "units"),
        ("INV-38", "RC-04", "SHELTER", "All-Season Thermal Sleeping Bags", 410, 18, "units"),
        ("INV-39", "RC-04", "HYGIENE", "Industrial Chlorine Disinfection Spray Tanks", 130, 8, "tanks"),
        ("INV-40", "RC-04", "HYGIENE", "Antibacterial Hand Soap & Sanitizer Bars", 1900, 80, "bars"),

        # Depot Epsilon (Velachery Flood Hub)
        ("INV-41", "RC-05", "WATER", "Purified Water Cans (5L)", 1150, 45, "cans"),
        ("INV-42", "RC-05", "WATER", "Individual Water Purification Filter Bottles", 520, 20, "bottles"),
        ("INV-43", "RC-05", "FOOD", "Instant Hot-Water Ready Meals (Khichdi/Poha)", 1300, 55, "packs"),
        ("INV-44", "RC-05", "FOOD", "Compressed Calorie Disaster Relief Bars", 2250, 90, "bars"),
        ("INV-45", "RC-05", "MEDICAL", "Anti-Venom & Waterborne Pathogen Kits", 140, 12, "kits"),
        ("INV-46", "RC-05", "MEDICAL", "Sterile Gauze Bandages, Sutures & Antiseptics", 650, 30, "packs"),
        ("INV-47", "RC-05", "SHELTER", "Reinforced Polyethylene Flood-Resistant Tarps", 580, 25, "sheets"),
        ("INV-48", "RC-05", "SHELTER", "Lightweight Compact EVA Foam Sleeping Mats", 630, 30, "mats"),
        ("INV-49", "RC-05", "HYGIENE", "Sanitary Napkins & Dignity Hygiene Kits", 980, 40, "kits"),
        ("INV-50", "RC-05", "HYGIENE", "Waterproof Solar Torches & Dynamo Lanterns", 340, 15, "units")
    ]
    cursor.executemany("INSERT INTO inventory_items (id, relief_center_id, item_category, item_name, quantity_available, quantity_reserved, unit) VALUES (?, ?, ?, ?, ?, ?, ?)", inventory)

    # Cross-populate resources table with corresponding warehouse IDs
    wh_map = {
        "RC-01": "WH-CHENNAI-CENTRAL",
        "RC-02": "WH-CHENNAI-SOUTH",
        "RC-03": "WH-CHENNAI-NORTH",
        "RC-04": "WH-CHENNAI-WEST",
        "RC-05": "WH-CHENNAI-VELACHERY"
    }
    resources = [
        (f"RES-{inv[0][4:]}", wh_map[inv[1]], inv[2], inv[3], inv[4], inv[5], inv[6])
        for inv in inventory
    ]
    cursor.executemany("INSERT INTO resources (id, warehouse_id, item_category, item_name, quantity_available, quantity_reserved, unit) VALUES (?, ?, ?, ?, ?, ?, ?)", resources)

    # 5. Relief Vehicles (Expanded Emergency Fleet: Trucks, Boats, 4x4s, Ambulances, Drones)
    fleet = [
        ("VEH-01", "TRUCK-4x4-ALPHA", "TRUCK", 2000.0, 13.0827, 80.2707, "IDLE", "Officer Vikram Singh", 42.0),
        ("VEH-02", "TRUCK-RESCUE-BETA", "TRUCK", 1500.0, 13.0067, 80.2026, "IDLE", "Lt. Priya Nair", 38.0),
        ("VEH-03", "BOAT-RESCUE-01", "BOAT", 750.0, 13.0600, 80.2500, "EN_ROUTE", "Capt. Manikandan", 22.0),
        ("VEH-04", "BOAT-AMPHIBIAN-02", "BOAT", 900.0, 12.9815, 80.2180, "IDLE", "Officer S. Murugan", 26.0),
        ("VEH-05", "SCOUT-4X4-DELTA", "4X4", 850.0, 12.9249, 80.1278, "IDLE", "Lt. Arun Prasad", 50.0),
        ("VEH-06", "AMBULANCE-ICU-01", "4X4", 600.0, 13.0827, 80.2707, "IDLE", "Dr. Revathi & Driver Selvam", 48.0),
        ("VEH-07", "DRONE-PAYLOAD-HEAVY", "DRONE", 45.0, 12.9249, 80.1278, "IDLE", "Remote Pilot Karthik", 65.0),
        ("VEH-08", "DRONE-RECON-SURVEIL", "DRONE", 15.0, 13.1250, 80.2970, "EN_ROUTE", "Flight Lead Divya", 75.0)
    ]
    cursor.executemany("INSERT INTO relief_vehicles (id, vehicle_code, vehicle_type, capacity_kg, current_lat, current_lon, status, assigned_driver, speed_kmh) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", fleet)

    vehicles_supa = [
        (v[0], v[1], v[2], v[3], v[8], v[4], v[5], v[6], v[7])
        for v in fleet
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
