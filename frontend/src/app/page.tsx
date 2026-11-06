import Link from "next/link";
import {
  ShieldAlert,
  Radio,
  ArrowRight,
  Flame,
  Package,
  Users,
  HeartHandshake,
  UserCheck,
  Truck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Layers
} from "lucide-react";

export default function LandingPage() {
  const dashboards = [
    { title: "Admin Dashboard", href: "/dashboard/admin", icon: ShieldAlert, desc: "System health, user role assignments & immutable audit logs.", badge: "Admin" },
    { title: "Disaster Dashboard", href: "/dashboard/disaster", icon: Flame, desc: "Real-time incident declaration, hazard polygons & severity maps.", badge: "Authority" },
    { title: "Resource Dashboard", href: "/dashboard/resource", icon: Package, desc: "Warehouse stock management, kit staging & low-stock triggers.", badge: "Warehouse" },
    { title: "Beneficiary Dashboard", href: "/dashboard/beneficiary", icon: Users, desc: "Affected family registration, distress SOS intake & status tracking.", badge: "Beneficiary" },
    { title: "NGO & Donor Portal", href: "/dashboard/ngo", icon: HeartHandshake, desc: "Aid pledges, transparency tracking & resource allocation audits.", badge: "NGO / Donor" },
    { title: "Volunteer Operations", href: "/dashboard/volunteer", icon: UserCheck, desc: "Assigned delivery missions, waypoint confirmation & ground reports.", badge: "Volunteer" },
    { title: "Logistics & Fleet", href: "/dashboard/logistics", icon: Truck, desc: "Vehicles, payload limits & dynamic CVRP route dispatching.", badge: "Logistics" },
    { title: "AI Predictions Engine", href: "/dashboard/ai", icon: Cpu, desc: "Demand forecasting, damage vision, NLP triage & Max-Min fair allocation.", badge: "AI / ML" }
  ];

  return (
    <div className="space-y-16 py-4">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-red-950/40 border border-slate-800 p-8 sm:p-14 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-[30rem] h-[30rem] bg-gradient-to-br from-red-600/20 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/80 text-red-400 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>ResQLink Autonomous Disaster Logistics Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
            AI-Driven Disaster Relief, <br />
            <span className="bg-gradient-to-r from-red-400 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Fair Allocation & Routing Platform
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            ResQLink unifies 6 crisis response roles with 5 core AI models. Eliminate first-come-first-served hoarding,
            triage thousands of emergency reports using NLP, and navigate flood barriers using geospatial vehicle routing.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href="/dashboard/beneficiary#sos"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all hover:scale-105"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Broadcast Emergency SOS</span>
            </Link>

            <Link
              href="/login"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all hover:scale-105"
            >
              <span>Login to Dashboard</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/dashboard/ai"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition-all hover:scale-105 shadow-lg shadow-amber-500/20"
            >
              <Cpu className="w-4 h-4" />
              <span>Test 5 AI Models</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Operational Metrics Ticker */}
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
            <div className="text-slate-400">SYSTEM ROLES</div>
            <div className="text-white font-bold text-sm">6 Authenticated Roles</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <Cpu className="w-6 h-6 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400">AI PIPELINES</div>
            <div className="text-white font-bold text-sm">5 Predictive Models</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400">FAIRNESS METRIC</div>
            <div className="text-white font-bold text-sm">Gini = 0.18 (Equitable)</div>
          </div>
        </div>
      </div>

      {/* 8 Dedicated Role Dashboards Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">8 Purpose-Built Operational Dashboards</h2>
            <p className="text-sm text-slate-400">Select any role dashboard to inspect its dedicated interface and controls.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {dashboards.map((dash) => {
            const Icon = dash.icon;
            return (
              <Link
                key={dash.href}
                href={dash.href}
                className="group p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900/90 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2.5 rounded-xl bg-slate-800 group-hover:bg-amber-950 text-amber-400 transition-colors">
                      <Icon className="w-5 h-5" />
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {dash.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition-colors">
                    {dash.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                    {dash.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center text-xs font-semibold text-slate-300 group-hover:text-amber-400">
                  <span>Open Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}
