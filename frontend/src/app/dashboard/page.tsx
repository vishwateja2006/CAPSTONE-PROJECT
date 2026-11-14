"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchSOSRequests,
  fetchReliefCenters,
  fetchVehicles,
  MOCK_DISASTER
} from "../../lib/api";
import { SOSRequest, ReliefCenter, ReliefVehicle } from "../../types";
import {
  ShieldAlert,
  Users,
  Truck,
  Package,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Sliders,
  CheckCircle,
  Clock
} from "lucide-react";

export default function DashboardPage() {
  const [sosList, setSosList] = useState<SOSRequest[]>([]);
  const [centers, setCenters] = useState<ReliefCenter[]>([]);
  const [vehicles, setVehicles] = useState<ReliefVehicle[]>([]);

  // Demand Forecast Simulator state
  const [forecastPeople, setForecastPeople] = useState<number>(650);
  const [forecastDays, setForecastDays] = useState<number>(3);

  useEffect(() => {
    async function loadData() {
      const [s, c, v] = await Promise.all([
        fetchSOSRequests(),
        fetchReliefCenters(),
        fetchVehicles()
      ]);
      setSosList(s);
      setCenters(c);
      setVehicles(v);
    }
    loadData();
  }, []);

  const safeParseNeeds = (val: any): string[] => {
    if (Array.isArray(val)) return val;
    if (!val) return [];
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [String(parsed)];
      } catch {
        return val.split(",").map((s) => s.trim()).filter(Boolean);
      }
    }
    return [];
  };

  const criticalCount = (sosList || []).filter((s) => s.urgency_level === "CRITICAL").length;
  const totalPeopleInDistress = (sosList || []).reduce((acc, s) => acc + (s.people_count || 0), 0);

  // Demand forecast calculations (Sphere humanitarian standards)
  const forecastedWaterLiters = Math.round(forecastPeople * 3.5 * forecastDays);
  const forecastedFoodPacks = Math.round(forecastPeople * 2 * forecastDays);
  const forecastedMedicalKits = Math.max(1, Math.round((forecastPeople / 40) * forecastDays));

  return (
    <div className="space-y-8">
      
      {/* Header & Active Disaster Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-400 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>INCIDENT COMMAND CENTER // REAL-TIME OPS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {MOCK_DISASTER.name}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Location: Coastal Sector (13.08°N, 80.27°E) | Severity:{" "}
            <span className="text-red-400 font-bold">{MOCK_DISASTER.severity}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700"
          >
            <span>Live GIS View</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active SOS Signals</span>
            <span className="p-2 rounded-xl bg-red-950/80 text-red-400 border border-red-800/60">
              <Radio className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{sosList.length}</span>
            <span className="text-xs text-red-400 font-medium">({criticalCount} Critical Priority)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Auto-ranked via NLP Urgency Engine</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Displaced / Trapped</span>
            <span className="p-2 rounded-xl bg-amber-950/80 text-amber-400 border border-amber-800/60">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-amber-400">{totalPeopleInDistress}</span>
            <span className="text-xs text-slate-400">Recorded Victims</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Across 4 municipal sectors</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fleet Status</span>
            <span className="p-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-emerald-400">{vehicles.length}</span>
            <span className="text-xs text-emerald-400/80 font-medium">Active Units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Trucks, Inflatable Boats, 4x4s</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Depot Inventory</span>
            <span className="p-2 rounded-xl bg-blue-950/80 text-blue-400 border border-blue-800/60">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-blue-400">2,500</span>
            <span className="text-xs text-slate-400">Total Units</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">Central Emergency Base Alpha</div>
        </div>

      </div>

      {/* Main Two-Column Layout: Emergency Incidents & AI Demand Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (2 Cols): Live Emergency Triage Stream */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-bold text-white">Live Emergency Triage Stream</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">SORTED BY AI URGENCY SCORE</span>
          </div>

          <div className="space-y-3">
            {(sosList || []).map((sos) => {
              const isCrit = sos.urgency_level === "CRITICAL";
              const isHigh = sos.urgency_level === "HIGH";
              const specialNeeds: string[] = safeParseNeeds(sos.special_needs);
              const categoryNeeds: string[] = safeParseNeeds(sos.category_needs);

              return (
                <div
                  key={sos.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCrit
                      ? "bg-red-950/20 border-red-900/80 hover:border-red-600"
                      : isHigh
                      ? "bg-amber-950/20 border-amber-900/70 hover:border-amber-600"
                      : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{sos.victim_name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                          {sos.people_count} People
                        </span>
                        <span className="text-xs text-slate-500">
                          {sos.address || "Zone Sector"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 italic">
                        "{sos.description}"
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black tracking-wide ${
                          isCrit
                            ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                            : isHigh
                            ? "bg-amber-500 text-slate-950"
                            : "bg-yellow-500 text-slate-950"
                        }`}
                      >
                        SCORE: {sos.urgency_score} ({sos.urgency_level})
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">{sos.requested_at}</div>
                    </div>
                  </div>

                  {/* Badges for needs */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Needs:</span>
                    {categoryNeeds.map((cat) => (
                      <span key={cat} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-medium">
                        {cat}
                      </span>
                    ))}
                    {specialNeeds.map((sn) => (
                      <span key={sn} className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-800/60 text-[10px] font-bold">
                        ⚠ {sn}
                      </span>
                    ))}

                    <div className="ml-auto">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        sos.status === "PENDING" ? "bg-amber-950 text-amber-400" : "bg-emerald-950 text-emerald-400"
                      }`}>
                        STATUS: {sos.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): AI Demand Forecasting Simulator */}
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex items-center space-x-2 text-white border-b border-slate-800 pb-3">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <div>
                <h3 className="font-bold text-sm">AI Demand Forecasting</h3>
                <p className="text-[11px] text-slate-400">Sphere Standards Projection Engine</p>
              </div>
            </div>

            {/* Slider 1: Displaced Headcount */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Estimated Displaced Persons:</span>
                <span className="font-bold text-amber-400 font-mono">{forecastPeople}</span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={forecastPeople}
                onChange={(e) => setForecastPeople(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Slider 2: Horizon Days */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Forecast Horizon:</span>
                <span className="font-bold text-amber-400 font-mono">{forecastDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                className="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
            </div>

            {/* Forecast Output Metrics */}
            <div className="space-y-2.5 pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">💧 Drinking Water Required:</span>
                <span className="font-black text-cyan-400 font-mono">{forecastedWaterLiters.toLocaleString()} Liters</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">🍞 Food Rations Required:</span>
                <span className="font-black text-amber-400 font-mono">{forecastedFoodPacks.toLocaleString()} Packs</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">🩹 Trauma & Medical Kits:</span>
                <span className="font-black text-red-400 font-mono">{forecastedMedicalKits.toLocaleString()} Kits</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 italic text-center">
              *Calculated with 3.5L/person/day and weather escalation factors.
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Operational Actions</h4>
            <Link
              href="/resources"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-white border border-slate-700/60"
            >
              <span>Execute Fair Resource Division</span>
              <Package className="w-4 h-4 text-amber-400" />
            </Link>
            <Link
              href="/routes"
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs text-white border border-slate-700/60"
            >
              <span>Run Dynamic Route Optimizer</span>
              <Truck className="w-4 h-4 text-blue-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

