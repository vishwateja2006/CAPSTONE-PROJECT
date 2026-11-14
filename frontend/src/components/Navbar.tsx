"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  ShieldCheck,
  LogIn,
  LogOut,
  User,
  Menu,
  X
} from "lucide-react";
import { getAuthSession, clearAuthSession, subscribeToAuth, AuthSession } from "../lib/auth";
import ThemeDropdown from "./ThemeDropdown";
import ActiveIncidentBanner from "./ActiveIncidentBanner";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setAuth(getAuthSession());
    const unsubscribe = subscribeToAuth((newAuth) => {
      setAuth(newAuth);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const handleLogoClick = () => {
    clearAuthSession();
    setMobileMenuOpen(false);
  };

  // Navigation links: strictly conditionally unlocked AFTER login
  // Build active navigation links based on user role; Home is completely removed (ResQLink logo routes home)
  const getNavLinks = () => {
    // Before login: zero navigation options visible
    if (!isMounted || !auth) {
      return [];
    }

    // Citizen / User Portal Login: User Portal
    if (auth.role === "USER") {
      return [
        { href: "/dashboard/user", label: "User Portal", icon: Users }
      ];
    }

    // Admin Command Center Login: Admin Command
    if (auth.role === "ADMIN") {
      return [
        { href: "/dashboard/admin", label: "Admin Command", icon: ShieldCheck }
      ];
    }

    return [];
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Full width container: anchors items to their respective ends (Left & Right) */}
      <div className="w-full px-4 sm:px-8 lg:px-12 h-16 flex items-center justify-between">
        
        {/* LEFT END: Clean Brand Logo */}
        <Link href="/" onClick={handleLogoClick} className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 via-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-red-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <span className="text-lg font-black tracking-wider text-white">
            ResQ<span className="text-amber-400">Link</span>
          </span>
        </Link>

        {/* RIGHT END: Navigation Links + Login / User Pill + Logout */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Nav links (Only rendered when there are active links) */}
          {navLinks.length > 0 && (
            <>
              <nav className="flex items-center space-x-2">
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
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-sm shadow-amber-500/10"
                            : item.href === "/dashboard/user"
                            ? "bg-blue-500/20 text-blue-300 border border-blue-500/60 shadow-sm shadow-blue-500/10"
                            : "bg-slate-800 text-white border border-slate-700"
                          : "text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? item.href === "/dashboard/admin"
                              ? "text-amber-400"
                              : item.href === "/dashboard/user"
                              ? "text-blue-400"
                              : "text-white"
                            : "text-slate-400"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Divider between nav links and user badge */}
              <div className="w-px h-5 bg-slate-800" />
            </>
          )}

          {/* Auth State & Appearance Controls */}
          {isMounted && auth ? (
            /* Authenticated: Role Badge + Appearance (just left of Logout) + Logout */
            <div className="flex items-center space-x-2">
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs border ${
                  auth.role === "ADMIN"
                    ? "bg-amber-950/60 border-amber-500/50 text-amber-300"
                    : "bg-blue-950/60 border-blue-500/50 text-blue-300"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full animate-ping ${
                    auth.role === "ADMIN" ? "bg-amber-400" : "bg-blue-400"
                  }`}
                />
                <User className="w-3.5 h-3.5" />
                <span className="font-bold tracking-tight">
                  {auth.role === "ADMIN" ? "Admin" : "Citizen"}: {auth.name}
                </span>
              </div>

              {/* Appearance Sidedown Dropdown (Just left of the logout button) */}
              <ThemeDropdown />

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/70 hover:border-red-800 text-slate-300 hover:text-red-300 text-xs font-semibold border border-slate-800 transition-colors"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            /* Unauthenticated: Appearance (just left of Login) + Clean Login Button on Far Right */
            <div className="flex items-center space-x-2">
              <ThemeDropdown />
              <Link
                href="/login"
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition-all hover:scale-105"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Action Controls */}
        <div className="flex md:hidden items-center space-x-2">
          <ThemeDropdown />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950/98 px-4 py-4 space-y-3">
          {navLinks.length > 0 && (
            <div className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center space-x-2 px-3 py-2.5 rounded-xl text-xs font-bold ${
                      isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex flex-col space-y-2">
            {isMounted && auth ? (
              <div className="space-y-2">
                <div className="text-xs text-slate-400 font-mono px-1">
                  Signed in as: <strong className="text-white">{auth.name}</strong> ({auth.role})
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center space-x-2 py-2 rounded-xl bg-red-950/70 border border-red-800 text-red-300 text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Emergency Operational Ribbon: Active Incident & DEFCON Status */}
      <ActiveIncidentBanner />
    </header>
  );
}
