"use client";

import React, { useState } from "react";
import {
  Flame,
  AlertTriangle,
  MapPin,
  Radio,
  Plus,
  CheckCircle,
  Eye,
  Layers,
  ArrowRight
} from "lucide-react";
import InteractiveMap from "../../../components/InteractiveMap";
import { MOCK_RELIEF_CENTERS, MOCK_VEHICLES, MOCK_SOS } from "../../../lib/api";

export default function DisasterDashboardPage() {
  const [disasters, setDisasters] = useState([
    {
      id: "DIS-01",
      name: "Cyclone Vardah & Storm Surge",
      type: "FLOOD",
      severity: "CRITICAL",
      status: "ACTIVE",
      epicenter: "13.0827°N, 80.2707°E",
      affected_villages: ["Kotturpuram", "T. Nagar Basin", "Kasimedu Coastal Belt"],
      declared_at: "Today, 06:00 AM"
    },
    {
      id: "DIS-02",
      name: "Cuddalore Coastal Depression",
      type: "CYCLONE",
      severity: "HIGH",
      status: "ALERT",
      epicenter: "11.7480°N, 79.7714°E",
      affected_villages: ["Silver Beach Sector", "Port Quarters"],
      declared_at: "Yesterday"
    }
  ]);

  const [name, setName] = useState("");
  const [type, setType] = useState("FLOOD");
  const [severity, setSeverity] = useState("CRITICAL");
  const [district, setDistrict] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateDisaster = (e: React.FormEvent) => {
    e.preventDefault();
    const newDis = {
      id: `DIS-0${disasters.length + 1}`,
      name: name || "Urban Monsoon Flood Event",
      type,
      severity,
      status: "ACTIVE",
      epicenter: "13.0600°N, 80.2500°E",
      affected_villages: district ? district.split(",").map((s) => s.trim()) : ["Sector 1", "Sector 2"],
      declared_at: "Just now"
    };
    setDisasters([newDis, ...disasters]);
    setShowCreateModal(false);
    setName("");
    setDistrict("");
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-red-400 mb-1">
            <Flame className="w-4 h-4" />
            <span>DISASTER MANAGEMENT AUTHORITY // INCIDENT MONITORING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Disaster Monitoring & Hazard Zone Command</h1>
          <p className="text-xs text-slate-400 mt-1">
            Declare disaster events, configure impacted zones, mark impassable red corridors & broadcast emergency alerts.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Disaster Event</span>
        </button>
      </div>

      {/* Interactive GIS Situational Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Layers className="w-5 h-5 text-red-500" />
            <span>Active Hazard Zones & Impacted Sectors (PostGIS Spatial Overlay)</span>
          </h2>
          <span className="text-xs font-mono text-red-400 font-semibold animate-pulse">
            ● RED ZONE: ADYAR BASIN IMPASSABLE
          </span>
        </div>

        <InteractiveMap
          reliefCenters={MOCK_RELIEF_CENTERS}
          vehicles={MOCK_VEHICLES}
          sosRequests={MOCK_SOS}
        />
      </div>

      {/* Active Disaster Events List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Declared Disaster Incidents Table</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {disasters.map((d) => (
            <div key={d.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400">{d.id} • {d.type}</span>
                  <h3 className="font-bold text-white text-base">{d.name}</h3>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                  d.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400"
                }`}>
                  {d.severity}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Epicenter Coordinates:</span>
                  <span className="font-mono text-white">{d.epicenter}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Declared At:</span>
                  <span>{d.declared_at}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">Affected Villages / Sectors:</div>
                <div className="flex flex-wrap gap-1.5">
                  {d.affected_villages.map((v) => (
                    <span key={v} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[11px] text-slate-300">
                      📍 {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Disaster Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span>Declare Emergency Disaster Incident</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDisaster} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Incident Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flash Flood in Kanchipuram District"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Hazard Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="FLOOD">FLOOD</option>
                    <option value="CYCLONE">CYCLONE</option>
                    <option value="EARTHQUAKE">EARTHQUAKE</option>
                    <option value="LANDSLIDE">LANDSLIDE</option>
                    <option value="WILDFIRE">WILDFIRE</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                  >
                    <option value="CRITICAL">CRITICAL (DEFCON-1)</option>
                    <option value="HIGH">HIGH RISK</option>
                    <option value="MODERATE">MODERATE</option>
                    <option value="LOW">ADVISORY</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Affected Villages / Wards (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Village Alpha, Ward 4, Riverside Hamlet"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider"
                >
                  Declare Disaster
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

