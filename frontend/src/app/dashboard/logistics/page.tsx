"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  Navigation,
  CheckCircle2,
  Clock,
  MapPin,
  Play,
  RotateCcw,
  Sliders,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { fetchVehicles, fetchReliefCenters, runRouteOptimization } from "../../../lib/api";
import { ReliefVehicle, ReliefCenter, RoutePlan } from "../../../types";

export default function LogisticsDashboardPage() {
  const [vehicles, setVehicles] = useState<ReliefVehicle[]>([]);
  const [centers, setCenters] = useState<ReliefCenter[]>([]);
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [isSolving, setIsSolving] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);

  useEffect(() => {
    async function init() {
      const [v, c] = await Promise.all([fetchVehicles(), fetchReliefCenters()]);
      setVehicles(v);
      setCenters(c);
    }
    init();
  }, []);

  const handleComputeRoutes = async () => {
    if (centers.length === 0 || vehicles.length === 0) return;
    setIsSolving(true);
    const plans = await runRouteOptimization(
      centers[0].id,
      vehicles.map((v) => v.id)
    );
    setRoutePlans(plans);
    setIsSolving(false);
  };

  const handleToggleSimulation = () => {
    setSimulationActive(!simulationActive);
    if (!simulationActive) {
      setVehicles((prev) =>
        prev.map((v, i) => (i === 0 ? { ...v, status: "EN_ROUTE" } : v))
      );
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-blue-400 mb-1">
            <Truck className="w-4 h-4" />
            <span>LOGISTICS COMMAND // FLEET & CVRP ROUTING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Logistics, Fleet & Delivery Dispatch</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track registered relief vehicles, solve capacity-constrained vehicle routing (CVRP) & monitor live delivery waypoints.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleComputeRoutes}
            disabled={isSolving || vehicles.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
          >
            <Navigation className={`w-3.5 h-3.5 ${isSolving ? "animate-spin" : ""}`} />
            <span>{isSolving ? "Solving CVRP Matrix..." : "Calculate Optimal Routes"}</span>
          </button>
        </div>
      </div>

      {/* Fleet Vehicles Status Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Truck className="w-5 h-5 text-blue-400" />
            <span>Registered Fleet Units & Real-time Telemetry</span>
          </h2>
          <span className="text-xs font-mono text-slate-400">{vehicles.length} VEHICLES READY</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div key={v.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base">{v.vehicle_code}</h3>
                  <div className="text-[11px] text-slate-400">Driver: {v.assigned_driver || "Assigned Driver"}</div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                  v.status === "EN_ROUTE"
                    ? "bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse"
                    : "bg-slate-800 text-slate-300"
                }`}>
                  {v.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chassis / Type:</span>
                  <span className="font-semibold text-white">{v.vehicle_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payload Capacity:</span>
                  <span className="font-mono text-cyan-400 font-bold">{v.capacity_kg} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Live GPS Coordinates:</span>
                  <span className="font-mono text-slate-300">{v.current_lat.toFixed(4)}, {v.current_lon.toFixed(4)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Delivery Plans Table */}
      {routePlans.length > 0 && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Active Delivery Waypoint Mission</h3>
              <p className="text-xs text-slate-400">Avoids Adyar flooded red zone and prioritizes critical medical needs</p>
            </div>
            <button
              onClick={handleToggleSimulation}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                simulationActive ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>{simulationActive ? "LIVE TELEMETRY STREAMING" : "SIMULATE VEHICLE PROGRESS"}</span>
            </button>
          </div>

          {routePlans.map((plan) => (
            <div key={plan.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                  <span className="text-white font-bold">{plan.vehicle_code || "RESCUE-TRUCK-01"}</span>
                </div>
                <div className="text-slate-400">
                  Total Travel: <span className="text-white font-bold">{plan.total_distance_km} km</span> | Estimated Duration:{" "}
                  <span className="text-cyan-400 font-bold">{plan.estimated_duration_mins} mins</span>
                </div>
              </div>

              {/* Waypoint Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {plan.waypoints.map((wp) => (
                  <div key={wp.sequence} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="w-5 h-5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 flex items-center justify-center font-bold text-[10px]">
                        {wp.sequence}
                      </span>
                      <span className="text-[10px] font-mono text-cyan-400">ETA: +{wp.eta_mins}m</span>
                    </div>
                    <div className="font-bold text-white truncate pt-1">{wp.location_name}</div>
                    <div className="text-[10px] text-amber-400 font-mono">{wp.action}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
