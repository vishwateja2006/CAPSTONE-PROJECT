"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldAlert,
  LogIn,
  UserPlus,
  KeyRound,
  Mail,
  User,
  Phone,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Users,
  AlertCircle
} from "lucide-react";
import { loginAsRole, getAuthSession } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [lockedRole, setLockedRole] = useState<"USER" | "ADMIN" | null>(null);
  const [email, setEmail] = useState("citizen@resqlink.org");
  const [password, setPassword] = useState("••••••••");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  // Two canonical roles only
  const roleConfigs = {
    USER: {
      title: "Citizen / User Login",
      badge: "Public & Affected Citizens",
      target: "/dashboard/user",
      defaultEmail: "citizen@resqlink.org",
      defaultName: "Citizen User",
      description: "Request emergency aid, track relief delivery, and find safe camps."
    },
    ADMIN: {
      title: "Administrator / Authority",
      badge: "Command Center Operations",
      target: "/dashboard/admin",
      defaultEmail: "admin@resqlink.org",
      defaultName: "Commander Sharma",
      description: "Incident command, 5 AI prediction models, warehouse stocks, and fleet CVRP dispatch."
    }
  };

  useEffect(() => {
    // Check if user was redirected or clicked specific role
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "USER" || roleParam === "ADMIN") {
        setRole(roleParam);
        setLockedRole(roleParam);
        setEmail(roleConfigs[roleParam].defaultEmail);
      }

      const redirectTarget = params.get("redirect");
      if (redirectTarget) {
        setRedirectNotice(`Please sign in to access ${redirectTarget}. Navigation options become active after login.`);
        if (!roleParam) {
          if (redirectTarget.includes("admin")) {
            setRole("ADMIN");
            setEmail(roleConfigs.ADMIN.defaultEmail);
          } else if (redirectTarget.includes("user")) {
            setRole("USER");
            setEmail(roleConfigs.USER.defaultEmail);
          }
        }
      }
      // If already logged in, redirect directly
      const session = getAuthSession();
      if (session) {
        if (redirectTarget) {
          router.push(redirectTarget);
        } else {
          router.push(roleConfigs[session.role].target);
        }
      }
    }

    try {
      router.prefetch("/dashboard/user");
      router.prefetch("/dashboard/admin");
      router.prefetch("/map");
    } catch {}
  }, [router]);

  const handleSelectRole = (selectedRole: "USER" | "ADMIN") => {
    setRole(selectedRole);
    setEmail(roleConfigs[selectedRole].defaultEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userName = fullName.trim() || roleConfigs[role].defaultName;
    loginAsRole(role, email, userName);

    // If there is a redirect parameter matching permitted role, go there, else go to role default
    let destination = roleConfigs[role].target;
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const redirectTarget = params.get("redirect");
      if (redirectTarget) {
        destination = redirectTarget;
      }
    }

    setTimeout(() => {
      router.push(destination);
    }, 300);
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {lockedRole === "ADMIN"
            ? "Administrator Command Access"
            : lockedRole === "USER"
            ? "Citizen / User Aid Portal"
            : "ResQLink Access Portal"}
        </h1>
        <p className="text-xs text-slate-400">
          {lockedRole === "ADMIN"
            ? "Administrative command login. AI models and CVRP logistics unlock upon authentication."
            : lockedRole === "USER"
            ? "Citizen aid sign in. Submit assistance requests and track live relief dispatches."
            : "Sign in as a Citizen or Administrator. Portal navigation & live GIS tools unlock upon login."}
        </p>
      </div>

      {/* Redirect / Auth Required Notification */}
      {redirectNotice && (
        <div className="flex items-center space-x-3 p-4 rounded-2xl bg-amber-950/80 border border-amber-600/70 text-amber-200 text-xs shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>{redirectNotice}</span>
        </div>
      )}

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Sign In vs Sign Up Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2.5 rounded-lg transition-all ${
              isLogin ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In to Account
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2.5 rounded-lg transition-all ${
              !isLogin ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Portal Selection: Hidden when clicking Login as Citizen or Login as Administrator; Shown ONLY from top-right Login */}
        {!lockedRole && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Select Login Portal:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* User Option */}
              <button
                type="button"
                onClick={() => handleSelectRole("USER")}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  role === "USER"
                    ? "bg-blue-950/70 border-blue-500 text-white shadow-lg ring-1 ring-blue-500"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl ${role === "USER" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400"}`}>
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">Citizen / User</div>
                    <div className="text-[10px] text-blue-400 font-mono">Public Access</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2">
                  Assistance intake, delivery tracking & shelter locator.
                </p>
              </button>

              {/* Admin Option */}
              <button
                type="button"
                onClick={() => handleSelectRole("ADMIN")}
                className={`p-4 rounded-2xl text-left border transition-all ${
                  role === "ADMIN"
                    ? "bg-amber-950/70 border-amber-500 text-white shadow-lg ring-1 ring-amber-500"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-xl ${role === "ADMIN" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400"}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-black text-sm text-white">Administrator</div>
                    <div className="text-[10px] text-amber-400 font-mono">Command Center</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2.5 line-clamp-2">
                  5 AI Models, CVRP fleet dispatch & stock control.
                </p>
              </button>

            </div>
          </div>
        )}

        {/* Login / Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kavitha Sundaram"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    placeholder="+91-9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {role === "USER" ? "Citizen Email" : "Admin Official Email"}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              {isLogin && <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">Forgot?</span>}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] ${
              role === "USER"
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
                : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching {role === "USER" ? "Citizen Portal" : "Admin Command"}...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? `Sign In as ${role === "USER" ? "Citizen / User" : "Administrator"}` : "Create Account"}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
