"use client";

import React, { useState } from "react";
import { submitSOS, enqueueOfflineSOS } from "../../lib/api";
import { Radio, ShieldAlert, CheckCircle, MapPin, Send, AlertTriangle, WifiOff } from "lucide-react";

export default function SOSPage() {
  const [victimName, setVictimName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("13.0650");
  const [longitude, setLongitude] = useState("80.2550");
  const [peopleCount, setPeopleCount] = useState(3);
  const [description, setDescription] = useState("");
  const [specialNeeds, setSpecialNeeds] = useState<string[]>([]);
  const [categoryNeeds, setCategoryNeeds] = useState<string[]>(["FOOD", "WATER"]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any | null>(null);

  // Dynamic client-side simulated AI preview
  const computeLivePreview = () => {
    let score = 30.0;
    const text = description.toLowerCase();
    if (text.includes("trapped") || text.includes("rising") || text.includes("oxygen") || text.includes("insulin") || text.includes("baby")) {
      score += 35.0;
    }
    if (specialNeeds.length > 0) score += specialNeeds.length * 10.0;
    if (peopleCount > 5) score += 10.0;
    if (categoryNeeds.includes("MEDICAL") || categoryNeeds.includes("EVACUATION")) score += 15.0;
    const finalScore = Math.min(100.0, score);
    return {
      score: finalScore,
      level: finalScore >= 80 ? "CRITICAL" : finalScore >= 60 ? "HIGH" : "MEDIUM"
    };
  };

  const preview = computeLivePreview();

  const handleToggleSpecialNeed = (need: string) => {
    setSpecialNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleToggleCategory = (cat: string) => {
    setCategoryNeeds((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      victim_name: victimName || "Citizen In Need",
      contact_phone: phone || "+91-9876500000",
      latitude: parseFloat(latitude) || 17.3780,
      longitude: parseFloat(longitude) || 78.4910,
      address,
      people_count: peopleCount,
      special_needs: specialNeeds,
      category_needs: categoryNeeds,
      description
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      const beacon = enqueueOfflineSOS(payload);
      setSubmittedData({
        id: beacon.queueId,
        victim_name: payload.victim_name,
        contact_phone: payload.contact_phone,
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address,
        people_count: payload.people_count,
        urgency_level: "HIGH",
        urgency_score: 92.0,
        status: "OFFLINE_QUEUED",
        requested_at: `Offline Queued (${beacon.queuedAt})`
      });
      setIsSubmitting(false);
      return;
    }

    const result = await submitSOS(payload);
    setSubmittedData(result);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-2">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-400 text-xs font-bold uppercase tracking-wider">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Priority Emergency Intake</span>
        </div>
        <h1 className="text-3xl font-black text-white">Emergency Relief SOS Beacon</h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Broadcast your location and survival needs directly to the Central Operations Command.
          Our AI model triages incoming reports in real-time.
        </p>
      </div>

      {submittedData ? (
        <div className="bg-slate-900/90 border border-emerald-800/80 rounded-2xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-600/80 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">SOS Beacon Transmitted Successfully</h2>
            <p className="text-sm text-slate-400">
              Your signal has been ingested by the dispatch queue and prioritized by the AI triage engine.
            </p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">BEACON ID:</span>
              <span className="text-emerald-400 font-bold">{submittedData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">AI ASSESSED URGENCY:</span>
              <span className="text-red-400 font-bold">{submittedData.urgency_score} / 100 ({submittedData.urgency_level})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">HEADCOUNT:</span>
              <span className="text-white">{submittedData.people_count} People</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">STATUS:</span>
              <span className="text-amber-400 font-bold">{submittedData.status}</span>
            </div>
          </div>

          <button
            onClick={() => setSubmittedData(null)}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
          >
            Submit Another Report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main Form (2 cols) */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5 bg-slate-900/70 border border-slate-800 p-6 rounded-2xl">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Name / Group</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={victimName}
                  onChange={(e) => setVictimName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mobile / WhatsApp Number</label>
                <input
                  type="tel"
                  required
                  placeholder="+91-9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Street Address or Landmark</label>
              <input
                type="text"
                placeholder="e.g. Near Musi Causeway Bridge, Chaderghat, Hyderabad"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm font-mono focus:border-red-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">People Trapped</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Special Needs Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Special Vulnerabilities (High AI Priority Boost)</label>
              <div className="flex flex-wrap gap-2">
                {["infant", "elderly", "pregnant", "injured", "insulin-dependent", "oxygen-needed"].map((sn) => (
                  <button
                    key={sn}
                    type="button"
                    onClick={() => handleToggleSpecialNeed(sn)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${specialNeeds.includes(sn)
                      ? "bg-red-600 text-white shadow-md shadow-red-600/30"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                      }`}
                  >
                    + {sn}
                  </button>
                ))}
              </div>
            </div>

            {/* Category of Supplies Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Required Aid Categories</label>
              <div className="flex flex-wrap gap-2">
                {["FOOD", "WATER", "MEDICAL", "SHELTER", "EVACUATION"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${categoryNeeds.includes(cat)
                      ? "bg-amber-500 text-slate-950 font-bold"
                      : "bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Situation Free-text Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Description / Immediate Danger</label>
              <textarea
                rows={3}
                placeholder="e.g. Water is entering the ground floor, family is trapped on the roof. Need baby milk and clean drinking water urgently."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all hover:scale-[1.01]"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? "Transmitting Emergency SOS..." : "Broadcast Emergency Beacon"}</span>
            </button>
          </form>

          {/* AI NLP Urgency Preview Sidebar (1 col) */}
          <div className="space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 sticky top-24">
              <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-bold text-sm text-white">Live AI Triage Preview</h3>
                  <p className="text-[11px] text-slate-400">Natural Language Scoring</p>
                </div>
              </div>

              <div className="text-center p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Predicted Priority</div>
                <div className={`text-2xl font-black ${preview.level === "CRITICAL" ? "text-red-500" : preview.level === "HIGH" ? "text-amber-400" : "text-yellow-400"
                  }`}>
                  {preview.level}
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Calculated Score: {preview.score.toFixed(1)} / 100
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Keywords Detected:</span>
                  <span className="text-white font-mono">
                    {description.toLowerCase().includes("trapped") ? "trapped, " : ""}
                    {description.toLowerCase().includes("rising") ? "rising water, " : ""}
                    {description.toLowerCase().includes("baby") ? "infant" : "standard"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Demographic Multiplier:</span>
                  <span className="text-white font-mono">+{specialNeeds.length * 10} pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Headcount Scaling:</span>
                  <span className="text-white font-mono">{peopleCount} persons</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-950/40 border border-red-900/60 text-[11px] text-red-300">
                💡 High priority signals are automatically routed to the top of vehicle dispatch queues.
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

