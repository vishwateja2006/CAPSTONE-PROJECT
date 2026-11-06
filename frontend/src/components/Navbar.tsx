"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  LayoutDashboard,
  Flame,
  Package,
  Users,
  HeartHandshake,
  UserCheck,
  Truck,
  Cpu,
  LogIn,
  ChevronDown,
  Radio,
  MapPin
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const mainLinks = [
    { href: "/dashboard/admin", label: "Admin", icon: LayoutDashboard },
    { href: "/dashboard/disaster", label: "Disasters", icon: Flame },
    { href: "/dashboard/resource", label: "Resources", icon: Package },
    { href: "/dashboard/beneficiary", label: "Beneficiaries", icon: Users },
    { href: "/dashboard/ai", label: "AI Engine", icon: Cpu },
  ];

  const allDashboards = [
    { href: "/dashboard/admin", label: "1. Admin Dashboard", desc: "Overall system overview & audit logs", icon: LayoutDashboard },
    { href: "/dashboard/disaster", label: "2. Disaster Dashboard", desc: "Disaster monitoring & hazard zones", icon: Flame },
    { href: "/dashboard/resource", label: "3. Resource Dashboard", desc: "Warehouses & stock management", icon: Package },
    { href: "/dashboard/beneficiary", label: "4. Beneficiary Dashboard", desc: "Manage affected people & requests", icon: Users },
    { href: "/dashboard/ngo", label: "5. NGO / Donor Dashboard", desc: "Donations, pledges & contributions", icon: HeartHandshake },
    { href: "/dashboard/volunteer", label: "6. Volunteer Dashboard", desc: "Field tasks & proof of delivery", icon: UserCheck },
    { href: "/dashboard/logistics", label: "7. Logistics Dashboard", desc: "Fleet vehicles & route tracking", icon: Truck },
    { href: "/dashboard/ai", label: "8. AI Predictions Dashboard", desc: "Demand, damage, NLP & fair allocation", icon: Cpu },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">ResQ<span className="text-amber-400">Link</span></span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800 rounded">
              DEFCON-1 ACTIVE
            </span>
          </div>
        </Link>

        {/* Primary Navigation */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
          {mainLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-slate-800 text-amber-400 border border-slate-700"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* All 8 Dashboards Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800"
            >
              <span>All 8 Dashboards</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2"
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Role Dashboard
                </div>
                <div className="space-y-1 mt-1 max-h-96 overflow-y-auto">
                  {allDashboards.map((dash) => {
                    const DIcon = dash.icon;
                    const isSel = pathname === dash.href;
                    return (
                      <Link
                        key={dash.href}
                        href={dash.href}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start space-x-3 p-2 rounded-xl text-xs transition-colors ${
                          isSel ? "bg-slate-800 text-amber-400 font-bold" : "text-slate-200 hover:bg-slate-800/60"
                        }`}
                      >
                        <DIcon className="w-4 h-4 mt-0.5 text-amber-400 flex-shrink-0" />
                        <div>
                          <div className="font-semibold">{dash.label}</div>
                          <div className="text-[11px] text-slate-400">{dash.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Auth & Emergency SOS Actions */}
        <div className="flex items-center space-x-2.5">
          <Link
            href="/login"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-slate-400" />
            <span>Login / Signup</span>
          </Link>

          <Link
            href="/dashboard/beneficiary#sos"
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 transition-transform hover:scale-105"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>SOS</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
