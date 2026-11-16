"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Compass,
  MapPin,
  Anchor,
  Truck,
  Building2,
  Shield,
  Crosshair,
  Navigation,
  Radio,
  ExternalLink,
  Layers,
  ArrowRight
} from "lucide-react";

export interface MiniRadarMapProps {
  citizenLat?: number;
  citizenLon?: number;
  citizenAddress?: string;
  vehicleCode?: string;
  vehicleType?: string;
  vehiclePilot?: string;
  vehicleSpeed?: string;
  vehicleHeading?: string;
  nearestShelterName?: string;
  nearestShelterDist?: string;
  status: string;
  t: any;
}

export default function MiniRadarMap({
  citizenLat = 17.3780,
  citizenLon = 78.4910,
  citizenAddress = "Musi River Link, Chaderghat Lowlands",
  vehicleCode = "BOAT-AMPHIBIAN-02",
  vehicleType = "BOAT",
  vehiclePilot = "Capt. Murugan",
  vehicleSpeed = "18 km/h",
  vehicleHeading = "Musi River Link / Chaderghat Expressway",
  nearestShelterName = "Moosarambagh Community Shelter",
  nearestShelterDist = "1.1 km away",
  status = "DISPATCHED",
  t
}: MiniRadarMapProps) {
  // Smooth vehicle movement animation progress (0% to 100% en route toward citizen)
  const [transitProgress, setTransitProgress] = useState(48);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitProgress((prev) => {
        if (prev >= 92) return 40; // Loop demonstration smoothly
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const isDelivered = status === "DELIVERED" || status === "RESOLVED";
  const isBoat = vehicleType === "BOAT" || vehicleCode.toLowerCase().includes("boat");

  // Interpolate vehicle position along transit trajectory from origin to citizen
  // Origin: { x: 20, y: 30 }, Destination (Citizen): { x: 72, y: 62 }
  const currentVehicleX = isDelivered ? 70 : Math.round(22 + (transitProgress / 100) * 48);
  const currentVehicleY = isDelivered ? 58 : Math.round(30 + (transitProgress / 100) * 30);

  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-cyan-800/60 animate-in fade-in">
      {/* Mini Radar Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center space-x-1.5 font-mono">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin [animation-duration:12s]" />
            <span>{t?.miniRadarTitle || "Live Tactical Radar • Real-Time Intercept"}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[10px] font-mono text-cyan-400">
          <span className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/80 font-bold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>GPS CARRIER LOCK: ±2.8m</span>
          </span>
          <span className="text-slate-400 hidden sm:inline">Tactical Grid: 3.5 km</span>
        </div>
      </div>

      {/* The Animated Radar Display Canvas */}
      <div className="relative w-full h-[240px] sm:h-[260px] rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-cyan-500/40 overflow-hidden shadow-inner shadow-cyan-950/80">
        {/* Subtle GIS Topographic Grid Lines */}
        <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#06b6d4_1px,transparent_1px),linear-gradient(to_bottom,#06b6d4_1px,transparent_1px)] bg-[size:32px_32px]" />

        {/* Concentric Range Rings (500m, 1.5km, 2.5km, 3.5km) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[120px] h-[120px] rounded-full border border-cyan-500/20 flex items-start justify-center">
            <span className="text-[8px] font-mono text-cyan-500/50 -mt-2.5 bg-slate-950 px-1">500m</span>
          </div>
          <div className="absolute w-[240px] h-[240px] rounded-full border border-cyan-500/20 flex items-start justify-center">
            <span className="text-[8px] font-mono text-cyan-500/50 -mt-2.5 bg-slate-950 px-1">1.5 km</span>
          </div>
          <div className="absolute w-[360px] h-[360px] rounded-full border border-cyan-500/15 flex items-start justify-center">
            <span className="text-[8px] font-mono text-cyan-500/50 -mt-2.5 bg-slate-950 px-1">2.5 km</span>
          </div>
          <div className="absolute w-[480px] h-[480px] rounded-full border border-cyan-500/10" />

          {/* Crosshair Axes */}
          <div className="absolute w-full h-[1px] bg-cyan-500/15 border-b border-dashed border-cyan-500/20" />
          <div className="absolute h-full w-[1px] bg-cyan-500/15 border-r border-dashed border-cyan-500/20" />
        </div>

        {/* Cardinal Directions */}
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black text-cyan-400 bg-slate-950/80 px-1 rounded z-10">N</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-mono font-black text-cyan-500/60 bg-slate-950/80 px-1 rounded z-10">S</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-cyan-500/60 bg-slate-950/80 px-1 rounded z-10">E</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] font-mono font-black text-cyan-500/60 bg-slate-950/80 px-1 rounded z-10">W</span>

        {/* Sweeping Conic Radar Beam */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="w-[480px] h-[480px] rounded-full animate-[spin_4s_linear_infinite] origin-center bg-[conic-gradient(from_0deg,transparent_0deg,transparent_270deg,rgba(6,182,212,0.08)_320deg,rgba(16,185,129,0.30)_360deg)]" />
        </div>

        {/* Simulated Musi River Flood Corridor (Shaded Blue/Cyan Waterway) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 250">
          <path
            d="M -20,180 Q 140,110 260,155 T 520,140"
            fill="none"
            stroke="rgba(6, 182, 212, 0.22)"
            strokeWidth="36"
            strokeLinecap="round"
          />
          {/* Animated Waypoint Intercept Trajectory (CVRP Transit Line) */}
          <path
            d="M 110,75 Q 180,120 280,115 T 365,150"
            fill="none"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            className="opacity-90 [animation:dash_1.5s_linear_infinite]"
          />
        </svg>

        {/* Water Corridor Label Tag */}
        <div className="absolute bottom-9 left-4 text-[9px] font-mono font-bold text-cyan-400/80 bg-slate-950/90 border border-cyan-800/60 px-2 py-0.5 rounded shadow">
          ≈ MUSI BASIN FLOOD WATERWAY (AMPHIBIOUS RESCUE CHANNEL)
        </div>

        {/* =================================================================== */}
        {/* PIN 1: NEAREST HUMANITARIAN SHELTER CAMP (High Ground)              */}
        {/* =================================================================== */}
        <div className="absolute left-[22%] top-[30%] -translate-x-1/2 -translate-y-1/2 z-20 group">
          <div className="relative flex h-6 w-6 items-center justify-center">
            <span className="relative inline-flex rounded-full h-5 w-5 bg-emerald-700 border-2 border-emerald-300 shadow-lg shadow-emerald-500/60 items-center justify-center">
              <Building2 className="w-2.5 h-2.5 text-white" />
            </span>
          </div>
          {/* Camp Tag */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 border border-emerald-500/80 rounded-lg px-2 py-0.5 shadow-xl text-center backdrop-blur-sm pointer-events-none">
            <div className="text-[9px] font-black text-emerald-400 uppercase tracking-tight flex items-center space-x-1 justify-center">
              <Shield className="w-2.5 h-2.5 text-emerald-400" />
              <span>{t?.nearestSafeCamp || "NEAREST RELIEF CAMP"}</span>
            </div>
            <span className="text-[8px] font-mono text-slate-300 block truncate max-w-[130px]">
              {nearestShelterName} ({nearestShelterDist})
            </span>
          </div>
        </div>

        {/* =================================================================== */}
        {/* PIN 2: INCOMING RESCUE CRAFT (Moving dynamically toward citizen!)   */}
        {/* =================================================================== */}
        <div
          className="absolute z-30 transition-all duration-1000 -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${currentVehicleX}%`, top: `${currentVehicleY}%` }}
        >
          <div className="relative flex h-8 w-8 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60"></span>
            <span className="relative inline-flex rounded-full h-7 w-7 bg-gradient-to-tr from-cyan-600 to-blue-500 border-2 border-cyan-200 shadow-xl shadow-cyan-400/80 items-center justify-center">
              {isBoat ? (
                <Anchor className="w-3.5 h-3.5 text-white" />
              ) : (
                <Truck className="w-3.5 h-3.5 text-white" />
              )}
            </span>
          </div>
          {/* Craft Live Telemetry Beacon Card */}
          <div className="absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 border border-cyan-500/80 rounded-lg px-2.5 py-0.5 shadow-2xl text-center backdrop-blur-md pointer-events-none">
            <div className="flex items-center space-x-1 text-[9px] font-black text-cyan-300 font-mono justify-center">
              <Navigation className="w-2.5 h-2.5 text-cyan-400 rotate-45 inline" />
              <span>{vehicleCode}</span>
            </div>
            <div className="text-[8px] font-mono text-emerald-300 font-bold">
              {isDelivered ? "✓ Arrived at Pin" : `${vehicleSpeed} • ${vehiclePilot}`}
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* PIN 3: CITIZEN'S PINNED GPS LOCATION (YOUR LOCATION)                */}
        {/* =================================================================== */}
        <div className="absolute left-[73%] top-[60%] -translate-x-1/2 -translate-y-1/2 z-20 group">
          <div className="relative flex h-7 w-7 items-center justify-center">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
            <span className="relative inline-flex rounded-full h-6 w-6 bg-red-600 border-2 border-white shadow-xl shadow-red-500/90 items-center justify-center">
              <Crosshair className="w-3.5 h-3.5 text-white animate-pulse" />
            </span>
          </div>
          {/* Citizen Pin Card */}
          <div className="absolute top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 border border-red-500/90 rounded-lg px-2 py-0.5 shadow-2xl text-center backdrop-blur-sm pointer-events-none">
            <span className="text-[9px] font-black text-red-400 uppercase tracking-tight flex items-center space-x-1 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping"></span>
              <span>{t?.yourPinnedLocation || "YOUR PINNED LOCATION"}</span>
            </span>
            <span className="text-[8px] font-mono text-slate-300 block truncate max-w-[130px]">
              {citizenAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Radar Bottom Bar & Full Map Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-2 truncate">
          <span className="text-cyan-400 font-semibold flex items-center space-x-1">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse inline" />
            <span>Telemetry:</span>
          </span>
          <span className="text-slate-300 truncate max-w-[280px]">
            {vehicleHeading}
          </span>
        </div>

        <Link
          href="/map"
          className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono transition-all self-end sm:self-auto shrink-0 group"
        >
          <span className="group-hover:underline">{t?.viewFullGisMap || "Open Full GIS Radar Map →"}</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
