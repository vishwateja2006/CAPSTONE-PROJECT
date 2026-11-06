"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldAlert, Map, LayoutDashboard, Truck, Package, Radio } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Command Center", icon: LayoutDashboard },
    { href: "/map", label: "GIS Situational Map", icon: Map },
    { href: "/sos", label: "Emergency SOS", icon: Radio, highlight: true },
    { href: "/resources", label: "Fair Allocation", icon: Package },
    { href: "/routes", label: "Route Dispatch", icon: Truck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">ResQ<span className="text-red-500">AI</span></span>
            <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-950/80 text-red-400 border border-red-800 rounded">
              DEFCON-1 ACTIVE
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  item.highlight
                    ? "bg-red-600 hover:bg-red-500 text-white font-semibold shadow-md shadow-red-600/30"
                    : isActive
                    ? "bg-slate-800 text-amber-400 border border-slate-700"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${item.highlight ? "text-white" : isActive ? "text-amber-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Tactical Status Pill */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-400 font-mono">LIVE FEED SYNCED</span>
          </div>
          <Link
            href="/sos"
            className="md:hidden flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold"
          >
            <Radio className="w-3.5 h-3.5" />
            <span>SOS</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
