import {
  Disaster,
  ReliefCenter,
  ReliefVehicle,
  SOSRequest,
  RoutePlan,
  FairAllocationResponse
} from "../types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// Mock Fallback Data in case the backend server is not active during frontend preview
export const MOCK_DISASTER: Disaster = {
  id: "dis-001",
  name: "Cyclone Vardah & Coastal Inundation",
  disaster_type: "FLOOD",
  status: "ACTIVE",
  severity: "CRITICAL",
  epicenter_lat: 13.0827,
  epicenter_lon: 80.2707,
  radius_km: 30.0,
  description: "Category 4 coastal storm surge with extensive urban flooding across low-lying coastal basins.",
  hazard_zones: [
    {
      id: "hz-001",
      name: "Zone A - Flooded Adyar Estuary Basin",
      risk_level: "RED",
      boundary_geojson: JSON.stringify({
        type: "Polygon",
        coordinates: [[
          [80.245, 13.010],
          [80.265, 13.010],
          [80.265, 13.035],
          [80.245, 13.035],
          [80.245, 13.010]
        ]]
      }),
      is_passable: false
    }
  ]
};

export const MOCK_RELIEF_CENTERS: ReliefCenter[] = [
  {
    id: "depot-alpha",
    name: "Central Emergency Relief Base Alpha",
    location_name: "Jawaharlal Nehru Stadium Complex",
    latitude: 13.0837,
    longitude: 80.2785,
    contact_person: "Col. Rajesh Sharma",
    phone: "+91-9444012345",
    capacity_people: 2500,
    current_occupancy: 450,
    inventory_items: [
      { id: "1", item_category: "FOOD", item_name: "Emergency Ration Packs", quantity_available: 850, quantity_reserved: 0, unit: "packets" },
      { id: "2", item_category: "WATER", item_name: "Purified Water Cans (5L)", quantity_available: 1200, quantity_reserved: 0, unit: "cans" },
      { id: "3", item_category: "MEDICAL", item_name: "First Aid & Trauma Kits", quantity_available: 150, quantity_reserved: 0, unit: "kits" },
      { id: "4", item_category: "SHELTER", item_name: "Thermal Blankets & Tents", quantity_available: 300, quantity_reserved: 0, unit: "units" }
    ]
  }
];

export const MOCK_VEHICLES: ReliefVehicle[] = [
  {
    id: "v-01",
    vehicle_code: "RESCUE-TRUCK-01",
    vehicle_type: "TRUCK",
    capacity_kg: 1500,
    current_lat: 13.0837,
    current_lon: 80.2785,
    status: "IDLE",
    assigned_driver: "Officer Vikram Singh",
    speed_kmh: 35
  },
  {
    id: "v-02",
    vehicle_code: "BOAT-RESCUE-02",
    vehicle_type: "BOAT",
    capacity_kg: 600,
    current_lat: 13.0720,
    current_lon: 80.2600,
    status: "EN_ROUTE",
    assigned_driver: "Capt. Manikandan",
    speed_kmh: 20
  },
  {
    id: "v-03",
    vehicle_code: "RAPID-4X4-03",
    vehicle_type: "4X4",
    capacity_kg: 800,
    current_lat: 13.0837,
    current_lon: 80.2785,
    status: "IDLE",
    assigned_driver: "Lt. Priya Nair",
    speed_kmh: 45
  }
];

export const MOCK_SOS: SOSRequest[] = [
  {
    id: "sos-01",
    victim_name: "Kavitha Sundaram",
    contact_phone: "+91-9840112233",
    latitude: 13.0650,
    longitude: 80.2550,
    address: "12 Canal Bank Road, Kotturpuram",
    people_count: 4,
    urgency_level: "CRITICAL",
    urgency_score: 92.0,
    special_needs: JSON.stringify(["infant", "insulin-dependent"]),
    category_needs: JSON.stringify(["FOOD", "WATER", "MEDICAL"]),
    description: "Water reached first floor, baby needs formula milk and mother needs cold storage insulin urgently. Trapped.",
    status: "PENDING",
    requested_at: "10 mins ago"
  },
  {
    id: "sos-02",
    victim_name: "Senior Care Care Home (Ramesh Babu)",
    contact_phone: "+91-9840556677",
    latitude: 13.0450,
    longitude: 80.2400,
    address: "Senior Care Annex, T. Nagar",
    people_count: 12,
    urgency_level: "CRITICAL",
    urgency_score: 88.5,
    special_needs: JSON.stringify(["elderly", "oxygen-cylinder", "wheelchair"]),
    category_needs: JSON.stringify(["MEDICAL", "WATER", "EVACUATION"]),
    description: "12 elderly residents stranded. Backup generator failed, oxygen concentrator offline.",
    status: "PENDING",
    requested_at: "25 mins ago"
  },
  {
    id: "sos-03",
    victim_name: "Anand Kumar",
    contact_phone: "+91-9840998811",
    latitude: 13.0950,
    longitude: 80.2850,
    address: "Fishermen Colony, Kasimedu",
    people_count: 6,
    urgency_level: "HIGH",
    urgency_score: 72.0,
    special_needs: JSON.stringify(["pregnant"]),
    category_needs: JSON.stringify(["FOOD", "WATER"]),
    description: "Roof damaged by heavy gale winds. Drinking water contaminated.",
    status: "PENDING",
    requested_at: "40 mins ago"
  },
  {
    id: "sos-04",
    victim_name: "Dr. Farooq",
    contact_phone: "+91-9840334455",
    latitude: 13.0550,
    longitude: 80.2750,
    address: "Royapettah High Road",
    people_count: 8,
    urgency_level: "HIGH",
    urgency_score: 68.0,
    special_needs: JSON.stringify(["injured"]),
    category_needs: JSON.stringify(["MEDICAL", "FOOD"]),
    description: "Minor injuries from shattered glass. First aid supplies exhausted.",
    status: "ASSIGNED",
    assigned_vehicle_id: "v-02",
    requested_at: "1 hour ago"
  }
];

export async function fetchDisasters(): Promise<Disaster[]> {
  try {
    const res = await fetch(`${API_BASE}/disasters/`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [MOCK_DISASTER];
  }
}

export async function fetchReliefCenters(): Promise<ReliefCenter[]> {
  try {
    const res = await fetch(`${API_BASE}/resources/centers`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return MOCK_RELIEF_CENTERS;
  }
}

export async function fetchVehicles(): Promise<ReliefVehicle[]> {
  try {
    const res = await fetch(`${API_BASE}/resources/vehicles`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return MOCK_VEHICLES;
  }
}

export async function fetchSOSRequests(): Promise<SOSRequest[]> {
  try {
    const res = await fetch(`${API_BASE}/sos/`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return MOCK_SOS;
  }
}

export async function submitSOS(payload: any): Promise<SOSRequest> {
  try {
    const res = await fetch(`${API_BASE}/sos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    // Return simulated scored SOS
    return {
      id: "sos-" + Math.floor(Math.random() * 10000),
      victim_name: payload.victim_name,
      contact_phone: payload.contact_phone,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address,
      people_count: payload.people_count,
      urgency_level: "HIGH",
      urgency_score: 75.0,
      special_needs: JSON.stringify(payload.special_needs || []),
      category_needs: JSON.stringify(payload.category_needs || ["FOOD", "WATER"]),
      description: payload.description,
      status: "PENDING",
      requested_at: "Just now"
    };
  }
}

export async function runFairAllocation(reliefCenterId: string): Promise<FairAllocationResponse> {
  try {
    const res = await fetch(`${API_BASE}/routes/allocate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relief_center_id: reliefCenterId })
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      relief_center_id: reliefCenterId,
      total_sos_served: 4,
      gini_fairness_coefficient: 0.18,
      unmet_demand_summary: { FOOD: 0, WATER: 0, MEDICAL: 0 },
      allocations: [
        {
          sos_id: "sos-01",
          victim_name: "Kavitha Sundaram",
          people_count: 4,
          urgency_score: 92.0,
          allocated_items: { FOOD: 4, WATER: 8, MEDICAL: 1 },
          fairness_index: 3.25
        },
        {
          sos_id: "sos-02",
          victim_name: "Senior Care Home",
          people_count: 12,
          urgency_score: 88.5,
          allocated_items: { MEDICAL: 3, WATER: 24, EVACUATION: 1 },
          fairness_index: 2.33
        },
        {
          sos_id: "sos-03",
          victim_name: "Anand Kumar",
          people_count: 6,
          urgency_score: 72.0,
          allocated_items: { FOOD: 6, WATER: 12 },
          fairness_index: 3.0
        },
        {
          sos_id: "sos-04",
          victim_name: "Dr. Farooq",
          people_count: 8,
          urgency_score: 68.0,
          allocated_items: { MEDICAL: 2, FOOD: 8 },
          fairness_index: 1.25
        }
      ]
    };
  }
}

export async function runRouteOptimization(reliefCenterId: string, vehicleIds: string[]): Promise<RoutePlan[]> {
  try {
    const res = await fetch(`${API_BASE}/routes/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ relief_center_id: reliefCenterId, vehicle_ids: vehicleIds })
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [
      {
        id: "plan-01",
        vehicle_id: "v-01",
        vehicle_code: "RESCUE-TRUCK-01",
        relief_center_id: reliefCenterId,
        total_distance_km: 14.8,
        estimated_duration_mins: 42.0,
        status: "GENERATED",
        created_at: new Date().toISOString(),
        waypoints: [
          { sequence: 1, location_name: "Central Base Alpha (Depot)", latitude: 13.0837, longitude: 80.2785, action: "DEPOT_START", demand_kg: 0, eta_mins: 0 },
          { sequence: 2, location_name: "SOS: Senior Care Home", latitude: 13.0450, longitude: 80.2400, action: "DELIVER_AID", demand_kg: 180, eta_mins: 16.5 },
          { sequence: 3, location_name: "SOS: Kavitha Sundaram", latitude: 13.0650, longitude: 80.2550, action: "DELIVER_AID", demand_kg: 60, eta_mins: 28.2 },
          { sequence: 4, location_name: "Central Base Alpha (Return)", latitude: 13.0837, longitude: 80.2785, action: "DEPOT_RETURN", demand_kg: 0, eta_mins: 42.0 }
        ]
      }
    ];
  }
}

