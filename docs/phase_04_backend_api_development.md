# Phase 4: Backend API Development Documentation
## Project: ResQLink — AI-Powered Disaster Relief & Route Optimization Platform

---

## 1. Overview & Architecture

Phase 4 establishes the high-throughput, async REST API Gateway built with **Python 3.11** and **FastAPI**, connecting the Next.js frontend, Supabase PostgreSQL persistence layer, and the 5 AI/Operations Research models.

### Key Features
- **Pydantic v2 Serialization:** Enforces strict data validation across request payloads and response bodies.
- **Role-Based Access Control (RBAC):** Middleware checks verify user tokens and enforce role permissions across all 6 roles.
- **AI Model Integration:** Direct hooks to NLP urgency triage, demand forecasting, CVRP vehicle routing, and Max-Min fair resource allocation.
- **Real-Time WebSockets:** Live broadcast feeds for incoming SOS alerts, dynamic vehicle movements, and disaster perimeter updates.
- **Interactive Documentation:** Automatic OpenAPI generation accessible via `/api/v1/docs` (Swagger UI) and `/api/v1/redoc`.

---

## 2. All 9 Phase 4 API Endpoints Specification

| # | Endpoint Prefix | Primary Methods | Purpose | RBAC Role Required |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **`/api/v1/disasters`** | `GET`, `POST`, `PATCH` | Declare disaster incidents, map hazard polygons & update lifecycle. | `DISASTER_AUTHORITY`, `ADMIN` |
| **2** | **`/api/v1/resources`** | `GET`, `POST`, `PATCH` | Manage warehouse stock quantities, kit staging & low-stock triggers. | `WAREHOUSE_MANAGER`, `ADMIN` |
| **3** | **`/api/v1/beneficiaries`** | `GET`, `POST`, `PATCH` | Register affected households, record coordinates & verify families. | Public / `VOLUNTEER` |
| **4** | **`/api/v1/requests`** | `GET`, `POST`, `PATCH` | Ingest aid distress beacons with automatic AI NLP triage scoring (0–100). | `BENEFICIARY`, `VOLUNTEER` |
| **5** | **`/api/v1/vehicles`** | `GET`, `POST`, `PATCH` | Register fleet vehicles (Trucks, Boats, 4x4s) & update live GPS telemetry. | `DISASTER_AUTHORITY`, `VOLUNTEER` |
| **6** | **`/api/v1/deliveries`** | `GET`, `POST`, `PATCH` | Stage dispatch missions, monitor waypoint progress & confirm completion. | `VOLUNTEER`, `ADMIN` |
| **7** | **`/api/v1/predictions`** | `GET`, `POST` | Execute Model 1 (Demand forecast) & Model 3 (NLP distress classification). | Authenticated / `AUTHORITY` |
| **8** | **`/api/v1/routes`** | `POST`, `GET` | Execute Model 4 (CVRP routing with hazard bypass) & Model 5 (Fair allocation). | `DISASTER_AUTHORITY`, `ADMIN` |
| **9** | **`/api/v1/alerts`** | `GET`, `POST`, `PATCH` | Generate localized emergency warnings and broadcast via WebSockets. | `DISASTER_AUTHORITY`, `ADMIN` |

---

## 3. Detailed Endpoint Schemas & Sample Payloads

### 1. `/disasters`
- `POST /api/v1/disasters/`: Declares an emergency incident.
  ```json
  {
    "name": "Cyclone Vardah Coastal Inundation",
    "disaster_type": "FLOOD",
    "severity": "CRITICAL",
    "status": "ACTIVE",
    "epicenter_lat": 13.0827,
    "epicenter_lon": 80.2707,
    "radius_km": 30.0,
    "description": "Category 4 cyclone causing urban flooding."
  }
  ```
- `POST /api/v1/disasters/{id}/locations`: Attaches a hazard polygon (e.g. Adyar flooded basin).

### 2. `/resources`
- `GET /api/v1/resources/low-stock`: Returns all items below safety threshold.
- `POST /api/v1/resources/`: Adds stock to a warehouse with category tags (`WATER`, `FOOD`, `MEDICAL`, `SHELTER`).

### 3. `/beneficiaries`
- `POST /api/v1/beneficiaries/`: Captures head of household, GPS coordinates, headcount, and vulnerability counts.

### 4. `/requests`
- `POST /api/v1/requests/`: Automatically scores submitted aid requests with NLP keyword and vulnerability weights:
  ```json
  {
    "beneficiary_id": "ben-001",
    "disaster_id": "dis-001",
    "requested_categories": "[\"FOOD\", \"WATER\", \"MEDICAL\"]",
    "description": "Water rising rapidly, baby needs infant formula and grandmother needs insulin."
  }
  ```
  *Response:* Assesses urgency score: `92.0/100`, level: `CRITICAL`.

### 5. `/vehicles`
- `PATCH /api/v1/vehicles/{id}/location`: Updates live GPS telemetry and broadcasts `VEHICLE_MOVED` event via WebSocket.

### 6. `/deliveries`
- `GET /api/v1/deliveries/`: Lists sequential waypoint stops, demand payload per stop, and ETAs.

### 7. `/predictions`
- `GET /api/v1/predictions/demand-forecast?population=850&days_ahead=3`:
  ```json
  {
    "forecast_horizon_days": 3,
    "projected_displaced_people": 850,
    "projected_demands": {
      "WATER_LITERS": 8925.0,
      "FOOD_RATIONS": 5100,
      "MEDICAL_KITS": 63,
      "HYGIENE_KITS": 510
    }
  }
  ```

### 8. `/routes`
- `POST /api/v1/routes/optimize`: Solves CVRP avoiding hazard zones and auto-dispatches available vehicles.
- `POST /api/v1/routes/fair-allocation`: Solves Max-Min linear program and verifies Gini equity ($G \le 0.25$).

### 9. `/alerts`
- `POST /api/v1/alerts/`: Broadcasts evacuation warning to connected dashboards.

---

## 4. Automated Test Verification

The Phase 4 test suite (`backend/tests/test_phase4_api.py`) tests:
1. Router prefix mounting for all 9 Phase 4 endpoints.
2. File existence and schema declaration integrity.
3. Model 1 demand forecast mathematical accuracy (Sphere Standards).
4. Model 3 NLP urgency triage scoring accuracy.
5. Model 4 CVRP route optimization solver.
6. Model 5 Max-Min fair allocation solver with Gini verification.

Run tests:
```bash
python3 backend/tests/test_phase4_api.py
```
Output:
```
.......
Ran 7 tests in 0.001s
OK
```

