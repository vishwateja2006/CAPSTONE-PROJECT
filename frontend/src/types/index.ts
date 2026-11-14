export interface HazardZone {
  id: string;
  name: string;
  risk_level: "RED" | "ORANGE" | "YELLOW";
  boundary_geojson: string;
  is_passable: boolean;
  road_blockages_json?: string;
}

export interface Disaster {
  id: string;
  name: string;
  disaster_type: string;
  status: "ACTIVE" | "ALERT" | "RECOVERY" | "RESOLVED";
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "LOW";
  epicenter_lat: number;
  epicenter_lon: number;
  radius_km: number;
  description?: string;
  hazard_zones?: HazardZone[];
}

export interface InventoryItem {
  id: string;
  item_category: "FOOD" | "WATER" | "MEDICAL" | "SHELTER" | "SANITATION" | "HYGIENE" | string;
  item_name: string;
  quantity_available: number;
  quantity_reserved: number;
  unit: string;
  relief_center_id?: string;
  warehouse_name?: string;
  location_name?: string;
}

export interface ReliefCenter {
  id: string;
  disaster_id?: string;
  name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  contact_person?: string;
  phone?: string;
  capacity_people: number;
  current_occupancy: number;
  inventory_items?: InventoryItem[];
}

export interface ReliefVehicle {
  id: string;
  vehicle_code: string;
  vehicle_type: "TRUCK" | "BOAT" | "4X4" | "DRONE" | "HELICOPTER" | string;
  capacity_kg: number;
  current_lat: number;
  current_lon: number;
  status: "IDLE" | "EN_ROUTE" | "RETURNING" | "MAINTENANCE" | "DISPATCHED" | string;
  assigned_driver?: string;
  speed_kmh: number;
  home_depot?: string;
}

export interface SOSRequest {
  id: string;
  disaster_id?: string;
  victim_name: string;
  contact_phone: string;
  latitude: number;
  longitude: number;
  address?: string;
  people_count: number;
  urgency_level: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  urgency_score: number;
  special_needs: string; // JSON array string
  category_needs: string; // JSON array string
  description?: string;
  status: "PENDING" | "ASSIGNED" | "IN_TRANSIT" | "DELIVERED" | "RESOLVED" | "CANCELLED";
  assigned_vehicle_id?: string;
  requested_at: string;
}

export interface Waypoint {
  sequence: number;
  location_name: string;
  latitude: number;
  longitude: number;
  action: string;
  sos_id?: string;
  demand_kg: number;
  eta_mins: number;
}

export interface RoutePlan {
  id: string;
  vehicle_id: string;
  vehicle_code?: string;
  relief_center_id?: string;
  total_distance_km: number;
  estimated_duration_mins: number;
  status: string;
  waypoints: Waypoint[];
  created_at: string;
}

export interface AllocationResult {
  sos_id: string;
  victim_name: string;
  people_count: number;
  urgency_score: number;
  allocated_items: Record<string, number>;
  fairness_index: number;
}

export interface FairAllocationResponse {
  disaster_id?: string;
  relief_center_id: string;
  allocations: AllocationResult[];
  total_sos_served: number;
  unmet_demand_summary: Record<string, number>;
  gini_fairness_coefficient: number;
}

