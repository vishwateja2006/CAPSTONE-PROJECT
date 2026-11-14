"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Package,
  Users,
  Truck,
  Cpu,
  CheckCircle2,
  Activity,
  Layers,
  MapPin,
  LogIn,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Compass,
  Lock
} from "lucide-react";
import { getAuthSession, subscribeToAuth, AuthSession } from "../lib/auth";

export default function LandingPage() {
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setAuth(getAuthSession());
    const unsubscribe = subscribeToAuth((newAuth) => {
      setAuth(newAuth);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-14 py-2">
      
      {/* Enhanced Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-8 sm:p-14 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-amber-500/15 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-inner backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">Next-Gen Response Engine</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">Autonomous Disaster Coordination</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              Intelligent Disaster Relief, <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                Zero Confusion.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              ResQLink unites rapid emergency response with automated fairness. Powered by 5 specialized AI models for demand forecasting, flood hazard segmentation, distress triage, vehicle routing, and equitable resource allocation.
            </p>
          </div>

          {/* Hero Right Visual: Platform Highlights Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Operational Core</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  ONLINE 100%
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>5 Autonomous AI Models</span>
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">Active</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Resource Allocation Equity</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">Gini = 0.019</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hazard-Bypass Fleet Routing</span>
                  </span>
                  <span className="text-amber-400 font-mono font-bold">OR-Tools VRP</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Cryptographic Audit Proof</span>
                  </span>
                  <span className="text-purple-400 font-mono font-bold">SHA-256</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Operational Metrics Ticker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <Activity className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">ACTIVE SURVEILLANCE</div>
            <div className="text-white font-bold text-sm">Real-Time Hazards</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <Layers className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">ACCESS CONTROL</div>
            <div className="text-white font-bold text-sm">Protected Roles</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <Cpu className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">DECISION PIPELINES</div>
            <div className="text-white font-bold text-sm">5 Neural Models</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">FAIRNESS METRIC</div>
            <div className="text-white font-bold text-sm">Gini = 0.019 (Equity)</div>
          </div>
        </div>
      </div>

      {/* Structured Dual-Portal Architecture Showcase (UNTOUCHED) */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Select Your Portal</h2>
          <p className="text-sm text-slate-400">Sign in to unlock your dedicated citizen or admin operational console.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Citizen / User Portal */}
          <div className="rounded-3xl bg-slate-900/80 border border-blue-900/40 p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-blue-950/80 border border-blue-800/80 text-blue-400">
                  <Users className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/80 text-blue-300 font-mono text-xs font-bold">
                  CITIZEN & USER
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                  Citizen / User Portal
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Fast, intuitive emergency hub for citizens. Submit high-priority relief requests, track incoming supplies, and discover safe shelter camps.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <ClipboardList className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Assistance Intake:</strong> Relief request form with automatic vulnerability tagging (infants, elderly, medical urgency).</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Truck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Live Relief Tracking:</strong> Track assigned vehicles, delivery status (Dispatched, En Route, Delivered), and ETAs.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Nearby Safe Shelters:</strong> Locate verified relief camps with real-time capacity and contact hotlines.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link
                href="/login?role=USER&redirect=/dashboard/user"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                <span>Login as User</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Admin Command Center */}
          <div className="rounded-3xl bg-slate-900/80 border border-amber-900/40 p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono text-xs font-bold">
                  AUTHORITY & LOGISTICS
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                  Admin Command Center
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Unified command interface for disaster coordinators. Inspect real-time triage queues, execute all 5 AI models, manage warehouse supplies, and seal audit ledgers.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>5 AI Models & UDAP:</strong> LSTM demand forecasts, NDWI flood segmentation, NLP triage, CVRP routing, and Max-Min fair allocation.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Package className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Warehouse Inventory:</strong> Monitor Water, Food, Medicine, and Shelters with automated low-stock warnings.</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>SHA-256 Audit Ledger:</strong> Tamper-evident cryptographic blocks and verifiable Proof-of-Delivery tokens.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link
                href="/login?role=ADMIN&redirect=/dashboard/admin"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <span>Login as Administrator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
