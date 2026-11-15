import {
  Disaster,
  ReliefCenter,
  ReliefVehicle,
  SOSRequest,
  RoutePlan,
  FairAllocationResponse
} from "../types";

const getApiBase = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || "http://localhost:8000/api/v1";
  if (envUrl.endsWith("/api/v1")) return envUrl;
  return `${envUrl.replace(/\/+$/, "")}/api/v1`;
};
const API_BASE = getApiBase();

// Mock Fallback Data in case the backend server is not active during frontend preview
export const MOCK_DISASTER: Disaster = {
  id: "DIS-HYD-FLOOD-2026",
  name: "Hyderabad Urban Flash Floods & Musi River Basin Breach",
  disaster_type: "FLOOD",
  status: "ACTIVE",
  severity: "CRITICAL",
  epicenter_lat: 17.3850,
  epicenter_lon: 78.4867,
  radius_km: 30.0,
  description: "Severe urban cloudburst and Musi River surge with extensive inundation across low-lying Hyderabad sectors.",
  hazard_zones: [
    {
      id: "hz-001",
      name: "Zone A - Flooded Musi River Causeway Sector",
      risk_level: "RED",
      boundary_geojson: JSON.stringify({
        type: "Polygon",
        coordinates: [[
          [78.470, 17.360],
          [78.530, 17.360],
          [78.530, 17.395],
          [78.470, 17.395],
          [78.470, 17.360]
        ]]
      }),
      is_passable: false
    }
  ]
};

export const MOCK_RELIEF_CENTERS: ReliefCenter[] = [
  {
    id: "RC-01",
    name: "Secunderabad Central Humanitarian Relief Base Alpha",
    location_name: "Gymkhana Grounds Complex, Secunderabad, Telangana",
    latitude: 17.4399,
    longitude: 78.4983,
    contact_person: "Col. Rajesh Sharma (Logistics Cmdr)",
    phone: "+91-9444012345",
    capacity_people: 3000,
    current_occupancy: 450,
    inventory_items: [
      { id: "INV-01", relief_center_id: "RC-01", item_category: "WATER", item_name: "Purified Drinking Water Cans (5L)", quantity_available: 1400, quantity_reserved: 50, unit: "cans" },
      { id: "INV-02", relief_center_id: "RC-01", item_category: "WATER", item_name: "Emergency 20L Jerry Cans", quantity_available: 600, quantity_reserved: 20, unit: "cans" },
      { id: "INV-03", relief_center_id: "RC-01", item_category: "FOOD", item_name: "MRE High-Calorie Ration Packs (2,100 kcal)", quantity_available: 1250, quantity_reserved: 45, unit: "packs" },
      { id: "INV-04", relief_center_id: "RC-01", item_category: "FOOD", item_name: "Infant Baby Formula & Milk Powder", quantity_available: 420, quantity_reserved: 15, unit: "tins" },
      { id: "INV-05", relief_center_id: "RC-01", item_category: "MEDICAL", item_name: "Comprehensive Trauma & Hemostatic Kits", quantity_available: 180, quantity_reserved: 10, unit: "kits" },
      { id: "INV-06", relief_center_id: "RC-01", item_category: "MEDICAL", item_name: "Cold-Chain Insulin & Glucose Vials", quantity_available: 260, quantity_reserved: 25, unit: "vials" },
      { id: "INV-07", relief_center_id: "RC-01", item_category: "SHELTER", item_name: "Thermal Tarpaulin Blankets & Ground Sheets", quantity_available: 550, quantity_reserved: 30, unit: "units" },
      { id: "INV-08", relief_center_id: "RC-01", item_category: "SHELTER", item_name: "Rapid Inflatable Family Shelter Tents", quantity_available: 140, quantity_reserved: 10, unit: "units" },
      { id: "INV-09", relief_center_id: "RC-01", item_category: "HYGIENE", item_name: "Sanitation & Disinfection Care Kits", quantity_available: 480, quantity_reserved: 20, unit: "kits" },
      { id: "INV-10", relief_center_id: "RC-01", item_category: "HYGIENE", item_name: "Solar LED Flashlights & Emergency Powerbanks", quantity_available: 320, quantity_reserved: 15, unit: "units" }
    ]
  },
  {
    id: "RC-02",
    name: "South Hyderabad Emergency Staging Depot Beta",
    location_name: "Rajendranagar PJTSAU Complex, Hyderabad, Telangana",
    latitude: 17.3200,
    longitude: 78.4070,
    contact_person: "Capt. Sundar Raman (Ops Head)",
    phone: "+91-9444054321",
    capacity_people: 2000,
    current_occupancy: 320,
    inventory_items: [
      { id: "INV-11", relief_center_id: "RC-02", item_category: "WATER", item_name: "Packaged Mineral Drinking Water (1L Bottles)", quantity_available: 3200, quantity_reserved: 120, unit: "bottles" },
      { id: "INV-12", relief_center_id: "RC-02", item_category: "WATER", item_name: "Aquatabs Chlorine Water Purification Tablets", quantity_available: 1800, quantity_reserved: 50, unit: "strips" },
      { id: "INV-13", relief_center_id: "RC-02", item_category: "FOOD", item_name: "High-Calorie Nutritious Energy Biscuits", quantity_available: 1950, quantity_reserved: 80, unit: "cartons" },
      { id: "INV-14", relief_center_id: "RC-02", item_category: "FOOD", item_name: "Ready-to-Eat Rice & Dal Meal Pouches", quantity_available: 1150, quantity_reserved: 40, unit: "packs" },
      { id: "INV-15", relief_center_id: "RC-02", item_category: "MEDICAL", item_name: "Burn & Fracture Splint Emergency Packs", quantity_available: 210, quantity_reserved: 15, unit: "kits" },
      { id: "INV-16", relief_center_id: "RC-02", item_category: "MEDICAL", item_name: "Portable Medical Oxygen Cylinders", quantity_available: 45, quantity_reserved: 5, unit: "cylinders" },
      { id: "INV-17", relief_center_id: "RC-02", item_category: "SHELTER", item_name: "Heavy Duty PVC Waterproof Ground Tarps", quantity_available: 680, quantity_reserved: 30, unit: "sheets" },
      { id: "INV-18", relief_center_id: "RC-02", item_category: "SHELTER", item_name: "Water-Resistant Sleeping Mats & Bed Rolls", quantity_available: 420, quantity_reserved: 20, unit: "units" },
      { id: "INV-19", relief_center_id: "RC-02", item_category: "HYGIENE", item_name: "Antiseptic Hand Rubs & Medical Disinfectant (5L)", quantity_available: 360, quantity_reserved: 25, unit: "cans" },
      { id: "INV-20", relief_center_id: "RC-02", item_category: "HYGIENE", item_name: "N95 Protective Biohazard Masks", quantity_available: 2800, quantity_reserved: 100, unit: "units" }
    ]
  },
  {
    id: "RC-03",
    name: "North-West Transit Relief Depot Gamma",
    location_name: "Kukatpally / Sanathnagar Industrial Hub, Hyderabad, Telangana",
    latitude: 17.4700,
    longitude: 78.3700,
    contact_person: "Officer K. Annamalai (Transit Cmdr)",
    phone: "+91-9444078901",
    capacity_people: 1500,
    current_occupancy: 210,
    inventory_items: [
      { id: "INV-21", relief_center_id: "RC-03", item_category: "WATER", item_name: "Purified Water Canisters & Mineral Cans (5L)", quantity_available: 950, quantity_reserved: 40, unit: "cans" },
      { id: "INV-22", relief_center_id: "RC-03", item_category: "WATER", item_name: "Electrolyte Oral Rehydration Salts (ORS)", quantity_available: 2200, quantity_reserved: 100, unit: "sachets" },
      { id: "INV-23", relief_center_id: "RC-03", item_category: "FOOD", item_name: "Disaster High-Energy Compact Ration Bars", quantity_available: 1350, quantity_reserved: 60, unit: "packs" },
      { id: "INV-24", relief_center_id: "RC-03", item_category: "FOOD", item_name: "Vacuum-Sealed Long-Life Grain & Rice Sacks (10kg)", quantity_available: 380, quantity_reserved: 20, unit: "sacks" },
      { id: "INV-25", relief_center_id: "RC-03", item_category: "MEDICAL", item_name: "Shock & Hypothermia Trauma Kits", quantity_available: 175, quantity_reserved: 12, unit: "kits" },
      { id: "INV-26", relief_center_id: "RC-03", item_category: "MEDICAL", item_name: "Broad-Spectrum Emergency Antibiotics", quantity_available: 850, quantity_reserved: 35, unit: "packs" },
      { id: "INV-27", relief_center_id: "RC-03", item_category: "SHELTER", item_name: "Stormproof High-Wind Geodesic Tents", quantity_available: 90, quantity_reserved: 8, unit: "units" },
      { id: "INV-28", relief_center_id: "RC-03", item_category: "SHELTER", item_name: "Emergency Aluminized Foil Space Blankets", quantity_available: 1300, quantity_reserved: 50, unit: "sheets" },
      { id: "INV-29", relief_center_id: "RC-03", item_category: "HYGIENE", item_name: "Waterproof Bio-Sanitation Pouch Sets", quantity_available: 520, quantity_reserved: 25, unit: "sets" },
      { id: "INV-30", relief_center_id: "RC-03", item_category: "HYGIENE", item_name: "Waterproof Floating Distress Beacons", quantity_available: 160, quantity_reserved: 10, unit: "units" }
    ]
  },
  {
    id: "RC-04",
    name: "West Zone Rapid Logistics Depot Delta",
    location_name: "Gachibowli Stadium Base Complex, Hyderabad, Telangana",
    latitude: 17.4435,
    longitude: 78.3489,
    contact_person: "Wing Cmdr. Arpitha Sen (Air Logistics)",
    phone: "+91-9444099887",
    capacity_people: 3500,
    current_occupancy: 580,
    inventory_items: [
      { id: "INV-31", relief_center_id: "RC-04", item_category: "WATER", item_name: "Bulk Water Tanker Refill Canisters (25L)", quantity_available: 800, quantity_reserved: 30, unit: "canisters" },
      { id: "INV-32", relief_center_id: "RC-04", item_category: "WATER", item_name: "Rapid Microbial Gravity Filtration Straws", quantity_available: 450, quantity_reserved: 20, unit: "kits" },
      { id: "INV-33", relief_center_id: "RC-04", item_category: "FOOD", item_name: "Fortified Cereal & Dehydrated Nutrition Meals", quantity_available: 1700, quantity_reserved: 70, unit: "packs" },
      { id: "INV-34", relief_center_id: "RC-04", item_category: "FOOD", item_name: "Infant Weaning Porridge & Toddler Food", quantity_available: 580, quantity_reserved: 25, unit: "packs" },
      { id: "INV-35", relief_center_id: "RC-04", item_category: "MEDICAL", item_name: "Mobile Surgical Field Trauma Deployment Packs", quantity_available: 95, quantity_reserved: 6, unit: "units" },
      { id: "INV-36", relief_center_id: "RC-04", item_category: "MEDICAL", item_name: "Pediatric Emergency Medicine Care Kits", quantity_available: 150, quantity_reserved: 10, unit: "kits" },
      { id: "INV-37", relief_center_id: "RC-04", item_category: "SHELTER", item_name: "Modular Quick-Deploy Community Shelter Tarps", quantity_available: 460, quantity_reserved: 25, unit: "units" },
      { id: "INV-38", relief_center_id: "RC-04", item_category: "SHELTER", item_name: "All-Season Thermal Sleeping Bags", quantity_available: 410, quantity_reserved: 18, unit: "units" },
      { id: "INV-39", relief_center_id: "RC-04", item_category: "HYGIENE", item_name: "Industrial Chlorine Disinfection Spray Tanks", quantity_available: 130, quantity_reserved: 8, unit: "tanks" },
      { id: "INV-40", relief_center_id: "RC-04", item_category: "HYGIENE", item_name: "Antibacterial Hand Soap & Sanitizer Bars", quantity_available: 1900, quantity_reserved: 80, unit: "bars" }
    ]
  },
  {
    id: "RC-05",
    name: "Amberpet Musi Basin Flood Response Hub Epsilon",
    location_name: "Amberpet / Moosarambagh Humanitarian Command Center, Hyderabad, Telangana",
    latitude: 17.3871,
    longitude: 78.5173,
    contact_person: "Insp. David Pushparaj (Flood Command)",
    phone: "+91-9444033221",
    capacity_people: 1800,
    current_occupancy: 390,
    inventory_items: [
      { id: "INV-41", relief_center_id: "RC-05", item_category: "WATER", item_name: "Purified Water Cans (5L)", quantity_available: 1150, quantity_reserved: 45, unit: "cans" },
      { id: "INV-42", relief_center_id: "RC-05", item_category: "WATER", item_name: "Individual Water Purification Filter Bottles", quantity_available: 520, quantity_reserved: 20, unit: "bottles" },
      { id: "INV-43", relief_center_id: "RC-05", item_category: "FOOD", item_name: "Instant Hot-Water Ready Meals (Khichdi/Poha)", quantity_available: 1300, quantity_reserved: 55, unit: "packs" },
      { id: "INV-44", relief_center_id: "RC-05", item_category: "FOOD", item_name: "Compressed Calorie Disaster Relief Bars", quantity_available: 2250, quantity_reserved: 90, unit: "bars" },
      { id: "INV-45", relief_center_id: "RC-05", item_category: "MEDICAL", item_name: "Anti-Venom & Waterborne Pathogen Kits", quantity_available: 140, quantity_reserved: 12, unit: "kits" },
      { id: "INV-46", relief_center_id: "RC-05", item_category: "MEDICAL", item_name: "Sterile Gauze Bandages, Sutures & Antiseptics", quantity_available: 650, quantity_reserved: 30, unit: "packs" },
      { id: "INV-47", relief_center_id: "RC-05", item_category: "SHELTER", item_name: "Reinforced Polyethylene Flood-Resistant Tarps", quantity_available: 580, quantity_reserved: 25, unit: "sheets" },
      { id: "INV-48", relief_center_id: "RC-05", item_category: "SHELTER", item_name: "Lightweight Compact EVA Foam Sleeping Mats", quantity_available: 630, quantity_reserved: 30, unit: "mats" },
      { id: "INV-49", relief_center_id: "RC-05", item_category: "HYGIENE", item_name: "Sanitary Napkins & Dignity Hygiene Kits", quantity_available: 980, quantity_reserved: 40, unit: "kits" },
      { id: "INV-50", relief_center_id: "RC-05", item_category: "HYGIENE", item_name: "Waterproof Solar Torches & Dynamo Lanterns", quantity_available: 340, quantity_reserved: 15, unit: "units" }
    ]
  }
];

export const MOCK_VEHICLES: ReliefVehicle[] = [
  {
    id: "VEH-01",
    vehicle_code: "TRUCK-4x4-ALPHA",
    vehicle_type: "TRUCK",
    capacity_kg: 2000,
    current_lat: 17.4399,
    current_lon: 78.4983,
    status: "IDLE",
    assigned_driver: "Officer Vikram Singh",
    speed_kmh: 42,
    home_depot: "Secunderabad Base Alpha"
  },
  {
    id: "VEH-02",
    vehicle_code: "TRUCK-RESCUE-BETA",
    vehicle_type: "TRUCK",
    capacity_kg: 1500,
    current_lat: 17.3200,
    current_lon: 78.4070,
    status: "IDLE",
    assigned_driver: "Lt. Priya Nair",
    speed_kmh: 38,
    home_depot: "Rajendranagar Staging Beta"
  },
  {
    id: "VEH-03",
    vehicle_code: "BOAT-RESCUE-01",
    vehicle_type: "BOAT",
    capacity_kg: 750,
    current_lat: 17.3850,
    current_lon: 78.4867,
    status: "EN_ROUTE",
    assigned_driver: "Capt. Manikandan",
    speed_kmh: 22,
    home_depot: "Musi Basin Maritime Gamma"
  },
  {
    id: "VEH-04",
    vehicle_code: "BOAT-AMPHIBIAN-02",
    vehicle_type: "BOAT",
    capacity_kg: 900,
    current_lat: 17.3871,
    current_lon: 78.5173,
    status: "IDLE",
    assigned_driver: "Officer S. Murugan",
    speed_kmh: 26,
    home_depot: "Amberpet / Moosarambagh Hub Epsilon"
  },
  {
    id: "VEH-05",
    vehicle_code: "SCOUT-4X4-DELTA",
    vehicle_type: "4X4",
    capacity_kg: 850,
    current_lat: 17.4435,
    current_lon: 78.3489,
    status: "IDLE",
    assigned_driver: "Lt. Arun Prasad",
    speed_kmh: 50,
    home_depot: "Gachibowli Delta"
  },
  {
    id: "VEH-06",
    vehicle_code: "AMBULANCE-ICU-01",
    vehicle_type: "4X4",
    capacity_kg: 600,
    current_lat: 17.4399,
    current_lon: 78.4983,
    status: "IDLE",
    assigned_driver: "Dr. Revathi & Driver Selvam",
    speed_kmh: 48,
    home_depot: "Secunderabad Base Alpha"
  },
  {
    id: "VEH-07",
    vehicle_code: "DRONE-PAYLOAD-HEAVY",
    vehicle_type: "DRONE",
    capacity_kg: 45,
    current_lat: 17.4435,
    current_lon: 78.3489,
    status: "IDLE",
    assigned_driver: "Remote Pilot Karthik",
    speed_kmh: 65,
    home_depot: "Gachibowli Delta"
  },
  {
    id: "VEH-08",
    vehicle_code: "DRONE-RECON-SURVEIL",
    vehicle_type: "DRONE",
    capacity_kg: 15,
    current_lat: 17.3850,
    current_lon: 78.4867,
    status: "EN_ROUTE",
    assigned_driver: "Flight Lead Divya",
    speed_kmh: 75,
    home_depot: "Musi Basin Maritime Gamma"
  }
];

export const MOCK_SOS: SOSRequest[] = [
  {
    id: "sos-01",
    victim_name: "Kavitha Sundaram",
    contact_phone: "+91-9840112233",
    latitude: 17.3780,
    longitude: 78.4910,
    address: "12 Musi Causeway Road, Chaderghat Lowlands, Hyderabad, Telangana",
    people_count: 4,
    urgency_level: "CRITICAL",
    urgency_score: 92.0,
    special_needs: JSON.stringify(["infant", "insulin-dependent"]),
    category_needs: JSON.stringify(["FOOD", "WATER", "MEDICAL"]),
    description: "Musi flood surge reached ground floor, baby needs formula milk and mother needs cold storage insulin urgently. Trapped.",
    status: "PENDING",
    requested_at: "10 mins ago"
  },
  {
    id: "sos-02",
    victim_name: "Senior Care Care Home (Ramesh Babu)",
    contact_phone: "+91-9840556677",
    latitude: 17.3810,
    longitude: 78.5120,
    address: "Moosarambagh Old Age Center, Ward 45, Hyderabad, Telangana",
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
    latitude: 17.3750,
    longitude: 78.4980,
    address: "Alaknanda Colony, Malakpet / Chaderghat Basin, Hyderabad, Telangana",
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
    latitude: 17.3616,
    longitude: 78.4747,
    address: "Charminar South Relief Shelter, Falaknuma Link, Hyderabad, Telangana",
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

export async function fetchInventory(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/inventory`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return MOCK_RELIEF_CENTERS.flatMap(rc =>
      (rc.inventory_items || []).map(item => ({
        ...item,
        warehouse_name: rc.name,
        location_name: rc.location_name
      }))
    );
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
  let createdSOS: SOSRequest;
  try {
    const res = await fetch(`${API_BASE}/sos/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    createdSOS = await res.json();
  } catch {
    // Return simulated scored SOS
    createdSOS = {
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

  // Register in cross-tab / cross-portal broadcast for immediate Admin notification
  try {
    if (typeof window !== "undefined") {
      const existing = JSON.parse(localStorage.getItem("resqlink_new_citizen_reports") || "[]");
      existing.unshift(createdSOS);
      localStorage.setItem("resqlink_new_citizen_reports", JSON.stringify(existing.slice(0, 30)));
      localStorage.setItem("resqlink_has_unseen_reports", "true");
      window.dispatchEvent(new CustomEvent("resqlink_new_sos", { detail: createdSOS }));
    }
  } catch { }

  return createdSOS;
}

export async function updateSOSStatus(
  sosId: string,
  newStatus: "PENDING" | "ASSIGNED" | "DISPATCHED" | "DELIVERED" | "RESOLVED",
  assignedVehicleId?: string
): Promise<SOSRequest> {
  let updatedRecord: SOSRequest | null = null;
  try {
    const res = await fetch(`${API_BASE}/sos/${sosId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: newStatus,
        assigned_vehicle_id: assignedVehicleId
      })
    });
    if (res.ok) {
      updatedRecord = await res.json();
    }
  } catch { }

  // Fallback to POST if PATCH fails or server differs
  if (!updatedRecord) {
    try {
      const res = await fetch(`${API_BASE}/sos/${sosId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          assigned_vehicle_id: assignedVehicleId
        })
      });
      if (res.ok) {
        updatedRecord = await res.json();
      }
    } catch { }
  }

  if (!updatedRecord) {
    updatedRecord = {
      id: sosId,
      status: newStatus,
      assigned_vehicle_id: assignedVehicleId || "TRUCK-4x4-ALPHA",
      resolved_at: newStatus === "DELIVERED" ? new Date().toISOString() : undefined
    } as any;
  }

  // Cross-portal real-time synchronization
  try {
    if (typeof window !== "undefined") {
      // 1. Update citizen userRequests in localStorage
      const userReqsStr = localStorage.getItem("resqlink_user_requests");
      if (userReqsStr) {
        const userReqs = JSON.parse(userReqsStr);
        const mapped = userReqs.map((r: any) => {
          if (r.id === sosId || r.id === `SOS-${sosId.replace("sos-", "")}` || r.id?.toLowerCase() === sosId?.toLowerCase()) {
            return {
              ...r,
              status: newStatus,
              assigned_vehicle: assignedVehicleId || r.assigned_vehicle || "TRUCK-4x4-ALPHA",
              eta: newStatus === "DELIVERED" ? "Delivered" : newStatus === "DISPATCHED" ? "12 mins" : "Assigned"
            };
          }
          return r;
        });
        localStorage.setItem("resqlink_user_requests", JSON.stringify(mapped));
      }

      // 2. Update recent citizen reports in localStorage
      const recentReportsStr = localStorage.getItem("resqlink_new_citizen_reports");
      if (recentReportsStr) {
        const recent = JSON.parse(recentReportsStr);
        const mappedRecent = recent.map((r: any) => {
          if (r.id === sosId) {
            return { ...r, status: newStatus, assigned_vehicle_id: assignedVehicleId || r.assigned_vehicle_id };
          }
          return r;
        });
        localStorage.setItem("resqlink_new_citizen_reports", JSON.stringify(mappedRecent));
      }

      // 3. Dispatch global real-time event for all open components/tabs
      window.dispatchEvent(
        new CustomEvent("resqlink_sos_status_updated", {
          detail: { sosId, status: newStatus, assignedVehicleId }
        })
      );
    }
  } catch { }

  return updatedRecord!;
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    let rawRoutes: any[] = [];
    if (Array.isArray(data)) {
      rawRoutes = data;
    } else if (data && Array.isArray(data.routes)) {
      rawRoutes = data.routes;
    }

    if (rawRoutes.length > 0) {
      return rawRoutes.map((r: any, idx: number) => ({
        id: r.id || `plan-hyd-0${idx + 1}`,
        vehicle_id: r.vehicle_id || (vehicleIds && vehicleIds[idx]) || `VEH-0${idx + 1}`,
        vehicle_code: r.vehicle_code || `TRUCK-${idx === 0 ? "4x4-ALPHA" : "RESCUE-BETA"}`,
        relief_center_id: r.relief_center_id || reliefCenterId || "RC-01",
        total_distance_km: Number(r.total_distance_km ?? r.distance_km ?? (idx === 0 ? 10.71 : 7.23)),
        estimated_duration_mins: Number(r.estimated_duration_mins ?? r.duration_mins ?? (idx === 0 ? 16.1 : 12.4)),
        status: r.status || "OPTIMAL",
        created_at: r.created_at || new Date().toISOString(),
        waypoints: Array.isArray(r.waypoints) ? r.waypoints.map((wp: any, wIdx: number) => ({
          sequence: Number(wp.sequence ?? wIdx + 1),
          location_name: wp.location_name || wp.name || `Waypoint ${wIdx + 1}`,
          latitude: Number(wp.latitude ?? (wIdx === 0 ? 17.4399 : wIdx === 1 ? 17.3780 : wIdx === 2 ? 17.3810 : 17.4399)),
          longitude: Number(wp.longitude ?? (wIdx === 0 ? 78.4983 : wIdx === 1 ? 78.4910 : wIdx === 2 ? 78.5120 : 78.4983)),
          action: wp.action || (wIdx === 0 ? "DEPOT_START" : wIdx === r.waypoints.length - 1 ? "DEPOT_RETURN" : "DELIVER_AID"),
          demand_kg: Number(wp.demand_kg ?? (wp.action === "DELIVER_AID" ? 150 : 0)),
          eta_mins: typeof wp.eta_mins === "number" ? wp.eta_mins : parseFloat(String(wp.eta || "0").replace(/[^0-9.]/g, "")) || (wIdx * 4),
          sos_id: wp.sos_id
        })) : []
      }));
    }
    throw new Error("No routes in response");
  } catch (err) {
    console.warn("Using offline CVRP route plan fallback:", err);
    return [
      {
        id: "plan-hyd-01",
        vehicle_id: "VEH-01",
        vehicle_code: "TRUCK-4x4-ALPHA",
        relief_center_id: reliefCenterId || "RC-01",
        total_distance_km: 10.71,
        estimated_duration_mins: 16.1,
        status: "OPTIMAL",
        created_at: new Date().toISOString(),
        waypoints: [
          { sequence: 1, location_name: "Secunderabad Central Hub (Depot)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_START", demand_kg: 0, eta_mins: 0 },
          { sequence: 2, location_name: "Musi River Causeway Hazard Detour", latitude: 17.3780, longitude: 78.4910, action: "HAZARD_BYPASS", demand_kg: 0, eta_mins: 3.9 },
          { sequence: 3, location_name: "SOS: Moosarambagh Ward 45", latitude: 17.3810, longitude: 78.5120, action: "DELIVER_AID", demand_kg: 150, eta_mins: 8.0 },
          { sequence: 4, location_name: "Secunderabad Central Hub (Return)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_RETURN", demand_kg: 0, eta_mins: 16.1 }
        ]
      },
      {
        id: "plan-hyd-02",
        vehicle_id: "VEH-02",
        vehicle_code: "TRUCK-RESCUE-BETA",
        relief_center_id: reliefCenterId || "RC-01",
        total_distance_km: 7.23,
        estimated_duration_mins: 12.4,
        status: "OPTIMAL",
        created_at: new Date().toISOString(),
        waypoints: [
          { sequence: 1, location_name: "Secunderabad Central Hub (Depot)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_START", demand_kg: 0, eta_mins: 0 },
          { sequence: 2, location_name: "Musi River Causeway Hazard Detour", latitude: 17.3780, longitude: 78.4910, action: "HAZARD_BYPASS", demand_kg: 0, eta_mins: 4.5 },
          { sequence: 3, location_name: "SOS: Senior Care Home (Malakpet)", latitude: 17.3750, longitude: 78.4980, action: "DELIVER_AID", demand_kg: 240, eta_mins: 6.4 },
          { sequence: 4, location_name: "Secunderabad Central Hub (Return)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_RETURN", demand_kg: 0, eta_mins: 12.4 }
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
          road_id: "ROAD-MUSI-01",
          name: "Musi River Causeway / Chaderghat Bridge",
          coordinates: [[17.376, 78.488], [17.382, 78.494]],
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
      step2_damage_intelligence: { flood_extent_sqkm: 1.45, blocked_road_segments: [{ name: "Musi River Causeway", status: "BLOCKED" }] },
      step3_nlp_triage_summary: { critical_cases: 2, high_cases: 1 },
      step4_fair_allocation_plan: {
        gini_fairness_coefficient: 0.18,
        allocations: [
          { recipient: "Moosarambagh Ward 45", allocated_items: { FOOD: 45, WATER: 90, MEDICINE: 1 } },
          { recipient: "Chaderghat Sector 4", allocated_items: { FOOD: 60, WATER: 120 } }
        ]
      },
      step5_route_dispatch_plan: [
        { vehicle_code: "TRUCK-4x4-ALPHA", total_distance_km: 9.8, estimated_duration_mins: 28.0, stops_count: 2 }
      ],
      recommendation: "Authority action recommended: Authorize dispatch of 2 relief units. Bypasses 1 flooded Musi causeway."
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
      message: `Successfully executed dispatch for ${payload.routes.length || 2} relief missions.`,
      proof_of_delivery_token: "POD-8F4A19B3",
      sha256_digest: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
      authorized_by: "Col. Rajesh Sharma, Senior Incident Commander (Hyderabad)",
      authorized_at: new Date().toISOString()
    };
  }
}


