"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  Users,
  Database,
  Activity,
  UserCheck,
  Lock,
  Radio,
  Clock,
  CheckCircle,
  FileText
} from "lucide-react";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState([
    { id: "usr-01", name: "Dr. Rajesh Sharma", email: "authority@ndma.gov", role: "DISASTER_AUTHORITY", status: "ACTIVE" },
    { id: "usr-02", name: "Vikram Logistics", email: "depot.alpha@resqlink.org", role: "WAREHOUSE_MANAGER", status: "ACTIVE" },
    { id: "usr-03", name: "Red Cross Director", email: "director@redcross.org", role: "NGO_DONOR", status: "ACTIVE" },
    { id: "usr-04", name: "Priya Volunteer", email: "volunteer.alpha@resqlink.org", role: "VOLUNTEER", status: "ACTIVE" },
    { id: "usr-05", name: "Kavitha Citizen", email: "kavitha.victim@gmail.com", role: "BENEFICIARY", status: "ACTIVE" },
  ]);

  const auditLogs = [
    { id: "log-101", timestamp: "12:28:10", actor: "authority@ndma.gov", action: "DECLARED_DISASTER", details: "Declared Cyclone Vardah DEFCON-1", status: "SUCCESS" },
    { id: "log-102", timestamp: "12:25:44", actor: "system.ai", action: "SOLVED_CVRP_ROUTING", details: "Dispatched 2 vehicles avoiding Adyar Red Zone", status: "SUCCESS" },
    { id: "log-103", timestamp: "12:20:15", actor: "depot.alpha@resqlink.org", action: "STOCKED_WAREHOUSE", details: "Logged 1,200L Water & 850 Rations", status: "SUCCESS" },
    { id: "log-104", timestamp: "12:15:30", actor: "admin@resqlink.org", action: "UPDATED_RLS_POLICIES", details: "Enforced Supabase Beneficiary Table RLS", status: "SUCCESS" }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 mb-1">
            <Lock className="w-4 h-4" />
            <span>ROOT ADMINISTRATION // SYSTEM HEALTH</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Admin Command & Governance Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Overall system health, user role-based permissions (RBAC), and Supabase audit logs.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-400 flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>POSTGRES RLS ACTIVE</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Provisioned Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-white">{users.length + 18}</div>
          <div className="text-[11px] text-slate-500">Across 6 RBAC classes</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Database Nodes</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono">Supabase PG</div>
          <div className="text-[11px] text-slate-500">PostGIS spatial extensions enabled</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>Audit Events</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">1,420</div>
          <div className="text-[11px] text-slate-500">Immutable ledger logs recorded</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex justify-between text-slate-400 text-xs font-semibold uppercase">
            <span>AI Decision Engine</span>
            <Activity className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-white font-mono">ONLINE</div>
          <div className="text-[11px] text-slate-500">FastAPI backend latency 32ms</div>
        </div>
      </div>

      {/* Main Two-Column View: Users & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* User Management & Roles */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <span>User Roles & Permission Management</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">RBAC DIRECTORY</span>
          </div>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{u.name}</div>
                  <div className="text-slate-500 font-mono text-[11px]">{u.email}</div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold text-[10px]">
                    {u.role}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immutable Audit Logs Table */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>Immutable System Audit Trail (`audit_logs`)</span>
            </h2>
            <span className="text-[10px] font-mono text-slate-400">REAL-TIME LOGS</span>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-cyan-400 font-bold">{log.action}</span>
                  <span className="text-slate-500">{log.timestamp}</span>
                </div>
                <p className="text-slate-300">{log.details}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 font-mono">
                  <span>Actor: {log.actor}</span>
                  <span className="text-emerald-400 font-bold">STATUS: {log.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}

