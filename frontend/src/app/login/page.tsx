"use client";

import React, { useState, useEffect } from "react";
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
  Users
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [email, setEmail] = useState("citizen@resqlink.org");
  const [password, setPassword] = useState("••••••••");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Two canonical roles only
  const roleConfigs = {
    USER: {
      title: "Citizen / User Login",
      badge: "Public & Affected Citizens",
      target: "/dashboard/user",
      defaultEmail: "citizen@resqlink.org",
      description: "Request emergency aid, broadcast SOS, track relief delivery, and find safe camps."
    },
    ADMIN: {
      title: "Administrator / Authority",
      badge: "Command Center Operations",
      target: "/dashboard/admin",
      defaultEmail: "admin@resqlink.org",
      description: "Incident command, 5 AI prediction models, warehouse stocks, and fleet CVRP dispatch."
    }
  };

  useEffect(() => {
    try {
      router.prefetch("/dashboard/user");
      router.prefetch("/dashboard/admin");
    } catch {}
  }, [router]);

  const handleSelectRole = (selectedRole: "USER" | "ADMIN") => {
    setRole(selectedRole);
    setEmail(roleConfigs[selectedRole].defaultEmail);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const destination = roleConfigs[role].target;
    router.push(destination);
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-white mx-auto shadow-lg shadow-red-500/20">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">ResQLink Access Portal</h1>
        <p className="text-xs text-slate-400">
          Select whether you are accessing the platform as a <b>Citizen</b> or an <b>Administrator</b>.
        </p>
      </div>

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

        {/* The 2 Clear Account Roles (User vs Admin) */}
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
                SOS intake, delivery tracking & shelter locator.
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

        {/* 1-Click Fast Launch Box */}
        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-slate-400">⚡ Direct 1-Click Fast Launch:</span>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link
              href="/dashboard/user"
              className="flex-1 sm:flex-none text-center px-3.5 py-1.5 rounded-lg bg-blue-950 text-blue-300 border border-blue-800/80 hover:bg-blue-900 font-bold font-mono text-[11px]"
            >
              ➔ User Portal
            </Link>
            <Link
              href="/dashboard/admin"
              className="flex-1 sm:flex-none text-center px-3.5 py-1.5 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/80 hover:bg-amber-900 font-bold font-mono text-[11px]"
            >
              ➔ Admin Portal
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
