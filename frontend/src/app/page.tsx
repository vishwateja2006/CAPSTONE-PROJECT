import Link from "next/link";
import {
  ShieldAlert,
  Radio,
  ArrowRight,
  Package,
  Users,
  Truck,
  Cpu,
  CheckCircle2,
  Activity,
  Layers,
  MapPin,
  Lock,
  HeartHandshake
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-red-950/40 border border-slate-800 p-8 sm:p-14 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[30rem] h-[30rem] bg-gradient-to-br from-red-600/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>ResQLink AI Disaster Logistics & Fair Relief</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            AI-Driven Disaster Relief, <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Zero Confusion. Two Unified Portals.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            ResQLink simplifies emergency coordination into two streamlined experiences: 
            a dedicated <strong className="text-white">Citizen / User Portal</strong> for instant SOS and relief tracking, and an <strong className="text-white">Admin Command Center</strong> powered by 5 AI models for triage, fair allocation, and hazard-bypass routing.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/dashboard/user"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Open User / Citizen Portal</span>
            </Link>

            <Link
              href="/dashboard/admin"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Command Center</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all hover:scale-105"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Login (User / Admin)</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/map"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 font-semibold text-sm border border-cyan-800/50 transition-all hover:scale-105"
            >
              <MapPin className="w-4 h-4" />
              <span>Live Hazard Map</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Operational Metrics Ticker */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <Activity className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <div className="text-slate-400">DEFCON STATUS</div>
            <div className="text-white font-bold text-sm">DEFCON-1 (Active Hazard)</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <Layers className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div>
            <div className="text-slate-400">PORTAL STRUCTURE</div>
            <div className="text-white font-bold text-sm">Citizen & Admin Only</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400">AI PIPELINES</div>
            <div className="text-white font-bold text-sm">5 Autonomous Models</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400">FAIRNESS METRIC</div>
            <div className="text-white font-bold text-sm">Gini = 0.019 (Verified Equity)</div>
          </div>
        </div>
      </div>

      {/* Structured Dual-Portal Architecture Showcase */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">Select Your Portal</h2>
          <p className="text-sm text-slate-400">Streamlined access for affected citizens and emergency administrators.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Citizen / User Portal */}
          <div className="rounded-3xl bg-slate-900/80 border border-red-900/40 p-8 flex flex-col justify-between hover:border-red-500/50 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-800/80 text-red-400">
                  <Users className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 font-mono text-xs font-bold">
                  CITIZEN & USER
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                  Citizen / User Portal
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Fast, intuitive emergency hub for citizens. Send high-priority distress signals, track incoming relief supplies, and discover safe shelter camps.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Radio className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span><strong>AI SOS Beacon:</strong> Intake form with automatic vulnerability tagging (infants, elderly, medical urgency).</span>
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
                href="/dashboard/user"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm transition-all shadow-lg shadow-red-600/20"
              >
                <span>Enter Citizen Portal</span>
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
                  <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>SHA-256 Audit Ledger:</strong> Tamper-evident cryptographic blocks and verifiable Proof-of-Delivery tokens.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link
                href="/dashboard/admin"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <span>Enter Admin Command</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
