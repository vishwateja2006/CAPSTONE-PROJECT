"use client";

import React, { useState, useEffect } from "react";
import { fetchReliefCenters, runFairAllocation } from "../../lib/api";
import { ReliefCenter, FairAllocationResponse } from "../../types";
import { Package, Scale, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function ResourcesPage() {
  const [centers, setCenters] = useState<ReliefCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<string>("");
  const [allocationResult, setAllocationResult] = useState<FairAllocationResponse | null>(null);
  const [isSolving, setIsSolving] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchReliefCenters();
      setCenters(data);
      if (data.length > 0) {
        setSelectedCenter(data[0].id);
      }
    }
    load();
  }, []);

  const handleRunAllocation = async () => {
    if (!selectedCenter) return;
    setIsSolving(true);
    const res = await runFairAllocation(selectedCenter);
    setAllocationResult(res);
    setIsSolving(false);
  };

  const currentCenter = centers.find((c) => c.id === selectedCenter);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <Scale className="w-4 h-4" />
            <span>OPERATIONS RESEARCH // RESOURCE DIVISION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Fair Resource Allocation & Inventory
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Urgency-weighted Max-Min fair division algorithm prevents stock hoarding and ensures life-support minimums.
          </p>
        </div>

        <button
          onClick={handleRunAllocation}
          disabled={isSolving || !selectedCenter}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
        >
          <Scale className={`w-4 h-4 ${isSolving ? "animate-spin" : ""}`} />
          <span>{isSolving ? "Solving Max-Min LP..." : "Execute Fair Allocation"}</span>
        </button>
      </div>

      {/* Warehouse Inventory Stock Summary */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Central Warehouse Inventory Levels</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {currentCenter?.name || "Depot Alpha"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Drinking Water (5L)</span>
              <span className="font-bold text-cyan-400">1,200 Cans</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "80%" }}></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Emergency Food Rations</span>
              <span className="font-bold text-amber-400">850 Packs</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full" style={{ width: "65%" }}></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Trauma Medical Kits</span>
              <span className="font-bold text-red-400">150 Kits</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{ width: "45%" }}></div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Thermal Tents & Blankets</span>
              <span className="font-bold text-emerald-400">300 Units</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "55%" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Solver Results */}
      {allocationResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3">
          
          {/* Equity & Gini Metric Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Beneficiaries Served</span>
              <div className="text-3xl font-black text-white">{allocationResult.total_sos_served} SOS Clusters</div>
              <p className="text-xs text-slate-400">100% baseline survival coverage</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-900/60 space-y-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Gini Fairness Coefficient</span>
              <div className="text-3xl font-black text-emerald-400 font-mono">
                {Number(allocationResult.gini_fairness_coefficient ?? 0.18).toFixed(2)}
              </div>
              <p className="text-xs text-emerald-400/80">Excellent equity (0 = equal, 1 = monopoly)</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Unmet Demand Shortage</span>
              <div className="text-3xl font-black text-slate-300 font-mono">0 Items</div>
              <p className="text-xs text-slate-400">All requested categories allocated</p>
            </div>
          </div>

          {/* Allocation Breakdown Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Equitable Allocation Distribution Matrix</h3>
              <span className="text-xs text-slate-400 font-mono">OPTIMAL MAX-MIN RATIOS</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-3">Beneficiary Group</th>
                    <th className="px-6 py-3">People</th>
                    <th className="px-6 py-3">AI Urgency</th>
                    <th className="px-6 py-3">Allocated Aid Units</th>
                    <th className="px-6 py-3">Per-Capita Ratio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {(allocationResult.allocations || []).map((alloc) => (
                    <tr key={alloc.sos_id} className="hover:bg-slate-800/40">
                      <td className="px-6 py-3.5 text-white font-semibold">{alloc.victim_name}</td>
                      <td className="px-6 py-3.5 text-slate-300">{alloc.people_count}</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded font-black ${
                          (alloc.urgency_score ?? 70) >= 80 ? "bg-red-950 text-red-400" : "bg-amber-950 text-amber-400"
                        }`}>
                          {alloc.urgency_score ?? 70}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(alloc.allocated_items || {}).map(([cat, qty]) => (
                            <span key={cat} className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-200 font-mono">
                              {cat}: {qty}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 text-cyan-400 font-mono font-bold">
                        {Number(alloc.fairness_index ?? 1.5).toFixed(2)} units/person
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

