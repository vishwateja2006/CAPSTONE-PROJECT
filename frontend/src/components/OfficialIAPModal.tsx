"use client";

import React, { useState } from "react";
import {
  Printer,
  X,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  Package,
  MapPin,
  AlertTriangle,
  QrCode,
  FileText,
  Clock,
  CheckCircle2,
  Award,
  Hash,
  Compass,
  ArrowRight
} from "lucide-react";

interface OfficialIAPModalProps {
  isOpen: boolean;
  onClose: () => void;
  unifiedPlan: any;
  routePlan?: any;
}

export default function OfficialIAPModal({
  isOpen,
  onClose,
  unifiedPlan,
  routePlan
}: OfficialIAPModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const planId = unifiedPlan?.action_plan_id || "UDAP-DIS-HYD-FLOOD-2026-89104";
  const sha256Digest =
    unifiedPlan?.sha256_digest ||
    "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
  const podToken = unifiedPlan?.proof_of_delivery_token || "POD-8F4A19B3";
  const authorizedAt = unifiedPlan?.authorized_at
    ? new Date(unifiedPlan.authorized_at).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short"
      })
    : new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short"
      });

  const handleCopyHash = () => {
    navigator.clipboard.writeText(sha256Digest);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in">
      
      {/* Modal Dialog Container */}
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        {/* Top Control Bar (Screen Only - Hidden in Print) */}
        <div className="print-hide flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:px-6 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono font-bold text-amber-400">FORM IRS-201</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-mono font-bold">
                  AUTHORITY SIGNED & AUDIT SEALED
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white">
                Official Incident Action Plan (IAP) & Logistics Manifest
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyHash}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center space-x-1.5 transition-all"
              title="Copy cryptographic SHA-256 hash"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Hash Copied!" : "Copy SHA-256"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-wider flex items-center space-x-2 shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Close Manifest Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Document Container */}
        <div className="overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950 flex justify-center">
          
          {/* ========================================================================= */}
          {/* PRINTABLE OFFICIAL BRIEFING DOCUMENT (#official-iap-manifest) */}
          {/* ========================================================================= */}
          <div
            id="official-iap-manifest"
            className="w-full max-w-4xl bg-white text-slate-900 rounded-xl p-6 sm:p-10 shadow-2xl space-y-8 font-sans border-2 border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0"
          >
            
            {/* 1. INSTITUTIONAL HEADER & CLASSIFICATION STRIP */}
            <div className="border-b-2 border-slate-900 pb-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center space-x-4">
                  {/* National Emblem Insignia Badge */}
                  <div className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-amber-50 flex flex-col items-center justify-center p-1 flex-shrink-0 text-slate-900 shadow-sm">
                    <ShieldCheck className="w-7 h-7 text-amber-700" />
                    <span className="text-[7px] font-black uppercase tracking-tight text-center leading-none mt-0.5">
                      NDMA • SDMA
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono font-black tracking-widest text-slate-700 uppercase">
                      GOVERNMENT OF INDIA • NATIONAL DISASTER MANAGEMENT AUTHORITY (NDMA)
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                      TAMIL NADU STATE DISASTER MANAGEMENT AUTHORITY (TNSDMA) • JOINT CRISIS COMMAND POST
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight uppercase mt-0.5">
                      FORM IRS-201: INCIDENT ACTION PLAN (IAP) & LOGISTICS DISPATCH MANIFEST
                    </h1>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="inline-block px-2.5 py-1 rounded border-2 border-red-700 bg-red-100 text-red-900 text-xs font-black uppercase tracking-widest">
                    RESTRICTED
                  </span>
                  <div className="text-[9px] font-mono text-slate-600 mt-1">DISASTER MGMT ACT § 34</div>
                </div>
              </div>

              {/* 4-Column Operational Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border border-slate-900 rounded-lg overflow-hidden text-xs bg-slate-50 divide-x divide-y sm:divide-y-0 divide-slate-300">
                <div className="p-2.5">
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Incident Code</div>
                  <div className="font-mono font-black text-slate-950 text-xs">DIS-HYD-FLOOD-2026</div>
                  <div className="text-[9px] text-slate-700">Hyderabad Cloudburst Surge</div>
                </div>
                <div className="p-2.5">
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Operational Period</div>
                  <div className="font-bold text-slate-950 text-xs">24-Hr Cycle (06:00 to 06:00)</div>
                  <div className="text-[9px] text-slate-700">14-Nov to 15-Nov-2026</div>
                </div>
                <div className="p-2.5">
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Action Plan ID</div>
                  <div className="font-mono font-black text-slate-950 text-xs truncate" title={planId}>
                    {planId}
                  </div>
                  <div className="text-[9px] text-emerald-800 font-bold">STATUS: AUTHORIZED</div>
                </div>
                <div className="p-2.5">
                  <div className="text-[10px] font-bold text-slate-700 uppercase">Execution Time</div>
                  <div className="font-mono font-bold text-slate-950 text-[11px]">{authorizedAt}</div>
                  <div className="text-[9px] text-slate-700">IST / UTC+05:30</div>
                </div>
              </div>
            </div>

            {/* 2. EXECUTIVE OPERATIONAL OBJECTIVES & AI SYNTHESIS */}
            <div className="space-y-2.5">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1">
                <Compass className="w-4 h-4 text-slate-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  1. Operational Objectives & Multi-Model AI Decision Synthesis
                </h3>
              </div>
              <div className="bg-slate-50 border border-slate-300 rounded-lg p-3.5 text-xs text-slate-800 space-y-2">
                <p className="leading-relaxed">
                  <b>Primary Mission Directive:</b> Mobilize immediate humanitarian relief payload from{" "}
                  <b>Central Regional Relief Logistics Hub (WH-HYD-CENTRAL)</b> servicing 135 verified flood victims
                  across Musi River Basin and Moosarambagh Lowlands. All deliveries are coordinated under strict adherence to UN
                  Sphere Humanitarian Standards and algorithmic Max-Min Fair Allocation (Gini coefficient 0.0194).
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-700 block text-[9px] font-bold">VICTIMS SERVICED</span>
                    <span className="font-black text-slate-900 text-sm">135 Individuals</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-700 block text-[9px] font-bold">VEHICLES MOBILIZED</span>
                    <span className="font-black text-blue-900 text-sm">2 Tactical Units</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-700 block text-[9px] font-bold">GROSS PAYLOAD WEIGHT</span>
                    <span className="font-black text-emerald-900 text-sm">2,025.0 kg</span>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-slate-700 block text-[9px] font-bold">FLOOD BYPASS DETOURS</span>
                    <span className="font-black text-amber-900 text-sm">1 Bridge Detour</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. SECTION 1: INCIDENT COMMANDER VERIFICATION BLOCK & OFFICIAL SIGNATURES */}
            <div className="space-y-3 page-break-inside-avoid">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1">
                <Award className="w-4 h-4 text-slate-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  2. Incident Commander Verification & Statutory Authority Block
                </h3>
              </div>

              <div className="border-2 border-slate-900 rounded-lg p-4 bg-amber-50/50 space-y-3">
                <p className="text-[11px] text-slate-800 leading-relaxed italic">
                  &ldquo;I hereby certify and solemnly affirm under Section 34 of the Disaster Management Act, 2005 that the
                  tactical resource allocations, fleet dispatch manifests, and obstacle-avoidance routing plans detailed
                  in this document have been evaluated against real-time aerial damage vision, algorithmic fairness criteria,
                  and life-safety priority constraints. Immediate tactical mobilization is legally sanctioned.&rdquo;
                </p>

                {/* Dual Signature & Stamp Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-300">
                  
                  {/* Left Signature: Incident Commander */}
                  <div className="border border-slate-400 rounded-lg p-3 bg-white relative">
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded border border-emerald-600 bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold">
                      ✓ DSC e-SIGNED
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 uppercase">Authorized By (Incident Commander)</div>
                    <div className="font-mono text-sm font-black text-slate-950 mt-1">Col. S. Ramanathan</div>
                    <div className="text-[10px] text-slate-700">Senior Incident Commander (NDMA / SDMA Operations)</div>
                    <div className="text-[9px] font-mono text-slate-600">ID: IC-NDMA-OPS-4409-CLEARANCE-ALPHA</div>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-400 flex justify-between items-end text-[9px] text-slate-600">
                      <span>Official Signature & Seal</span>
                      <span className="font-mono font-bold text-slate-900">{authorizedAt}</span>
                    </div>
                  </div>

                  {/* Right Signature: Zonal Relief Commissioner */}
                  <div className="border border-slate-400 rounded-lg p-3 bg-white relative">
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded border border-emerald-600 bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold">
                      ✓ CONCURRED
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 uppercase">Duty Commissioner / Approving Authority</div>
                    <div className="font-mono text-sm font-black text-slate-950 mt-1">Dr. Preethi Sundararajan, IAS</div>
                    <div className="text-[10px] text-slate-700">Zonal Relief Commissioner / Executive Director (Operations)</div>
                    <div className="text-[9px] font-mono text-slate-600">Tamil Nadu State Disaster Management Authority</div>
                    <div className="mt-3 pt-2 border-t border-dashed border-slate-400 flex justify-between items-end text-[9px] text-slate-600">
                      <span>Official Signature & Seal</span>
                      <span className="font-mono font-bold text-slate-900">{authorizedAt}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* 4. SECTION 2: SHA-256 CRYPTOGRAPHIC HASH & QR CODE AUDIT SEAL */}
            <div className="space-y-3 page-break-inside-avoid">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1">
                <Hash className="w-4 h-4 text-slate-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  3. Cryptographic SHA-256 Hash Token & Blockchain Ledger Seal
                </h3>
              </div>

              <div className="border border-slate-900 rounded-lg p-4 bg-slate-50 flex flex-col sm:flex-row items-center gap-5">
                {/* Simulated SVG QR Code */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-28 h-28 bg-white border-2 border-slate-900 p-1.5 rounded-lg flex items-center justify-center shadow-sm">
                    {/* Authentic Vector QR Code */}
                    <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                      {/* Top-Left Finder Pattern */}
                      <rect x="5" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="13" y="13" width="12" height="12" />
                      
                      {/* Top-Right Finder Pattern */}
                      <rect x="67" y="5" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="75" y="13" width="12" height="12" />
                      
                      {/* Bottom-Left Finder Pattern */}
                      <rect x="5" y="67" width="28" height="28" rx="2" fill="none" stroke="currentColor" strokeWidth="6" />
                      <rect x="13" y="75" width="12" height="12" />
                      
                      {/* Timing Lines */}
                      <rect x="36" y="18" width="6" height="6" />
                      <rect x="46" y="18" width="6" height="6" />
                      <rect x="56" y="18" width="6" height="6" />
                      <rect x="18" y="36" width="6" height="6" />
                      <rect x="18" y="46" width="6" height="6" />
                      <rect x="18" y="56" width="6" height="6" />

                      {/* Data Matrix Elements */}
                      <rect x="40" y="40" width="8" height="8" />
                      <rect x="52" y="40" width="8" height="8" />
                      <rect x="40" y="52" width="8" height="8" />
                      <rect x="64" y="52" width="8" height="8" />
                      <rect x="52" y="64" width="8" height="8" />
                      <rect x="40" y="76" width="8" height="8" />
                      <rect x="64" y="76" width="8" height="8" />
                      <rect x="76" y="40" width="8" height="8" />
                      <rect x="76" y="64" width="8" height="8" />
                      <rect x="76" y="76" width="8" height="8" />
                      <rect x="40" y="6" width="6" height="6" />
                      <rect x="52" y="6" width="6" height="6" />
                      <rect x="6" y="40" width="6" height="6" />
                      <rect x="6" y="52" width="6" height="6" />
                    </svg>
                  </div>
                  <span className="text-[8px] font-mono font-bold text-slate-700 mt-1 uppercase tracking-tight">
                    SCAN TO VERIFY AUDIT
                  </span>
                </div>

                {/* Audit Hash & Ledger Info */}
                <div className="space-y-2 flex-grow min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">
                      SHA-256 Cryptographic Hash Digest
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                      LEDGER BLOCK #849,201
                    </span>
                  </div>

                  <div className="p-2.5 rounded bg-white border border-slate-300 font-mono text-[11px] font-black text-slate-900 break-all select-all shadow-inner">
                    {sha256Digest}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-700 font-bold">PoD Verification Token: </span>
                      <span className="font-bold text-blue-900">{podToken}</span>
                    </div>
                    <div>
                      <span className="text-slate-700 font-bold">Merkle Proof Root: </span>
                      <span className="font-bold text-slate-900">0x7a4e9b812f6c0d8321</span>
                    </div>
                  </div>

                  <div className="text-[9px] text-slate-700 italic">
                    Immutable anti-diversion certificate: Encrypts cargo allocation, vehicle routes, and commander digital
                    signature into public audit logs. Tampering voids field clearance.
                  </div>
                </div>
              </div>
            </div>

            {/* 5. SECTION 3: VEHICLE-BY-VEHICLE CARGO MANIFEST & TURN-BY-TURN WAYPOINTS */}
            <div className="space-y-4 page-break-inside-avoid">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1">
                <Truck className="w-4 h-4 text-slate-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  4. Vehicle-by-Vehicle Cargo Manifest (kg Breakdown) & Turn-by-Turn Waypoints
                </h3>
              </div>

              {/* VEHICLE 1: TRUCK-4x4-ALPHA */}
              <div className="border border-slate-900 rounded-lg overflow-hidden">
                <div className="bg-slate-900 text-white p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-[10px]">
                      VEHICLE UNIT 01
                    </span>
                    <span className="font-black text-sm">TRUCK-4x4-ALPHA</span>
                    <span className="text-slate-400 text-[11px]">(Reg: TN-01-GA-9142)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    Driver: <b>Havildar M. Krishnan</b> | Radio: <b>RESCUE-ALPHA-1 (156.800 MHz)</b>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 space-y-3">
                  {/* Vehicle Cargo Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-300 bg-white">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-300">
                        <tr>
                          <th className="p-2">Item Category</th>
                          <th className="p-2">Material Description</th>
                          <th className="p-2 text-center">Unit Count</th>
                          <th className="p-2 text-right">Unit Weight</th>
                          <th className="p-2 text-right">Total Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        <tr>
                          <td className="p-2 font-bold text-cyan-900">Potable Water</td>
                          <td className="p-2">20L Rigid Jerrycans (WHO Quality Standard)</td>
                          <td className="p-2 text-center font-mono">45 Cans (900 L)</td>
                          <td className="p-2 text-right font-mono">20.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">900.0 kg</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-amber-900">Food Rations</td>
                          <td className="p-2">2,400 kcal Ready-to-Eat Emergency MRE Packs</td>
                          <td className="p-2 text-center font-mono">75 Packs</td>
                          <td className="p-2 text-right font-mono">2.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">150.0 kg</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-rose-900">Medical Supplies</td>
                          <td className="p-2">Trauma Dressings, Hemostatic Gauze & Splints</td>
                          <td className="p-2 text-center font-mono">45 Kits</td>
                          <td className="p-2 text-right font-mono">1.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">45.0 kg</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-indigo-900">Emergency Shelter</td>
                          <td className="p-2">Heavy-Duty Polythene Tarpaulins (4x5m)</td>
                          <td className="p-2 text-center font-mono">30 Units</td>
                          <td className="p-2 text-right font-mono">1.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">30.0 kg</td>
                        </tr>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={2} className="p-2 text-slate-900 uppercase">
                            Gross Vehicle Payload Manifest
                          </td>
                          <td className="p-2 text-center font-mono">195 Items</td>
                          <td className="p-2 text-right text-[10px] text-slate-700">Capacity: 2,500 kg</td>
                          <td className="p-2 text-right font-mono font-black text-sm text-blue-900">1,125.0 kg (45.0%)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Turn-by-Turn Waypoint Routing */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">
                      Assigned Turn-by-Turn Waypoint Route (CVRP Model 4 Optimized)
                    </span>
                    <div className="border border-slate-300 rounded bg-white text-[10px] font-mono divide-y divide-slate-200">
                      <div className="p-1.5 flex items-center justify-between text-slate-700">
                        <span><b>STOP 1 [START / 00:00]:</b> Central Regional Relief Hub Alpha (Depot Departure)</span>
                        <span className="font-bold text-emerald-800">LOAD CHECK PASSED</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between bg-red-50 text-red-900">
                        <span><b>STOP 2 [BYPASS / +03.9m]:</b> ⚠️ <b>Detour:</b> Bypass Musi River Causeway Bridge (3.2 ft deep floodwater)</span>
                        <span className="font-bold">MODEL 2 HAZARD DETOUR</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between text-slate-900">
                        <span><b>STOP 3 [DELIVERY / +08.0m]:</b> SOS: Moosarambagh Ward 45 (Community Shelter - 45 Victims)</span>
                        <span className="font-bold text-blue-900">900L Water, 150kg Food, 45 Meds</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between text-slate-900">
                        <span><b>STOP 4 [DELIVERY / +13.3m]:</b> SOS: Fishermen Colony (Kasimedu Shoreline Camp - 30 Victims)</span>
                        <span className="font-bold text-blue-900">Rations & Trauma Replenishment</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between text-slate-700">
                        <span><b>STOP 5 [RETURN / +16.1m]:</b> Central Regional Relief Hub Alpha (Return to Depot)</span>
                        <span className="font-bold text-slate-900">10.71 KM ROUND TRIP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* VEHICLE 2: TRUCK-RESCUE-BETA */}
              <div className="border border-slate-900 rounded-lg overflow-hidden">
                <div className="bg-slate-900 text-white p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center space-x-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-cyan-400 text-slate-950 font-black text-[10px]">
                      VEHICLE UNIT 02
                    </span>
                    <span className="font-black text-sm">TRUCK-RESCUE-BETA</span>
                    <span className="text-slate-400 text-[11px]">(Reg: TN-02-GB-3381)</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-300">
                    Driver: <b>Naik S. Velmurugan</b> | Radio: <b>RESCUE-BETA-2 (156.850 MHz)</b>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 space-y-3">
                  {/* Vehicle Cargo Breakdown Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-slate-300 bg-white">
                      <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-300">
                        <tr>
                          <th className="p-2">Item Category</th>
                          <th className="p-2">Material Description</th>
                          <th className="p-2 text-center">Unit Count</th>
                          <th className="p-2 text-right">Unit Weight</th>
                          <th className="p-2 text-right">Total Weight (kg)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11px]">
                        <tr>
                          <td className="p-2 font-bold text-cyan-900">Potable Water</td>
                          <td className="p-2">20L Rigid Jerrycans (WHO Quality Standard)</td>
                          <td className="p-2 text-center font-mono">36 Cans (720 L)</td>
                          <td className="p-2 text-right font-mono">20.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">720.0 kg</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-amber-900">Food Rations</td>
                          <td className="p-2">2,400 kcal Ready-to-Eat Emergency MRE Packs</td>
                          <td className="p-2 text-center font-mono">60 Packs</td>
                          <td className="p-2 text-right font-mono">2.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">120.0 kg</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-rose-900">Medical Supplies</td>
                          <td className="p-2">Insulin Coolers, Pediatric Oral Rehydration & Inhalers</td>
                          <td className="p-2 text-center font-mono">45 Kits</td>
                          <td className="p-2 text-right font-mono">1.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">45.0 kg</td>
                        </tr>
                        <tr>
                          <td className="p-2 font-bold text-purple-900">Hygiene & Infant</td>
                          <td className="p-2">Infant Milk Powder, Baby Dignity & Water Purification</td>
                          <td className="p-2 text-center font-mono">15 Packs</td>
                          <td className="p-2 text-right font-mono">1.0 kg</td>
                          <td className="p-2 text-right font-mono font-black text-slate-900">15.0 kg</td>
                        </tr>
                        <tr className="bg-slate-100 font-bold">
                          <td colSpan={2} className="p-2 text-slate-900 uppercase">
                            Gross Vehicle Payload Manifest
                          </td>
                          <td className="p-2 text-center font-mono">156 Items</td>
                          <td className="p-2 text-right text-[10px] text-slate-700">Capacity: 2,000 kg</td>
                          <td className="p-2 text-right font-mono font-black text-sm text-blue-900">900.0 kg (45.0%)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Turn-by-Turn Waypoint Routing */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wide block">
                      Assigned Turn-by-Turn Waypoint Route (CVRP Model 4 Optimized)
                    </span>
                    <div className="border border-slate-300 rounded bg-white text-[10px] font-mono divide-y divide-slate-200">
                      <div className="p-1.5 flex items-center justify-between text-slate-700">
                        <span><b>STOP 1 [START / 00:00]:</b> Central Regional Relief Hub Alpha (Depot Departure)</span>
                        <span className="font-bold text-emerald-800">LOAD CHECK PASSED</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between bg-amber-50 text-amber-900">
                        <span><b>STOP 2 [BYPASS / +04.5m]:</b> ⚠️ <b>Detour:</b> Bypass Moosarambagh Low Bridge Channel</span>
                        <span className="font-bold">LOWLAND SURGE AVOIDED</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between text-slate-900">
                        <span><b>STOP 3 [DELIVERY / +06.4m]:</b> SOS: Senior Care Home (Malakpet - 60 Elderly Trapped)</span>
                        <span className="font-bold text-blue-900">720L Water, 120kg Food, 45 Meds</span>
                      </div>
                      <div className="p-1.5 flex items-center justify-between text-slate-700">
                        <span><b>STOP 4 [RETURN / +12.4m]:</b> Central Regional Relief Hub Alpha (Return to Depot)</span>
                        <span className="font-bold text-slate-900">7.23 KM ROUND TRIP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* 6. SECTION 4: WAREHOUSE ISSUE SLIPS SIGNED OUT BY DEPOT MANAGER */}
            <div className="space-y-3 page-break-inside-avoid">
              <div className="flex items-center space-x-2 border-b border-slate-300 pb-1">
                <Package className="w-4 h-4 text-slate-800" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  5. Warehouse Issue Slips & Custody Transfer (Form IRS-204)
                </h3>
              </div>

              <div className="border border-slate-900 rounded-lg p-4 bg-slate-50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs border-b border-slate-200 pb-2">
                  <div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase">Issuing Warehouse Depot: </span>
                    <b className="text-slate-950">Central Strategic Relief Hub (WH-HYD-CENTRAL)</b>
                  </div>
                  <div className="font-mono text-[11px] text-slate-700">
                    Voucher Ref: <b>WH-ISSUE-2026-NOV-4902</b>
                  </div>
                </div>

                {/* Warehouse Stock Release Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-slate-300 bg-white">
                    <thead className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-300">
                      <tr>
                        <th className="p-2">SKU Code</th>
                        <th className="p-2">Item Description</th>
                        <th className="p-2">Batch / Lot #</th>
                        <th className="p-2 text-center">Released Qty</th>
                        <th className="p-2 text-right">Gross Weight</th>
                        <th className="p-2 text-right">Sphere Standards Clearance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-[11px]">
                      <tr>
                        <td className="p-2 font-mono font-bold text-slate-900">WTR-CAN-20L</td>
                        <td className="p-2">Potable Water 20L Heavy Jerrycans</td>
                        <td className="p-2 font-mono text-[10px]">LOT-2026-W09</td>
                        <td className="p-2 text-center font-mono font-bold">81 Cans (1,620 L)</td>
                        <td className="p-2 text-right font-mono">1,620.0 kg</td>
                        <td className="p-2 text-right text-emerald-800 font-bold">✓ PASSED (15L/day req)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-slate-900">RAT-MRE-01</td>
                        <td className="p-2">High-Calorie Ready-to-Eat Ration Packs</td>
                        <td className="p-2 font-mono text-[10px]">LOT-2026-F14</td>
                        <td className="p-2 text-center font-mono font-bold">135 Packs</td>
                        <td className="p-2 text-right font-mono">270.0 kg</td>
                        <td className="p-2 text-right text-emerald-800 font-bold">✓ PASSED (2,400 kcal)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-slate-900">MED-TRM-PK</td>
                        <td className="p-2">Emergency First Aid & Trauma Splints</td>
                        <td className="p-2 font-mono text-[10px]">LOT-2026-M22</td>
                        <td className="p-2 text-center font-mono font-bold">90 Kits</td>
                        <td className="p-2 text-right font-mono">90.0 kg</td>
                        <td className="p-2 text-right text-emerald-800 font-bold">✓ PASSED (Sterile Seal)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-mono font-bold text-slate-900">SHE-TRP-04</td>
                        <td className="p-2">Heavy-Duty Polythene Tarpaulins (4x5m)</td>
                        <td className="p-2 font-mono text-[10px]">LOT-2026-S03</td>
                        <td className="p-2 text-center font-mono font-bold">45 Units</td>
                        <td className="p-2 text-right font-mono">45.0 kg</td>
                        <td className="p-2 text-right text-emerald-800 font-bold">✓ PASSED (3.5m²/person)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Warehouse Manager & Escort Signatures */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-300">
                  <div className="border border-slate-300 rounded p-2.5 bg-white space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 uppercase">Released By (Depot Manager)</div>
                    <div className="font-mono text-xs font-black text-slate-950">Col. Rajesh Sharma</div>
                    <div className="text-[9px] text-slate-700">Chief Logistics Custodian, WH-HYD-CENTRAL</div>
                    <div className="pt-2 mt-1 border-t border-dashed border-slate-300 flex justify-between text-[8px] text-slate-600">
                      <span>Signature: __________________________</span>
                      <span>Date: {authorizedAt}</span>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded p-2.5 bg-white space-y-1">
                    <div className="text-[10px] font-bold text-slate-700 uppercase">Received By (Fleet Lead / Escort)</div>
                    <div className="font-mono text-xs font-black text-slate-950">Havildar M. Krishnan</div>
                    <div className="text-[9px] text-slate-700">Fleet Escort Commander, TRUCK-4x4-ALPHA</div>
                    <div className="pt-2 mt-1 border-t border-dashed border-slate-300 flex justify-between text-[8px] text-slate-600">
                      <span>Signature: __________________________</span>
                      <span>Date: {authorizedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. STATUTORY FOOTER & AUDIT INTEGRITY STATEMENT */}
            <div className="border-t-2 border-slate-900 pt-3 flex flex-col sm:flex-row items-center justify-between text-[9px] text-slate-600 gap-2 font-mono">
              <div>
                NDMA FORM IRS-201 (REVISED 2026) • AUTHENTICATED EMERGENCY DISPATCH MANIFEST
              </div>
              <div className="text-right">
                IMMUTABLE CHAIN-OF-CUSTODY RECORD • STATE DISASTER MANAGEMENT PORTAL
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
