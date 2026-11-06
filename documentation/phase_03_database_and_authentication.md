# Phase 3: Database and Authentication Specification
## Project: ResQLink — AI-Powered Disaster Relief & Route Optimization Platform

---

## 1. Database Overview & Technology Selection

ResQLink uses **Supabase with PostgreSQL 15+** enhanced by the **PostGIS** geospatial extension for all persistence, authentication, and security requirements. 

### Key Capabilities
- **PostGIS Spatial Support:** Stores geometries (polygons for hazard zones, points for shelters, vehicle coordinates) enabling native spatial queries (`ST_DWithin`, `ST_Intersects`, `ST_Distance`).
- **Row Level Security (RLS):** Enforces data privacy at the database engine level. Beneficiaries can only access their own household information, while Disaster Authorities and Admins have authorized operational visibility.
- **Role-Based Access Control (RBAC):** Authenticates six distinct user roles (`ADMIN`, `DISASTER_AUTHORITY`, `NGO_DONOR`, `WAREHOUSE_MANAGER`, `VOLUNTEER`, `BENEFICIARY`) via JWT tokens and PostgreSQL claims.
- **Auditability:** Implements an immutable `audit_logs` table recording all high-impact actions (disaster declaration, dispatch overrides, stock adjustments).

---

## 2. All 12 Supabase Tables Schema

```mermaid
erDiagram
    PROFILES ||--o{ DISASTERS : declares
    PROFILES ||--o{ WAREHOUSES : manages
    PROFILES ||--o{ VEHICLES : operates
    PROFILES ||--o{ BENEFICIARIES : associated_with
    PROFILES ||--o{ AUDIT_LOGS : performs

    DISASTERS ||--o{ LOCATIONS : contains
    DISASTERS ||--o{ WAREHOUSES : operates_in
    DISASTERS ||--o{ REQUESTS : receives
    DISASTERS ||--o{ DELIVERIES : coordinates
    DISASTERS ||--o{ PREDICTIONS : informs
    DISASTERS ||--o{ ALERTS : broadcasts

    WAREHOUSES ||--o{ RESOURCES : stocks
    WAREHOUSES ||--o{ DELIVERIES : stages

    BENEFICIARIES ||--o{ REQUESTS : submits
    VEHICLES ||--o{ DELIVERIES : assigned_to

    PROFILES {
        uuid id PK
        string email
        string hashed_password
        string full_name
        string role
        string phone
        string organization
        timestamp created_at
    }

    DISASTERS {
        uuid id PK
        string name
        string disaster_type
        string severity
        string status
        float epicenter_lat
        float epicenter_lon
        float radius_km
        uuid declared_by FK
        timestamp declared_at
    }

    LOCATIONS {
        uuid id PK
        uuid disaster_id FK
        string name
        string district
        string state
        string risk_level
        jsonb boundary_geojson
        boolean is_accessible
    }

    WAREHOUSES {
        uuid id PK
        uuid disaster_id FK
        string name
        string location_name
        float latitude
        float longitude
        uuid manager_id FK
        float capacity_sqft
    }

    RESOURCES {
        uuid id PK
        uuid warehouse_id FK
        string item_category
        string item_name
        integer quantity_available
        integer quantity_reserved
        string unit
        integer minimum_threshold
    }

    BENEFICIARIES {
        uuid id PK
        uuid user_id FK
        string head_of_household
        string contact_phone
        float latitude
        float longitude
        integer household_size
        integer infants_count
        integer elderly_count
        boolean is_verified
    }

    REQUESTS {
        uuid id PK
        uuid beneficiary_id FK
        uuid disaster_id FK
        jsonb requested_categories
        string urgency_level
        float urgency_score
        string status
        uuid assigned_warehouse_id FK
    }

    VEHICLES {
        uuid id PK
        string vehicle_code
        string vehicle_type
        float capacity_kg
        float current_lat
        float current_lon
        string status
        uuid assigned_driver_id FK
    }

    DELIVERIES {
        uuid id PK
        uuid disaster_id FK
        uuid vehicle_id FK
        uuid warehouse_id FK
        float total_distance_km
        float estimated_duration_mins
        string status
        jsonb waypoints_json
    }

    PREDICTIONS {
        uuid id PK
        uuid disaster_id FK
        string model_type
        jsonb input_payload
        jsonb prediction_output
        float accuracy_or_fairness_metric
    }

    ALERTS {
        uuid id PK
        uuid disaster_id FK
        string title
        string message
        string severity
        string broadcast_channel
        boolean is_active
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        string actor_role
        string action
        string entity_table
        string entity_id
        jsonb details
    }
```

---

## 3. Row Level Security (RLS) Policy Specifications

| Table | Policy Name | Permitted Operation | Target Role / Condition |
| :--- | :--- | :---: | :--- |
| `profiles` | Own profile access | `SELECT`, `UPDATE` | `auth.uid() = id` (User can only read/edit their own account) |
| `profiles` | Admin full access | `ALL` | `get_current_user_role() = 'ADMIN'` |
| `disasters` | Public read | `SELECT` | `true` (Anyone can view active disaster alerts) |
| `disasters` | Authority control | `ALL` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY')` |
| `locations` | Authority manage | `ALL` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY')` |
| `warehouses` | Manager control | `ALL` | `get_current_user_role() IN ('ADMIN', 'WAREHOUSE_MANAGER')` |
| `resources` | Stock updates | `ALL` | `get_current_user_role() IN ('ADMIN', 'WAREHOUSE_MANAGER')` |
| `beneficiaries`| Citizen privacy | `ALL` | `auth.uid() = user_id` (Beneficiary can only view their own family data) |
| `beneficiaries`| Triage view | `SELECT` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER')` |
| `requests` | Citizen request | `INSERT`, `SELECT` | `beneficiary_id IN (SELECT id FROM beneficiaries WHERE user_id = auth.uid())` |
| `requests` | Status dispatch | `UPDATE` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER')` |
| `vehicles` | Fleet management | `ALL` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'VOLUNTEER')` |
| `deliveries` | Waypoint updates | `ALL` | `get_current_user_role() IN ('ADMIN', 'VOLUNTEER')` |
| `predictions`| AI analytics view | `SELECT` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY', 'WAREHOUSE_MANAGER')` |
| `alerts` | Broadcast publish | `ALL` | `get_current_user_role() IN ('ADMIN', 'DISASTER_AUTHORITY')` |
| `audit_logs` | Immutable audit | `SELECT` | `get_current_user_role() = 'ADMIN'` (Only root admins inspect logs) |

---

## 4. Verification & Automated Test Coverage

The Phase 3 test suite (`backend/tests/test_phase3_db_and_auth.py`) tests:
1. Schema parsing of all 12 tables in `01_init_schema.sql`.
2. Explicit `ENABLE ROW LEVEL SECURITY` verification on all 12 tables.
3. Multi-role RBAC decision engine across all 6 roles.
4. Cryptographic HMAC-SHA256 JWT generation, decoding, and tamper resistance.
5. Verification that beneficiary privacy policies restrict data access to `auth.uid() = user_id`.

Run tests with:
```bash
python3 backend/tests/test_phase3_db_and_auth.py
```
Output:
```
......
Ran 6 tests in 0.002s
OK
```

