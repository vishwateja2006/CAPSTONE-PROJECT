"use client";

import React, { useState, useEffect } from "react";
import { ReliefCenter, ReliefVehicle, SOSRequest, RoutePlan } from "../types";
import { EnvironmentalData, HazardZone } from "../lib/environmentalTelemetry";
import {
  ShieldAlert,
  AlertTriangle,
  Navigation,
  MapPin,
  Truck,
  Wind,
  Waves,
  Gauge,
  Activity,
  Crosshair,
  Radio,
  Eye,
  Sliders,
  Layers,
  Sparkles,
  Info,
  Droplets
} from "lucide-react";
import { playSonarPing } from "../lib/audioTelemetry";

interface InteractiveMapProps {
  reliefCenters: ReliefCenter[];
  vehicles: ReliefVehicle[];
  sosRequests: SOSRequest[];
  routePlans?: RoutePlan[];
  selectedSosId?: string;
  onSelectSos?: (sos: SOSRequest) => void;
  environmentalData?: EnvironmentalData;
  userCoords?: { lat: number; lon: number; accuracy?: number; isLive: boolean };
  onRecenterGPS?: () => void;
  floodDepth?: number;
  onFloodDepthChange?: (depth: number) => void;
}

const DEFAULT_USER_COORDS = { lat: 17.3850, lon: 78.4867, isLive: false };
const DEFAULT_ENV_DATA: EnvironmentalData = {
  timestamp: new Date().toISOString(),
  location: { lat: 17.3850, lon: 78.4867, city: "Hyderabad Urban Sector", isLiveGPS: false },
  aqi: { value: 74, category: "MODERATE", label: "Moderate", color: "#f59e0b", pm2_5: 24.2, pm10: 48.0, no2: 14.5, o3: 35.0, co: 0.5, advisory: "Acceptable air quality." },
  cyclone: { name: "Telangana Flash Flood Cloudburst", detected: true, category: "Severe Cloudburst Event", centralPressure_hpa: 988, windSpeed_kmh: 72, windGusts_kmh: 98, eyeLat: 17.42, eyeLon: 78.48, distanceToEye_km: 14.5, radiusOfGale_km: 60, trajectoryHeading_deg: 310, stormSurge_m: 2.1, threatLevel: "HIGH" },
  marine: { waveHeight_m: 3.6, swellHeight_m: 2.8, wavePeriod_s: 11.4, waveDirection_deg: 75, tidalSurgeRisk: "HIGH", waveCondition: "Musi River Inundation Alert", waterTemp_c: 28.5, tsunamiSurgeAlert: false },
  hazard: { defconLevel: 2, defconName: "DEFCON-2: SEVERE EMERGENCY WARNING", compositeIndex: 78, primaryThreat: "Urban Flash Flood & Musi Overflow", evacuationStatus: "Pre-emptive Evacuation Active", recommendedActions: ["Avoid low-lying causeways."], hazardZones: [] }
};

export default function InteractiveMap({
  reliefCenters = [],
  vehicles = [],
  sosRequests = [],
  routePlans = [],
  selectedSosId,
  onSelectSos,
  environmentalData = DEFAULT_ENV_DATA,
  userCoords = DEFAULT_USER_COORDS,
  onRecenterGPS,
  floodDepth = 3.5,
  onFloodDepthChange
}: InteractiveMapProps) {
  const [activeItem, setActiveItem] = useState<{
    type: "USER" | "CYCLONE" | "WAVE" | "AQI" | "HAZARD_ZONE" | "SOS" | "DEPOT" | "VEHICLE" | "CAUSEWAY_BRIDGE" | "FLYOVER_BRIDGE" | "MUSI_RIVER";
    data: any;
  } | null>(null);

  // Synchronized Flood Depth State (1.0 ft to 6.0 ft)
  const [localFloodDepth, setLocalFloodDepth] = useState<number>(floodDepth);

  useEffect(() => {
    setLocalFloodDepth(floodDepth);
  }, [floodDepth]);

  const currentDepth = floodDepth !== undefined ? floodDepth : localFloodDepth;
  const isCausewaySubmerged = currentDepth >= 3.0;

  const handleSliderChange = (newVal: number) => {
    const clamped = Math.max(1.0, Math.min(6.0, Number(newVal.toFixed(1))));
    setLocalFloodDepth(clamped);
    if (onFloodDepthChange) {
      onFloodDepthChange(clamped);
    }
    playSonarPing();
  };

  // Active Map Layers Toggles
  const [showGPS, setShowGPS] = useState(true);
  const [showCyclone, setShowCyclone] = useState(true);
  const [showWaves, setShowWaves] = useState(true);
  const [showAQI, setShowAQI] = useState(true);
  const [showHazards, setShowHazards] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [basemapStyle, setBasemapStyle] = useState<"TACTICAL_DARK" | "SATELLITE_RECON" | "GRID">("TACTICAL_DARK");

  // Dynamic Geographic Projection Bounds centered on current region
  const centerLat = userCoords.lat || 17.3850;
  const centerLon = userCoords.lon || 78.4867;
  const LAT_SPAN = 0.12; // ~13 km North-South span
  const LON_SPAN = 0.16; // ~17 km East-West span

  const MIN_LAT = centerLat - LAT_SPAN / 2;
  const MAX_LAT = centerLat + LAT_SPAN / 2;
  const MIN_LON = centerLon - LON_SPAN / 2;
  const MAX_LON = centerLon + LON_SPAN / 2;

  // Project geographic coordinates into SVG Canvas (1000 x 650)
  const project = (lat: number, lon: number) => {
    const numLat = Number(lat) || centerLat;
    const numLon = Number(lon) || centerLon;
    const x = ((numLon - MIN_LON) / (MAX_LON - MIN_LON)) * 940 + 30;
    // Invert Y because latitude goes South -> North but SVG goes Top -> Down
    const y = ((MAX_LAT - numLat) / (MAX_LAT - MIN_LAT)) * 580 + 35;
    return {
      x: Math.max(20, Math.min(980, isNaN(x) ? 500 : x)),
      y: Math.max(25, Math.min(625, isNaN(y) ? 325 : y))
    };
  };

  const userPt = project(userCoords.lat, userCoords.lon);
  const cyclonePt = project(environmentalData.cyclone.eyeLat, environmentalData.cyclone.eyeLon);
  const causewayPt = project(17.3680, 78.4900);
  const flyoverPt = project(17.3880, 78.4820);
  const depotPt = project(17.4399, 78.4983);

  return (
    <div className="relative w-full h-[680px] rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl select-none group">

      {/* Top Floating HUD: Real-time Telemetry & Layer Toggles */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">

        {/* Left: Dynamic DEFCON & Telemetry Indicators */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">
          {/* DEFCON Rating Badge */}
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-black shadow-lg backdrop-blur-md ${environmentalData.hazard.defconLevel === 1
            ? "bg-red-950/90 border-red-700 text-red-300 animate-pulse"
            : environmentalData.hazard.defconLevel === 2
              ? "bg-amber-950/90 border-amber-700 text-amber-300"
              : "bg-blue-950/90 border-blue-700 text-blue-300"
            }`}>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>{environmentalData.hazard.defconName}</span>
          </div>

          {/* AQI Live Pill */}
          <button
            onClick={() => setActiveItem({ type: "AQI", data: environmentalData.aqi })}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700 text-xs font-mono backdrop-blur-md text-white transition-all shadow-md"
          >
            <Gauge className="w-3.5 h-3.5" style={{ color: environmentalData.aqi.color }} />
            <span>AQI:</span>
            <span className="font-bold" style={{ color: environmentalData.aqi.color }}>
              {environmentalData.aqi.value} ({environmentalData.aqi.category})
            </span>
          </button>

          {/* Wave & Surge Pill */}
          <button
            onClick={() => setActiveItem({ type: "WAVE", data: environmentalData.marine })}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-cyan-800/80 text-xs font-mono backdrop-blur-md text-cyan-300 transition-all shadow-md"
          >
            <Waves className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>WAVE:</span>
            <span className="font-bold text-white">{environmentalData.marine.waveHeight_m}m</span>
            <span className="text-[10px] text-cyan-400">({environmentalData.marine.tidalSurgeRisk})</span>
          </button>

          {/* Cyclone Radar Pill */}
          <button
            onClick={() => setActiveItem({ type: "CYCLONE", data: environmentalData.cyclone })}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-amber-800/80 text-xs font-mono backdrop-blur-md text-amber-300 transition-all shadow-md"
          >
            <Wind className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>CYCLONE:</span>
            <span className="font-bold text-white">{environmentalData.cyclone.windSpeed_kmh} km/h</span>
            <span className="text-[10px] text-amber-400">({environmentalData.cyclone.centralPressure_hpa} hPa)</span>
          </button>
        </div>

        {/* Right: Layer Switches, Live Flood Depth Slider & Recenter GPS */}
        <div className="flex flex-wrap items-center gap-2 pointer-events-auto">

          {/* Floating Mini Flood Depth Slider */}
          <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700 text-xs shadow-lg">
            <span className="text-cyan-400 font-bold flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline font-mono">Depth:</span>
            </span>
            <span
              className={`font-mono font-black text-xs px-2 py-0.5 rounded-full ${
                isCausewaySubmerged
                  ? "bg-red-950 text-red-300 border border-red-700 animate-pulse"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-700"
              }`}
            >
              {currentDepth.toFixed(1)} ft
            </span>
            <input
              type="range"
              min="1.0"
              max="6.0"
              step="0.1"
              value={currentDepth}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title={`Simulated Flood Depth: ${currentDepth.toFixed(1)} ft`}
            />
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 text-xs">
            {onRecenterGPS && (
              <button
                onClick={onRecenterGPS}
                title="Center on My Real-Time GPS Location"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-600/30"
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>Locate Me</span>
              </button>
            )}

            {/* Quick Layer Filter Buttons */}
            <button
              onClick={() => setShowCyclone(!showCyclone)}
              title="Toggle Cyclone Vortex"
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${showCyclone ? "bg-amber-500/20 text-amber-300 border border-amber-500/50" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              🌪️ Storm
            </button>

            <button
              onClick={() => setShowWaves(!showWaves)}
              title="Toggle Coastal Waves & Ocean Surge"
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${showWaves ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              🌊 Waves
            </button>

            <button
              onClick={() => setShowAQI(!showAQI)}
              title="Toggle Air Quality Index (AQI)"
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${showAQI ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              🌫️ AQI
            </button>

            <button
              onClick={() => setShowHazards(!showHazards)}
              title="Toggle DEFCON Hazard Zones"
              className={`px-2.5 py-1.5 rounded-xl font-bold transition-all ${showHazards ? "bg-red-500/20 text-red-300 border border-red-500/50" : "text-slate-500 hover:text-slate-300"
                }`}
            >
              ⚠️ Hazard
            </button>
          </div>
        </div>
      </div>

      {/* SVG Vector Map Rendering Canvas */}
      <svg className="w-full h-full bg-[#060a14]" viewBox="0 0 1000 650">
        <defs>
          {/* Tactical Grid */}
          <pattern id="tacticalGrid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#172554" strokeWidth="0.6" opacity="0.4" />
          </pattern>

          {/* Radar Sweep Gradient */}
          <radialGradient id="radarScan" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="70%" stopColor="#38bdf8" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>

          {/* Flooded Hazard Zone Pattern */}
          <pattern id="floodStripes" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#ef4444" strokeWidth="3.5" opacity="0.4" />
          </pattern>

          {/* Severe Hazard Zone Pattern */}
          <pattern id="severeStripes" width="16" height="16" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="16" stroke="#f97316" strokeWidth="3" opacity="0.35" />
          </pattern>

          {/* AQI Smog Dispersion Gradient */}
          <radialGradient id="aqiPlume" cx="45%" cy="55%" r="65%">
            <stop offset="0%" stopColor={environmentalData.aqi.color} stopOpacity="0.32" />
            <stop offset="50%" stopColor={environmentalData.aqi.color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={environmentalData.aqi.color} stopOpacity="0" />
          </radialGradient>

          {/* Glowing Filters */}
          <filter id="mapGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Layer 1: Tactical Grid */}
        <rect width="100%" height="100%" fill="url(#tacticalGrid)" />

        {/* Layer 2: Oceanic Waterway & Coastline (East Boundary) */}
        <path
          d="M 850 0 Q 820 220 870 420 T 840 650"
          fill="none"
          stroke="#0369a1"
          strokeWidth="60"
          opacity="0.35"
        />
        <text x="880" y="90" fill="#38bdf8" fontSize="11" opacity="0.6" transform="rotate(86 880 90)" fontFamily="monospace" fontWeight="bold">
          HUSSAIN SAGAR / URBAN WATER CORRIDOR
        </text>

        {/* Musi River Basin Flood Inundation Floodplain (Dynamic Hazard Polygon) */}
        {currentDepth >= 2.0 && (
          <g>
            <path
              d="M 40 545 Q 380 435 620 460 T 870 480 L 870 550 Q 620 540 380 510 T 40 565 Z"
              fill="url(#floodStripes)"
              stroke="#ef4444"
              strokeWidth="2"
              opacity={0.25 + (currentDepth / 6) * 0.45}
              className={isCausewaySubmerged ? "animate-pulse" : ""}
            />
          </g>
        )}

        {/* Dynamic River Canal Network (Musi River Inundation Channel) */}
        <path
          d="M 60 520 Q 380 470 620 500 T 850 515"
          fill="none"
          stroke={currentDepth < 2.5 ? "#0284c7" : currentDepth < 3.5 ? "#f59e0b" : "#dc2626"}
          strokeWidth={Math.round(22 + (currentDepth - 1.0) * 11)}
          opacity={Math.min(0.85, 0.45 + (currentDepth - 1.0) * 0.08)}
          filter="url(#mapGlow)"
        />

        {/* River Water Dynamic Flow Ripples */}
        <path
          d="M 60 520 Q 380 470 620 500 T 850 515"
          fill="none"
          stroke={isCausewaySubmerged ? "#fca5a5" : "#67e8f9"}
          strokeWidth="3"
          strokeDasharray="14,10"
          opacity={isCausewaySubmerged ? 0.8 : 0.6}
        >
          <animate attributeName="stroke-dashoffset" from="120" to="0" dur="3s" repeatCount="indefinite" />
        </path>

        {/* Musi River Corridor Interactive Tag & Breach Indicator */}
        <g
          className="cursor-pointer"
          onClick={() => setActiveItem({
            type: "MUSI_RIVER",
            data: {
              depth: currentDepth,
              isSubmerged: isCausewaySubmerged,
              inundatedAreaKm2: (currentDepth * 2.8).toFixed(1),
              populationAtRisk: Math.round(currentDepth * 1850)
            }
          })}
        >
          <rect
            x="320"
            y="492"
            width="380"
            height="26"
            rx="6"
            fill="#090e1a"
            opacity="0.92"
            stroke={isCausewaySubmerged ? "#ef4444" : "#0284c7"}
            strokeWidth="1.5"
          />
          <circle
            cx="336"
            cy="505"
            r="5"
            fill={isCausewaySubmerged ? "#ef4444" : "#38bdf8"}
            className={isCausewaySubmerged ? "animate-ping" : ""}
          />
          <circle cx="336" cy="505" r="3.5" fill={isCausewaySubmerged ? "#ef4444" : "#38bdf8"} />
          <text
            x="350"
            y="509"
            fill={isCausewaySubmerged ? "#fca5a5" : "#38bdf8"}
            fontSize="9.5"
            opacity="0.95"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {isCausewaySubmerged
              ? `⚠ MUSI RIVER BASIN • CRITICAL INUNDATION: ${currentDepth.toFixed(1)} FT (SUBMERGED)`
              : `🌊 MUSI RIVER BASIN • WATER DEPTH: ${currentDepth.toFixed(1)} FT (FLOW NORMAL)`}
          </text>
        </g>

        {/* STRATEGIC BRIDGE 1: MUSI LOW-LEVEL CAUSEWAY BRIDGE */}
        <g
          transform={`translate(${causewayPt.x}, ${causewayPt.y})`}
          className="cursor-pointer"
          onClick={() => setActiveItem({
            type: "CAUSEWAY_BRIDGE",
            data: {
              name: "Musi River Low-Level Causeway Bridge",
              depth: currentDepth,
              threshold: 3.0,
              isSubmerged: isCausewaySubmerged,
              elevationClearance: (3.0 - currentDepth).toFixed(1),
              status: isCausewaySubmerged ? "SUBMERGED & IMPASSABLE" : "OPEN & NAVIGABLE"
            }
          })}
        >
          {isCausewaySubmerged ? (
            <>
              <circle cx="0" cy="0" r="26" fill="#ef4444" opacity="0.3" className="animate-ping" />
              <circle cx="0" cy="0" r="16" fill="#7f1d1d" stroke="#ef4444" strokeWidth="2.5" />
              <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">⛔</text>
              <rect x="-95" y="22" width="190" height="24" rx="5" fill="#450a0a" opacity="0.95" stroke="#ef4444" strokeWidth="1.2" />
              <text x="0" y="37" textAnchor="middle" fill="#fca5a5" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                ⛔ CAUSEWAY SUBMERGED ({currentDepth.toFixed(1)}ft)
              </text>
            </>
          ) : (
            <>
              <circle cx="0" cy="0" r="20" fill="#065f46" opacity="0.25" />
              <circle cx="0" cy="0" r="14" fill="#047857" stroke="#34d399" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11">🌉</text>
              <rect x="-85" y="18" width="170" height="22" rx="5" fill="#064e3b" opacity="0.95" stroke="#10b981" strokeWidth="1" />
              <text x="0" y="32" textAnchor="middle" fill="#a7f3d0" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
                ✓ MUSI CAUSEWAY: OPEN ({currentDepth.toFixed(1)}ft)
              </text>
            </>
          )}
        </g>

        {/* STRATEGIC BRIDGE 2: CHADERGHAT ELEVATED FLYOVER (SAFE HIGH-LEVEL DETOUR) */}
        <g
          transform={`translate(${flyoverPt.x}, ${flyoverPt.y})`}
          className="cursor-pointer"
          onClick={() => setActiveItem({
            type: "FLYOVER_BRIDGE",
            data: {
              name: "Chaderghat Elevated Flyover / Expressway",
              clearanceMeters: 6.7,
              status: "ALL-WEATHER SAFE DETOUR (OPEN)",
              inundationImmune: true
            }
          })}
        >
          <circle cx="0" cy="0" r="18" fill="#0e7490" opacity="0.3" />
          <circle cx="0" cy="0" r="13" fill="#0891b2" stroke="#67e8f9" strokeWidth="2" />
          <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="10">🛡️</text>
          <rect x="-95" y="-28" width="190" height="22" rx="5" fill="#082f49" opacity="0.95" stroke="#06b6d4" strokeWidth="1" />
          <text x="0" y="-14" textAnchor="middle" fill="#67e8f9" fontSize="8.5" fontWeight="bold" fontFamily="monospace">
            🛡️ CHADERGHAT FLYOVER: SAFE DETOUR
          </text>
        </g>

        {/* HAZARD RAY-CASTING COLLISION SENSOR SYSTEM (DEMONSTRATES AUTONOMOUS AVOIDANCE) */}
        {isCausewaySubmerged && (
          <g>
            {/* Ray 1: Sensor Collision Vector aimed at Submerged Musi Sector */}
            <line
              x1={flyoverPt.x + 10}
              y1={flyoverPt.y + 20}
              x2={causewayPt.x - 12}
              y2={causewayPt.y - 15}
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeDasharray="6,4"
              opacity="0.85"
            >
              <animate attributeName="stroke-dashoffset" from="40" to="0" dur="1.2s" repeatCount="indefinite" />
            </line>

            {/* Impact Collision Point on Hazard Perimeter */}
            <g transform={`translate(${causewayPt.x - 12}, ${causewayPt.y - 15})`}>
              <circle cx="0" cy="0" r="10" fill="#ef4444" opacity="0.35" className="animate-ping" />
              <circle cx="0" cy="0" r="6" fill="#dc2626" stroke="#fca5a5" strokeWidth="1.5" />
              <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="7" fontWeight="bold">✕</text>
              <rect x="-70" y="-22" width="140" height="18" rx="4" fill="#450a0a" opacity="0.95" stroke="#ef4444" strokeWidth="1" />
              <text x="0" y="-10" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="bold" fontFamily="monospace">
                RAY COLLISION DETECTED
              </text>
            </g>

            {/* Ray 2: Detour Deflection Vector Curving to Elevated Flyover */}
            <path
              d={`M ${causewayPt.x - 12} ${causewayPt.y - 15} Q ${causewayPt.x - 45} ${causewayPt.y - 50} ${flyoverPt.x + 15} ${flyoverPt.y + 10}`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeDasharray="8,5"
              opacity="0.9"
            >
              <animate attributeName="stroke-dashoffset" from="60" to="0" dur="1.8s" repeatCount="indefinite" />
            </path>

            {/* Detour Label Pill */}
            <rect x={flyoverPt.x - 20} y={flyoverPt.y + 26} width="165" height="20" rx="4" fill="#451a03" opacity="0.95" stroke="#f59e0b" strokeWidth="1" />
            <text x={flyoverPt.x + 62} y={flyoverPt.y + 39} textAnchor="middle" fill="#fde68a" fontSize="8" fontWeight="bold" fontFamily="monospace">
              ⚡ RAY-CASTING DETOUR VECTOR
            </text>
          </g>
        )}

        {/* Layer 3: AIR QUALITY DISPERSION HEATMAP (AQI) */}
        {showAQI && (
          <g className="cursor-pointer" onClick={() => setActiveItem({ type: "AQI", data: environmentalData.aqi })}>
            <ellipse cx={centerLon ? 480 : 500} cy="340" rx="380" ry="240" fill="url(#aqiPlume)" />
            <rect x="50" y="580" width="220" height="40" rx="10" fill="#090e1a" opacity="0.85" stroke="#334155" strokeWidth="1" />
            <circle cx="70" cy="600" r="8" fill={environmentalData.aqi.color} />
            <text x="86" y="596" fill="#f8fafc" fontSize="10" fontWeight="bold" fontFamily="monospace">
              AQI SENSOR: {environmentalData.aqi.value} ({environmentalData.aqi.label})
            </text>
            <text x="86" y="611" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              PM2.5: {environmentalData.aqi.pm2_5}µg/m³ | PM10: {environmentalData.aqi.pm10}µg/m³
            </text>
          </g>
        )}

        {/* Layer 4: OCEANIC WAVES & NATURAL SURGE DETECTOR */}
        {showWaves && (
          <g className="cursor-pointer" onClick={() => setActiveItem({ type: "WAVE", data: environmentalData.marine })}>
            {/* Sinusoidal Wave Ripples along coastline */}
            {[0, 1, 2, 3].map((wIdx) => (
              <path
                key={wIdx}
                d={`M ${810 - wIdx * 25} 30 Q ${840 - wIdx * 25} 150 ${800 - wIdx * 25} 300 T ${820 - wIdx * 25} 620`}
                fill="none"
                stroke="#06b6d4"
                strokeWidth={2.5 - wIdx * 0.4}
                strokeDasharray="12,8"
                opacity={0.8 - wIdx * 0.18}
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="100"
                  to="0"
                  dur={`${4 + wIdx}s`}
                  repeatCount="indefinite"
                />
              </path>
            ))}

            {/* High Swell / Coastal Breach Alert Marker */}
            <g transform="translate(770, 260)">
              <circle cx="0" cy="0" r="26" fill="#0891b2" opacity="0.25" className="animate-ping" />
              <circle cx="0" cy="0" r="14" fill="#0e7490" stroke="#67e8f9" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11">🌊</text>
              <rect x="-85" y="20" width="170" height="34" rx="6" fill="#082f49" opacity="0.95" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="34" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                WAVE HEIGHT: {environmentalData.marine.waveHeight_m} METERS
              </text>
              <text x="0" y="47" textAnchor="middle" fill="#bae6fd" fontSize="8" fontFamily="monospace">
                Period: {environmentalData.marine.wavePeriod_s}s ({environmentalData.marine.tidalSurgeRisk} Risk)
              </text>
            </g>
          </g>
        )}

        {/* Layer 5: CYCLONE & ATMOSPHERIC VORTEX RADAR */}
        {showCyclone && environmentalData.cyclone.detected && (
          <g className="cursor-pointer" onClick={() => setActiveItem({ type: "CYCLONE", data: environmentalData.cyclone })}>
            {/* Concentric Storm Radii */}
            <circle cx={cyclonePt.x} cy={cyclonePt.y} r="180" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,6" opacity="0.3" />
            <circle cx={cyclonePt.x} cy={cyclonePt.y} r="110" fill="none" stroke="#ea580c" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.45" />
            <circle cx={cyclonePt.x} cy={cyclonePt.y} r="55" fill="none" stroke="#dc2626" strokeWidth="2" strokeDasharray="8,4" opacity="0.65" />

            {/* Rotating Spiral Arms */}
            <g>
              <path
                d={`M ${cyclonePt.x} ${cyclonePt.y} Q ${cyclonePt.x - 80} ${cyclonePt.y - 60} ${cyclonePt.x - 140} ${cyclonePt.y + 40} T ${cyclonePt.x - 200} ${cyclonePt.y + 120}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="4"
                opacity="0.65"
              />
              <path
                d={`M ${cyclonePt.x} ${cyclonePt.y} Q ${cyclonePt.x + 80} ${cyclonePt.y + 60} ${cyclonePt.x + 140} ${cyclonePt.y - 40} T ${cyclonePt.x + 180} ${cyclonePt.y - 110}`}
                fill="none"
                stroke="#ea580c"
                strokeWidth="3.5"
                opacity="0.65"
              />
            </g>

            {/* Cyclone Eye Beacon */}
            <circle cx={cyclonePt.x} cy={cyclonePt.y} r="28" fill="#78350f" opacity="0.3" className="animate-ping" />
            <circle cx={cyclonePt.x} cy={cyclonePt.y} r="15" fill="#9a3412" stroke="#fdba74" strokeWidth="2.5" />
            <text x={cyclonePt.x} y={cyclonePt.y + 4} textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="bold">
              🌀
            </text>

            {/* Cyclone Tag Banner */}
            <rect x={cyclonePt.x - 90} y={cyclonePt.y + 22} width="180" height="34" rx="6" fill="#451a03" opacity="0.95" stroke="#f59e0b" strokeWidth="1" />
            <text x={cyclonePt.x} y={cyclonePt.y + 36} textAnchor="middle" fill="#fef3c7" fontSize="9" fontWeight="black" fontFamily="monospace">
              CYCLONE EYE: {environmentalData.cyclone.windSpeed_kmh} KM/H
            </text>
            <text x={cyclonePt.x} y={cyclonePt.y + 49} textAnchor="middle" fill="#fed7aa" fontSize="8" fontFamily="monospace">
              Pressure: {environmentalData.cyclone.centralPressure_hpa} hPa ({environmentalData.cyclone.threatLevel})
            </text>
          </g>
        )}

        {/* Layer 6: DEFCON HAZARD ZONES (Submerged Areas & Evacuation Polygons) */}
        {showHazards && (
          <g>
            {(environmentalData.hazard.hazardZones || []).map((zone) => {
              const pts = zone.coordinates.map((c) => {
                const p = project(c[0], c[1]);
                return `${p.x},${p.y}`;
              }).join(" ");

              const isCritical = zone.severity === "CRITICAL";
              const isSevere = zone.severity === "SEVERE";
              const strokeColor = isCritical ? "#ef4444" : isSevere ? "#f97316" : "#eab308";
              const fillPattern = isCritical ? "url(#floodStripes)" : "url(#severeStripes)";

              // Calculate polygon centroid for label placement
              const centerP = project(
                zone.coordinates.reduce((acc, curr) => acc + curr[0], 0) / zone.coordinates.length,
                zone.coordinates.reduce((acc, curr) => acc + curr[1], 0) / zone.coordinates.length
              );

              return (
                <g key={zone.id} className="cursor-pointer" onClick={() => setActiveItem({ type: "HAZARD_ZONE", data: zone })}>
                  <polygon
                    points={pts}
                    fill={fillPattern}
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                  />
                  <rect x={centerP.x - 80} y={centerP.y - 12} width="160" height="24" rx="4" fill="#0f172a" opacity="0.9" stroke={strokeColor} strokeWidth="1" />
                  <text x={centerP.x} y={centerP.y + 3} textAnchor="middle" fill={strokeColor} fontSize="9" fontWeight="bold" fontFamily="monospace">
                    ⚠ {zone.name.slice(0, 18)}.. ({zone.inundationDepth_ft}ft)
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* Layer 7: OPTIMIZED FLEET ROUTE TRAJECTORIES (CVRP & RAY-CASTING DETOURS) */}
        {showRoutes && (() => {
          const rawRoutes: RoutePlan[] = Array.isArray(routePlans)
            ? routePlans
            : (routePlans as any)?.routes && Array.isArray((routePlans as any).routes)
            ? (routePlans as any).routes
            : [];

          // Dynamically recalculate route waypoints based on Musi River flood depth
          const validRoutes: RoutePlan[] = rawRoutes.length > 0 ? rawRoutes.map((r, rIdx) => {
            if (isCausewaySubmerged) {
              return {
                ...r,
                total_distance_km: Number((r.total_distance_km + 3.2).toFixed(2)),
                estimated_duration_mins: Number((r.estimated_duration_mins + 5.5).toFixed(1)),
                waypoints: r.waypoints.map((wp, wIdx) => {
                  if (wIdx === 1 || wp.action === "HAZARD_BYPASS" || (wp.latitude < 17.38 && wp.latitude > 17.36)) {
                    return {
                      ...wp,
                      location_name: `DETOUR: Chaderghat Flyover (Avoiding Flood @ ${currentDepth.toFixed(1)}ft)`,
                      latitude: 17.3880,
                      longitude: 78.4820,
                      action: "HAZARD_BYPASS"
                    };
                  }
                  return wp;
                })
              };
            } else {
              return {
                ...r,
                total_distance_km: Number(Math.max(6.5, r.total_distance_km - 1.5).toFixed(2)),
                estimated_duration_mins: Number(Math.max(9.0, r.estimated_duration_mins - 3.2).toFixed(1)),
                waypoints: r.waypoints.map((wp, wIdx) => {
                  if (wIdx === 1 || wp.action === "HAZARD_BYPASS") {
                    return {
                      ...wp,
                      location_name: `Musi Causeway (Direct Passage Open @ ${currentDepth.toFixed(1)}ft)`,
                      latitude: 17.3680,
                      longitude: 78.4900,
                      action: "DIRECT_CROSSING"
                    };
                  }
                  return wp;
                })
              };
            }
          }) : [
            // Default active CVRP route when no external plan is passed
            isCausewaySubmerged ? {
              id: "plan-detour-01",
              vehicle_id: "VEH-01",
              vehicle_code: "TRUCK-4x4-ALPHA",
              relief_center_id: "RC-01",
              total_distance_km: 10.65,
              estimated_duration_mins: 16.7,
              status: "OPTIMAL",
              created_at: new Date().toISOString(),
              waypoints: [
                { sequence: 1, location_name: "Secunderabad Central Hub (Depot)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_START", demand_kg: 0, eta_mins: 0 },
                { sequence: 2, location_name: `DETOUR: Chaderghat Elevated Flyover (Bypassing Musi Causeway Submerged @ ${currentDepth.toFixed(1)}ft)`, latitude: 17.3880, longitude: 78.4820, action: "HAZARD_BYPASS", demand_kg: 0, eta_mins: 5.2 },
                { sequence: 3, location_name: "Amberpet Ring Bypass", latitude: 17.3790, longitude: 78.5140, action: "SAFE_CORRIDOR", demand_kg: 0, eta_mins: 9.8 },
                { sequence: 4, location_name: "SOS: Moosarambagh Ward 45", latitude: 17.3640, longitude: 78.5080, action: "DELIVER_AID", demand_kg: 150, eta_mins: 12.5 },
                { sequence: 5, location_name: "Secunderabad Central Hub (Return)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_RETURN", demand_kg: 0, eta_mins: 16.7 }
              ]
            } : {
              id: "plan-direct-01",
              vehicle_id: "VEH-01",
              vehicle_code: "TRUCK-4x4-ALPHA",
              relief_center_id: "RC-01",
              total_distance_km: 7.42,
              estimated_duration_mins: 11.2,
              status: "OPTIMAL",
              created_at: new Date().toISOString(),
              waypoints: [
                { sequence: 1, location_name: "Secunderabad Central Hub (Depot)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_START", demand_kg: 0, eta_mins: 0 },
                { sequence: 2, location_name: `Musi Causeway (Direct Passage Open @ ${currentDepth.toFixed(1)}ft)`, latitude: 17.3680, longitude: 78.4900, action: "DIRECT_CROSSING", demand_kg: 0, eta_mins: 3.5 },
                { sequence: 3, location_name: "SOS: Moosarambagh Ward 45", latitude: 17.3640, longitude: 78.5080, action: "DELIVER_AID", demand_kg: 150, eta_mins: 7.0 },
                { sequence: 4, location_name: "Secunderabad Central Hub (Return)", latitude: 17.4399, longitude: 78.4983, action: "DEPOT_RETURN", demand_kg: 0, eta_mins: 11.2 }
              ]
            }
          ];

          return validRoutes.map((plan, idx) => {
            if (!plan || !Array.isArray(plan.waypoints) || plan.waypoints.length < 2) return null;
            const validWps = plan.waypoints.filter(
              (wp) => wp && wp.latitude != null && !isNaN(Number(wp.latitude)) && wp.longitude != null && !isNaN(Number(wp.longitude))
            );
            if (validWps.length < 2) return null;

            const pointsStr = validWps
              .map((wp) => {
                const p = project(Number(wp.latitude), Number(wp.longitude));
                return `${p.x},${p.y}`;
              })
              .join(" ");

            const strokeColor = idx % 2 === 0 ? "#38bdf8" : "#a855f7";
            const nodeFill = idx % 2 === 0 ? "#0284c7" : "#7e22ce";

            return (
              <g key={plan.id || `plan-${idx}`}>
                {/* Route Vector Polyline */}
                <polyline
                  points={pointsStr}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="4"
                  strokeDasharray="8,6"
                  opacity="0.85"
                  filter="url(#mapGlow)"
                />
                {/* Route Waypoint Nodes & Badges */}
                {validWps.map((wp, wIdx) => {
                  const pt = project(Number(wp.latitude), Number(wp.longitude));
                  const isDepot = wp.action?.includes("DEPOT");
                  const isDetour = wp.action?.includes("HAZARD") || wp.action?.includes("BYPASS");
                  const badgeColor = isDepot ? "#3b82f6" : isDetour ? "#f59e0b" : "#10b981";

                  return (
                    <g key={wIdx} className="cursor-pointer">
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isDepot ? "7" : "5"}
                        fill={badgeColor}
                        stroke="#0f172a"
                        strokeWidth="2"
                      />
                      <rect
                        x={pt.x - 30}
                        y={pt.y - 20}
                        width="60"
                        height="14"
                        rx="3"
                        fill="#090d16"
                        opacity="0.85"
                        stroke={badgeColor}
                        strokeWidth="0.8"
                      />
                      <text
                        x={pt.x}
                        y={pt.y - 10}
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8"
                        fontWeight="bold"
                        fontFamily="monospace"
                        className="pointer-events-none select-none"
                      >
                        {wp.sequence ? `Stop #${wp.sequence}` : `WP ${wIdx + 1}`}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          });
        })()}

        {/* Layer 8: RELIEF DEPOTS */}
        {(reliefCenters || []).map((depot) => {
          const pt = project(depot.latitude, depot.longitude);
          return (
            <g
              key={depot.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setActiveItem({ type: "DEPOT", data: depot })}
            >
              <circle cx={pt.x} cy={pt.y} r="24" fill="#1e3a8a" opacity="0.3" />
              <circle cx={pt.x} cy={pt.y} r="14" fill="#2563eb" stroke="#93c5fd" strokeWidth="2.5" />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                HQ
              </text>
              <rect x={pt.x - 55} y={pt.y + 18} width="110" height="18" rx="4" fill="#0f172a" opacity="0.9" />
              <text x={pt.x} y={pt.y + 30} textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold" fontFamily="monospace">
                {(depot.name || "Relief Depot").slice(0, 16)}..
              </text>
            </g>
          );
        })}

        {/* Layer 9: SOS EMERGENCY BEACONS */}
        {(sosRequests || []).map((sos) => {
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
                <circle cx={pt.x} cy={pt.y} r="20" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.7" className="animate-ping" />
              )}
              {isSelected && (
                <circle cx={pt.x} cy={pt.y} r="26" fill="none" stroke="#38bdf8" strokeWidth="3" strokeDasharray="4,2" />
              )}
              <circle cx={pt.x} cy={pt.y} r="11" fill={pinColor} stroke="#ffffff" strokeWidth="2" />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black">
                {sos.people_count || 1}
              </text>
            </g>
          );
        })}

        {/* Layer 10: FLEET VEHICLES */}
        {(vehicles || []).map((v) => {
          const pt = project(v.current_lat, v.current_lon);
          return (
            <g
              key={v.id}
              className="cursor-pointer transition-transform hover:scale-125"
              onClick={() => setActiveItem({ type: "VEHICLE", data: v })}
            >
              <rect x={pt.x - 12} y={pt.y - 12} width="24" height="24" rx="6" fill="#047857" stroke="#6ee7b7" strokeWidth="2" />
              <text x={pt.x} y={pt.y + 4} textAnchor="middle" fill="#ffffff" fontSize="11">
                🚚
              </text>
              <text x={pt.x} y={pt.y + 24} textAnchor="middle" fill="#6ee7b7" fontSize="8" fontWeight="bold" fontFamily="monospace">
                {(v.vehicle_code || "V-01").slice(-6)}
              </text>
            </g>
          );
        })}

        {/* Layer 11: USER REAL-TIME GPS LOCATION MARKER */}
        {showGPS && (
          <g
            className="cursor-pointer"
            onClick={() => setActiveItem({ type: "USER", data: userCoords })}
          >
            {/* Accuracy Radius Circle */}
            <circle
              cx={userPt.x}
              cy={userPt.y}
              r="40"
              fill="#38bdf8"
              opacity="0.12"
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="4,4"
            />
            {/* Pulsing Radar Ring */}
            <circle
              cx={userPt.x}
              cy={userPt.y}
              r="22"
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
              opacity="0.7"
              className="animate-ping"
            />
            {/* Solid GPS Core */}
            <circle cx={userPt.x} cy={userPt.y} r="10" fill="#0284c7" stroke="#ffffff" strokeWidth="3" />
            <circle cx={userPt.x} cy={userPt.y} r="4" fill="#ffffff" />

            {/* Badge */}
            <rect x={userPt.x - 65} y={userPt.y - 36} width="130" height="22" rx="6" fill="#0369a1" opacity="0.95" stroke="#bae6fd" strokeWidth="1" />
            <text x={userPt.x} y={userPt.y - 21} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="black" fontFamily="monospace">
              📍 YOU ARE HERE ({userCoords.isLive ? "LIVE GPS" : "SIMULATED"})
            </text>
          </g>
        )}
      </svg>

      {/* Floating Tactical Inspector Card */}
      {activeItem && (
        <div className="absolute bottom-4 right-4 z-30 w-88 bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 border border-slate-700 shadow-2xl text-xs animate-in fade-in slide-in-from-bottom-2 max-w-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
            <div className="flex items-center space-x-2">
              {activeItem.type === "USER" && <Crosshair className="w-4 h-4 text-cyan-400" />}
              {activeItem.type === "CYCLONE" && <Wind className="w-4 h-4 text-amber-400" />}
              {activeItem.type === "WAVE" && <Waves className="w-4 h-4 text-cyan-400" />}
              {activeItem.type === "AQI" && <Gauge className="w-4 h-4" style={{ color: environmentalData.aqi.color }} />}
              {activeItem.type === "HAZARD_ZONE" && <AlertTriangle className="w-4 h-4 text-red-500" />}
              {activeItem.type === "SOS" && <ShieldAlert className="w-4 h-4 text-red-500" />}
              {activeItem.type === "DEPOT" && <MapPin className="w-4 h-4 text-blue-500" />}
              {activeItem.type === "VEHICLE" && <Truck className="w-4 h-4 text-emerald-500" />}
              {activeItem.type === "CAUSEWAY_BRIDGE" && <AlertTriangle className="w-4 h-4 text-red-400" />}
              {activeItem.type === "FLYOVER_BRIDGE" && <Navigation className="w-4 h-4 text-cyan-400" />}
              {activeItem.type === "MUSI_RIVER" && <Droplets className="w-4 h-4 text-blue-400" />}

              <span className="font-bold uppercase tracking-wider text-white text-xs">
                {activeItem.type === "USER"
                  ? "Real-Time User Location"
                  : activeItem.type === "CYCLONE"
                    ? "Cyclone Atmospheric Vortex"
                    : activeItem.type === "WAVE"
                      ? "Ocean Wave & Surge Telemetry"
                      : activeItem.type === "AQI"
                        ? "Air Quality Index (AQI)"
                        : activeItem.type === "HAZARD_ZONE"
                          ? "Hazard Zone Perimeter"
                          : activeItem.type === "SOS"
                            ? "Distress Incident"
                            : activeItem.type === "DEPOT"
                              ? "Relief Base Depot"
                              : activeItem.type === "VEHICLE"
                                ? "Relief Fleet Unit"
                                : activeItem.type === "CAUSEWAY_BRIDGE"
                                  ? "Musi Causeway Bridge Status"
                                  : activeItem.type === "FLYOVER_BRIDGE"
                                    ? "Elevated Flyover Detour Route"
                                    : "Musi River Hydration Corridor"}
              </span>
            </div>
            <button
              onClick={() => setActiveItem(null)}
              className="text-slate-400 hover:text-white px-2 py-0.5 rounded hover:bg-slate-800"
            >
              ✕
            </button>
          </div>

          {/* USER LIVE GPS INSPECTOR */}
          {activeItem.type === "USER" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Positioning Mode:</span>
                <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[10px] font-bold border border-blue-800">
                  {activeItem.data.isLive ? "HARDWARE HIGH-PRECISION GPS" : "DEFAULT DISASTER ZONE COORDS"}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Coordinates:</span>
                <span className="text-cyan-400 font-bold">{activeItem.data.lat.toFixed(4)}°N, {activeItem.data.lon.toFixed(4)}°E</span>
              </div>
              {activeItem.data.accuracy && (
                <div className="flex justify-between items-center font-mono">
                  <span className="text-slate-400">Accuracy Radius:</span>
                  <span className="text-emerald-400">±{activeItem.data.accuracy.toFixed(1)} meters</span>
                </div>
              )}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div className="font-bold text-white">Live Environmental Conditions:</div>
                <div>• Air Quality: <span style={{ color: environmentalData.aqi.color }}>AQI {environmentalData.aqi.value}</span> ({environmentalData.aqi.label})</div>
                <div>• Coastal Surge Risk: <span className="text-cyan-400 font-bold">{environmentalData.marine.tidalSurgeRisk}</span></div>
                <div>• Dist. to Cyclone Eye: <span className="text-amber-400 font-mono font-bold">{environmentalData.cyclone.distanceToEye_km} km</span></div>
              </div>
            </div>
          )}

          {/* CYCLONE INSPECTOR */}
          {activeItem.type === "CYCLONE" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Storm System:</span>
                <span className="font-bold text-white">{activeItem.data.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Category:</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-mono text-[10px] font-bold border border-amber-800">
                  {activeItem.data.category}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Sustained Wind Speed:</span>
                <span className="text-red-400 font-black text-sm">{activeItem.data.windSpeed_kmh} km/h (Gusts: {activeItem.data.windGusts_kmh})</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Barometric Pressure:</span>
                <span className="text-amber-400 font-bold">{activeItem.data.centralPressure_hpa} hPa</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Storm Surge Height:</span>
                <span className="text-cyan-400 font-bold">{activeItem.data.stormSurge_m} meters</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Gale Radius:</span>
                <span className="text-white font-mono">{activeItem.data.radiusOfGale_km} km</span>
              </div>
              <div className="p-2 rounded bg-amber-950/40 border border-amber-900/60 text-[11px] text-amber-200">
                ⚠ Advisory: High shear cyclonic gusts capable of uprooting power lines and destabilizing high-profile transit vehicles.
              </div>
            </div>
          )}

          {/* OCEAN WAVE INSPECTOR */}
          {activeItem.type === "WAVE" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Wave Condition:</span>
                <span className="font-bold text-cyan-300">{activeItem.data.waveCondition}</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Significant Wave Height:</span>
                <span className="text-cyan-400 font-black text-sm">{activeItem.data.waveHeight_m} meters</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Swell Period:</span>
                <span className="text-white font-bold">{activeItem.data.wavePeriod_s} seconds</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Tidal Surge Threat:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${activeItem.data.tidalSurgeRisk === "EXTREME"
                  ? "bg-red-950 text-red-400 border border-red-800 animate-pulse"
                  : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                  }`}>
                  {activeItem.data.tidalSurgeRisk}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Surface Water Temp:</span>
                <span className="font-mono text-slate-300">{activeItem.data.waterTemp_c}°C</span>
              </div>
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-900/60 text-[11px] text-cyan-200">
                🌊 Coastal Inundation Watch: Tidal surge exceeds astronomical high tide by +2.1m. Fishermen and coastal residences advised to evacuate inland.
              </div>
            </div>
          )}

          {/* AQI INSPECTOR */}
          {activeItem.type === "AQI" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AQI Index Value:</span>
                <span className="font-black text-base font-mono" style={{ color: activeItem.data.color }}>
                  {activeItem.data.value}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Category:</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold" style={{ backgroundColor: activeItem.data.color + "25", color: activeItem.data.color, border: `1px solid ${activeItem.data.color}80` }}>
                  {activeItem.data.label}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[10px] text-slate-300">
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">PM2.5: {activeItem.data.pm2_5} µg/m³</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">PM10: {activeItem.data.pm10} µg/m³</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">NO₂: {activeItem.data.no2} ppb</div>
                <div className="p-1.5 rounded bg-slate-950 border border-slate-800">O₃: {activeItem.data.o3} µg/m³</div>
              </div>
              <p className="text-[11px] text-slate-300 p-2 rounded bg-slate-950/80 border border-slate-800 italic">
                "{activeItem.data.advisory}"
              </p>
            </div>
          )}

          {/* HAZARD ZONE INSPECTOR */}
          {activeItem.type === "HAZARD_ZONE" && (
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">{activeItem.data.name}</div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Hazard Classification:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${activeItem.data.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400"
                  }`}>
                  {activeItem.data.severity} ({activeItem.data.hazardType})
                </span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Submersion Depth:</span>
                <span className="text-red-400 font-bold">{activeItem.data.inundationDepth_ft} feet</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Affected Population:</span>
                <span className="text-amber-400 font-bold">{activeItem.data.affectedPopulation} Citizens</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Evacuation Status:</span>
                <span className="text-red-400 font-bold font-mono">
                  {activeItem.data.evacuationMandatory ? "MANDATORY EVACUATION" : "VOLUNTARY RELOCATION"}
                </span>
              </div>
              <div className="p-2 rounded bg-red-950/40 border border-red-900/60 text-[11px] text-red-200">
                ⛔ Ray-casting Obstacle: This polygon is flagged as IMPASSABLE for ground fleet. Vehicle routes automatically bypass this zone.
              </div>
            </div>
          )}

          {/* SOS BEACON INSPECTOR */}
          {activeItem.type === "SOS" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Victim:</span>
                <span className="font-semibold text-white">{activeItem.data.victim_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Trapped Headcount:</span>
                <span className="font-bold text-amber-400">{activeItem.data.people_count} People</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">AI Urgency Score:</span>
                <span className={`px-2 py-0.5 rounded font-black ${activeItem.data.urgency_score >= 80 ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400"
                  }`}>
                  {activeItem.data.urgency_score} / 100 ({activeItem.data.urgency_level})
                </span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Contact:</span>
                <span className="text-slate-300">{activeItem.data.contact_phone}</span>
              </div>
              <p className="text-slate-300 bg-slate-950/80 p-2 rounded border border-slate-800 text-[11px] italic">
                "{activeItem.data.description || "Immediate emergency aid needed."}"
              </p>
            </div>
          )}

          {/* DEPOT INSPECTOR */}
          {activeItem.type === "DEPOT" && (
            <div className="space-y-2">
              <div className="font-semibold text-white">{activeItem.data.name}</div>
              <div className="text-slate-400">{activeItem.data.location_name}</div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span>Safe Shelter Capacity:</span>
                <span className="font-bold">{activeItem.data.current_occupancy} / {activeItem.data.capacity_people}</span>
              </div>
              <div className="text-slate-400 text-[11px] font-mono">
                GPS: {Number(activeItem.data.latitude || 17.3850).toFixed(4)}, {Number(activeItem.data.longitude || 78.4867).toFixed(4)}
              </div>
            </div>
          )}

          {/* VEHICLE INSPECTOR */}
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
                <span className="font-semibold text-cyan-400 font-mono">{activeItem.data.capacity_kg} kg</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Assigned Driver:</span>
                <span>{activeItem.data.assigned_driver || "Active Pilot"}</span>
              </div>
            </div>
          )}

          {/* CAUSEWAY BRIDGE INSPECTOR */}
          {activeItem.type === "CAUSEWAY_BRIDGE" && (
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">{activeItem.data.name}</div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Operational Status:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  activeItem.data.isSubmerged
                    ? "bg-red-950 text-red-400 border border-red-800 animate-pulse"
                    : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}>
                  {activeItem.data.status}
                </span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Current Flood Depth:</span>
                <span className="text-cyan-400 font-bold">{activeItem.data.depth.toFixed(1)} feet</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Crest Submergence Threshold:</span>
                <span className="text-amber-400 font-bold">{activeItem.data.threshold.toFixed(1)} feet</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Elevation Clearance:</span>
                <span className={activeItem.data.isSubmerged ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                  {activeItem.data.elevationClearance} feet
                </span>
              </div>
              <div className={`p-2 rounded text-[11px] leading-snug border ${
                activeItem.data.isSubmerged
                  ? "bg-red-950/40 border-red-900/60 text-red-200"
                  : "bg-emerald-950/40 border-emerald-900/60 text-emerald-200"
              }`}>
                {activeItem.data.isSubmerged
                  ? "⛔ Ray-Casting Obstacle: Water has crested over the bridge deck. Autonomous fleet vehicles are automatically rerouted via the Chaderghat Elevated Flyover."
                  : "✓ Safe Corridor: Water level is below the bridge deck. Direct transit permitted for all emergency response craft."}
              </div>
            </div>
          )}

          {/* FLYOVER BRIDGE INSPECTOR */}
          {activeItem.type === "FLYOVER_BRIDGE" && (
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">{activeItem.data.name}</div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Corridor Clearance:</span>
                <span className="text-cyan-400 font-bold font-mono">22.0 ft (6.7m) High Clearance</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Flood Inundation Immunity:</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  100% ELEVATED SAFE HAVEN
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Autonomous Ray-Casting Status:</span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  PRIMARY ALL-WEATHER DETOUR
                </span>
              </div>
              <div className="p-2 rounded bg-cyan-950/40 border border-cyan-900/60 text-[11px] text-cyan-200 leading-snug">
                🛡️ All-Weather Bypass: Elevated flyover structures remain completely operational during all cyclone & flood inundation levels up to 6.0 ft.
              </div>
            </div>
          )}

          {/* MUSI RIVER INSPECTOR */}
          {activeItem.type === "MUSI_RIVER" && (
            <div className="space-y-2">
              <div className="font-bold text-white text-sm">Musi River Hydration & Surge Corridor</div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Simulated Surge Depth:</span>
                <span className="text-red-400 font-black text-sm">{activeItem.data.depth.toFixed(1)} feet</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Inundated Basin Area:</span>
                <span className="text-amber-400 font-bold">{activeItem.data.inundatedAreaKm2} km²</span>
              </div>
              <div className="flex justify-between items-center font-mono">
                <span className="text-slate-400">Population at Flood Risk:</span>
                <span className="text-white font-bold">{activeItem.data.populationAtRisk.toLocaleString()} Citizens</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Low-Level Causeways Submerged:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  activeItem.data.isSubmerged ? "bg-red-950 text-red-400 border border-red-800 animate-pulse" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                }`}>
                  {activeItem.data.isSubmerged ? "1 / 1 SUBMERGED (BREACH)" : "0 / 1 SUBMERGED (CLEAR)"}
                </span>
              </div>
              <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 leading-snug">
                🌊 Telemetry: Inundation spreads northward into lowlands as water depth rises from 1.0 ft to 6.0 ft. Use the slider to view ray-casting avoidance in action.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Status Ticker */}
      <div className="absolute bottom-3 left-4 z-20 flex items-center space-x-2 text-[10px] font-mono text-slate-400 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>LIVE TELEMETRY SYNCED</span>
        <span>•</span>
        <span>GPS: {centerLat.toFixed(4)}°N, {centerLon.toFixed(4)}°E</span>
        <span>•</span>
        <span>CYCLONE: {environmentalData.cyclone.category}</span>
        <span>•</span>
        <span>WAVES: {environmentalData.marine.waveHeight_m}m</span>
      </div>

    </div>
  );
}
