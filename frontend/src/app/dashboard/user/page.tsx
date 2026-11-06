"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Radio,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Map,
  ShieldCheck,
  Package,
  Droplet,
  HeartPulse,
  Truck,
  ArrowRight
} from "lucide-react";
import { submitSOS } from "../../../lib/api";

export default function UserPortalPage() {
  const [activeTab, setActiveTab] = useState<"SOS" | "MY_REQUESTS" | "RELIEF_CAMPS">("SOS");

  // Citizen SOS Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [headcount, setHeadcount] = useState(3);
  const [description, setDescription] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["FOOD", "WATER"]);
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSignal, setSubmittedSignal] = useState<any | null>(null);

  // User's active requests
  const [userRequests, setUserRequests] = useState([
    {
      id: "SOS-8491",
      family_count: 4,
      needs: ["FOOD", "WATER", "MEDICAL"],
      vulnerabilities: ["Infant (8mo)", "Diabetic Mother"],
      address: "12 Canal Bank Road, Kotturpuram",
      status: "DISPATCHED",
      urgency_score: 92.0,
      eta: "15 mins",
      assigned_vehicle: "TRUCK-4x4-ALPHA",
      created_at: "25 mins ago"
    },
    {
      id: "SOS-7210",
      family_count: 2,
      needs: ["WATER", "SHELTER"],
      vulnerabilities: ["Elderly (72yo)"],
      address: "T. Nagar Ward 12",
      status: "DELIVERED",
      urgency_score: 74.0,
      eta: "Delivered",
      assigned_vehicle: "TRUCK-RESCUE-BETA",
      created_at: "2 hours ago"
    }
  ]);

  // Relief Camps list
  const reliefCamps = [
    {
      name: "Central Emergency Relief Base Alpha",
      location: "Jawaharlal Nehru Stadium Complex",
      distance: "1.8 km away",
      capacity: "2,500 people",
      occupancy: "450 sheltered",
      status: "OPEN",
      available_items: ["Clean Water", "Food Packs", "First Aid", "Blankets"],
      phone: "+91-9444012345"
    },
    {
      name: "Forward Staging Depot B (South)",
      location: "Guindy Industrial Community Center",
      distance: "3.2 km away",
      capacity: "1,200 people",
      occupancy: "310 sheltered",
      status: "OPEN",
      available_items: ["Water Cans", "Ration Packs", "Doctor on Duty"],
      phone: "+91-9444056789"
    },
    {
      name: "Kasimedu Coastal Relief Camp",
      location: "Kasimedu Community Hall",
      distance: "4.5 km away",
      capacity: "800 people",
      occupancy: "620 sheltered",
      status: "NEAR CAPACITY",
      available_items: ["Dry Rations", "Chlorine Tablets"],
      phone: "+91-9444098765"
    }
  ];

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const toggleVulnerability = (v: string) => {
    setSelectedVulnerabilities((prev) =>
      prev.includes(v) ? prev.filter((item) => item !== v) : [...prev, v]
    );
  };

  const handleSubmitSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await submitSOS({
      victim_name: name || "Registered Citizen",
      contact_phone: phone || "+91-9876500000",
      latitude: 13.0650,
      longitude: 80.2550,
      address: address || "Residential Sector",
      people_count: headcount,
      special_needs: selectedVulnerabilities,
      category_needs: selectedNeeds,
      description
    });

    const newReq = {
      id: res.id || `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
      family_count: headcount,
      needs: selectedNeeds,
      vulnerabilities: selectedVulnerabilities.length > 0 ? selectedVulnerabilities : ["None flagged"],
      address: address || "Emergency Intake Sector",
      status: "PENDING",
      urgency_score: res.urgency_score || (selectedVulnerabilities.length > 0 ? 88.0 : 65.0),
      eta: "Calculating ETA",
      assigned_vehicle: "Assigning Fleet...",
      created_at: "Just now"
    };

    setUserRequests([newReq, ...userRequests]);
    setSubmittedSignal(res);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-8 py-2">
      
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/80 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Citizen & Beneficiary Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Emergency Relief & Aid Portal</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Broadcast emergency SOS reports, track your relief delivery in real-time, and locate nearby safe shelter camps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
          >
            <Map className="w-4 h-4 text-cyan-400" />
            <span>View Safe Shelter Map</span>
          </Link>
          <button
            onClick={() => {
              setActiveTab("SOS");
              setSubmittedSignal(null);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Send SOS Beacon</span>
          </button>
        </div>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("SOS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "SOS" ? "bg-red-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>1. Broadcast SOS Report</span>
        </button>

        <button
          onClick={() => setActiveTab("MY_REQUESTS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "MY_REQUESTS" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>2. Track My Aid Deliveries ({userRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RELIEF_CAMPS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${
            activeTab === "RELIEF_CAMPS" ? "bg-blue-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white"
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>3. Nearby Safe Shelters ({reliefCamps.length})</span>
        </button>
      </div>

      {/* TAB 1: SOS REPORT FORM */}
      {activeTab === "SOS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
          
          {/* Left 2 Cols: The SOS Broadcast Form */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                <span>Emergency Distress Intake Form</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Our AI model automatically scores medical and child vulnerability to ensure priority dispatch.
              </p>
            </div>

            {submittedSignal ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800 space-y-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-white">Emergency Signal Logged with Command Center</h3>
                  <p className="text-xs text-emerald-300 mt-1">
                    Your request ID is <b>{submittedSignal.id || "SOS-PENDING"}</b>. Relief units have been notified.
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("MY_REQUESTS")}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    Track Delivery Status
                  </button>
                  <button
                    onClick={() => setSubmittedSignal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    Send Another Report
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSOS} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Name / Household Head</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kavitha Sundaram"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Contact Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="+91-9840112233"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Detailed Location / Landmark</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12 Canal Bank Road, near Kotturpuram Bridge"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">People Trapped / With You</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={headcount}
                      onChange={(e) => setHeadcount(Number(e.target.value))}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold text-center"
                    />
                  </div>
                </div>

                {/* Critical Vulnerabilities */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-400">
                    ⚠ Flag Urgent Vulnerabilities (Increases Priority):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: "infant", label: "Infant / Baby (< 1yr)" },
                      { id: "elderly", label: "Elderly Citizen (65+)" },
                      { id: "pregnant", label: "Pregnant Female" },
                      { id: "insulin", label: "Diabetic / Needs Insulin" },
                      { id: "oxygen", label: "Needs Oxygen / Medical" },
                      { id: "injured", label: "Physical Trauma / Injury" },
                      { id: "wheelchair", label: "Disabled / Immobile" },
                      { id: "trapped", label: "Rooftop / Water Rising" }
                    ].map((vuln) => (
                      <button
                        key={vuln.id}
                        type="button"
                        onClick={() => toggleVulnerability(vuln.label)}
                        className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                          selectedVulnerabilities.includes(vuln.label)
                            ? "bg-red-950/80 border-red-500 text-red-300 shadow-md"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {vuln.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Aid Categories Needed */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Relief Aid Categories Required:</label>
                  <div className="flex flex-wrap gap-2">
                    {["WATER", "FOOD", "MEDICAL", "SHELTER", "EVACUATION"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleNeed(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          selectedNeeds.includes(cat)
                            ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Situation Description</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Water reached 4 feet on ground floor. We are on the roof. Baby needs formula milk urgently."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Transmitting Distress Signal..." : "Transmit Emergency SOS"}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: AI Triage Guidance Card */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>How ResQLink Prioritizes Aid</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Unlike traditional First-Come First-Served systems, ResQLink uses <b>Max-Min Mathematical Fairness</b>. 
                Every family is guaranteed hydration and calories, while urgent life-support items (insulin, infant milk, oxygen) are dispatched first.
              </p>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Critical Urgency (80-100):</span>
                  <span className="text-red-400 font-bold">&lt; 30 min dispatch</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>High Urgency (60-79):</span>
                  <span className="text-amber-400 font-bold">&lt; 60 min dispatch</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>Standard Aid:</span>
                  <span className="text-cyan-400 font-bold">Same day scheduled</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Helpline Contacts</span>
              <div className="text-xs text-slate-400 space-y-1">
                <div>State Disaster Control: <span className="font-mono text-cyan-400 font-bold">1070</span></div>
                <div>District Helpline: <span className="font-mono text-cyan-400 font-bold">1077</span></div>
                <div>Emergency Ambulance: <span className="font-mono text-cyan-400 font-bold">108</span></div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MY AID REQUESTS & STATUS */}
      {activeTab === "MY_REQUESTS" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>My Active Relief Requests & Delivery Tracking</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Real-time tracking of assigned delivery vehicles, estimated time of arrival, and Proof-of-Delivery status.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {userRequests.length} RECORDED SIGNALS
            </span>
          </div>

          <div className="space-y-4">
            {userRequests.map((req) => {
              const isDelivered = req.status === "DELIVERED";
              const isDispatched = req.status === "DISPATCHED";
              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isDelivered
                      ? "bg-emerald-950/20 border-emerald-900/80"
                      : isDispatched
                      ? "bg-cyan-950/20 border-cyan-800/80 shadow-md"
                      : "bg-slate-950 border-slate-800"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-black text-white text-base">{req.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${
                        isDelivered
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : isDispatched
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}>
                        STATUS: {req.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex items-center space-x-4">
                      <span>ETA: <b className="text-white">{req.eta}</b></span>
                      <span>{req.created_at}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">Location / Address:</span>
                      <div className="font-medium text-slate-200 mt-0.5">{req.address}</div>
                      <div className="text-slate-400 mt-0.5">{req.family_count} People</div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold">Special Vulnerabilities:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {req.vulnerabilities.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold">
                            ⚠ {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold">Assigned Fleet Mission:</span>
                      <div className="font-mono text-cyan-400 font-bold mt-0.5">{req.assigned_vehicle}</div>
                      <div className="text-[11px] text-slate-500">Urgency Score: {req.urgency_score}/100</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NEARBY RELIEF CAMPS */}
      {activeTab === "RELIEF_CAMPS" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>Verified Humanitarian Relief Depots & Shelters</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Official emergency bases offering hot meals, purified drinking water, medical tents, and dry shelter.
              </p>
            </div>
            <Link
              href="/map"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase"
            >
              Open Interactive GIS Map
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reliefCamps.map((camp, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">{camp.distance}</span>
                    <h3 className="font-bold text-white text-base mt-0.5">{camp.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">{camp.location}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    camp.status === "OPEN" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400"
                  }`}>
                    {camp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Occupancy:</span>
                    <span className="font-bold text-white">{camp.occupancy} / {camp.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-mono text-cyan-400">{camp.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Stocked Supplies:</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {camp.available_items.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium">
                        ✓ {item}
                      </span>
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

