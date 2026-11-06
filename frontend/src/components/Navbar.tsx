"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Map,
  Users,
  ShieldCheck,
  LogIn,
  Radio,
  Home
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/map", label: "Live GIS Map", icon: Map },
    { href: "/dashboard/user", label: "User Portal", icon: Users },
    { href: "/dashboard/admin", label: "Admin Command", icon: ShieldCheck },
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

        {/* Primary Clear Navigation (No confusing dropdowns) */}
        <nav className="hidden md:flex items-center space-x-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? item.href === "/dashboard/admin"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/60"
                      : item.href === "/dashboard/user"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/60"
                      : "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isActive
                    ? item.href === "/dashboard/admin" ? "text-amber-400" : item.href === "/dashboard/user" ? "text-blue-400" : "text-white"
                    : "text-slate-400"
                }`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth & Emergency SOS Actions */}
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 transition-colors"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-400" />
            <span>Login</span>
          </Link>

          <Link
            href="/sos"
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-600/30 transition-transform hover:scale-105"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>SOS</span>
          </Link>
        </div>

      </div>
    </header>
  );
}
