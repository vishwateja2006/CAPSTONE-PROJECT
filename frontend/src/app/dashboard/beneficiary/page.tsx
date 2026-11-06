"use client";

import React, { useState } from "react";
import {
  Users,
  Radio,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ShieldAlert,
  Search,
  Filter
} from "lucide-react";

export default function BeneficiaryDashboardPage() {
  const [beneficiaries, setBeneficiaries] = useState([
    {
      id: "BEN-01",
      head_of_household: "Kavitha Sundaram",
      phone: "+91-9840112233",
      location: "Kotturpuram Canal Bank",
      latitude: 13.0650,
      longitude: 80.2550,
      family_count: 4,
      special_vulnerabilities: ["Infant (8mo)", "Insulin-dependent mother"],
      requested_aid: ["FOOD", "WATER", "MEDICAL"],
      urgency: "CRITICAL",
      urgency_score: 92.0,
      status: "DISPATCHED",
      created_at: "35 mins ago"
    },
    {
      id: "BEN-02",
      head_of_household: "Senior Care Care Home (Ramesh Babu)",
      phone: "+91-9840556677",
      location: "T. Nagar Annex, Ward 12",
      latitude: 13.0450,
      longitude: 80.2400,
      family_count: 12,
      special_vulnerabilities: ["Elderly (65+)", "Oxygen-dependent"],
      requested_aid: ["MEDICAL", "WATER", "EVACUATION"],
      urgency: "CRITICAL",
      urgency_score: 88.5,
      status: "ALLOCATED",
      created_at: "1 hour ago"
    },
    {
      id: "BEN-03",
      head_of_household: "Anand Kumar & Family",
      phone: "+91-9840998811",
      location: "Fishermen Colony, Kasimedu",
      latitude: 13.0950,
      longitude: 80.2850,
      family_count: 6,
      special_vulnerabilities: ["Pregnant female"],
      requested_aid: ["FOOD", "WATER"],
      urgency: "HIGH",
      urgency_score: 72.0,
      status: "PENDING",
      created_at: "2 hours ago"
    },
    {
      id: "BEN-04",
      head_of_household: "Dr. Farooq",
      phone: "+91-9840334455",
      location: "Royapettah High Road",
      latitude: 13.0550,
      longitude: 80.2750,
      family_count: 8,
      special_vulnerabilities: ["Trauma injuries"],
      requested_aid: ["MEDICAL", "FOOD"],
      urgency: "HIGH",
      urgency_score: 68.0,
      status: "DELIVERED",
      created_at: "3 hours ago"
    }
  ]);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Form State for Registering Household / SOS
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [headcount, setHeadcount] = useState(3);
  const [description, setDescription] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["FOOD", "WATER"]);
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([]);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  const handleRegisterHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = {
      id: `BEN-0${beneficiaries.length + 1}`,
      head_of_household: name || "Anonymous Household",
      phone: phone || "+91-9876543210",
      location: address || "Emergency Sector Intake",
      latitude: 13.0650,
      longitude: 80.2550,
      family_count: headcount,
      special_vulnerabilities: selectedVulnerabilities.length > 0 ? selectedVulnerabilities : ["None flagged"],
      requested_aid: selectedNeeds,
      urgency: selectedVulnerabilities.length > 0 ? "CRITICAL" : "HIGH",
      urgency_score: selectedVulnerabilities.length > 0 ? 85.0 : 65.0,
      status: "PENDING",
      created_at: "Just now"
    };

    setBeneficiaries([newRecord, ...beneficiaries]);
    setName("");
    setPhone("");
    setAddress("");
    setDescription("");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    const matchesSearch =
      b.head_of_household.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <Users className="w-4 h-4" />
            <span>BENEFICIARY OPERATIONS // HOUSEHOLD MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Beneficiary & Distress Request Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register affected households, capture location coordinates, record urgency vulnerabilities & track aid delivery statuses.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <a
            href="#sos"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Submit Emergency Beacon</span>
          </a>
        </div>
      </div>

      {/* Success Notification */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">Household successfully registered! Ingested into the AI Triage dispatch queue.</span>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Registered Households</span>
          <div className="text-3xl font-black text-white">{beneficiaries.length} Clusters</div>
          <p className="text-[11px] text-slate-500">Total {beneficiaries.reduce((acc, b) => acc + b.family_count, 0)} individuals recorded</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-red-900/60 space-y-1">
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Critical Urgency</span>
          <div className="text-3xl font-black text-red-400 font-mono">
            {beneficiaries.filter((b) => b.urgency === "CRITICAL").length} Cases
          </div>
          <p className="text-[11px] text-red-400/80">Infant, oxygen, or trauma alerts</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">In Transit / Dispatched</span>
          <div className="text-3xl font-black text-amber-400 font-mono">
            {beneficiaries.filter((b) => b.status === "DISPATCHED" || b.status === "ALLOCATED").length} Units
          </div>
          <p className="text-[11px] text-slate-500">Relief vehicles actively en route</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Fulfilled Deliveries</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">
            {beneficiaries.filter((b) => b.status === "DELIVERED").length} Families
          </div>
          <p className="text-[11px] text-slate-500">Verified by field volunteer signatures</p>
        </div>
      </div>

      {/* Beneficiaries Table & Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Affected Beneficiaries & Aid Request Queue</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by name or district..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 w-52"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="ALLOCATED">ALLOCATED</option>
              <option value="DISPATCHED">DISPATCHED</option>
              <option value="DELIVERED">DELIVERED</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Head of Household</th>
                <th className="px-4 py-3">Sector Location</th>
                <th className="px-4 py-3">People</th>
                <th className="px-4 py-3">Vulnerabilities</th>
                <th className="px-4 py-3">Aid Needs</th>
                <th className="px-4 py-3">AI Urgency</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredBeneficiaries.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{b.head_of_household}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{b.phone}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-slate-300">{b.location}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{b.latitude.toFixed(4)}, {b.longitude.toFixed(4)}</div>
                  </td>
                  <td className="px-4 py-3.5 text-white font-bold">{b.family_count}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {b.special_vulnerabilities.map((v) => (
                        <span key={v} className="px-2 py-0.5 rounded bg-red-950/80 text-red-300 border border-red-900/60 text-[10px]">
                          ⚠ {v}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {b.requested_aid.map((aid) => (
                        <span key={aid} className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono">
                          {aid}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded font-black font-mono ${
                      b.urgency === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800" : "bg-amber-950 text-amber-400"
                    }`}>
                      {b.urgency_score} ({b.urgency})
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                      b.status === "DELIVERED"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : b.status === "DISPATCHED"
                        ? "bg-cyan-950 text-cyan-400 border border-cyan-800"
                        : b.status === "ALLOCATED"
                        ? "bg-blue-950 text-blue-400 border border-blue-800"
                        : "bg-amber-950 text-amber-400 border border-amber-800"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Household Registration & Distress SOS Submission Form */}
      <div id="sos" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          <div>
            <h2 className="text-lg font-bold text-white">Register Affected Household or Submit Distress Beacon</h2>
            <p className="text-xs text-slate-400">Captures ground coordinates and calculates automated AI urgency rating</p>
          </div>
        </div>

        <form onSubmit={handleRegisterHousehold} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Head of Household / Group Contact</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Contact Mobile Number</label>
              <input
                type="tel"
                required
                placeholder="+91-9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Number of Trapped/Affected People</label>
              <input
                type="number"
                min="1"
                max="50"
                value={headcount}
                onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Street Address / Landmark Location</label>
            <input
              type="text"
              required
              placeholder="e.g. 15 Anna Salai near Bus Stand, Adyar Basin"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Vulnerability Checklist */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold">Flag Special Vulnerabilities (Triggers Urgency Boost):</label>
            <div className="flex flex-wrap gap-2">
              {["Infant / Newborn", "Elderly (65+)", "Pregnant Female", "Insulin-dependent", "Oxygen-dependent", "Severe Trauma / Bleeding"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => toggleVulnerability(v)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedVulnerabilities.includes(v)
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {selectedVulnerabilities.includes(v) ? "✓ " : "+ "} {v}
                </button>
              ))}
            </div>
          </div>

          {/* Aid Requirements */}
          <div className="space-y-2">
            <label className="text-slate-300 font-semibold">Select Aid Supply Categories Needed:</label>
            <div className="flex flex-wrap gap-2">
              {["FOOD", "WATER", "MEDICAL", "SHELTER", "EVACUATION"].map((need) => (
                <button
                  key={need}
                  type="button"
                  onClick={() => toggleNeed(need)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedNeeds.includes(need)
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {need}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Situation Narrative / Immediate Danger</label>
            <textarea
              rows={2}
              placeholder="e.g. Ground floor flooded. 1 senior citizen unable to walk, drinking water exhausted."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-transform hover:scale-[1.01]"
            >
              Submit Distress Beacon & Register Request
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

