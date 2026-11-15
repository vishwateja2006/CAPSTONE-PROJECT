"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import InteractiveMap from "../../components/InteractiveMap";
import {
  fetchSOSRequests,
  fetchReliefCenters,
  fetchVehicles,
  runRouteOptimization
} from "../../lib/api";
import {
  fetchLiveEnvironmentalData,
  EnvironmentalData,
  getAQICategory
} from "../../lib/environmentalTelemetry";
import { getAuthSession, AuthSession } from "../../lib/auth";
import { SOSRequest, ReliefCenter, ReliefVehicle, RoutePlan } from "../../types";
import {
  Map,
  Layers,
  Navigation,
  RefreshCw,
  Crosshair,
  Wind,
  Waves,
  Gauge,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Radio,
  CheckCircle2,
  Clock,
  Compass,
  MapPin,
  Sparkles,
  Info
} from "lucide-react";

export default function MapPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [reliefCenters, setReliefCenters] = useState<ReliefCenter[]>([]);
  const [vehicles, setVehicles] = useState<ReliefVehicle[]>([]);
  const [sosRequests, setSosRequests] = useState<SOSRequest[]>([]);
  const [routePlans, setRoutePlans] = useState<RoutePlan[]>([]);
  const [selectedSosId, setSelectedSosId] = useState<string | undefined>();
  const [isGeneratingRoutes, setIsGeneratingRoutes] = useState(false);

  // User Real-Time Location State
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lon: number;
    accuracy?: number;
    isLive: boolean;
    locationName: string;
  }>({
    lat: 17.3850,
    lon: 78.4867,
    isLive: false,
    locationName: "Musi River Basin / Hyderabad Central Hub"
  });
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Real-Time Environmental Telemetry State
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [isLoadingEnv, setIsLoadingEnv] = useState(true);

  // Check authentication & load operational relief data
  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login?redirect=/map");
      return;
    }
    setAuth(session);
    setIsCheckingAuth(false);

    async function initReliefData() {
      const [c, v, s] = await Promise.all([
        fetchReliefCenters(),
        fetchVehicles(),
        fetchSOSRequests()
      ]);
      setReliefCenters(c || []);
      setVehicles(v || []);
      setSosRequests(s || []);
    }
    initReliefData();
  }, [router]);

  // Request Real-Time Browser Geolocation
  const requestLiveGPS = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser hardware.");
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserCoords({
          lat: latitude,
          lon: longitude,
          accuracy,
          isLive: true,
          locationName: "My Live GPS Location"
        });
        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setGpsError(
          error.code === error.PERMISSION_DENIED
            ? "Location permission was denied. Falling back to active disaster sector."
            : "Unable to retrieve precise GPS coordinates. Using disaster sector fallback."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  // Fetch or update environmental telemetry whenever coordinates change
  useEffect(() => {
    let isMounted = true;
    async function loadTelemetry() {
      setIsLoadingEnv(true);
      const data = await fetchLiveEnvironmentalData(
        userCoords.lat,
        userCoords.lon,
        userCoords.locationName,
        userCoords.isLive,
        userCoords.accuracy
      );
      if (isMounted) {
        setEnvironmentalData(data);
        setIsLoadingEnv(false);
      }
    }
    loadTelemetry();

    // Auto-poll environmental telemetry every 30 seconds
    const interval = setInterval(loadTelemetry, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userCoords.lat, userCoords.lon, userCoords.locationName, userCoords.isLive, userCoords.accuracy]);

  // Request GPS once automatically on initial page mount
  useEffect(() => {
    requestLiveGPS();
  }, [requestLiveGPS]);

  // Compute Optimized CVRP Routes
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

  // Location Presets
  const setPresetLocation = (lat: number, lon: number, name: string) => {
    setUserCoords({
      lat,
      lon,
      isLive: false,
      locationName: name
    });
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-mono">Verifying GIS telemetry access privileges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Real-time Disaster Status Header */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-950 border border-blue-800 text-blue-400 font-mono text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Geospatial Radar & Natural Hazard Sensor</span>
            </span>

            {userCoords.isLive ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 font-mono text-xs font-bold flex items-center space-x-1">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Live GPS Synced (±{userCoords.accuracy?.toFixed(0) || 5}m)</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-medium">
                Active Disaster Sector (Simulated)
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Live Geospatial Map & Environmental Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Real-time GPS positioning, Air Quality Index (AQI) tracking, cyclone atmospheric vortex telemetry, ocean wave & tidal surge detection, and automated CVRP fleet navigation.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={requestLiveGPS}
            disabled={isLocating}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-cyan-600/30"
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Acquiring GPS..." : "Detect Live Location"}</span>
          </button>

          <button
            onClick={handleComputeRoutes}
            disabled={isGeneratingRoutes}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30"
          >
            <Navigation className={`w-4 h-4 ${isGeneratingRoutes ? "animate-spin" : ""}`} />
            <span>{isGeneratingRoutes ? "Routing Vehicles..." : "Draw CVRP Routes"}</span>
          </button>
        </div>
      </div>

      {/* GPS Error Alert if Denied */}
      {gpsError && (
        <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-900/70 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
          <button
            onClick={() => setGpsError(null)}
            className="text-amber-400 hover:text-white px-2 py-0.5 rounded font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Real-Time Environmental Telemetry Strip */}
      {environmentalData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Air Quality Index (AQI) */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-semibold uppercase flex items-center space-x-1.5">
                <Gauge className="w-4 h-4" style={{ color: environmentalData.aqi.color }} />
                <span>Air Quality Index</span>
              </span>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                style={{
                  backgroundColor: environmentalData.aqi.color + "25",
                  color: environmentalData.aqi.color,
                  border: `1px solid ${environmentalData.aqi.color}60`
                }}
              >
                {environmentalData.aqi.label}
              </span>
            </div>

            <div>
              <div className="text-3xl font-black font-mono" style={{ color: environmentalData.aqi.color }}>
                {environmentalData.aqi.value} <span className="text-xs text-slate-400 font-sans font-normal">US AQI</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                PM2.5: <b className="text-white">{environmentalData.aqi.pm2_5}</b> µg/m³ • PM10: <b className="text-white">{environmentalData.aqi.pm10}</b> µg/m³
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-300 italic leading-snug">
              "{environmentalData.aqi.advisory}"
            </div>
          </div>

          {/* Card 2: Cyclone Atmospheric Radar */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-semibold uppercase flex items-center space-x-1.5">
                <Wind className="w-4 h-4 text-amber-400" />
                <span>Cyclone Storm Radar</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-800 text-amber-300 font-mono text-[10px] font-bold">
                {environmentalData.cyclone.threatLevel} THREAT
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                {environmentalData.cyclone.windSpeed_kmh} <span className="text-xs text-slate-400 font-sans font-normal">km/h winds</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Pressure: <b className="text-white">{environmentalData.cyclone.centralPressure_hpa} hPa</b> • Gusts: <b className="text-red-400">{environmentalData.cyclone.windGusts_kmh} km/h</b>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-300 leading-snug">
              <span className="text-amber-300 font-bold">{environmentalData.cyclone.category}:</span> Eye {environmentalData.cyclone.distanceToEye_km} km away. Storm surge +{environmentalData.cyclone.stormSurge_m}m.
            </div>
          </div>

          {/* Card 3: Ocean Waves & Tidal Surge */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-semibold uppercase flex items-center space-x-1.5">
                <Waves className="w-4 h-4 text-cyan-400" />
                <span>Natural Wave & Swell</span>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                environmentalData.marine.tidalSurgeRisk === "EXTREME"
                  ? "bg-red-950 border border-red-800 text-red-400 animate-pulse"
                  : "bg-cyan-950 border border-cyan-800 text-cyan-300"
              }`}>
                {environmentalData.marine.tidalSurgeRisk} RISK
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-cyan-400 font-mono">
                {environmentalData.marine.waveHeight_m} <span className="text-xs text-slate-400 font-sans font-normal">meters</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Swell Period: <b className="text-white">{environmentalData.marine.wavePeriod_s}s</b> • Water Temp: <b className="text-white">{environmentalData.marine.waterTemp_c}°C</b>
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[10px] text-slate-300 leading-snug">
              <span className="text-cyan-300 font-bold">{environmentalData.marine.waveCondition}.</span> High surge breach warning active along coastal sectors.
            </div>
          </div>

          {/* Card 4: DEFCON Hazard Rating */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-xs font-semibold uppercase flex items-center space-x-1.5">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                <span>Composite Hazard Level</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-red-950 border border-red-800 text-red-400 font-mono text-[10px] font-black animate-pulse">
                DEFCON-{environmentalData.hazard.defconLevel}
              </span>
            </div>

            <div>
              <div className="text-3xl font-black text-red-400 font-mono">
                {environmentalData.hazard.compositeIndex}/100 <span className="text-xs text-slate-400 font-sans font-normal">Hazard Index</span>
              </div>
              <div className="text-[11px] text-red-300 mt-1 font-bold">
                {environmentalData.hazard.evacuationStatus}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-red-950/40 border border-red-900/60 text-[10px] text-red-200 leading-snug">
              Primary Threat: {environmentalData.hazard.primaryThreat}.
            </div>
          </div>

        </div>
      )}

      {/* Preset Location Quick Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs">
        <div className="flex items-center space-x-2 text-slate-400">
          <Compass className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">Geographic Sector Presets:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono">
          <button
            onClick={() => setPresetLocation(17.3780, 78.4910, "Musi River Flooded Causeway Basin")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            🌊 Musi River Basin (Flood Zone)
          </button>
          <button
            onClick={() => setPresetLocation(17.4399, 78.4983, "Secunderabad Central Humanitarian Hub")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
          >
            🏛️ Secunderabad Hub Alpha
          </button>
          <button
            onClick={() => setPresetLocation(17.4200, 78.4800, "Hussain Sagar Lake Spillway Surge")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-900/60 transition-all"
          >
            🌊 Hussain Sagar Spillway
          </button>
          <button
            onClick={() => setPresetLocation(17.4435, 78.3489, "Gachibowli Relief Staging Sector")}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-900/60 transition-all"
          >
            🏟️ Gachibowli Base Delta
          </button>
        </div>
      </div>

      {/* Main Interactive Vector GIS Map Component */}
      {environmentalData && (
        <InteractiveMap
          reliefCenters={reliefCenters}
          vehicles={vehicles}
          sosRequests={sosRequests}
          routePlans={routePlans}
          selectedSosId={selectedSosId}
          onSelectSos={(sos) => setSelectedSosId(sos.id)}
          environmentalData={environmentalData}
          userCoords={userCoords}
          onRecenterGPS={requestLiveGPS}
        />
      )}

      {/* Map Legend & Sector Information Strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs font-mono">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 flex-shrink-0 animate-ping"></span>
          <div>
            <div className="font-bold text-slate-200">User Real-Time GPS</div>
            <div className="text-slate-500 text-[10px]">Pulsing Location Radar</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse"></span>
          <div>
            <div className="font-bold text-slate-200">DEFCON-1 Red Zone</div>
            <div className="text-slate-500 text-[10px]">Submerged Flood Sector</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-amber-500 flex-shrink-0"></span>
          <div>
            <div className="font-bold text-slate-200">Cyclone Vortex Radar</div>
            <div className="text-slate-500 text-[10px]">Eye & Wind Isobars</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex-shrink-0"></span>
          <div>
            <div className="font-bold text-slate-200">Coastal Surge Waves</div>
            <div className="text-slate-500 text-[10px]">Tidal Swell Vectors</div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center space-x-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex-shrink-0"></span>
          <div>
            <div className="font-bold text-slate-200">Air Quality Plume</div>
            <div className="text-slate-500 text-[10px]">AQI Toxicity Heatmap</div>
          </div>
        </div>
      </div>

    </div>
  );
}
