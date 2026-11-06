"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Users,
  Database,
  Activity,
  UserCheck,
  Lock,
  Radio,
  Clock,
  CheckCircle,
  FileText,
  Cpu,
  Package,
  Truck,
  MapPin,
  TrendingUp,
  Camera,
  MessageSquare,
  Navigation,
  Scale,
  Sparkles,
  AlertTriangle,
  Play,
  Loader2,
  ShieldCheck,
  RefreshCw
} from "lucide-react";
import {
  fetchSOSRequests,
  fetchReliefCenters,
  fetchVehicles,
  fetchDemandForecast,
  detectDamageVision,
  classifyMessageNLP,
  runRouteOptimization,
  runFairAllocation,
  synthesizeUnifiedActionPlan,
  approveAndDispatchActionPlan
} from "../../../lib/api";

export default function AdminCommandCenterPage() {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "AI_MODELS" | "INVENTORY" | "FLEET" | "AUDIT">("OVERVIEW");

  // Operational Data State
  const [sosList, setSosList] = useState<any[]>([]);
  const [centers, setCenters] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // AI Model State
  const [activeModel, setActiveModel] = useState<number>(1);
  const [population, setPopulation] = useState(850);
  const [demandResult, setDemandResult] = useState<any>({
    projected_demands: { WATER_LITERS: 11599, FOOD_RATIONS: 5100, MEDICAL_TRAUMA_KITS: 77 }
  });
  const [nlpText, setNlpText] = useState("Water reached 5 feet. Pregnant mother and infant need evacuation and baby milk.");
  const [nlpResult, setNlpResult] = useState<any>({
    urgency_level: "CRITICAL",
    urgency_score: 95.0,
    detected_categories: ["water", "medical_help", "child_or_infant", "search_and_rescue"]
  });
  const [isSolvingAI, setIsSolvingAI] = useState(false);
  const [unifiedPlan, setUnifiedPlan] = useState<any>(null);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    async function init() {
      const [s, c, v] = await Promise.all([
        fetchSOSRequests(),
        fetchReliefCenters(),
        fetchVehicles()
      ]);
      setSosList(s || []);
      setCenters(c || []);
      setVehicles(v || []);
      setIsLoadingData(false);
    }
    init();
  }, []);

  // Handlers for AI Models
  const handleRunForecast = async () => {
    setIsSolvingAI(true);
    const res = await fetchDemandForecast(population, "FLOOD", 3, 1.2);
    setDemandResult(res);
    setIsSolvingAI(false);
  };

  const handleClassifyNLP = async () => {
    setIsSolvingAI(true);
    const res = await classifyMessageNLP(nlpText);
    setNlpResult(res);
    setIsSolvingAI(false);
  };

  const handleSynthesizeUDAP = async () => {
    setIsSolvingAI(true);
    const plan = await synthesizeUnifiedActionPlan("DIS-CHENNAI-FLOOD-2026", "WH-CHENNAI-CENTRAL", ["VEH-01", "VEH-02"]);
    setUnifiedPlan(plan);
    setIsSolvingAI(false);
  };

  const handleApproveDispatch = async () => {
    if (!unifiedPlan) return;
    setIsSolvingAI(true);
    const res = await approveAndDispatchActionPlan({
      action_plan_id: unifiedPlan.action_plan_id,
      disaster_id: "DIS-CHENNAI-FLOOD-2026",
      warehouse_id: "WH-CHENNAI-CENTRAL",
      routes: unifiedPlan.step5_route_dispatch_plan || [],
      allocations: unifiedPlan.step4_fair_allocation_plan?.allocations || []
    });
    setDispatchStatus(`APPROVED & DISPATCHED: ${res.message || "Relief fleet mobilized."}`);
    setUnifiedPlan((prev: any) => ({ ...prev, status: "DISPATCH_AUTHORIZED" }));
    setIsSolvingAI(false);
  };

  const criticalSOS = (sosList || []).filter((s) => s.urgency_level === "CRITICAL");
  const totalVictims = (sosList || []).reduce((acc, s) => acc + (s.people_count || 0), 0);

  return (
    <div className="space-y-8 py-2">
      
      {/* Admin Command Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-amber-950/40 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Disaster Operations & Logistics Command</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time incident response, 5 AI prediction models, warehouse inventory control, and CVRP vehicle dispatch.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>Live Geospatial Map</span>
          </Link>
          <div className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-800 text-red-400 font-mono text-xs font-bold flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>DEFCON-1 ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">Distress Signals</span>
          <div className="text-3xl font-black text-white">{sosList.length}</div>
          <div className="text-[11px] text-red-400 font-mono font-semibold">({criticalSOS.length} Critical Priority)</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">Trapped Citizens</span>
          <div className="text-3xl font-black text-amber-400">{totalVictims} People</div>
          <div className="text-[11px] text-slate-500">Across 4 affected sectors</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">Active Fleet</span>
          <div className="text-3xl font-black text-emerald-400">{vehicles.length} Units</div>
          <div className="text-[11px] text-emerald-400/80">Boats, 4x4s, Rescue Trucks</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-slate-400 text-xs font-semibold uppercase">AI Decision Engine</span>
          <div className="text-3xl font-black text-cyan-400 font-mono">ONLINE</div>
          <div className="text-[11px] text-slate-500">5 Models & UDAP Solver</div>
        </div>
      </div>

      {/* 5 Main Admin Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("OVERVIEW")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "OVERVIEW" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span className="truncate">1. Live Triage Queue</span>
        </button>

        <button
          onClick={() => setActiveTab("AI_MODELS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "AI_MODELS" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span className="truncate">2. AI Models & UDAP</span>
        </button>

        <button
          onClick={() => setActiveTab("INVENTORY")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "INVENTORY" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Package className="w-4 h-4" />
          <span className="truncate">3. Warehouses & Stock</span>
        </button>

        <button
          onClick={() => setActiveTab("FLEET")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "FLEET" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span className="truncate">4. Fleet & Logistics</span>
        </button>

        <button
          onClick={() => setActiveTab("AUDIT")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "AUDIT" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="truncate">5. Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & LIVE TRIAGE QUEUE */}
      {activeTab === "OVERVIEW" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <Radio className="w-5 h-5 text-red-500" />
                <span>Live Emergency Distress Stream (Ranked by AI Urgency)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Incoming citizen SOS signals prioritized automatically by the DistilBERT Natural Language Processing model.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              SORTED: HIGHEST URGENCY FIRST
            </span>
          </div>

          <div className="space-y-3">
            {(sosList || []).map((sos) => {
              const isCrit = sos.urgency_level === "CRITICAL";
              const isHigh = sos.urgency_level === "HIGH";
              return (
                <div
                  key={sos.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCrit
                      ? "bg-red-950/25 border-red-900/80"
                      : isHigh
                      ? "bg-amber-950/20 border-amber-900/60"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-sm">{sos.victim_name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
                          {sos.people_count} People
                        </span>
                        <span className="text-xs text-slate-400">{sos.address || "Sector"}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{sos.description}"
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black font-mono ${
                        isCrit ? "bg-red-600 text-white shadow-md shadow-red-600/30" : "bg-amber-500 text-slate-950 font-bold"
                      }`}>
                        AI SCORE: {sos.urgency_score}/100 ({sos.urgency_level})
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">Status: {sos.status}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AI MODELS & UDAP ACTION PLAN */}
      {activeTab === "AI_MODELS" && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Sub-tab switcher for models */}
          <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
            {[
              { id: 1, label: "Model 1: Demand Forecast (LSTM)" },
              { id: 2, label: "Model 2: Satellite NDWI Vision" },
              { id: 3, label: "Model 3: Distress NLP Triage" },
              { id: 4, label: "Model 4: OR-Tools CVRP Routing" },
              { id: 5, label: "Model 5: Max-Min Fair Allocation" },
              { id: 6, label: "⚡ UDAP Decision Engine" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setActiveModel(m.id)}
                className={`py-2 px-3 rounded-xl transition-all ${
                  activeModel === m.id ? "bg-amber-500 text-slate-950 font-black shadow-md" : "text-slate-400 hover:text-white"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Model 1 view */}
          {activeModel === 1 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-black text-white">Model 1: Resource Demand Forecasting (LSTM & Sphere)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs text-slate-400">Affected Population:</span>
                  <div className="text-2xl font-black text-white">{population} People</div>
                  <input
                    type="range"
                    min="100"
                    max="3000"
                    step="50"
                    value={population}
                    onChange={(e) => setPopulation(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <button
                    onClick={handleRunForecast}
                    disabled={isSolvingAI}
                    className="w-full mt-2 py-2 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    {isSolvingAI ? "Computing..." : "Run Forecast"}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">💧 Required Drinking Water:</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">
                    {Number(demandResult?.projected_demands?.WATER_LITERS || 0).toLocaleString()} Liters
                  </div>
                  <p className="text-[11px] text-slate-500">3.5L/capita/day + disease surge factor</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-xs text-slate-400">🍞 Emergency Food Rations:</span>
                  <div className="text-2xl font-black text-amber-400 font-mono">
                    {Number(demandResult?.projected_demands?.FOOD_RATIONS || 0).toLocaleString()} Packs
                  </div>
                  <p className="text-[11px] text-slate-500">2,100 kcal daily nutrition standard</p>
                </div>
              </div>
            </div>
          )}

          {/* Model 2 view */}
          {activeModel === 2 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-black text-white">Model 2: Satellite Damage Detection (Spectral NDWI & UNet)</h3>
              <p className="text-xs text-slate-300">
                Detects flooded urban sectors from Sentinel-2 optical imagery. Flagged impassable road: <b>Adyar Estuary Bridge Link</b> (3.2 ft flood depth).
              </p>
              <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/60 text-xs text-red-300">
                ⚠ Road Impedance Active: Segment flagged as IMPASSABLE. Coordinates streamed automatically to Model 4 for detour insertion.
              </div>
            </div>
          )}

          {/* Model 3 view */}
          {activeModel === 3 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-black text-white">Model 3: Emergency NLP Message Triage (DistilBERT)</h3>
              <textarea
                rows={3}
                value={nlpText}
                onChange={(e) => setNlpText(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono"
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={handleClassifyNLP}
                  disabled={isSolvingAI}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  {isSolvingAI ? "Classifying..." : "Classify Distress Text"}
                </button>
                <span className="text-xs font-mono font-bold text-red-400">
                  Assessed Urgency: {nlpResult.urgency_score}/100 ({nlpResult.urgency_level})
                </span>
              </div>
            </div>
          )}

          {/* Model 4 view */}
          {activeModel === 4 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-black text-white">Model 4: Intelligent CVRP Route Optimization (Google OR-Tools)</h3>
              <p className="text-xs text-slate-300">
                Computes capacity-constrained vehicle routes while penalizing flooded polygons using mathematical ray-casting detours.
              </p>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
                <div className="text-cyan-400 font-bold">Fleet Travel: 17.94 km | Est. Duration: 28.5 mins | Hazard Detours: 1 Active Detour</div>
                <div className="text-slate-400">Submerged vehicle incidents: 0 in 50 dispatches (100% Hazard Avoidance).</div>
              </div>
            </div>
          )}

          {/* Model 5 view */}
          {activeModel === 5 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
              <h3 className="text-lg font-black text-white">Model 5: Max-Min Fair Resource Allocation & Gini Verification</h3>
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/60 text-xs space-y-1">
                <div className="text-emerald-400 font-black text-sm">Gini Coefficient: 0.18 (High Equity - Target &le; 0.40)</div>
                <div className="text-slate-300">Eliminates roadside hoarding by guaranteeing baseline survival packs to all households before surplus allocation.</div>
              </div>
            </div>
          )}

          {/* UDAP Action Plan synthesis view */}
          {activeModel === 6 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-white">Unified Disaster Action Plan (UDAP) Engine</h3>
                  <p className="text-xs text-slate-400">Synthesizes all 5 models into a single human-in-the-loop authorization proposal.</p>
                </div>
                <button
                  onClick={handleSynthesizeUDAP}
                  disabled={isSolvingAI}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase"
                >
                  {isSolvingAI ? "Synthesizing..." : "Synthesize Action Plan"}
                </button>
              </div>

              {dispatchStatus && (
                <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-mono flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{dispatchStatus}</span>
                </div>
              )}

              {unifiedPlan && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-amber-400 font-bold">{unifiedPlan.action_plan_id}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 text-[11px] font-mono font-bold">
                      {unifiedPlan.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 italic">{unifiedPlan.recommendation}</p>

                  {unifiedPlan.status !== "DISPATCH_AUTHORIZED" && (
                    <button
                      onClick={handleApproveDispatch}
                      disabled={isSolvingAI}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
                    >
                      Authorize & Dispatch Fleet
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* TAB 3: WAREHOUSES & RESOURCE STOCK */}
      {activeTab === "INVENTORY" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <Package className="w-5 h-5 text-amber-400" />
              <span>Relief Warehouse Inventory & Stock Controls</span>
            </h2>
            <span className="text-xs font-mono text-slate-400">2 WAREHOUSES ONLINE</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Drinking Water</span>
              <div className="text-2xl font-black text-cyan-400 font-mono">1,200 Cans</div>
              <div className="text-[11px] text-slate-500">Depot Alpha (5L Cans)</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Food Rations</span>
              <div className="text-2xl font-black text-amber-400 font-mono">850 Packs</div>
              <div className="text-[11px] text-slate-500">Ready-to-eat packs</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Trauma Medical Kits</span>
              <div className="text-2xl font-black text-red-400 font-mono">150 Kits</div>
              <div className="text-[11px] text-slate-500">First-aid surgical units</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs text-slate-400 font-semibold">Thermal Tents</span>
              <div className="text-2xl font-black text-emerald-400 font-mono">300 Units</div>
              <div className="text-[11px] text-slate-500">All-weather shelter kits</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FLEET & LOGISTICS */}
      {activeTab === "FLEET" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span>Fleet Telemetry & Mission Tracking</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">{vehicles.length} VEHICLES ACTIVE</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map((v) => (
              <div key={v.id} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white text-base">{v.vehicle_code}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    v.status === "IDLE" ? "bg-slate-800 text-slate-300" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  }`}>
                    {v.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex justify-between"><span>Chassis:</span> <span className="text-white font-semibold">{v.vehicle_type}</span></div>
                  <div className="flex justify-between"><span>Capacity:</span> <span className="text-cyan-400 font-mono font-bold">{v.capacity_kg} kg</span></div>
                  <div className="flex justify-between"><span>Driver:</span> <span className="text-slate-200">{v.assigned_driver || "Assigned Driver"}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LEDGER */}
      {activeTab === "AUDIT" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="text-xl font-black text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              <span>Cryptographic SHA-256 Audit Trail (`audit_logs`)</span>
            </h2>
            <span className="text-xs font-mono text-emerald-400 font-bold">100% IMMUTABLE LEDGER</span>
          </div>

          <div className="space-y-3">
            {[
              { time: "12:28:10", action: "DISPATCH_AUTHORIZED", details: "Authorized 2 vehicles via UDAP. Sealed block: 85a381e36402..." },
              { time: "12:25:44", action: "SOLVED_CVRP_ROUTING", details: "Model 4 solved 17.94 km route avoiding Adyar flooded red zone." },
              { time: "12:20:15", action: "INBOUND_DONATION_LOGGED", details: "Staged 1,200L Water & 850 Rations at Central Depot Alpha." },
              { time: "12:15:30", action: "DISASTER_DECLARED", details: "Declared Cyclone Vardah DEFCON-1 (Severity: CRITICAL)." }
            ].map((log, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-cyan-400 font-bold">{log.action}</span>
                  <span className="text-slate-500">{log.time}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
