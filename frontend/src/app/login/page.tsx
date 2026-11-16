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
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Sparkles
} from "lucide-react";
import { loginWithVerifiedCredentials, getAuthSession } from "../../lib/auth";
import { loginUser, registerUser } from "../../lib/api";
import {
  getStoredLanguage,
  subscribeToLanguage,
  translations,
  AppLanguage
} from "../../lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>("EN");
  const t = translations[selectedLanguage]?.login || translations.EN.login;
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<"USER" | "ADMIN">("USER");
  const [lockedRole, setLockedRole] = useState<"USER" | "ADMIN" | null>(null);

  // Sign In State (clean by default; quick demo buttons available)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  // Registration State
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"CITIZEN" | "ADMIN">("CITIZEN");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [redirectNotice, setRedirectNotice] = useState<string | null>(null);

  const roleConfigs = {
    USER: {
      title: "Citizen / User Portal",
      badge: "Public & Affected Citizens",
      target: "/dashboard/user",
      defaultUsername: "citizen",
      defaultEmail: "citizen@resqlink.org",
      defaultPassword: "citizen123",
      defaultName: "Citizen User",
      description: "Request emergency aid, track relief delivery, and find safe camps."
    },
    ADMIN: {
      title: "Administrator / Command",
      badge: "Command Center Operations",
      target: "/dashboard/admin",
      defaultUsername: "admin",
      defaultEmail: "admin@resqlink.org",
      defaultPassword: "admin123",
      defaultName: "Commander Sharma",
      description: "Incident command, 5 AI prediction models, warehouse stocks, and fleet CVRP dispatch."
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get("role");
      if (roleParam === "USER" || roleParam === "ADMIN") {
        setRole(roleParam);
        setLockedRole(roleParam);
        setRegRole(roleParam === "ADMIN" ? "ADMIN" : "CITIZEN");
      }

      const redirectTarget = params.get("redirect");
      if (redirectTarget) {
        setRedirectNotice(`Please sign in to access ${redirectTarget}. Navigation options become active after login.`);
        if (!roleParam) {
          if (redirectTarget.includes("admin")) {
            setRole("ADMIN");
            setRegRole("ADMIN");
          } else if (redirectTarget.includes("user")) {
            setRole("USER");
            setRegRole("CITIZEN");
          }
        }
      }

      // If already logged in with verified token, redirect directly
      const session = getAuthSession();
      if (session && session.token) {
        if (redirectTarget) {
          router.push(redirectTarget);
        } else {
          router.push(roleConfigs[session.role].target);
        }
      }
    }

    setSelectedLanguage(getStoredLanguage());
    const unsubLang = subscribeToLanguage((newLang) => {
      setSelectedLanguage(newLang);
    });

    try {
      router.prefetch("/dashboard/user");
      router.prefetch("/dashboard/admin");
      router.prefetch("/map");
    } catch {}

    return () => {
      unsubLang();
    };
  }, [router]);

  const handleSelectRole = (selectedRole: "USER" | "ADMIN") => {
    setRole(selectedRole);
    setRegRole(selectedRole === "ADMIN" ? "ADMIN" : "CITIZEN");
    setErrorMessage(null);
  };

  const handleAutofillDemo = (selectedRole: "USER" | "ADMIN") => {
    setRole(selectedRole);
    setIdentifier(roleConfigs[selectedRole].defaultUsername);
    setPassword(roleConfigs[selectedRole].defaultPassword);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (isLogin) {
      // ----------------- SIGN IN VALIDATION & SUBMISSION -----------------
      const trimmedIdentifier = identifier.trim();
      const trimmedPassword = password.trim();

      if (!trimmedIdentifier) {
        setErrorMessage("Validation error: Username or email is required.");
        return;
      }
      if (!trimmedPassword) {
        setErrorMessage("Validation error: Password is required.");
        return;
      }

      setIsSubmitting(true);

      try {
        const loginResult = await loginUser({
          identifier: trimmedIdentifier,
          password: trimmedPassword,
          portal: role
        });

        loginWithVerifiedCredentials(loginResult);

        let destination = roleConfigs[loginResult.user.role].target;
        if (typeof window !== "undefined") {
          const params = new URLSearchParams(window.location.search);
          const redirectTarget = params.get("redirect");
          if (redirectTarget) {
            destination = redirectTarget;
          }
        }

        router.push(destination);
      } catch (err: any) {
        console.error("Authentication failed:", err);
        const msg = err.message || "Invalid username/email or password. Access denied.";
        setErrorMessage(msg);
        setIsSubmitting(false);
      }
    } else {
      // ----------------- REGISTRATION VALIDATION & SAVE TO DB -----------------
      const trimmedName = regFullName.trim();
      const trimmedEmail = regEmail.trim().toLowerCase();
      const trimmedUsername = regUsername.trim().toLowerCase() || trimmedEmail.split("@")[0].replace(/[^a-z0-9_]/g, "_");
      const trimmedPhone = regPhone.trim();
      const trimmedPassword = regPassword.trim();
      const trimmedConfirm = regConfirmPassword.trim();

      if (!trimmedName) {
        setErrorMessage("Validation error: Full name is required.");
        return;
      }
      if (!trimmedEmail || !trimmedEmail.includes("@")) {
        setErrorMessage("Validation error: Please provide a valid email address.");
        return;
      }
      if (!trimmedPassword || trimmedPassword.length < 6) {
        setErrorMessage("Validation error: Password must be at least 6 characters long.");
        return;
      }
      if (trimmedPassword !== trimmedConfirm) {
        setErrorMessage("Validation error: Passwords do not match.");
        return;
      }

      setIsSubmitting(true);

      try {
        const regResult = await registerUser({
          email: trimmedEmail,
          password: trimmedPassword,
          full_name: trimmedName,
          phone: trimmedPhone,
          username: trimmedUsername,
          role: regRole
        });

        setSuccessMessage(`Account registered for ${trimmedEmail}! Credentials saved into database.`);
        loginWithVerifiedCredentials(regResult);

        setTimeout(() => {
          const target = regResult.user.role === "ADMIN" ? "/dashboard/admin" : "/dashboard/user";
          router.push(target);
        }, 1200);

      } catch (err: any) {
        console.error("Registration failed:", err);
        const msg = err.message || "Registration failed. Please check your details.";
        setErrorMessage(msg);
        setIsSubmitting(false);
      }
    }
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
            ? t.roleAdmin
            : lockedRole === "USER"
            ? t.roleUser
            : t.title}
        </h1>
        <p className="text-xs text-slate-400">
          {isLogin
            ? (lockedRole === "ADMIN" ? t.roleAdminDesc : lockedRole === "USER" ? t.roleUserDesc : t.subtitle)
            : "Register your account. Your credentials and profile are safely saved in the ResQLink database."}
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
            onClick={() => {
              setIsLogin(true);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              isLogin ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In to Account</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setErrorMessage(null);
              setSuccessMessage(null);
            }}
            className={`py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
              !isLogin ? "bg-amber-500 text-slate-950 shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create New Account</span>
          </button>
        </div>

        {/* Portal Selection (Sign In mode): Shown ONLY when not directly locked by URL */}
        {isLogin && !lockedRole && (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">Target Portal:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectRole("USER")}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  role === "USER"
                    ? "bg-blue-950/70 border-blue-500 text-white shadow-lg ring-1 ring-blue-500"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-xl ${role === "USER" ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-400"}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white">{t.roleUser}</div>
                    <div className="text-[10px] text-blue-400 font-mono">{t.roleUserBadge}</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole("ADMIN")}
                className={`p-3.5 rounded-2xl text-left border transition-all ${
                  role === "ADMIN"
                    ? "bg-amber-950/70 border-amber-500 text-white shadow-lg ring-1 ring-amber-500"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div className={`p-1.5 rounded-xl ${role === "ADMIN" ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400"}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-black text-xs text-white">{t.roleAdmin}</div>
                    <div className="text-[10px] text-amber-400 font-mono">{t.roleAdminBadge}</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error Alert Banner */}
          {errorMessage && (
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-red-950/90 border border-red-500/80 text-red-200 text-xs shadow-xl animate-in fade-in">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-red-300">Action Required</div>
                <div className="text-red-200 leading-relaxed">{errorMessage}</div>
              </div>
            </div>
          )}

          {/* Success Alert Banner */}
          {successMessage && (
            <div className="flex items-start space-x-3 p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-xs shadow-xl animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-300">Registration Confirmed</div>
                <div className="text-emerald-200 leading-relaxed">{successMessage}</div>
              </div>
            </div>
          )}

          {/* ======================= REGISTRATION FIELDS ======================= */}
          {!isLogin ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Priya Sharma"
                    value={regFullName}
                    onChange={(e) => {
                      setRegFullName(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      disabled={isSubmitting}
                      placeholder="e.g. priya@gmail.com"
                      value={regEmail}
                      onChange={(e) => {
                        setRegEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Username <span className="text-slate-500 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. priya_sharma"
                      value={regUsername}
                      onChange={(e) => {
                        setRegUsername(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Contact Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="tel"
                      disabled={isSubmitting}
                      placeholder="+91-9876543210"
                      value={regPhone}
                      onChange={(e) => {
                        setRegPhone(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Account Type</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as "CITIZEN" | "ADMIN")}
                    disabled={isSubmitting || lockedRole !== null}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none"
                  >
                    <option value="CITIZEN">Citizen / Affected Public (Standard User)</option>
                    <option value="ADMIN">Disaster Authority / Administrator</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Security Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                      placeholder="Min 6 characters"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password *</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      disabled={isSubmitting}
                      placeholder="Re-type password"
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* ======================= SIGN IN FIELDS ======================= */
            <>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">
                    {role === "USER" ? (t.usernameOrEmailLabel || t.emailLabel) : `${t.roleAdmin} - ${t.usernameOrEmailLabel || t.emailLabel}`}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Accepts <span className="text-amber-400 font-bold">username</span> or <span className="text-cyan-400 font-bold">email</span>
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 flex items-center space-x-1 text-slate-400 pointer-events-none">
                    <User className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] text-slate-600 font-mono">/</span>
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <input
                    type="text"
                    required
                    disabled={isSubmitting}
                    autoComplete="username"
                    placeholder="Enter your registered email or username"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full pl-14 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-300">{t.passwordLabel}</label>
                  <span className="text-[11px] text-amber-400 hover:underline cursor-pointer">Forgot?</span>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    disabled={isSubmitting}
                    placeholder="Enter your security password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Quick Fill Demo Section (Optional convenience for evaluation) */}
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Quick Autofill Demo Accounts:</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">One-click testing</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAutofillDemo("USER")}
                    className="p-2.5 rounded-xl border border-blue-900/60 bg-blue-950/30 hover:bg-blue-900/40 text-left transition-all group"
                  >
                    <div className="flex items-center space-x-2">
                      <Users className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-blue-200">Citizen User</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">citizen &bull; citizen123</div>
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleAutofillDemo("ADMIN")}
                    className="p-2.5 rounded-xl border border-amber-900/60 bg-amber-950/30 hover:bg-amber-900/40 text-left transition-all group"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-bold text-amber-200">Administrator</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">admin &bull; admin123</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg transition-all hover:scale-[1.01] ${
              (!isLogin ? regRole === "ADMIN" : role === "ADMIN")
                ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isLogin ? t.submittingBtn : "Registering Account & Saving Data..."}</span>
              </>
            ) : (
              <>
                {isLogin ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>{`${t.submitBtn} (${role === "USER" ? t.roleUser : t.roleAdmin})`}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Create Account & Save to Database</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

      </div>

    </div>
  );
}
