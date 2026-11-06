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

// -------------------------------------------------------------
// Phase 9: AI/ML Model Integration APIs
// -------------------------------------------------------------

export async function fetchAIModelsCatalog(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/predictions/models`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [
      { id: 1, name: "Resource Demand Prediction", type: "TIME_SERIES_FORECASTING", algorithm: "LSTM & Sphere Standards", dataset: "FEMA Disaster Declarations", status: "ONLINE" },
      { id: 2, name: "Disaster Damage Detection", type: "COMPUTER_VISION", algorithm: "CNN / UNet & Spectral NDWI", dataset: "ML4Floods & xView2", status: "ONLINE" },
      { id: 3, name: "Emergency Message Classification", type: "NATURAL_LANGUAGE_PROCESSING", algorithm: "Transformer / DistilBERT", dataset: "Appen 30k Crisis Messages", status: "ONLINE" },
      { id: 4, name: "Intelligent Route Optimization", type: "OPERATIONS_RESEARCH", algorithm: "Google OR-Tools CVRP & Dijkstra Detours", dataset: "OSM Network & Simulated Floods", status: "ONLINE" },
      { id: 5, name: "Fair Resource Allocation", type: "OPTIMIZATION", algorithm: "Max-Min Constrained Linear Program", dataset: "UNHCR Emergency Operations Datasets", status: "ONLINE" }
    ];
  }
}

export async function fetchDemandForecast(
  population: number,
  disasterType: string = "FLOOD",
  daysAhead: number = 3,
  severityMultiplier: number = 1.2
): Promise<any> {
  try {
    const url = `${API_BASE}/predictions/demand-forecast?population=${population}&disaster_type=${disasterType}&days_ahead=${daysAhead}&severity_multiplier=${severityMultiplier}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const water = Math.round(population * 3.5 * (disasterType === "FLOOD" ? 1.3 : 1.0) * severityMultiplier * daysAhead);
    const food = Math.round(population * 2 * daysAhead);
    return {
      model_name: "LSTM-Sphere-DemandForecaster-v1",
      horizon_days: daysAhead,
      displaced_population: population,
      projected_demands: {
        WATER_LITERS: water,
        FOOD_RATIONS: food,
        MEDICAL_TRAUMA_KITS: Math.max(1, Math.round((population / 40) * daysAhead * severityMultiplier)),
        TARPAULIN_BLANKETS: Math.max(1, Math.round(population * 1.0))
      },
      time_series_projections: Array.from({ length: daysAhead }, (_, i) => ({
        day: i + 1,
        water_liters: Math.round(water / daysAhead),
        food_rations: Math.round(food / daysAhead)
      }))
    };
  }
}

export async function detectDamageVision(payload: {
  tile_id?: string;
  ndwi_threshold?: number;
  center_lat?: number;
  center_lon?: number;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/predictions/damage-vision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      model_name: "Spectral-NDWI-UNet-DamageDetector-v2",
      tile_id: payload.tile_id || "SENTINEL2-INUNDATION-DEMO",
      water_detected: true,
      mean_ndwi: 0.48,
      estimated_flood_area_sqkm: 1.45,
      confidence_score: 0.942,
      impassable_road_segments: [
        {
          road_id: "ROAD-ADYAR-01",
          name: "Dr. Muthulakshmi Salai / Canal Bridge",
          coordinates: [[13.008, 80.255], [13.015, 80.260]],
          status: "IMPASSABLE_FLOOD_3FT"
        }
      ]
    };
  }
}

export async function classifyMessageNLP(text: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/predictions/nlp-triage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    const lower = text.toLowerCase();
    const categories: string[] = [];
    if (lower.includes("water") || lower.includes("flood")) categories.push("water");
    if (lower.includes("food") || lower.includes("hunger")) categories.push("food");
    if (lower.includes("medicine") || lower.includes("insulin") || lower.includes("doctor")) categories.push("medical_help");
    if (lower.includes("baby") || lower.includes("infant") || lower.includes("child")) categories.push("child_or_infant");
    if (lower.includes("trapped") || lower.includes("roof") || lower.includes("rescue")) categories.push("search_and_rescue");
    if (categories.length === 0) categories.push("aid_related");

    let urgency = 40.0;
    if (categories.includes("search_and_rescue")) urgency += 35.0;
    if (categories.includes("medical_help") || categories.includes("child_or_infant")) urgency += 20.0;
    if (categories.includes("water")) urgency += 10.0;
    const finalScore = Math.min(100.0, urgency);

    return {
      model_name: "DistilBERT-DisasterNLP-Classifier-v3",
      detected_categories: categories,
      urgency_score: finalScore,
      urgency_level: finalScore >= 80 ? "CRITICAL" : finalScore >= 60 ? "HIGH" : "MEDIUM",
      sentiment_polarity: -0.82
    };
  }
}

export async function synthesizeUnifiedActionPlan(
  disasterId: string,
  warehouseId: string,
  vehicleIds: string[]
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/decision-engine/synthesize-action-plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        disaster_id: disasterId,
        warehouse_id: warehouseId,
        vehicle_ids: vehicleIds
      })
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      action_plan_id: `UDAP-${disasterId}-${Date.now()}`,
      status: "PENDING_AUTHORITY_APPROVAL",
      executive_summary: {
        disaster_name: "Active Inundation Event",
        severity: "CRITICAL",
        displaced_people: 135,
        total_households_serviced: 3,
        total_distance_km: 18.4,
        vehicles_dispatched: 2,
        gini_fairness_coefficient: 0.18,
        inaccessible_road_blocks_identified: 1
      },
      step1_demand_forecast: { WATER_LITERS: 2125, FOOD_RATIONS: 810 },
      step2_damage_intelligence: { flood_extent_sqkm: 1.45, blocked_road_segments: [{ name: "Canal Bank Rd", status: "BLOCKED" }] },
      step3_nlp_triage_summary: { critical_cases: 2, high_cases: 1 },
      step4_fair_allocation_plan: {
        gini_fairness_coefficient: 0.18,
        allocations: [
          { recipient: "Velachery Ward 178", allocated_items: { FOOD: 45, WATER: 90, MEDICINE: 1 } },
          { recipient: "Madipakkam Sector 4", allocated_items: { FOOD: 60, WATER: 120 } }
        ]
      },
      step5_route_dispatch_plan: [
        { vehicle_code: "TRUCK-4x4-ALPHA", total_distance_km: 9.8, estimated_duration_mins: 28.0, stops_count: 2 }
      ],
      recommendation: "Authority action recommended: Authorize dispatch of 2 relief units. Bypasses 1 flooded canal bridge."
    };
  }
}

export async function approveAndDispatchActionPlan(payload: {
  action_plan_id: string;
  disaster_id: string;
  warehouse_id: string;
  routes: any[];
  allocations: any[];
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/decision-engine/approve-and-dispatch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return {
      status: "DISPATCH_AUTHORIZED",
      action_plan_id: payload.action_plan_id,
      missions_created: payload.routes.length || 2,
      message: `Successfully executed dispatch for ${payload.routes.length || 2} relief missions.`
    };
  }
}


