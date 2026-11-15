"use client";

import React, { useState } from "react";
import {
  HeartHandshake,
  DollarSign,
  Package,
  TrendingUp,
  CheckCircle2,
  Building,
  Plus,
  ShieldCheck,
  Search,
  ExternalLink
} from "lucide-react";

export default function NGODashboardPage() {
  const [donations, setDonations] = useState([
    {
      id: "DON-101",
      donor_org: "Indian Red Cross Society",
      contact_person: "Dr. Arvind Mehta",
      contribution_type: "MATERIAL_AID",
      category: "MEDICAL",
      description: "200 Trauma & Emergency Surgical Kits",
      quantity: 200,
      unit: "kits",
      allocated_sector: "Secunderabad Central Depot -> Chaderghat Basin, Hyderabad",
      status: "DISTRIBUTED",
      date: "Nov 05, 2026"
    },
    {
      id: "DON-102",
      donor_org: "Tata Disaster Relief Foundation",
      contact_person: "Ananya Deshmukh",
      contribution_type: "MATERIAL_AID",
      category: "WATER",
      description: "1,500 Purified Drinking Water Cans (5L)",
      quantity: 1500,
      unit: "cans",
      allocated_sector: "Musi River Basin & Moosarambagh, Hyderabad",
      status: "STAGED",
      date: "Nov 06, 2026"
    },
    {
      id: "DON-103",
      donor_org: "Rotary International Relief",
      contact_person: "Col. Sanjeev Kapoor",
      contribution_type: "FINANCIAL_GRANT",
      category: "FUNDS",
      description: "Emergency Logistics & Fuel Fund",
      quantity: 500000,
      unit: "INR",
      allocated_sector: "Fleet Dispatch Fuel & Boat Operations",
      status: "ACTIVE",
      date: "Nov 06, 2026"
    }
  ]);

  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [quantity, setQuantity] = useState(500);
  const [description, setDescription] = useState("");
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handlePledgeDonation = (e: React.FormEvent) => {
    e.preventDefault();
    const newDon = {
      id: `DON-10${donations.length + 1}`,
      donor_org: orgName || "Global Humanitarian Donor",
      contact_person: contactPerson || "Aid Coordinator",
      contribution_type: "MATERIAL_AID",
      category,
      description: description || `${quantity} units of ${category} relief aid`,
      quantity,
      unit: category === "WATER" ? "cans" : category === "FOOD" ? "packets" : "kits",
      allocated_sector: "Staging Area Alpha (Pending Allocation)",
      status: "STAGED",
      date: "Today, Just now"
    };

    setDonations([newDon, ...donations]);
    setOrgName("");
    setContactPerson("");
    setDescription("");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 4000);
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <HeartHandshake className="w-4 h-4" />
            <span>NGO & DONOR NETWORK // AID PLEDGE TRACKING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">NGO Contributions & Transparency Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Pledge relief supplies, monitor fund utilization, and inspect transparent distribution audit trails down to the last village.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% TRANSPARENCY VERIFIED</span>
          </div>
        </div>
      </div>

      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold">Donation pledge logged successfully! Staged for dynamic fair allocation.</span>
          </div>
          <button onClick={() => setShowSuccessToast(false)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Material Pledged</span>
          <div className="text-3xl font-black text-white font-mono">1,700 Units</div>
          <p className="text-[11px] text-slate-500">Water cans, rations & medical packs</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Financial Grants Logged</span>
          <div className="text-3xl font-black text-amber-400 font-mono">₹5,00,000</div>
          <p className="text-[11px] text-slate-500">Allocated for fuel, boats & rapid 4x4s</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Partner NGOs Active</span>
          <div className="text-3xl font-black text-cyan-400 font-mono">8 Foundations</div>
          <p className="text-[11px] text-slate-500">Cross-coordinated via ResQLink</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-900/60 space-y-1">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Distribution Ratio</span>
          <div className="text-3xl font-black text-emerald-400 font-mono">92.4%</div>
          <p className="text-[11px] text-emerald-400/80">Reaching verified affected clusters</p>
        </div>
      </div>

      {/* Contributions Ledger Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Donation Ledger & Traceability Trail</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">IMMUTABLE LOGS</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Donation ID</th>
                <th className="px-4 py-3">Organization / Donor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Pledged Quantity</th>
                <th className="px-4 py-3">Assigned Impact Sector</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {donations.map((d) => (
                <tr key={d.id} className="hover:bg-slate-800/40">
                  <td className="px-4 py-3.5 font-mono text-amber-400 font-bold">{d.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-white">{d.donor_org}</div>
                    <div className="text-[11px] text-slate-500 font-mono">Rep: {d.contact_person}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-mono">
                      {d.category}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-white font-bold">
                    {d.category === "FUNDS" ? `₹${d.quantity.toLocaleString()}` : `${d.quantity.toLocaleString()} ${d.unit}`}
                  </td>
                  <td className="px-4 py-3.5 text-slate-300">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{d.allocated_sector}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${d.status === "DISTRIBUTED"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      : "bg-blue-950 text-blue-400 border border-blue-800"
                      }`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{d.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pledge New Contribution Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
          <HeartHandshake className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Pledge Material or Financial Relief Contribution</h2>
            <p className="text-xs text-slate-400">All pledged items enter the Max-Min fair allocation solver automatically</p>
          </div>
        </div>

        <form onSubmit={handlePledgeDonation} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Organization / Foundation Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Hope International Foundation"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Authorized Representative</label>
              <input
                type="text"
                required
                placeholder="e.g. Priya Sharma, Relief Coordinator"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Aid Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
              >
                <option value="FOOD">FOOD (Nutritional Rations / Dry Food Packs)</option>
                <option value="WATER">WATER (5L Purified Water Cans)</option>
                <option value="MEDICAL">MEDICAL (First Aid, Insulin, Suture Kits)</option>
                <option value="SHELTER">SHELTER (Tarpaulins, Blankets, Inflatable Tents)</option>
                <option value="FUNDS">FINANCIAL GRANT (Direct Logistics Subsidies)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Pledged Quantity (Units or INR)</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 100)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Specification / Batch Details</label>
            <input
              type="text"
              placeholder="e.g. 500 family nutrition packets ready for dispatch at North Hub"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.01]"
            >
              Submit Aid Pledge & Generate Allocation Receipt
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}

