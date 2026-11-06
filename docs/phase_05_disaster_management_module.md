# Phase 5: Disaster Management Module Documentation
## Project: ResQLink — AI-Powered Disaster Relief & Route Optimization Platform

---

## 1. Overview & Objectives

The **Disaster Management Module** equips Disaster Management Authorities and System Administrators with operational tools to declare, monitor, manage, and resolve emergency incidents.

### Core Features Implemented:
1. **Disaster Event Creation:** Register emergency incidents with primary metadata (name, epicenter coordinates, radius, narrative).
2. **Disaster Category Selection:** Multi-hazard classification supporting:
   - `FLOOD` (Urban flooding, river overflow, coastal storm surge)
   - `CYCLONE` (High-wind tropical depressions)
   - `EARTHQUAKE` (Seismic tremors and structural collapse)
   - `LANDSLIDE` (Hill slope failure and mudslides)
   - `WILDFIRE` & `DROUGHT`
3. **Affected Location & Village Tagging:** Ability to select a district and mark multiple impacted villages/wards with bounding GeoJSON polygons and access flags (`is_accessible`).
4. **Severity Level Configuration:** Assign and escalate operational severity:
   - `CRITICAL` (DEFCON-1: Life-threatening, immediate evacuations required)
   - `HIGH` (Significant displacement, structural risk)
   - `MODERATE` (Restricted mobility, localized aid needed)
   - `LOW` (Advisory monitoring)
5. **Interactive GIS Situational Mapping:** Real-time visual overlay rendering red hazard polygons, epicenter radiuses, and impassable road blocks on Leaflet vector maps.
6. **Disaster Lifecycle Transitions:** State machine enforcement:
   $$\text{ALERT} \longrightarrow \text{ACTIVE} \longrightarrow \text{RECOVERY} \longrightarrow \text{RESOLVED} \longrightarrow \text{CLOSED}$$
7. **Automated Emergency Alerts:** Generation and real-time WebSocket broadcast of localized evacuation warnings across SMS, push, and connected operations consoles.

---

## 2. Example Walkthrough: District Flood Declaration

### Scenario:
*An authority registers an active flood in Kanchipuram district and marks three villages as critically affected.*

1. **Request Payload (`POST /api/v1/disasters/register-with-villages`):**
   ```json
   {
     "name": "Kanchipuram Monsoon River Inundation",
     "disaster_type": "FLOOD",
     "district": "Kanchipuram",
     "affected_villages": ["Perungattur", "Ozhukarai", "Walajabad Sector 4"],
     "severity": "CRITICAL",
     "epicenter_lat": 12.8342,
     "epicenter_lon": 79.7036,
     "radius_km": 30.0
   }
   ```

2. **Automated Backend Operations:**
   - **Step 1:** Inserts row into `disasters` table with `status = 'ACTIVE'`.
   - **Step 2:** `DisasterManagementService.generate_village_hazard_locations` creates 3 `locations` rows with closed-ring GeoJSON polygons and `risk_level = 'RED'`.
   - **Step 3:** Sets `is_accessible = False` and creates road blockage entries (`"Main access route into Perungattur submerged"`).
   - **Step 4:** Drafts an emergency alert in the `alerts` table.
   - **Step 5:** Broadcasts `CRITICAL_DISASTER_DECLARED` event over the WebSocket bus (`/ws/alerts`).

---

## 3. Automated Test Verification

The Phase 5 test suite ([`test_phase5_disaster_module.py`](file:///Users/vishwateja/Desktop/new_project_capstone/backend/tests/test_phase5_disaster_module.py)) verifies:
1. Village hazard polygon generation with closed-ring GeoJSON boundaries and accessibility tags.
2. Lifecycle state machine transitions (valid transitions allowed; illegal skips rejected).
3. Automated emergency alert drafting and severity classification.

Run test:
```bash
python3 backend/tests/test_phase5_disaster_module.py
```
Output:
```
...
Ran 3 tests in 0.000s
OK
```

