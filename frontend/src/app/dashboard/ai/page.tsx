"use client";

import React, { useState, useEffect } from "react";
import {
  Cpu,
  TrendingUp,
  Camera,
  MessageSquare,
  Navigation,
  Scale,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Play,
  Send,
  Check,
  Loader2,
  ShieldCheck,
  FileText,
  Layers,
  MapPin
} from "lucide-react";
import {
  fetchAIModelsCatalog,
  fetchDemandForecast,
  detectDamageVision,
  classifyMessageNLP,
  runRouteOptimization,
  runFairAllocation,
  synthesizeUnifiedActionPlan,
  approveAndDispatchActionPlan
} from "../../../lib/api";

export default function AIDashboardPage() {
  const [activeModelTab, setActiveModelTab] = useState<number>(1);
  const [modelsCatalog, setModelsCatalog] = useState<any[]>([]);

  // ---------------------------------------------------------------------------
  // MODEL 1: Resource Demand Forecasting State
  // ---------------------------------------------------------------------------
  const [population, setPopulation] = useState(850);
  const [disasterType, setDisasterType] = useState("FLOOD");
  const [forecastHorizon, setForecastHorizon] = useState(3);
  const [severityMultiplier, setSeverityMultiplier] = useState(1.2);
  const [isLoadingForecast, setIsLoadingForecast] = useState(false);
  const [demandResult, setDemandResult] = useState<any>({
    model_name: "LSTM-Sphere-DemandForecaster-v1",
    projected_demands: {
      WATER_LITERS: 11599,
      FOOD_RATIONS: 5100,
      MEDICAL_TRAUMA_KITS: 77,
      TARPAULIN_BLANKETS: 850
    },
    time_series_projections: [
      { day: 1, water_liters: 3866, food_rations: 1700 },
      { day: 2, water_liters: 3866, food_rations: 1700 },
      { day: 3, water_liters: 3866, food_rations: 1700 }
    ]
  });

  // ---------------------------------------------------------------------------
  // MODEL 2: Satellite Damage Vision State
  // ---------------------------------------------------------------------------
  const [selectedImageMode, setSelectedImageMode] = useState<"RAW" | "SEGMENTED">("SEGMENTED");
  const [ndwiThreshold, setNdwiThreshold] = useState(0.3);
  const [isLoadingVision, setIsLoadingVision] = useState(false);
  const [visionResult, setVisionResult] = useState<any>({
    model_name: "Spectral-NDWI-UNet-DamageDetector-v2",
    tile_id: "SENTINEL-2B-CHENNAI-T14",
    water_detected: true,
    estimated_flood_area_sqkm: 1.84,
    confidence_score: 0.942,
    impassable_road_segments: [
      {
        road_id: "ROAD-ADYAR-01",
        name: "Adyar Canal Bridge / Dr. Muthulakshmi Rd",
        status: "IMPASSABLE_FLOOD_3FT"
      }
    ]
  });

  // ---------------------------------------------------------------------------
  // MODEL 3: Emergency NLP Triage State
  // ---------------------------------------------------------------------------
  const [nlpText, setNlpText] = useState(
    "Water reached 4 feet inside the ground floor. Grandmother is diabetic and needs insulin urgently. Baby needs infant milk formula."
  );
  const [isLoadingNLP, setIsLoadingNLP] = useState(false);
  const [nlpResult, setNlpResult] = useState<any>({
    model_name: "DistilBERT-DisasterNLP-Classifier-v3",
    category: "WATER_RELIEF & MEDICAL_ASSISTANCE",
    urgency_score: 95.0,
    urgency_level: "CRITICAL",
    detected_categories: ["water", "medical_help", "child_or_infant", "search_and_rescue"],
    sentiment_polarity: -0.82
  });

  // ---------------------------------------------------------------------------
  // MODEL 4: Route Optimization State
  // ---------------------------------------------------------------------------
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routePlan, setRoutePlan] = useState<any>({
    total_distance_km: 14.8,
    estimated_duration_mins: 42.0,
    hazard_detours_inserted: 1,
    waypoints: [
      { sequence: 1, location_name: "Central Base Alpha [START]", action: "DEPOT_START", eta_mins: 0 },
      { sequence: 2, location_name: "⚠ Adyar Red Zone Perimeter [HAZARD_BYPASS]", action: "HAZARD_BYPASS", eta_mins: 8.5 },
      { sequence: 3, location_name: "SOS: Senior Care Home (12 People)", action: "DELIVER_AID", demand_kg: 180, eta_mins: 16.5 },
      { sequence: 4, location_name: "SOS: Kavitha & Infant (4 People)", action: "DELIVER_AID", demand_kg: 60, eta_mins: 28.2 },
      { sequence: 5, location_name: "Central Base Alpha [RETURN]", action: "DEPOT_RETURN", eta_mins: 42.0 }
    ]
  });

  // ---------------------------------------------------------------------------
  // MODEL 5: Fair Resource Allocation State
  // ---------------------------------------------------------------------------
  const [isSolvingAllocation, setIsSolvingAllocation] = useState(false);
  const [allocationResult, setAllocationResult] = useState<any>({
    gini_fairness_coefficient: 0.18,
    total_sos_served: 4,
    allocations: [
      { victim_name: "Kavitha & Infant", people_count: 4, urgency_score: 92.0, allocated_items: { FOOD: 4, WATER: 8, MEDICAL: 1 } },
      { victim_name: "Senior Care Home", people_count: 12, urgency_score: 88.5, allocated_items: { MEDICAL: 3, WATER: 24, EVAC: 1 } },
      { victim_name: "Anand Kumar", people_count: 6, urgency_score: 72.0, allocated_items: { FOOD: 6, WATER: 12 } },
      { victim_name: "Dr. Farooq", people_count: 8, urgency_score: 68.0, allocated_items: { MEDICAL: 2, FOOD: 8 } }
    ]
  });

  // ---------------------------------------------------------------------------
  // UNIFIED DECISION ENGINE (PHASE 8 & 9 INTEGRATION)
  // ---------------------------------------------------------------------------
  const [isSynthesizingUDAP, setIsSynthesizingUDAP] = useState(false);
  const [isDispatchingUDAP, setIsDispatchingUDAP] = useState(false);
  const [unifiedPlan, setUnifiedPlan] = useState<any>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchAIModelsCatalog().then(setModelsCatalog);
  }, []);

  // Handler: Run Model 1 Demand Forecasting
  const handleRunForecast = async () => {
    setIsLoadingForecast(true);
    try {
      const data = await fetchDemandForecast(population, disasterType, forecastHorizon, severityMultiplier);
      setDemandResult(data);
    } finally {
      setIsLoadingForecast(false);
    }
  };

  // Handler: Run Model 2 Damage Detection
  const handleRunVision = async () => {
    setIsLoadingVision(true);
    try {
      const data = await detectDamageVision({
        tile_id: "SENTINEL-2B-CHENNAI-T14",
        ndwi_threshold: ndwiThreshold,
        center_lat: 13.0600,
        center_lon: 80.2500
      });
      setVisionResult(data);
    } finally {
      setIsLoadingVision(false);
    }
  };

  // Handler: Run Model 3 NLP Distress Triage
  const handleClassifyMessage = async () => {
    setIsLoadingNLP(true);
    try {
      const data = await classifyMessageNLP(nlpText);
      setNlpResult({
        ...data,
        category: (data.detected_categories || []).map((c: string) => c.toUpperCase()).join(" & ")
      });
    } finally {
      setIsLoadingNLP(false);
    }
  };

  // Handler: Run Model 4 Route Optimization
  const handleRunRouteSolver = async () => {
    setIsLoadingRoutes(true);
    try {
      const data = await runRouteOptimization("WH-CHENNAI-CENTRAL", ["VEH-01", "VEH-02"]);
      if (data && data.length > 0) {
        setRoutePlan(data[0]);
      }
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Handler: Run Model 5 Fair Allocation
  const handleRunFairAllocation = async () => {
    setIsSolvingAllocation(true);
    try {
      const data = await runFairAllocation("WH-CHENNAI-CENTRAL");
      setAllocationResult(data);
    } finally {
      setIsSolvingAllocation(false);
    }
  };

  // Handler: Synthesize Unified Disaster Action Plan (UDAP)
  const handleSynthesizeUDAP = async () => {
    setIsSynthesizingUDAP(true);
    setDispatchStatus(null);
    try {
      const plan = await synthesizeUnifiedActionPlan(
        "DIS-CHENNAI-FLOOD-2026",
        "WH-CHENNAI-CENTRAL",
        ["VEH-01", "VEH-02"]
      );
      setUnifiedPlan(plan);
    } finally {
      setIsSynthesizingUDAP(false);
    }
  };

  // Handler: Human-in-the-Loop Authority Approval & Dispatch
  const handleApproveAndDispatch = async () => {
    if (!unifiedPlan) return;
    setIsDispatchingUDAP(true);
    try {
      const res = await approveAndDispatchActionPlan({
        action_plan_id: unifiedPlan.action_plan_id,
        disaster_id: "DIS-CHENNAI-FLOOD-2026",
        warehouse_id: "WH-CHENNAI-CENTRAL",
        routes: unifiedPlan.step5_route_dispatch_plan || [],
        allocations: unifiedPlan.step4_fair_allocation_plan?.allocations || []
      });
      setDispatchStatus(`APPROVED & DISPATCHED: ${res.message || "Relief fleet mobilized."}`);
      setUnifiedPlan((prev: any) => ({ ...prev, status: "DISPATCH_AUTHORIZED" }));
    } finally {
      setIsDispatchingUDAP(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>CORE INTELLIGENCE // 5 PRIMARY AI/ML MODELS & DECISION ENGINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">AI Predictions & Mathematical Decision Engine</h1>
          <p className="text-xs text-slate-400 mt-1">
            Explore, run, and review the five AI/ML models integrated with FastAPI backend and the unified decision engine.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ALL 5 MODELS ONLINE</span>
          </div>
        </div>
      </div>

      {/* Model Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
        {[
          { id: 1, label: "1. Demand Forecast", icon: TrendingUp },
          { id: 2, label: "2. Damage Vision", icon: Camera },
          { id: 3, label: "3. Message NLP", icon: MessageSquare },
          { id: 4, label: "4. Route Solver", icon: Navigation },
          { id: 5, label: "5. Fair Allocation", icon: Scale },
          { id: 6, label: "UDAP Decision Engine", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeModelTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveModelTab(tab.id)}
              className={`flex items-center justify-center space-x-2 py-3 px-2 rounded-xl transition-all ${
                isAct
                  ? "bg-amber-500 text-slate-950 shadow-md font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MODEL 1: Demand Prediction */}
      {activeModelTab === 1 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Model 1: Time-Series Forecasting
              </span>
              <h2 className="text-xl font-black text-white">Resource Demand Prediction (LSTM & Sphere Standards)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Predicts 24h, 48h and 72h humanitarian procurement requirements based on affected population.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs font-bold">
              BENCHMARK: SPHERE 2026 / FEMA
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-1 p-5 rounded-2xl bg-slate-950 border border-slate-800">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Input Parameters</span>
              </h3>

              <div className="space-y-2">
                <label className="text-xs text-slate-400">Disaster Type:</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                >
                  <option value="FLOOD">Flood (Waterborne disease risk: 1.3x)</option>
                  <option value="CYCLONE">Cyclone / Storm Surge (1.2x)</option>
                  <option value="EARTHQUAKE">Earthquake / Structural (1.1x)</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Affected Population:</span>
                  <span className="font-bold text-white font-mono">{population} people</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="5000"
                  step="50"
                  value={population}
                  onChange={(e) => setPopulation(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Forecast Horizon:</span>
                  <span className="font-bold text-white font-mono">{forecastHorizon} Days</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Weather Severity Index:</span>
                  <span className="font-bold text-white font-mono">{severityMultiplier}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.1"
                  value={severityMultiplier}
                  onChange={(e) => setSeverityMultiplier(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleRunForecast}
                disabled={isLoadingForecast}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoadingForecast ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isLoadingForecast ? "Computing Projections..." : "Run LSTM Model Inference"}</span>
              </button>
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">💧 Drinking Water Required</span>
                  <div className="text-3xl font-black text-cyan-400 font-mono">
                    {Number(demandResult.projected_demands.WATER_LITERS).toLocaleString()} Liters
                  </div>
                  <p className="text-[11px] text-slate-500">3.5L per capita / day adjusted for weather severity & disease index</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">🍞 Food Nutrition Rations</span>
                  <div className="text-3xl font-black text-amber-400 font-mono">
                    {Number(demandResult.projected_demands.FOOD_RATIONS).toLocaleString()} Packs
                  </div>
                  <p className="text-[11px] text-slate-500">2,100 kcal standard rations per person / day</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">🩹 Emergency Trauma Kits</span>
                  <div className="text-3xl font-black text-red-400 font-mono">
                    {Number(demandResult.projected_demands.MEDICAL_TRAUMA_KITS).toLocaleString()} Kits
                  </div>
                  <p className="text-[11px] text-slate-500">1 comprehensive field medical pack per 40 individuals</p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400 font-semibold">🏕 Tarpaulins & Blankets</span>
                  <div className="text-3xl font-black text-emerald-400 font-mono">
                    {Number(demandResult.projected_demands.TARPAULIN_BLANKETS || population).toLocaleString()} Units
                  </div>
                  <p className="text-[11px] text-slate-500">Emergency shelter & thermal insulation</p>
                </div>
              </div>

              {/* Projections timeline */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Multi-Day Temporal Projections ({demandResult.model_name})
                </span>
                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                  {demandResult.time_series_projections.map((p: any) => (
                    <div key={p.day} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-center">
                      <div className="text-slate-400 font-bold">Day +{p.day}</div>
                      <div className="text-cyan-400 font-black mt-1">{p.water_liters.toLocaleString()} L</div>
                      <div className="text-amber-400 text-[10px]">{p.food_rations.toLocaleString()} rations</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL 2: Damage Detection */}
      {activeModelTab === 2 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Model 2: Computer Vision & Remote Sensing
              </span>
              <h2 className="text-xl font-black text-white">Disaster Damage Detection (CNN & Vision Transformer)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Satellite / UAV image segmentation identifies flooded roads, bridge failures & structural damage.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-xs font-bold">
              <button
                onClick={() => setSelectedImageMode("RAW")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedImageMode === "RAW" ? "bg-slate-800 text-white" : "text-slate-400"
                }`}
              >
                Raw Optical Frame
              </button>
              <button
                onClick={() => setSelectedImageMode("SEGMENTED")}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  selectedImageMode === "SEGMENTED" ? "bg-amber-500 text-slate-950 font-black" : "text-slate-400"
                }`}
              >
                AI Segmentation Mask
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative h-80 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <svg viewBox="0 0 600 350" className="w-full h-full">
                <rect width="100%" height="100%" fill="#0a0f1d" />
                <path d="M 0 180 Q 200 120 400 190 T 600 200" fill="none" stroke="#1e293b" strokeWidth="30" />
                <text x="30" y="150" fill="#64748b" fontSize="12" fontFamily="monospace">
                  NH-45 / ADYAR HIGHWAY CORRIDOR
                </text>

                {selectedImageMode === "SEGMENTED" && (
                  <>
                    <polygon
                      points="180,120 380,110 400,240 190,250"
                      fill="#ef4444"
                      fillOpacity="0.45"
                      stroke="#ef4444"
                      strokeWidth="2.5"
                      strokeDasharray="6,3"
                    />
                    <rect x="220" y="155" width="165" height="26" rx="4" fill="#7f1d1d" opacity="0.95" />
                    <text x="230" y="172" fill="#fecaca" fontSize="11" fontWeight="bold" fontFamily="monospace">
                      ⚠ FLOOD MASK ({Math.round(visionResult.confidence_score * 100)}%)
                    </text>
                    <rect x="420" y="80" width="120" height="70" rx="6" fill="#f59e0b" fillOpacity="0.25" stroke="#f59e0b" strokeWidth="2" />
                    <text x="430" y="120" fill="#fde68a" fontSize="9" fontWeight="bold" fontFamily="monospace">
                      COLLAPSED BRIDGE (91%)
                    </text>
                  </>
                )}
              </svg>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Vision Model Telemetry</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Tile Ref:</span>
                  <span className="text-white font-mono">{visionResult.tile_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Architecture:</span>
                  <span className="text-white font-mono">ResNet-50 + UNet / ViT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Training Benchmark:</span>
                  <span className="text-white font-mono">ML4Floods & xView2</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Flooded Polygon Extent:</span>
                  <span className="text-red-400 font-bold font-mono">{visionResult.estimated_flood_area_sqkm} sq km</span>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">NDWI Threshold:</span>
                  <span className="text-amber-400 font-mono">{ndwiThreshold}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.6"
                  step="0.05"
                  value={ndwiThreshold}
                  onChange={(e) => setNdwiThreshold(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleRunVision}
                disabled={isLoadingVision}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2"
              >
                {isLoadingVision ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}
                <span>{isLoadingVision ? "Segmenting..." : "Re-run Vision Segmentation"}</span>
              </button>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-[11px] text-red-300">
                ⚠ Automated Action: Highway segment flagged as IMPASSABLE. Coordinates streamed directly to Model 4 (Route Optimizer) to prevent vehicle dispatch.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL 3: Message Triage */}
      {activeModelTab === 3 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Model 3: Natural Language Processing
              </span>
              <h2 className="text-xl font-black text-white">Emergency Distress Message Classification (NLP Transformer)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Parses multilingual emergency text, social reports & WhatsApp distress calls into 36 actionable disaster categories.
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs font-bold">
              APPEN / FIGURE EIGHT 30K DATASET
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300">Incoming Emergency Message / Tweet / SMS:</label>
              <textarea
                rows={4}
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                className="w-full p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 font-mono"
              />

              <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">Presets:</span>
                <button
                  type="button"
                  onClick={() =>
                    setNlpText("Rooftop stranded in Velachery. Water level 5 feet. Pregnant mother and infant need evacuation.")
                  }
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Pregnant & Infant Stranded
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setNlpText("Old age home generator failed. 12 residents out of oxygen and drinking water.")
                  }
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
                >
                  Oxygen & Medical Emergency
                </button>
              </div>

              <button
                onClick={handleClassifyMessage}
                disabled={isLoadingNLP}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center space-x-2"
              >
                {isLoadingNLP ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isLoadingNLP ? "Classifying With DistilBERT..." : "Execute NLP Classification & Triage"}</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Model Inference Output</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Assessed Urgency Level:</span>
                  <span
                    className={`px-2.5 py-1 rounded-lg font-black font-mono ${
                      nlpResult.urgency_level === "CRITICAL"
                        ? "bg-red-950 text-red-400 border border-red-800"
                        : "bg-amber-950 text-amber-400"
                    }`}
                  >
                    {nlpResult.urgency_level} ({nlpResult.urgency_score}/100)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Classified Category:</span>
                  <span className="font-mono text-cyan-400 font-bold">{nlpResult.category}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Sentiment Polarity:</span>
                  <span className="font-mono text-red-400 font-bold">{nlpResult.sentiment_polarity} (Severe Distress)</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-400 font-semibold text-[11px]">Detected Categories (Appen 36):</span>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(nlpResult.detected_categories || []).map((ent: string) => (
                    <span key={ent} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono">
                      ✓ {ent}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL 4: Route Optimization */}
      {activeModelTab === 4 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Model 4: Operations Research / Dynamic Graph Solver
              </span>
              <h2 className="text-xl font-black text-white">Intelligent Route Optimization (CVRP with Hazard Avoidance)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Google OR-Tools / Dijkstra solver penalizes submerged flood polygons and schedules high-urgency waypoints first.
              </p>
            </div>
            <button
              onClick={handleRunRouteSolver}
              disabled={isLoadingRoutes}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold flex items-center space-x-1.5"
            >
              {isLoadingRoutes ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>Solve CVRP Route</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Formulation Constraints</h3>
              <div className="space-y-2 text-slate-300">
                <div>✓ <b>Capacity Limit:</b> Cargo ≤ 1500 kg per truck</div>
                <div>✓ <b>Sub-tour Elimination:</b> Closed loop depot start/end</div>
                <div>✓ <b>Polygon Avoidance:</b> Adyar flood zone impassable</div>
                <div>✓ <b>Priority Scheduling:</b> Scores ≥ 80 served in first 30 mins</div>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <div className="text-slate-400">Total Route Distance:</div>
                <div className="text-xl font-black text-cyan-400 font-mono">{routePlan.total_distance_km} km</div>
                <div className="text-slate-400 mt-1">Est. Mission Time:</div>
                <div className="text-xl font-black text-amber-400 font-mono">{routePlan.estimated_duration_mins} mins</div>
              </div>
            </div>

            <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Computed Mission Trajectory</h3>
              <div className="space-y-2 font-mono text-[11px]">
                {(routePlan.waypoints || []).map((wp: any, idx: number) => {
                  const isDetour = wp.action === "HAZARD_BYPASS";
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-lg flex justify-between ${
                        isDetour
                          ? "bg-red-950/40 border border-red-900/60 text-red-300 font-bold"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      <span>
                        {wp.sequence}. {wp.location_name || wp.name}
                      </span>
                      <span className={isDetour ? "text-red-400" : "text-cyan-400"}>
                        ETA: +{wp.eta_mins}m
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODEL 5: Fair Resource Allocation */}
      {activeModelTab === 5 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Model 5: Constrained Mathematical Optimization
              </span>
              <h2 className="text-xl font-black text-white">Max-Min Fair Resource Allocation & Gini Verification</h2>
              <p className="text-xs text-slate-400 mt-1">
                Prevents FCFS hoarding by calculating proportional survival baselines weighted by urgency scores.
              </p>
            </div>
            <button
              onClick={handleRunFairAllocation}
              disabled={isSolvingAllocation}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold flex items-center space-x-1.5"
            >
              {isSolvingAllocation ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Scale className="w-3.5 h-3.5" />}
              <span>Solve Max-Min LP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Traditional FCFS Hoarding vs ResQLink</h3>
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-red-950/20 border border-red-900/40">
                  <div className="font-bold text-red-400">❌ Traditional First-Come First-Served:</div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    First 2 roadside shelters take 100% of supplies. Distant infant & diabetic patients starve. Gini = 0.76 (Extreme Inequality).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/40">
                  <div className="font-bold text-emerald-400">✓ ResQLink Max-Min Proportional Fairness:</div>
                  <p className="text-slate-400 text-[11px] mt-1">
                    Guarantees base survival kits to every household, then allocates scarce items proportionally to urgency. Gini ={" "}
                    {allocationResult.gini_fairness_coefficient} (High Equity).
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
              <h3 className="font-bold text-white uppercase tracking-wider">Live Fair Allocation Results</h3>
              <div className="space-y-2 font-mono text-[11px]">
                {(allocationResult.allocations || []).map((alloc: any, i: number) => (
                  <div key={i} className="p-2.5 rounded-lg bg-slate-900 flex justify-between items-center">
                    <span className="text-white">
                      {alloc.victim_name || alloc.recipient} (Score {alloc.urgency_score || 80})
                    </span>
                    <span className="text-amber-400 font-bold">
                      {typeof alloc.allocated_items === "object"
                        ? Object.entries(alloc.allocated_items)
                            .map(([k, v]) => `${v} ${k}`)
                            .join(", ")
                        : JSON.stringify(alloc.allocated_items)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: UNIFIED DECISION ACTION PLAN (PHASE 8 & 9) */}
      {activeModelTab === 6 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Phase 8 & 9: Full 5-Model Synthesis & Execution
              </span>
              <h2 className="text-xl font-black text-white">Unified Disaster Action Plan (UDAP)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Synthesizes Demand Forecasts + Satellite Road Hazards + NLP Triage + Max-Min Allocation + CVRP Routing for human authority review.
              </p>
            </div>
            <button
              onClick={handleSynthesizeUDAP}
              disabled={isSynthesizingUDAP}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center space-x-2"
            >
              {isSynthesizingUDAP ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              <span>{isSynthesizingUDAP ? "Synthesizing All Models..." : "Synthesize Action Plan"}</span>
            </button>
          </div>

          {dispatchStatus && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{dispatchStatus}</span>
            </div>
          )}

          {unifiedPlan ? (
            <div className="space-y-6">
              {/* Executive Summary Card */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400">PLAN IDENTIFIER</span>
                    <div className="text-base font-black text-white font-mono">{unifiedPlan.action_plan_id}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-black ${
                        unifiedPlan.status === "DISPATCH_AUTHORIZED"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {unifiedPlan.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900">
                    <span className="text-slate-400 text-[10px]">TOTAL DISPLACED</span>
                    <div className="text-lg font-black text-cyan-400">
                      {unifiedPlan.executive_summary?.displaced_people || 135} People
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900">
                    <span className="text-slate-400 text-[10px]">FLEET DISTANCE</span>
                    <div className="text-lg font-black text-amber-400">
                      {unifiedPlan.executive_summary?.total_distance_km || 18.4} km
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900">
                    <span className="text-slate-400 text-[10px]">GINI FAIRNESS</span>
                    <div className="text-lg font-black text-emerald-400">
                      {unifiedPlan.executive_summary?.gini_fairness_coefficient || 0.18}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900">
                    <span className="text-slate-400 text-[10px]">HAZARD DETOURS</span>
                    <div className="text-lg font-black text-red-400">
                      {unifiedPlan.executive_summary?.inaccessible_road_blocks_identified || 1} Blockages
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-900/60 text-xs text-blue-200">
                  <b>AI Recommendation:</b> {unifiedPlan.recommendation}
                </div>
              </div>

              {/* Action Buttons for Authority Approval */}
              {unifiedPlan.status !== "DISPATCH_AUTHORIZED" && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-amber-950/20 border border-amber-800/60">
                  <div>
                    <h4 className="text-sm font-bold text-white">Disaster Management Authority Authorization</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Approving this plan will immediately deduct warehouse stocks, dispatch fleet units, and update victim statuses to DISPATCHED.
                    </p>
                  </div>
                  <button
                    onClick={handleApproveAndDispatch}
                    disabled={isDispatchingUDAP}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center space-x-2"
                  >
                    {isDispatchingUDAP ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                    <span>Authorize & Dispatch Fleet</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Unified Action Plan Ready for Generation</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Click "Synthesize Action Plan" to execute the 5-model pipeline across Chennai's flood epicenter and generate the complete relief dispatch recommendation.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
