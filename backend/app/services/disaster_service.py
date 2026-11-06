import json
from datetime import datetime
from typing import List, Dict, Any, Optional

VALID_STATUS_TRANSITIONS = {
    "ALERT": ["ACTIVE", "CLOSED"],
    "ACTIVE": ["RECOVERY", "CLOSED"],
    "RECOVERY": ["RESOLVED", "ACTIVE"],
    "RESOLVED": ["CLOSED", "RECOVERY"],
    "CLOSED": []
}

class DisasterManagementService:
    """
    Business logic and lifecycle coordinator for Disaster Events and Hazard Locations.
    """

    @staticmethod
    def validate_status_transition(current_status: str, new_status: str) -> bool:
        """Validates that a disaster lifecycle transition is logically valid."""
        allowed = VALID_STATUS_TRANSITIONS.get(current_status.upper(), [])
        return new_status.upper() in allowed

    @staticmethod
    def generate_village_hazard_locations(
        disaster_id: str,
        district: str,
        villages: List[str],
        base_lat: float,
        base_lon: float,
        risk_level: str = "RED"
    ) -> List[Dict[str, Any]]:
        """
        Creates location entities with bounding polygons for affected villages.
        Simulates polygon offsets around the district epicenter.
        """
        locations = []
        # Predefined geographic offsets for simulated village clusters
        offsets = [
            (-0.015, -0.012),
            (0.018, 0.014),
            (-0.008, 0.022),
            (0.025, -0.018)
        ]

        for i, village_name in enumerate(villages):
            dlat, dlon = offsets[i % len(offsets)]
            v_lat = base_lat + dlat
            v_lon = base_lon + dlon

            # Create bounding polygon (approx 1.5km x 1.5km box)
            delta = 0.008
            polygon_coords = [[
                [round(v_lon - delta, 4), round(v_lat - delta, 4)],
                [round(v_lon + delta, 4), round(v_lat - delta, 4)],
                [round(v_lon + delta, 4), round(v_lat + delta, 4)],
                [round(v_lon - delta, 4), round(v_lat + delta, 4)],
                [round(v_lon - delta, 4), round(v_lat - delta, 4)]
            ]]

            locations.append({
                "disaster_id": disaster_id,
                "name": f"{village_name.strip()} Affected Sector",
                "district": district.strip(),
                "state": "Tamil Nadu",
                "risk_level": risk_level.upper(),
                "boundary_geojson": json.dumps({
                    "type": "Polygon",
                    "coordinates": polygon_coords
                }),
                "is_accessible": False if risk_level.upper() == "RED" else True,
                "road_blockage_notes": f"Main access route into {village_name.strip()} submerged." if risk_level.upper() == "RED" else None
            })

        return locations

    @staticmethod
    def draft_emergency_alert(
        disaster_name: str,
        disaster_type: str,
        severity: str,
        district: str,
        villages: List[str]
    ) -> Dict[str, Any]:
        """Drafts emergency evacuation notification for broadcast."""
        villages_str = ", ".join(villages)
        title = f"EMERGENCY {severity} WARNING: {disaster_name}"
        message = (
            f"A severe {disaster_type} emergency has been declared in {district}. "
            f"The following villages are classified under immediate high-risk: {villages_str}. "
            "Residents are advised to move to higher ground or nearest relief shelter immediately."
        )

        return {
            "title": title,
            "message": message,
            "severity": "CRITICAL" if severity == "CRITICAL" else "HIGH",
            "target_area_district": district,
            "broadcast_channel": "ALL"
        }
