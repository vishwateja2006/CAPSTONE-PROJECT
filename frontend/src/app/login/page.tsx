"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldAlert,
  LogIn,
  UserPlus,
  CheckCircle,
  KeyRound,
  Mail,
  User,
  Phone,
  ArrowRight
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("ADMIN");
  const [email, setEmail] = useState("admin@resqlink.org");
  const [password, setPassword] = useState("••••••••");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  const roles = [
    { id: "ADMIN", label: "Admin", target: "/dashboard/admin", email: "admin@resqlink.org" },
    { id: "AUTHORITY", label: "Disaster Authority", target: "/dashboard/disaster", email: "authority@ndma.gov" },
    { id: "WAREHOUSE", label: "Warehouse Manager", target: "/dashboard/resource", email: "depot.alpha@resqlink.org" },
    { id: "BENEFICIARY", label: "Beneficiary", target: "/dashboard/beneficiary", email: "citizen@relief.org" },
    { id: "NGO", label: "NGO / Donor", target: "/dashboard/ngo", email: "director@redcross.org" },
    { id: "VOLUNTEER", label: "Field Volunteer", target: "/dashboard/volunteer", email: "volunteer.alpha@resqlink.org" },
  ];

  const handleSelectRole = (rId: string) => {
    setRole(rId);
    const matched = roles.find((r) => r.id === rId);
    if (matched) {
      setEmail(matched.email);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = roles.find((r) => r.id === role);
    const destination = matched ? matched.target : "/dashboard/admin";
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
          Role-Based Access Control (RBAC) & Supabase Authentication Interface
        </p>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Sign In vs Sign Up Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`py-2 rounded-lg transition-all ${
              isLogin ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Sign In to Dashboard
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`py-2 rounded-lg transition-all ${
              !isLogin ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            Create New Account
          </button>
        </div>

        {/* Role Selector Grid */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300">Select Operating User Role:</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelectRole(r.id)}
                className={`p-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                  role === r.id
                    ? "bg-amber-950/70 border-amber-500 text-amber-300 shadow-md"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="truncate">{r.label}</div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5">RBAC: {r.id}</div>
              </button>
            ))}
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
                    placeholder="e.g. Dr. Rajesh Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Contact Phone</label>
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
            <label className="text-xs font-semibold text-slate-300">Authorized Email</label>
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
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-transform hover:scale-[1.01]"
          >
            <span>{isLogin ? `Sign In as ${role}` : "Register Role Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast-Switch Notice */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
          <span>💡 Quick Demo Mode Enabled</span>
          <span className="text-amber-400 font-mono font-semibold">One-Click Auto-Redirect</span>
        </div>

      </div>

    </div>
  );
}

