"use client";

import React, { useState, useEffect } from "react";
import InteractiveMap from "../../components/InteractiveMap";
import {
  fetchSOSRequests,
  fetchReliefCenters,
  fetchVehicles,
  runRouteOptimization
} from "../../lib/api";
import { SOSRequest, ReliefCenter, ReliefVehicle, RoutePlan } from "../../types";
import { Map, Layers, Navigation, RefreshCw } from "lucide-react";

export default function MapPage() {
  const [reliefCenters, setReliefCenters] = useState<ReliefCenter[]>([]);
  const [vehicles, setVehicles] = useState<ReliefVehicle[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [selectedSosId, setSelectedSosId] = useState<string | undefined>();
  const [isGeneratingRoutes, setIsGeneratingRoutes] = useState(false);

  useEffect(() => {
    async function init() {
      const [c, v, s] = await Promise.all([
        fetchReliefCenters(),
        fetchVehicles(),
        fetchSOSRequests()
      ]);
      setReliefCenters(c);
      setVehicles(v);
      setSosRequests(s);
    }
    init();
  }, []);

  const handleComputeRoutes = async () => {
    if (reliefCenters.length === 0 || vehicles.length === 0) return;
    setIsGeneratingRoutes(true);
    const plans = await runRouteOptimization(
      reliefCenters[0].id,
      vehicles.map((v) => v.id)
    );
    setRoutePlans(plans);
    setIsGeneratingRoutes(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Map Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/80">
            <Map className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Geospatial Situational Map</h1>
            <p className="text-xs text-slate-400">
              Interactive GIS telemetry, hazard zone perimeter & dynamic vehicle trajectories
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleComputeRoutes}
            disabled={isGeneratingRoutes}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-600/30"
          >
            <Navigation className={`w-3.5 h-3.5 ${isGeneratingRoutes ? "animate-spin" : ""}`} />
            <span>{isGeneratingRoutes ? "Computing Waypoints..." : "Draw Optimized Trajectories"}</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Vector GIS Map */}
      <InteractiveMap
        reliefCenters={reliefCenters}
        vehicles={vehicles}
        sosRequests={sosRequests}
        routePlans={routePlans}
        selectedSosId={selectedSosId}
        onSelectSos={(sos) => setSelectedSosId(sos.id)}
      />

      {/* Map Legend & Sector Info */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></span>
          <div>
            <div className="font-bold text-slate-200">Critical Red Zone</div>
            <div className="text-slate-500 text-[11px]">Adyar Basin (Submerged)</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex-shrink-0"></span>
          <div>
            <div className="font-bold text-slate-200">Central Relief Depot</div>
            <div className="text-slate-500 text-[11px]">Depot Base Alpha (Jawaharlal Stadium)</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <div>
            <div className="font-bold text-slate-200">Active Relief Fleet</div>
            <div className="text-slate-500 text-[11px]">{vehicles.length} Units En Route / Staged</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex-shrink-0"></span>
          <div>
            <div className="font-bold text-slate-200">Victim SOS Beacons</div>
            <div className="text-slate-500 text-[11px]">{sosRequests.length} High & Critical Signals</div>
          </div>
        </div>
      </div>

    </div>
  );
}
