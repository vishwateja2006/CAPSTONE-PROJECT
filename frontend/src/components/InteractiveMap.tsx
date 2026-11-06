"use client";

import React, { useState } from "react";
import { ReliefCenter, ReliefVehicle, SOSRequest, RoutePlan } from "../types";
import { ShieldAlert, AlertTriangle, CheckCircle, Navigation, Radio, MapPin, Truck } from "lucide-react";

interface InteractiveMapProps {
  reliefCenters: ReliefCenter[];
  vehicles: ReliefVehicle[];
  sosRequests: SOSRequest[];
  routePlans?: RoutePlan[];
  selectedSosId?: string;
  onSelectSos?: (sos: SOSRequest) => void;
}

export default function InteractiveMap({
  reliefCenters,
  vehicles,
  sosRequests,
  routePlans = [],
  selectedSosId,
  onSelectSos,
}: InteractiveMapProps) {
  const [activeItem, setActiveItem] = useState<{
    type: "SOS" | "DEPOT" | "VEHICLE";
    data: any;
  } | null>(null);

  // Geographic bounds for coordinate projection (Chennai metro disaster zone)
  const MIN_LAT = 13.010;
  const MAX_LAT = 13.110;
  const MIN_LON = 80.220;
  const MAX_LON = 80.310;

  // Project lat/lon into SVG viewBox 0..900 (X) and 0..600 (Y)
  const project = (lat: number, lon: number) => {
    const x = ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * 860 + 20;
    // Invert Y because latitude goes South -> North but SVG goes Top -> Down
    const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 540 + 30;
    return { x: Math.max(25, Math.min(875, x)), y: Math.max(25, Math.min(575, y)) };
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none">
      
      {/* Tactical HUD Header */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 items-center bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-1.5 text-red-400 font-semibold">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          <span>CRITICAL HAZARD ZONE</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5 text-blue-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span>RELIEF DEPOT</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5 text-emerald-400">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>ACTIVE FLEET</span>
        </div>
        <span className="text-slate-600">|</span>
        <div className="flex items-center space-x-1.5 text-amber-400">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span>SOS BEACONS ({sosRequests.length})</span>
        </div>
      </div>

      {/* SVG GIS Layer */}
      <svg className="w-full h-full bg-[#080d1a]" viewBox="0 0 900 600">
        <defs>
          {/* Tactical Grid */}
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.8" opacity="0.4" />
          </pattern>

          {/* Flooded Hazard Zone Pattern */}
          <pattern id="floodHazard" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="#ef4444" strokeWidth="4" opacity="0.35" />
          </pattern>

          {/* Glow filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Map Background Grid */}
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Coastal Line / River Representation */}
        <path
          d="M 820 0 Q 800 200 840 400 T 830 600"
          fill="none"
          stroke="#0284c7"
          strokeWidth="38"
          opacity="0.25"
        />
        <text x="810" y="80" fill="#38bdf8" fontSize="11" opacity="0.6" transform="rotate(85 810 80)" fontFamily="monospace">
          COASTLINE / BAY OF BENGAL
        </text>

        {/* Adyar Flooded Estuary River Basin */}
        <path
          d="M 100 480 Q 400 440 600 470 T 820 480"
          fill="none"
          stroke="#0369a1"
          strokeWidth="24"
          opacity="0.3"
        />
        <text x="320" y="475" fill="#38bdf8" fontSize="10" opacity="0.5" fontFamily="monospace">
          ADYAR RIVER BASIN (OVERFLOWING)
        </text>

        {/* RED HAZARD ZONE: Flooded Sector Polygon */}
        <polygon
          points="250,420 540,410 570,520 280,530"
          fill="url(#floodHazard)"
          stroke="#ef4444"
          strokeWidth="2.5"
          strokeDasharray="6,4"
        />
        <rect x="330" y="450" width="165" height="26" rx="4" fill="#7f1d1d" opacity="0.85" />
        <text x="340" y="467" fill="#fecaca" fontSize="10" fontWeight="bold" fontFamily="monospace">
          ⚠ RED ZONE: SUBMERGED
        </text>

        {/* Optimized Route Paths */}
        {routePlans.map((plan, idx) => {
          if (!plan.waypoints || plan.waypoints.length < 2) return null;
          const pointsStr = plan.waypoints
            .map((wp) => {
              const p = project(wp.latitude, wp.longitude);
              return `${p.x},${p.y}`;
            })
            .join(" ");

          return (
            <g key={plan.id || idx}>
              <polyline
                points={pointsStr}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
                strokeDasharray="8,6"
                opacity="0.8"
                filter="url(#glow)"
              />
              {plan.waypoints.map((wp, wIdx) => {
                const pt = project(wp.latitude, wp.longitude);
                return (
                  <circle
                    key={wIdx}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#38bdf8"
                    stroke="#0284c7"
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          );
        })}

        {/* Relief Depots */}
        {reliefCenters.map((depot) => {
          const pt = project(depot.latitude, depot.longitude);
          return (
            <g
              key={depot.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setActiveItem({ type: "DEPOT", data: depot })}
            >
              <circle cx={pt.x} cy={pt.y} r="22" fill="#1e3a8a" opacity="0.4" />
              <circle cx={pt.x} cy={pt.y} r="14" fill="#2563eb" stroke="#93c5fd" strokeWidth="2.5" />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                HQ
              </text>
              <rect x={pt.x - 50} y={pt.y + 18} width="100" height="18" rx="4" fill="#0f172a" opacity="0.9" />
              <text x={pt.x} y={pt.y + 30} textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                {depot.name.slice(0, 15)}..
              </text>
            </g>
          );
        })}

        {/* SOS Request Pins */}
        {sosRequests.map((sos) => {
          const pt = project(sos.latitude, sos.longitude);
          const isCritical = sos.urgency_level === "CRITICAL";
          const isHigh = sos.urgency_level === "HIGH";
          const pinColor = isCritical ? "#ef4444" : isHigh ? "#f97316" : "#eab308";
          const isSelected = selectedSosId === sos.id;

          return (
            <g
              key={sos.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => {
                setActiveItem({ type: "SOS", data: sos });
                if (onSelectSos) onSelectSos(sos);
              }}
            >
              {isCritical && (
                <circle cx={pt.x} cy={pt.y} r="18" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6" className="radar-pulse" />
              )}
              {isSelected && (
                <circle cx={pt.x} cy={pt.y} r="24" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4,2" />
              )}
              <circle cx={pt.x} cy={pt.y} r="10" fill={pinColor} stroke="#ffffff" strokeWidth="2" />
              <text x={pt.x} y={pt.y + 3.5} textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                {sos.people_count}
              </text>
            </g>
          );
        })}

        {/* Relief Vehicles */}
        {vehicles.map((v) => {
          const pt = project(v.current_lat, v.current_lon);
          return (
            <g
              key={v.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setActiveItem({ type: "VEHICLE", data: v })}
            >
              <rect x={pt.x - 12} y={pt.y - 12} width="24" height="24" rx="6" fill="#047857" stroke="#6ee7b7" strokeWidth="2" />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="#ffffff" fontSize="10">
                🚚
              </text>
              <text x={pt.x} y={pt.y + 24} textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold" fontFamily="monospace">
                {v.vehicle_code.slice(-6)}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Tactical Inspector Card */}
      {activeItem && (
        <div className="absolute bottom-4 right-4 z-30 w-80 bg-slate-900/95 backdrop-blur-md rounded-xl p-4 border border-slate-700 shadow-2xl text-xs animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center space-x-2">
              {activeItem.type === "SOS" && (
                <ShieldAlert className="w-4 h-4 text-red-500" />
              )}
              {activeItem.type === "DEPOT" && (
                <MapPin className="w-4 h-4 text-blue-500" />
              )}
              {activeItem.type === "VEHICLE" && (
                <Truck className="w-4 h-4 text-emerald-500" />
              )}
              <span className="font-bold uppercase tracking-wider text-white">
                {activeItem.type === "SOS" ? "Emergency Incident" : activeItem.type === "DEPOT" ? "Relief Base Depot" : "Fleet Unit"}
              </span>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          {activeItem.type === "SOS" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Victim:</span>
                <span className="font-semibold text-white">{activeItem.data.victim_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Affected Headcount:</span>
                <span className="font-bold text-amber-400">{activeItem.data.people_count} People</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AI Urgency Score:</span>
                <span className={`px-2 py-0.5 rounded font-black ${
                  activeItem.data.urgency_score >= 80 ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400"
                }`}>
                  {activeItem.data.urgency_score} / 100 ({activeItem.data.urgency_level})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Phone:</span>
                <span className="font-mono text-slate-300">{activeItem.data.contact_phone}</span>
              </div>
              <p className="text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px] italic">
                "{activeItem.data.description || "Immediate emergency relief required."}"
              </p>
            </div>
          )}

          {activeItem.type === "DEPOT" && (
            <div className="space-y-2">
              <div className="font-semibold text-white">{activeItem.data.name}</div>
              <div className="text-slate-400">{activeItem.data.location_name}</div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span>Shelter Capacity:</span>
                <span className="font-bold">{activeItem.data.current_occupancy} / {activeItem.data.capacity_people}</span>
              </div>
              <div className="text-slate-400 text-[11px]">
                Coordinates: {activeItem.data.latitude.toFixed(4)}, {activeItem.data.longitude.toFixed(4)}
              </div>
            </div>
          )}

          {activeItem.type === "VEHICLE" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">{activeItem.data.vehicle_code}</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {activeItem.data.status}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payload Capacity:</span>
                <span className="font-semibold">{activeItem.data.capacity_kg} kg</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Driver:</span>
                <span>{activeItem.data.assigned_driver || "Assigned Driver"}</span>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
