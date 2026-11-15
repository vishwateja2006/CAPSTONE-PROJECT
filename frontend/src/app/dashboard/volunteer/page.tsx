"use client";

import React, { useState } from "react";
import {
  UserCheck,
  CheckCircle2,
  MapPin,
  Clock,
  Camera,
  AlertTriangle,
  Send,
  Navigation,
  FileCheck,
  Wifi,
  WifiOff
} from "lucide-react";

export default function VolunteerDashboardPage() {
  const [assignedStops, setAssignedStops] = useState([
    {
      sequence: 1,
      name: "Central Base Alpha (Depot Staging)",
      action: "DEPOT_START",
      address: "Jawaharlal Nehru Stadium Complex",
      eta: "08:00 AM",
      status: "COMPLETED",
      items: "Loaded 600kg Food & Water"
    },
    {
      sequence: 2,
      name: "SOS: Senior Care Home (12 Residents)",
      action: "DELIVER_AID",
      address: "Moosarambagh Old Age Ward, Hyderabad",
      eta: "+16 mins",
      status: "PENDING",
      items: "3x Medical Kits, 24x 5L Water Cans"
    },
    {
      sequence: 3,
      name: "SOS: Kavitha & Infant (4 Trapped)",
      action: "DELIVER_AID",
      address: "12 Musi Causeway Road, Chaderghat Lowlands, Hyderabad",
      eta: "+28 mins",
      status: "PENDING",
      items: "4x Food Packs, 8x Water Cans, Insulin Kit"
    },
    {
      sequence: 4,
      name: "Secunderabad Central Hub (Return Journey)",
      action: "DEPOT_RETURN",
      address: "Gymkhana Grounds Complex, Secunderabad, Telangana",
      eta: "+42 mins",
      status: "PENDING",
      items: "Debrief & Vehicle Inspection"
    }
  ]);

  const [activeStop, setActiveStop] = useState<any | null>(null);
  const [recipientSignature, setRecipientSignature] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [hazardLocation, setHazardLocation] = useState("");
  const [hazardSeverity, setHazardSeverity] = useState("ROAD_BLOCKED");
  const [hazardSuccess, setHazardSuccess] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const handleConfirmDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStop) return;

    setAssignedStops((prev) =>
      prev.map((stop) =>
        stop.sequence === activeStop.sequence
          ? { ...stop, status: "COMPLETED" }
          : stop
      )
    );
    setActiveStop(null);
    setRecipientSignature("");
    setDeliveryNotes("");
  };

  const handleReportHazard = (e: React.FormEvent) => {
    e.preventDefault();
    setHazardSuccess(true);
    setTimeout(() => {
      setHazardSuccess(false);
      setHazardLocation("");
    }, 4000);
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 mb-1">
            <UserCheck className="w-4 h-4" />
            <span>FIELD OPERATIONS // RAPID VOLUNTEER DISPATCH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Field Agent & Volunteer Mission Console</h1>
          <p className="text-xs text-slate-400 mt-1">
            Execute turn-by-turn aid deliveries, record photo proof-of-delivery & report real-time ground road obstacles.
          </p>
        </div>

        {/* Offline Sync State Pill */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <button
            onClick={() => setIsOffline(!isOffline)}
            className={`px-3 py-1.5 rounded-xl border flex items-center space-x-1.5 transition-all ${isOffline
              ? "bg-amber-950/80 border-amber-600 text-amber-300"
              : "bg-emerald-950/80 border-emerald-800 text-emerald-400"
              }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isOffline ? "OFFLINE BUFFER (5 QUEUED)" : "SYNCED TO SUPABASE"}</span>
          </button>
        </div>
      </div>

      {hazardSuccess && (
        <div className="p-4 rounded-2xl bg-amber-950/90 border border-amber-600 text-amber-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span className="font-bold">Ground obstacle broadcasted! CVRP Routing solver rerouting active fleet around obstacle.</span>
          </div>
          <button onClick={() => setHazardSuccess(false)} className="text-amber-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (2 Cols): Assigned Waypoint Route Checklist */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Navigation className="w-5 h-5 text-blue-400" />
              <h2 className="text-base font-bold text-white">Active Delivery Mission Stops (Vehicle: RESCUE-TRUCK-01)</h2>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-semibold">4 STOPS ASSIGNED</span>
          </div>

          <div className="space-y-3">
            {assignedStops.map((stop) => {
              const isDone = stop.status === "COMPLETED";
              return (
                <div
                  key={stop.sequence}
                  className={`p-4 rounded-2xl border transition-all ${isDone
                    ? "bg-slate-900/40 border-slate-800/60 opacity-80"
                    : "bg-slate-900/90 border-slate-800 hover:border-amber-500/50"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-3">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${isDone ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-blue-950 text-blue-400 border border-blue-800"
                        }`}>
                        {isDone ? "✓" : stop.sequence}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{stop.name}</h3>
                        <p className="text-xs text-slate-400">{stop.address}</p>
                        <div className="mt-1 text-[11px] text-cyan-400 font-mono">📦 {stop.items}</div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0 space-y-1">
                      <div className="text-xs font-mono text-slate-400 font-semibold">{stop.eta}</div>
                      {isDone ? (
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                          COMPLETED
                        </span>
                      ) : (
                        <button
                          onClick={() => setActiveStop(stop)}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          Confirm Delivery
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (1 Col): Report Ground Obstacle / Road Blockage */}
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <div>
                <h3 className="font-bold text-sm text-white">Report Ground Road Blockage</h3>
                <p className="text-[11px] text-slate-400">Updates the CVRP route avoidance graph</p>
              </div>
            </div>

            <form onSubmit={handleReportHazard} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Location / Landmark Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bridge on Anna Salai flooded 3ft deep"
                  value={hazardLocation}
                  onChange={(e) => setHazardLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Obstacle Severity</label>
                <select
                  value={hazardSeverity}
                  onChange={(e) => setHazardSeverity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
                >
                  <option value="ROAD_BLOCKED">ROAD IMPASSABLE (Flooded / Debris)</option>
                  <option value="SLOW_TRANSIT">HEAVY WATERLOGGING (4x4 Only)</option>
                  <option value="BRIDGE_CLOSED">BRIDGE STRUCTURALLY COMPROMISED</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-wider text-xs shadow-md shadow-red-600/30"
              >
                Broadcast Hazard Alert
              </button>
            </form>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline Edge Synchronization</span>
            </div>
            <p className="text-[11px]">
              If network drops in flooded areas, all signatures and delivery timestamps are persisted in IndexedDB and synchronized automatically when 4G re-engages.
            </p>
          </div>
        </div>

      </div>

      {/* Confirm Delivery Modal */}
      {activeStop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Confirm Delivery at Stop #{activeStop.sequence}</span>
              </h3>
              <button
                onClick={() => setActiveStop(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="font-bold text-white">{activeStop.name}</div>
                <div className="text-slate-400">{activeStop.address}</div>
                <div className="text-cyan-400 font-mono text-[11px] pt-1">📦 {activeStop.items}</div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Recipient Signature / Sign-off Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Babu (Care Home Supervisor)"
                  value={recipientSignature}
                  onChange={(e) => setRecipientSignature(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Delivery Photo Proof (Simulated Capture)</label>
                <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950 text-center text-slate-400 space-y-1">
                  <Camera className="w-6 h-6 mx-auto text-slate-500" />
                  <div className="text-[11px]">Click to upload delivery verification photo</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveStop(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider"
                >
                  Sign & Complete Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

