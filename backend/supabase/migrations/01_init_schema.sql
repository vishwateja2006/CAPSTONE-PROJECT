-- ResQLink Phase 3: Supabase PostgreSQL Schema with RLS
-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 1. Table: profiles (User accounts and RBAC roles)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('ADMIN', 'DISASTER_AUTHORITY', 'NGO_DONOR', 'WAREHOUSE_MANAGER', 'VOLUNTEER', 'BENEFICIARY')),
    phone TEXT,
    avatar_url TEXT,
    organization TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Table: disasters (Disaster declarations)
CREATE TABLE IF NOT EXISTS disasters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    disaster_type TEXT NOT NULL CHECK (disaster_type IN ('FLOOD', 'CYCLONE', 'EARTHQUAKE', 'LANDSLIDE', 'WILDFIRE', 'DROUGHT')),
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'MODERATE', 'LOW')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ALERT', 'ACTIVE', 'RECOVERY', 'RESOLVED', 'CLOSED')),
    epicenter_lat DOUBLE PRECISION NOT NULL,
    epicenter_lon DOUBLE PRECISION NOT NULL,
    radius_km DOUBLE PRECISION DEFAULT 25.0,
    description TEXT,
    declared_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    declared_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Table: locations (Impacted administrative districts, wards, hazard zones)
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('RED', 'ORANGE', 'YELLOW')),
    boundary_geojson JSONB NOT NULL,
    is_accessible BOOLEAN DEFAULT TRUE,
    road_blockage_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Table: warehouses (Relief distribution hubs)
CREATE TABLE IF NOT EXISTS warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    contact_phone TEXT,
    capacity_sqft DOUBLE PRECISION DEFAULT 10000.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Table: resources (Inventory stock items)
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    item_category TEXT NOT NULL CHECK (item_category IN ('WATER', 'FOOD', 'MEDICAL', 'SHELTER', 'SANITATION', 'COMMUNICATION')),
    item_name TEXT NOT NULL,
    quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
    quantity_reserved INTEGER NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    unit TEXT NOT NULL DEFAULT 'units',
    minimum_threshold INTEGER NOT NULL DEFAULT 100,
    expiry_date TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Table: beneficiaries (Affected households / citizens)
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    head_of_household TEXT NOT NULL,
    contact_phone TEXT NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    household_size INTEGER NOT NULL DEFAULT 1 CHECK (household_size > 0),
    infants_count INTEGER DEFAULT 0,
    elderly_count INTEGER DEFAULT 0,
    disabled_or_injured_count INTEGER DEFAULT 0,
    medical_conditions JSONB DEFAULT '[]'::jsonb,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Table: requests (Aid assistance requests)
CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    requested_categories JSONB NOT NULL DEFAULT '["FOOD", "WATER"]'::jsonb,
    urgency_level TEXT NOT NULL CHECK (urgency_level IN ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')),
    urgency_score DOUBLE PRECISION NOT NULL DEFAULT 50.0 CHECK (urgency_score >= 0.0 AND urgency_score <= 100.0),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VERIFIED', 'ALLOCATED', 'DISPATCHED', 'DELIVERED', 'CANCELLED')),
    assigned_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    fulfilled_at TIMESTAMPTZ
);

-- 8. Table: vehicles (Logistics fleet)
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_code TEXT UNIQUE NOT NULL,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('TRUCK', 'BOAT', '4X4', 'DRONE', 'HELICOPTER')),
    capacity_kg DOUBLE PRECISION NOT NULL DEFAULT 1000.0,
    current_lat DOUBLE PRECISION NOT NULL,
    current_lon DOUBLE PRECISION NOT NULL,
    status TEXT NOT NULL DEFAULT 'IDLE' CHECK (status IN ('IDLE', 'EN_ROUTE', 'RETURNING', 'MAINTENANCE')),
    assigned_driver_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    average_speed_kmh DOUBLE PRECISION DEFAULT 40.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Table: deliveries (Dispatch missions & waypoints)
CREATE TABLE IF NOT EXISTS deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
    warehouse_id UUID REFERENCES warehouses(id) ON DELETE CASCADE,
    total_distance_km DOUBLE PRECISION DEFAULT 0.0,
    estimated_duration_mins DOUBLE PRECISION DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'STAGED' CHECK (status IN ('STAGED', 'IN_TRANSIT', 'COMPLETED', 'ABORTED')),
    waypoints_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Table: predictions (AI & Optimization model inferences)
CREATE TABLE IF NOT EXISTS predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    model_type TEXT NOT NULL CHECK (model_type IN ('DEMAND_FORECAST', 'DAMAGE_DETECTION', 'NLP_TRIAGE', 'ROUTE_OPTIMIZER', 'FAIR_ALLOCATION')),
    input_payload JSONB NOT NULL,
    prediction_output JSONB NOT NULL,
    accuracy_or_fairness_metric DOUBLE PRECISION,
    is_simulation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Table: alerts (Real-time warnings and emergency notifications)
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    disaster_id UUID REFERENCES disasters(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('CRITICAL', 'HIGH', 'WARNING', 'INFO')),
    target_area_district TEXT,
    broadcast_channel TEXT DEFAULT 'ALL' CHECK (broadcast_channel IN ('ALL', 'SMS', 'PUSH', 'WEBSOCKET')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Table: audit_logs (Immutable platform activity logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_table TEXT NOT NULL,
    entity_id TEXT,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE disasters ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch current auth user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM profiles WHERE id = auth.uid());
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'ANONYMOUS';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" ON profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile" ON profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles" ON profiles
    FOR ALL TO authenticated USING (get_current_user_role() = 'ADMIN');

-- 2. disasters policies (Public/authenticated read, Authority/Admin write)
CREATE POLICY "Disasters viewable by all" ON disasters
    FOR SELECT USING (true);

CREATE POLICY "Authorities and Admins can create and modify disasters" ON disasters
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY'));

-- 3. locations policies
CREATE POLICY "Locations viewable by all" ON locations
    FOR SELECT USING (true);

CREATE POLICY "Authorities and Admins can manage locations" ON locations
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY'));

-- 4. warehouses policies
CREATE POLICY "Warehouses viewable by all authenticated users" ON warehouses
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Warehouse managers and Admins can update warehouses" ON warehouses
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'WAREHOUSE_MANAGER'));

-- 5. resources policies
CREATE POLICY "Resources viewable by authenticated users" ON resources
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Warehouse managers and Admins can manage resources" ON resources
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'WAREHOUSE_MANAGER'));

-- 6. beneficiaries policies (Privacy protection: Citizens see only their own record)
CREATE POLICY "Beneficiaries can read and update their own record" ON beneficiaries
    FOR ALL TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Authorities, Volunteers, and Admins can view all beneficiaries" ON beneficiaries
    FOR SELECT TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER'));

-- 7. requests policies
CREATE POLICY "Beneficiaries can create requests" ON requests
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Beneficiaries can view their own requests" ON requests
    FOR SELECT TO authenticated USING (
        beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())
        OR get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER', 'WAREHOUSE_MANAGER')
    );

CREATE POLICY "Authorities and Volunteers can update request status" ON requests
    FOR UPDATE TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER'));

-- 8. vehicles policies
CREATE POLICY "Vehicles viewable by authenticated users" ON vehicles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Logistics, Volunteers, and Admins can manage vehicles" ON vehicles
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER'));

-- 9. deliveries policies
CREATE POLICY "Deliveries viewable by authenticated users" ON deliveries
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Volunteers and Admins can update deliveries" ON deliveries
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER'));

-- 10. predictions policies
CREATE POLICY "Predictions viewable by Authorities and Admins" ON predictions
    FOR SELECT TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'WAREHOUSE_MANAGER'));

-- 11. alerts policies
CREATE POLICY "Alerts viewable by all" ON alerts
    FOR SELECT USING (true);

CREATE POLICY "Authorities and Admins can publish alerts" ON alerts
    FOR ALL TO authenticated USING (get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY'));

-- 12. audit_logs policies (Strict immutable security)
CREATE POLICY "Audit logs only viewable by Admins" ON audit_logs
    FOR SELECT TO authenticated USING (get_current_user_role() = 'ADMIN');

CREATE POLICY "Anyone can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);
