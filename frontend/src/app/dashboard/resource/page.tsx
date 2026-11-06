"use client";

import React, { useState } from "react";
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  Warehouse,
  CheckCircle,
  Truck,
  Droplet,
  HeartPulse,
  Home
} from "lucide-react";

export default function ResourceDashboardPage() {
  const [items, setItems] = useState([
    { id: "inv-01", warehouse: "Central Depot Alpha", category: "WATER", name: "Purified Water Cans (5L)", available: 1200, reserved: 200, threshold: 300, unit: "cans" },
    { id: "inv-02", warehouse: "Central Depot Alpha", category: "FOOD", name: "Emergency Ready-to-Eat Rations", available: 850, reserved: 150, threshold: 250, unit: "packets" },
    { id: "inv-03", warehouse: "Central Depot Alpha", category: "MEDICAL", name: "Trauma & Suture Field Kits", available: 150, reserved: 40, threshold: 100, unit: "kits" },
    { id: "inv-04", warehouse: "Forward Staging Depot B", category: "SHELTER", name: "Thermal Blankets & Tents", available: 300, reserved: 50, threshold: 100, unit: "units" },
    { id: "inv-05", warehouse: "Forward Staging Depot B", category: "SANITATION", name: "Chlorine Disinfection Tablets", available: 75, reserved: 20, threshold: 100, unit: "packs" }
  ]);

  const [donorName, setDonorName] = useState("");
  const [selectedCat, setSelectedCat] = useState("WATER");
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(100);

  const handleRecordInbound = (e: React.FormEvent) => {
    e.preventDefault();
    const existing = items.find((i) => i.category === selectedCat);
    if (existing) {
      existing.available += quantity;
      setItems([...items]);
    } else {
      setItems([
        ...items,
        {
          id: `inv-0${items.length + 1}`,
          warehouse: "Central Depot Alpha",
          category: selectedCat as any,
          name: itemName || `${selectedCat} Aid Batch`,
          available: quantity,
          reserved: 0,
          threshold: 100,
          unit: "units"
        }
      ]);
    }
    setDonorName("");
    setItemName("");
    setQuantity(100);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <Package className="w-4 h-4" />
            <span>WAREHOUSE OPERATIONS // INVENTORY CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Resource Stock & Warehouse Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track multi-warehouse inventory, stage aid shipments, log inbound contributions & monitor low-stock thresholds.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            <span>2 WAREHOUSES CONNECTED</span>
          </div>
        </div>
      </div>

      {/* Warehouse Stock Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((item) => {
          const isLow = item.available <= item.threshold;
          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border transition-all ${
                isLow
                  ? "bg-red-950/20 border-red-900/80 shadow-red-950/30"
                  : "bg-slate-900/80 border-slate-800"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{item.warehouse}</span>
                  <h3 className="font-bold text-white text-base mt-0.5">{item.name}</h3>
                </div>
                {isLow ? (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800 font-bold animate-pulse">
                    LOW STOCK
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                    SUFFICIENT
                  </span>
                )}
              </div>

              <div className="mt-4 flex items-baseline space-x-2">
                <span className="text-3xl font-black text-white font-mono">{item.available}</span>
                <span className="text-xs text-slate-400">{item.unit} available</span>
              </div>

              <div className="mt-2 text-xs text-slate-400 flex justify-between pt-2 border-t border-slate-800/80 font-mono">
                <span>Reserved: {item.reserved}</span>
                <span>Threshold: {item.threshold}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inbound Donation / Restock Form */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
          <Warehouse className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white">Record Inbound Warehouse Donation / Procurement</h2>
        </div>

        <form onSubmit={handleRecordInbound} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Donor / Supplier</label>
            <input
              type="text"
              required
              placeholder="e.g. Red Cross India / WHO Relief"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Category</label>
            <select
              value={selectedCat}
              onChange={(e) => setSelectedCat(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none"
            >
              <option value="WATER">WATER (Liters / Cans)</option>
              <option value="FOOD">FOOD (Ration Packs)</option>
              <option value="MEDICAL">MEDICAL (Trauma Kits)</option>
              <option value="SHELTER">SHELTER (Tents/Blankets)</option>
              <option value="SANITATION">SANITATION (Hygiene)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-300 font-semibold">Quantity Units</label>
            <input
              type="number"
              min="10"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black uppercase tracking-wider transition-all"
            >
              Log Inbound Stock
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
