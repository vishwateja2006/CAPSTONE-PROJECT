"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Wind,
  Waves,
  MapPin,
  Cpu,
  Radio,
  Clock,
  Sparkles
} from "lucide-react";

export default function ActiveIncidentBanner() {
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="region"
      aria-label="Active Disaster Operational Ribbon"
      className="w-full bg-gradient-to-r from-red-950/90 via-slate-950 to-slate-950 border-b border-red-900/50 text-slate-200 text-xs shadow-inner shadow-red-950/30 overflow-x-auto scrollbar-none"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 py-2 flex items-center justify-between gap-4 min-w-max">
        
        {/* Left: Pulsing DEFCON-1 Beacon & Incident Code */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="px-2 py-0.5 rounded font-black font-mono text-[10px] tracking-wider uppercase bg-red-600 text-white shadow-sm shadow-red-600/40">
              🔴 DEFCON-1 CRITICAL
            </span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center space-x-1.5 font-mono font-bold text-white text-[11px] sm:text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>INCIDENT: <span className="text-amber-300">DIS-CHENNAI-FLOOD-2026</span></span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          {/* Target Sector */}
          <div className="hidden sm:flex items-center space-x-1 text-slate-300 text-[11px] sm:text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span>SECTOR: <span className="text-white">ADYAR &amp; VELACHERY LOWLANDS</span></span>
          </div>
        </div>

        {/* Center & Right: Meteorological Telemetry & AI Model Synchronization */}
        <div className="flex items-center space-x-3 text-[11px] sm:text-xs">
          {/* Weather Telemetry */}
          <div className="flex items-center space-x-2 text-slate-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
            <Wind className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>WEATHER: <strong className="text-white font-medium">Category 4 Surge • Wind 62 km/h • Flood Depth +3.2ft</strong></span>
          </div>

          <span className="text-slate-700">|</span>

          {/* AI Decision Engine Synchronization */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>5/5 AI Models Synchronized</span>
          </div>

          {/* Live Zulu / Local Time */}
          {mounted && currentTime && (
            <div className="hidden lg:flex items-center space-x-1 font-mono text-[10px] text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800/80">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>LIVE: {currentTime} IST</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
