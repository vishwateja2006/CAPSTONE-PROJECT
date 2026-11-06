import Link from "next/link";
import { ShieldAlert, Navigation, Package, Radio, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-red-950/40 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/60 text-red-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>Active Incident Response Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            AI-Driven Disaster Relief, <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Fair Allocation & Routing Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Eliminating bottlenecks in crisis logistics. ResQAI synchronizes NLP-powered emergency triage, 
            mathematically fair resource distribution (Max-Min fairness), and capacity-constrained dynamic vehicle routing around hazardous zones.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/sos"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm shadow-xl shadow-red-600/30 transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Submit Emergency SOS</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all hover:scale-105"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Core Architectural Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Module 1 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-red-950 text-red-400 border border-red-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">AI Urgency Triage</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            NLP keyword recognition & demographic vulnerability weighting to score requests from 0-100 instantly.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-red-400">
            <span>Phase 07: Natural Language Model</span>
          </div>
        </div>

        {/* Module 2 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-amber-950 text-amber-400 border border-amber-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Fair Resource Allocation</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Max-Min proportional distribution algorithm prevents hoarding and guarantees baseline survival supplies.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-amber-400">
            <span>Phase 08: Gini Fairness Solver</span>
          </div>
        </div>

        {/* Module 3 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-950 text-blue-400 border border-blue-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Navigation className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Route Optimization</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Dynamic capacity-constrained vehicle routing (CVRP) with real-time hazard avoidance & road penalty weights.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-blue-400">
            <span>Phase 08: Operations Research / VRP</span>
          </div>
        </div>

        {/* Module 4 */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Real-Time GIS & Alerts</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Live telemetry, WebSocket alerts, flood zone polygons, and interactive command center tracking.
          </p>
          <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-emerald-400">
            <span>Phase 10: Telemetry & Analytics</span>
          </div>
        </div>

      </div>

      {/* System Status Table Summary */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-white">Capstone System Architecture & Verification</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">BACKEND ENGINE</span>
            <div className="text-slate-200 font-bold mt-1">FastAPI + SQLAlchemy + Pydantic v2</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">ALGORITHMIC SOLVER</span>
            <div className="text-slate-200 font-bold mt-1">CVRP Heuristic + Max-Min Linear Fair Division</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-slate-500">DATABASE & GIS</span>
            <div className="text-slate-200 font-bold mt-1">PostgreSQL + PostGIS / Haversine Spatial Math</div>
          </div>
        </div>
      </div>

    </div>
  );
}
