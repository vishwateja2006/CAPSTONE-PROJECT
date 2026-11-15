"use client";

import React, { useState, useEffect } from "react";
import { fetchVehicles, fetchReliefCenters, runRouteOptimization } from "../../lib/api";
import { ReliefVehicle, ReliefCenter, RoutePlan } from "../../types";
import { Truck, Navigation, CheckCircle2, Clock, MapPin, AlertTriangle, ArrowRight } from "lucide-react";

export default function RoutesPage() {
  const [vehicles, setVehicles] = useState<ReliefVehicle[]>([]);
  const [centers, setCenters] = useState<ReliefCenter[]>([]);
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    async function init() {
      const [v, c] = await Promise.all([fetchVehicles(), fetchReliefCenters()]);
      setVehicles(v);
      setCenters(c);
    }
    init();
  }, []);

  const handleRunOptimizer = async () => {
    setIsSolving(true);
    try {
      const centerId = centers.length > 0 ? centers[0].id : "RC-01";
      const vehicleIds = vehicles.length > 0 ? vehicles.map((v) => v.id) : ["VEH-01", "VEH-02"];
      const plans = await runRouteOptimization(centerId, vehicleIds);
      if (Array.isArray(plans)) {
        setRoutePlans(plans);
      }
    } catch (err) {
      console.error("Error solving CVRP routes:", err);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-1">
            <Navigation className="w-4 h-4" />
            <span>DYNAMIC VEHICLE ROUTING // OPERATIONS RESEARCH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Relief Fleet Dispatch & Route Optimization
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Capacity-constrained vehicle routing (CVRP) with real-time road hazard penalties and urgency sequencing.
          </p>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={isSolving || vehicles.length === 0}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
        >
          <Navigation className={`w-4 h-4 ${isSolving ? "animate-spin" : ""}`} />
          <span>{isSolving ? "Solving VRP Graph..." : "Solve & Dispatch Routes"}</span>
        </button>
      </div>

      {/* Fleet Readiness Overview */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Available Relief Fleet & Crew</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {vehicles.length} VEHICLES REGISTERED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {vehicles.map((v) => (
            <div key={v.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{v.vehicle_code}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  v.status === "IDLE" ? "bg-slate-800 text-slate-300" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}>
                  {v.status}
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Type / Chassis:</span>
                  <span className="text-slate-200 font-semibold">{v.vehicle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cargo Capacity:</span>
                  <span className="text-cyan-400 font-mono font-bold">{v.capacity_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned Operator:</span>
                  <span className="text-slate-200">{v.assigned_driver || "Assigned Driver"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Route Mission Plans */}
      {routePlans.length > 0 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Generated Mission Waypoints & ETAs</h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              ✓ HAZARD ZONES PENALIZED & AVOIDED
            </span>
          </div>

          <div className="space-y-6">
            {routePlans.map((plan) => (
              <div key={plan.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5">
                
                {/* Plan Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/80 flex items-center justify-center font-bold">
                      🚚
                    </div>
                    <div>
                      <div className="font-bold text-white text-sm">{plan.vehicle_code || "RESCUE-TRUCK-01"}</div>
                      <div className="text-xs text-slate-400">Status: <span className="text-amber-400 font-semibold">{plan.status}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-xs font-mono">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">TOTAL DISTANCE:</span>
                      <span className="ml-2 font-bold text-white">{plan.total_distance_km} km</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                      <span className="text-slate-500">EST. DURATION:</span>
                      <span className="ml-2 font-bold text-cyan-400">{plan.estimated_duration_mins} mins</span>
                    </div>
                  </div>
                </div>

                {/* Waypoint Chronological Stepper */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chronological Route Stops</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    {(plan.waypoints || []).map((wp) => (
                      <div
                        key={wp.sequence}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-full bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center text-xs font-black">
                            {wp.sequence}
                          </span>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">
                            ETA: +{wp.eta_mins}m
                          </span>
                        </div>

                        <div className="text-xs font-bold text-white truncate pt-1">
                          {wp.location_name}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-900">
                          <span className="font-mono text-amber-400">{wp.action}</span>
                          {wp.demand_kg > 0 && <span>{wp.demand_kg} kg aid</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

