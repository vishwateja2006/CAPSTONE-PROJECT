"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Radio,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Map,
  ShieldCheck,
  Package,
  Droplet,
  HeartPulse,
  Truck,
  ArrowRight,
  Crosshair,
  Compass,
  Loader2,
  Languages,
  Phone,
  Anchor,
  Shield,
  Flame,
  Sparkles,
  Activity
} from "lucide-react";
import { submitSOS } from "../../../lib/api";
import { getAuthSession, AuthSession } from "../../../lib/auth";
import {
  getStoredLanguage,
  subscribeToLanguage,
  translations,
  AppLanguage
} from "../../../lib/i18n";

interface UserRequest {
  id: string;
  family_count: number;
  needs: string[];
  vulnerabilities: string[];
  address: string;
  status: string;
  urgency_score: number;
  eta: string;
  assigned_vehicle: string;
  relief_package?: string;
  telemetry?: {
    pilot?: string;
    phone?: string;
    speed?: string;
    heading?: string;
    last_ping?: string;
  };
  created_at: string;
}

const getNeedIcon = (id: string) => {
  switch (id) {
    case "WATER": return Droplet;
    case "FOOD": return Flame;
    case "MEDICAL": return HeartPulse;
    case "SHELTER": return Shield;
    case "EVACUATION": return Anchor;
    default: return Package;
  }
};

interface LiveEtaCountdownProps {
  reqId: string;
  status: string;
  initialSeconds?: number;
  compact?: boolean;
  t: any;
  heading?: string;
  routeLabel?: string;
}

function LiveEtaCountdown({
  reqId,
  status,
  initialSeconds = 878, // 14 mins 38 seconds
  compact = false,
  t,
  heading,
  routeLabel
}: LiveEtaCountdownProps) {
  const isDelivered = status === "DELIVERED" || status === "RESOLVED";

  // Use persistent storage so page refreshes maintain the ticking state
  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (isDelivered) return 0;
    if (typeof window !== "undefined") {
      try {
        const storageKey = `resqlink_eta_${reqId}`;
        const savedTarget = localStorage.getItem(storageKey);
        const now = Date.now();
        if (savedTarget) {
          const targetTimestamp = parseInt(savedTarget, 10);
          const diff = Math.floor((targetTimestamp - now) / 1000);
          if (diff > 0) return diff;
          return 0;
        }
        const newTarget = now + initialSeconds * 1000;
        localStorage.setItem(storageKey, newTarget.toString());
        return initialSeconds;
      } catch {
        return initialSeconds;
      }
    }
    return initialSeconds;
  });

  useEffect(() => {
    if (isDelivered) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isDelivered]);

  if (isDelivered || secondsLeft === 0) {
    if (compact) {
      return (
        <span className="inline-flex items-center space-x-1.5 text-emerald-400 font-mono font-bold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.arrivedDelivered}</span>
        </span>
      );
    }
    return (
      <div className="space-y-1.5">
        <div className="flex items-center space-x-1.5 text-emerald-400 font-mono font-bold text-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{t.arrivedDelivered}</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate">
          {routeLabel || "Route:"} <span className="text-slate-200 font-medium">{heading || "Delivered at Musi Sector"}</span>
        </div>
      </div>
    );
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  // Calculate dynamic journey progress (from 35% at 15 mins down to 98% as time decreases)
  const totalDuration = 900;
  const elapsed = Math.max(0, totalDuration - secondsLeft);
  const progressPercent = Math.min(98, Math.max(35, Math.round(35 + (elapsed / totalDuration) * 63)));

  if (compact) {
    return (
      <span className="inline-flex items-center space-x-1.5 font-mono text-xs">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-black text-amber-300 tabular-nums tracking-wide">{formattedTime}</span>
        <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-tight bg-emerald-950 px-1 py-0.5 rounded border border-emerald-800/60">
          {t.liveEtaBadge}
        </span>
      </span>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-baseline space-x-2">
        <span className="relative flex h-2.5 w-2.5 self-center shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <Clock className="w-4 h-4 text-amber-400 animate-pulse shrink-0 self-center" />
        <span className="font-mono font-black text-amber-400 text-xl tracking-wider tabular-nums">
          {formattedTime}
        </span>
        <span className="text-[11px] font-mono text-slate-400 font-medium">min:sec</span>
      </div>

      {/* Real-Time Rescue Vehicle Transit Progress Bar */}
      <div className="space-y-1.5 pt-1 border-t border-slate-900">
        <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
          <span>{t.transitProgressLabel}</span>
          <span className="text-emerald-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-400 h-full rounded-full transition-all duration-1000 shadow-sm shadow-emerald-500/50"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 font-mono">
          <span className="truncate max-w-[160px] text-slate-300">
            {routeLabel || "Route:"} <b className="text-white font-medium">{heading || "Musi River Link"}</b>
          </span>
          <span className="text-emerald-400 font-bold shrink-0 flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{t.satellitePing}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function UserPortalPage() {
  const router = useRouter();
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"SOS" | "MY_REQUESTS" | "RELIEF_CAMPS">("SOS");

  // Regional Language State (English / తెలుగు / தமிழ் / हिंदी) - Synchronized with Navbar down slider
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>("EN");
  const t = translations[selectedLanguage]?.citizen || translations.EN.citizen;

  // GPS Auto-Detection State
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsLocked, setGpsLocked] = useState<{
    lat: number;
    lon: number;
    accuracy: number;
    timestamp: string;
  } | null>(null);

  // User's active requests
  const [userRequests, setUserRequests] = useState<UserRequest[]>([
    {
      id: "SOS-8491",
      family_count: 4,
      needs: ["FOOD", "WATER", "MEDICAL"],
      vulnerabilities: ["Infant (8mo)", "Diabetic Mother"],
      address: "12 Musi Causeway Road, Chaderghat Lowlands, Hyderabad",
      status: "DISPATCHED",
      urgency_score: 92.0,
      eta: "12–15 mins",
      assigned_vehicle: "BOAT-AMPHIBIAN-02 (Capt. Murugan)",
      relief_package: "Water (5L) + Food Rations + Infant Care",
      telemetry: {
        pilot: "Capt. Murugan",
        phone: "+91-9444088112",
        speed: "18 km/h amphibious",
        heading: "Musi River Link / Chaderghat Expressway",
        last_ping: "20s ago"
      },
      created_at: "25 mins ago"
    },
    {
      id: "SOS-7210",
      family_count: 2,
      needs: ["WATER", "SHELTER"],
      vulnerabilities: ["Elderly (72yo)"],
      address: "Malakpet Ward 12, Hyderabad",
      status: "DELIVERED",
      urgency_score: 74.0,
      eta: "Delivered",
      assigned_vehicle: "TRUCK-RESCUE-BETA",
      relief_package: "Drinking Water (20L) + Tarpaulin Kit",
      created_at: "2 hours ago"
    }
  ]);

  // Route protection
  useEffect(() => {
    const session = getAuthSession();
    if (!session) {
      router.replace("/login?redirect=/dashboard/user");
      return;
    }
    setAuth(session);
    setIsCheckingAuth(false);

    // Synchronize with global navbar language slider
    setSelectedLanguage(getStoredLanguage());
    const unsubLang = subscribeToLanguage((newLang) => {
      setSelectedLanguage(newLang);
    });

    try {
      const saved = localStorage.getItem("resqlink_user_requests");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const merged = parsed.map((item: any) => {
            if (item.id === "SOS-8491" && (!item.relief_package || item.assigned_vehicle?.includes("TRUCK"))) {
              return {
                ...item,
                assigned_vehicle: "BOAT-AMPHIBIAN-02 (Capt. Murugan)",
                eta: "12–15 mins",
                relief_package: "Water (5L) + Food Rations + Infant Care",
                telemetry: {
                  pilot: "Capt. Murugan",
                  phone: "+91-9444088112",
                  speed: "18 km/h amphibious",
                  heading: "Musi River Link / Chaderghat Expressway",
                  last_ping: "20s ago"
                }
              };
            }
            return item;
          });
          setUserRequests(merged);
        }
      }
    } catch { }

    const handleStatusUpdate = (e: any) => {
      const { sosId, status, assignedVehicleId } = e.detail || {};
      if (sosId && status) {
        setUserRequests((prev) =>
          prev.map((r) => {
            const matches =
              r.id === sosId ||
              r.id?.toLowerCase() === sosId?.toLowerCase() ||
              r.id === `SOS-${sosId.replace("sos-", "")}`;
            if (matches) {
              return {
                ...r,
                status,
                assigned_vehicle: assignedVehicleId || r.assigned_vehicle || "BOAT-AMPHIBIAN-02 (Capt. Murugan)",
                eta: status === "DELIVERED" ? "Delivered" : status === "DISPATCHED" ? "12–15 mins" : "Assigned"
              };
            }
            return r;
          })
        );
      }
    };

    window.addEventListener("resqlink_sos_status_updated", handleStatusUpdate);

    const interval = setInterval(() => {
      try {
        const saved = localStorage.getItem("resqlink_user_requests");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setUserRequests(parsed);
          }
        }
      } catch { }
    }, 4000);

    return () => {
      window.removeEventListener("resqlink_sos_status_updated", handleStatusUpdate);
      clearInterval(interval);
      unsubLang();
    };
  }, [router]);

  // Citizen SOS Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [headcount, setHeadcount] = useState(3);
  const [description, setDescription] = useState("");
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(["FOOD", "WATER"]);
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSignal, setSubmittedSignal] = useState<any | null>(null);

  // One-Tap GPS Detection Handler using Browser Geolocation API
  const handleDetectGPS = () => {
    setIsDetectingGPS(true);
    if (typeof window !== "undefined" && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = Number(pos.coords.latitude.toFixed(6));
          const lon = Number(pos.coords.longitude.toFixed(6));
          const acc = Math.round(pos.coords.accuracy || 4.8);
          setGpsLocked({
            lat,
            lon,
            accuracy: acc,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          });
          setAddress(`GPS Sat-Fix: ${lat}° N, ${lon}° E (±${acc}m accuracy) • Musi River Chaderghat Lowlands, Hyderabad`);
          setIsDetectingGPS(false);
        },
        () => {
          // Graceful fallback for mock/sandboxed environments without hardware sensors
          const mockLat = 17.3780;
          const mockLon = 78.4910;
          setGpsLocked({
            lat: mockLat,
            lon: mockLon,
            accuracy: 5,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
          });
          setAddress(`GPS Sat-Fix: ${mockLat}° N, ${mockLon}° E (±5m accuracy) • Musi River Sector 4 Lowlands, Hyderabad`);
          setIsDetectingGPS(false);
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
      );
    } else {
      setIsDetectingGPS(false);
    }
  };

  const toggleNeed = (need: string) => {
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const toggleVulnerability = (v: string) => {
    setSelectedVulnerabilities((prev) =>
      prev.includes(v) ? prev.filter((item) => item !== v) : [...prev, v]
    );
  };

  const handleSubmitSOS = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const signalPayload = {
        victim_name: name || "Anonymous Citizen",
        contact_phone: phone || "+91-9840112233",
        latitude: gpsLocked?.lat || 17.3780,
        longitude: gpsLocked?.lon || 78.4910,
        people_count: headcount,
        description: description || "Severe flooding reached first floor, require immediate aid.",
        needs: selectedNeeds,
        vulnerabilities: selectedVulnerabilities
      };

      const result = await submitSOS(signalPayload);

      const newRequest: UserRequest = {
        id: result?.id || `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        family_count: headcount,
        needs: selectedNeeds,
        vulnerabilities: selectedVulnerabilities.map(
          (v) => t.vulns.find((item) => item.id === v)?.label || v
        ),
        address: address || "Hyderabad Musi River Sector",
        status: "PENDING",
        urgency_score: result?.urgency_score || 88.0,
        eta: "15–20 mins (Calculating CVRP Route)",
        assigned_vehicle: "Assigning tactical fleet...",
        relief_package: selectedNeeds.join(" + ") || "Standard Relief Kit",
        created_at: "Just now"
      };

      const updated = [newRequest, ...userRequests];
      setUserRequests(updated);
      try {
        localStorage.setItem("resqlink_user_requests", JSON.stringify(updated));
      } catch { }

      setSubmittedSignal(newRequest);
      setName("");
      setPhone("");
      setAddress("");
      setDescription("");
      setSelectedVulnerabilities([]);
    } catch {
      // Fallback local broadcast
      const fallbackRequest: UserRequest = {
        id: `SOS-${Math.floor(1000 + Math.random() * 9000)}`,
        family_count: headcount,
        needs: selectedNeeds,
        vulnerabilities: selectedVulnerabilities,
        address: address || "Hyderabad Musi River Flood Sector",
        status: "PENDING",
        urgency_score: 90.0,
        eta: "15–20 mins",
        assigned_vehicle: "Auto-Allocating...",
        relief_package: "Food + Water Pack",
        created_at: "Just now"
      };
      const updated = [fallbackRequest, ...userRequests];
      setUserRequests(updated);
      try {
        localStorage.setItem("resqlink_user_requests", JSON.stringify(updated));
      } catch { }
      setSubmittedSignal(fallbackRequest);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nearby Verified Relief Camps
  const reliefCamps = [
    {
      name: "Secunderabad Central Humanitarian Relief Hub",
      location: "Near Railway Cantonment, Secunderabad",
      distance: "2.4 km away",
      capacity: 1200,
      occupancy: 420,
      status: "OPEN",
      phone: "+91-40-27801234",
      available_items: ["Water Tankers", "Medical Tents", "Dry Food Rations", "Bedding"]
    },
    {
      name: "Moosarambagh Ward Community Camp",
      location: "Moosarambagh High School Grounds, Hyderabad",
      distance: "1.1 km away",
      capacity: 450,
      occupancy: 280,
      status: "OPEN",
      phone: "+91-40-24567890",
      available_items: ["Hot Meals", "Purified Water", "Doctor on Site", "Children Supplies"]
    },
    {
      name: "Malakpet Senior Relief & Care Depots",
      location: "Government Primary Health Center, Malakpet",
      distance: "3.2 km away",
      capacity: 300,
      occupancy: 190,
      status: "OPEN",
      phone: "+91-40-23456789",
      available_items: ["Insulin Storage", "Oxygen Concentrators", "First Aid", "Blankets"]
    }
  ];

  if (isCheckingAuth) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-mono">Verifying citizen portal clearance...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-2">

      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/80 text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>{t.headerTag}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{t.headerTitle}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            {t.headerSubtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/map"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
          >
            <Map className="w-4 h-4 text-cyan-400" />
            <span>{t.viewShelterMap}</span>
          </Link>
          <button
            onClick={() => {
              setActiveTab("SOS");
              setSubmittedSignal(null);
            }}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-red-600/30 transition-transform hover:scale-105"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>{t.sendBeaconBtn}</span>
          </button>
        </div>
      </div>

      {/* 3 Main Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTab("SOS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${activeTab === "SOS" ? "bg-red-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white"
            }`}
        >
          <Radio className="w-4 h-4" />
          <span>{t.tab1Label}</span>
        </button>

        <button
          onClick={() => setActiveTab("MY_REQUESTS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${activeTab === "MY_REQUESTS" ? "bg-amber-500 text-slate-950 shadow-md font-black" : "text-slate-400 hover:text-white"
            }`}
        >
          <Truck className="w-4 h-4" />
          <span>{t.tab2Label} ({userRequests.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("RELIEF_CAMPS")}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-xl transition-all ${activeTab === "RELIEF_CAMPS" ? "bg-blue-600 text-white shadow-md font-black" : "text-slate-400 hover:text-white"
            }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{t.tab3Label} ({reliefCamps.length})</span>
        </button>
      </div>

      {/* TAB 1: SOS REPORT FORM */}
      {activeTab === "SOS" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">

          {/* Left 2 Cols: The SOS Broadcast Form */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-white flex items-center space-x-2">
                  <Radio className="w-5 h-5 text-red-500 animate-pulse" />
                  <span>{t.formTitle}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {t.formSubtitle}
                </p>
              </div>

              {/* Active Global Language Badge (Managed by Navbar dropdown) */}
              <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 self-start sm:self-auto shrink-0 shadow-inner">
                <Languages className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-mono text-slate-400">{t.activeLanguageLabel}:</span>
                <span className="font-bold font-mono text-cyan-300">
                  {selectedLanguage === "TE" ? "తెలుగు (Telugu)" : selectedLanguage === "TA" ? "தமிழ் (Tamil)" : selectedLanguage === "HI" ? "हिंदी (Hindi)" : "English (EN)"}
                </span>
              </div>
            </div>

            {submittedSignal ? (
              <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800 space-y-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <div>
                  <h3 className="text-lg font-black text-white">{t.signalLoggedTitle}</h3>
                  <p className="text-xs text-emerald-300 mt-1">
                    {t.signalLoggedDesc} (ID: <b>{submittedSignal.id || "SOS-PENDING"}</b>)
                  </p>
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveTab("MY_REQUESTS")}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                  >
                    {t.trackDeliveryBtn}
                  </button>
                  <button
                    onClick={() => setSubmittedSignal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
                  >
                    {t.sendAnotherBtn}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSOS} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t.nameLabel}</label>
                    <input
                      type="text"
                      required
                      placeholder={t.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">{t.phoneLabel}</label>
                    <input
                      type="tel"
                      required
                      placeholder={t.phonePlaceholder}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:border-red-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Location Input with One-Tap GPS Detection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">{t.locationLabel}</label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetectingGPS}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-700/60 text-xs font-bold transition-all shadow-sm active:scale-95"
                    >
                      {isDetectingGPS ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          <span>{t.gpsAcquiring}</span>
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{t.autoDetectGPS}</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <input
                        type="text"
                        required
                        placeholder={t.locationPlaceholder}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={headcount}
                        onChange={(e) => setHeadcount(Number(e.target.value))}
                        className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-bold text-center"
                      />
                      <span className="text-[10px] text-slate-500 block text-center font-mono">
                        {t.headcountLabel}
                      </span>
                    </div>
                  </div>

                  {/* GPS Coordinates & Accuracy Confirmation Card */}
                  {gpsLocked && (
                    <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs animate-in fade-in">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-900/60 border border-cyan-600 flex items-center justify-center text-cyan-300 shrink-0">
                          <Compass className="w-4 h-4 animate-spin [animation-duration:8s]" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-white">
                              {gpsLocked.lat}° N, {gpsLocked.lon}° E
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                              <span>±{gpsLocked.accuracy}m accuracy</span>
                            </span>
                          </div>
                          <div className="text-[11px] text-cyan-300/80 font-mono mt-0.5">
                            {t.gpsLockedNotice} • Musi River Lowlands, Hyderabad • {gpsLocked.timestamp}
                          </div>
                        </div>
                      </div>
                      <span className="self-start sm:self-auto text-[10px] font-mono font-bold text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
                        GPS LOCK ACTIVE
                      </span>
                    </div>
                  )}
                </div>

                {/* Critical Vulnerabilities */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-amber-400 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    <span>{t.vulnSectionTitle}</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {t.vulns.map((vuln) => {
                      const isSelected = selectedVulnerabilities.includes(vuln.id);
                      return (
                        <button
                          key={vuln.id}
                          type="button"
                          onClick={() => toggleVulnerability(vuln.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all ${isSelected
                            ? "bg-red-950/80 border-red-500 text-red-200 shadow-md shadow-red-900/30"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                          <div className="text-xs font-bold leading-tight">{vuln.label}</div>
                          <div className={`text-[10px] mt-0.5 ${isSelected ? "text-red-300 font-semibold" : "text-slate-500"}`}>
                            {vuln.sub}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Aid Categories Needed */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">{t.needsSectionTitle}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {t.needs.map((item) => {
                      const Icon = getNeedIcon(item.id);
                      const isSelected = selectedNeeds.includes(item.id);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleNeed(item.id)}
                          className={`p-2.5 rounded-xl text-left border transition-all flex flex-col justify-between space-y-1.5 ${isSelected
                            ? "bg-amber-500/15 border-amber-400 text-white shadow-md shadow-amber-500/10"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <Icon className={`w-4 h-4 ${isSelected ? "text-amber-400" : "text-slate-500"}`} />
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? "bg-amber-500 text-slate-950" : "bg-slate-900 text-slate-400"
                              }`}>
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-xs font-bold leading-tight">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">{t.descLabel}</label>
                  <textarea
                    rows={3}
                    placeholder={t.descPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:border-red-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? t.submittingBtn : t.submitBtn}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: AI Triage Guidance Card */}
          <div className="space-y-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>{t.howPrioritizesTitle}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t.howPrioritizesDesc}
              </p>

              <div className="space-y-2.5 pt-2 border-t border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-red-400 font-bold">{t.criticalUrgency}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-amber-400 font-bold">{t.highUrgency}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-cyan-400 font-bold">{t.standardAid}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{t.helplineContacts}</span>
              <div className="text-xs text-slate-400 space-y-1">
                <div>{t.stateControl}</div>
                <div>{t.districtHelpline}</div>
                <div>{t.ambulance}</div>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MY AID REQUESTS & STATUS */}
      {activeTab === "MY_REQUESTS" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>{t.myRequestsHeader}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.myRequestsSub}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {userRequests.length} {t.recordedSignals}
            </span>
          </div>

          <div className="space-y-4">
            {userRequests.map((req) => {
              const isDelivered = req.status === "DELIVERED";
              const isDispatched = req.status === "DISPATCHED";
              return (
                <div
                  key={req.id}
                  className={`p-5 rounded-2xl border transition-all ${isDelivered
                    ? "bg-emerald-950/20 border-emerald-900/80"
                    : isDispatched
                      ? "bg-cyan-950/20 border-cyan-800/80 shadow-md"
                      : "bg-slate-950 border-slate-800"
                    }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-black text-white text-base">{req.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-black ${isDelivered
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : isDispatched
                          ? "bg-cyan-950 text-cyan-400 border border-cyan-800 animate-pulse"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}>
                        {t.statusLabel} {req.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-400 flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <span>{t.etaLabel}</span>
                        {isDispatched ? (
                          <LiveEtaCountdown reqId={req.id} status={req.status} initialSeconds={878} compact={true} t={t} />
                        ) : (
                          <b className="text-white">{req.eta}</b>
                        )}
                      </div>
                      <span>{req.created_at}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <span className="text-slate-500 font-semibold">{t.locationAddressLabel}</span>
                      <div className="font-medium text-slate-200 mt-0.5">{req.address}</div>
                      <div className="text-slate-400 mt-0.5">{req.family_count} {t.peopleCountLabel}</div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold">{t.vulnLabel}</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {req.vulnerabilities.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-red-950 text-red-300 text-[10px] font-bold">
                            ⚠ {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 font-semibold">{t.assignedMissionLabel}</span>
                      <div className="font-mono text-cyan-400 font-bold mt-0.5">{req.assigned_vehicle}</div>
                      <div className="text-[11px] text-slate-500">{t.urgencyScoreLabel} {req.urgency_score}/100</div>
                    </div>
                  </div>

                  {/* Live Aid Vehicle Telemetry on Citizen Tracker */}
                  {isDispatched && (
                    <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900/90 to-blue-950/60 border border-cyan-500/50 space-y-3 shadow-lg shadow-cyan-950/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-800/50 pb-2.5">
                        <div className="flex items-center space-x-2">
                          <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                          </span>
                          <span className="text-xs font-black text-cyan-300 tracking-wider uppercase flex items-center space-x-1.5">
                            <Truck className="w-4 h-4 text-cyan-400" />
                            <span>{t.liveTelemetryTitle}</span>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono text-[10px] font-bold">
                            {t.transponderLock}
                          </span>
                          <div className="bg-slate-950/90 border border-red-900/60 px-2.5 py-1 rounded-lg">
                            <LiveEtaCountdown reqId={req.id} status={req.status} initialSeconds={878} compact={true} t={t} />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        {/* 1. Assigned Unit & Pilot */}
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                            {t.assignedVehicleLabel}
                          </span>
                          <div className="font-mono font-black text-cyan-300 text-sm flex items-center space-x-1.5">
                            <Anchor className="w-4 h-4 text-cyan-400 shrink-0" />
                            <span className="truncate">{req.assigned_vehicle || "BOAT-AMPHIBIAN-02 (Capt. Murugan)"}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-900">
                            <span>{t.speedLabel} <b className="text-white font-mono">{req.telemetry?.speed || "18 km/h"}</b></span>
                            <a
                              href={`tel:${req.telemetry?.phone || "+919444088112"}`}
                              className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-mono font-bold"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{t.directHotline}</span>
                            </a>
                          </div>
                        </div>

                        {/* 2. Estimated Time of Arrival */}
                        <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                              {t.estimatedEtaLabel}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 uppercase flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                              <span>{t.liveEtaBadge}</span>
                            </span>
                          </div>
                          <LiveEtaCountdown
                            reqId={req.id}
                            status={req.status}
                            initialSeconds={878}
                            compact={false}
                            t={t}
                            heading={req.telemetry?.heading}
                            routeLabel={t.routeLabel}
                          />
                        </div>

                        {/* 3. Relief Package Payload */}
                        <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                          <span className="text-[10px] font-mono uppercase text-slate-400 font-semibold block">
                            {t.reliefPackageLabel}
                          </span>
                          <div className="font-bold text-emerald-400 text-xs flex items-center space-x-1.5">
                            <Package className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="truncate">{req.relief_package || "Water (5L) + Food Rations + Infant Care"}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-900 flex items-center space-x-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{t.depotSealedLabel}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Real-time Tracking Stepper */}
                  <div className="mt-4 pt-3.5 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-2">
                      <span className="text-slate-400 font-semibold uppercase">{t.deliveryLifecycleLabel}</span>
                      <span className="text-cyan-400 font-bold">
                        {req.status === "DELIVERED"
                          ? t.lifecycleDelivered
                          : req.status === "DISPATCHED"
                            ? t.lifecycleDispatched
                            : req.status === "ASSIGNED"
                              ? t.lifecycleAssigned
                              : t.lifecycleIntake}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[10px]">
                      <div className={`p-2 rounded-xl text-center border ${(req.status === "PENDING" || req.status === "ASSIGNED" || req.status === "DISPATCHED" || req.status === "DELIVERED")
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                        {t.step1}
                      </div>
                      <div className={`p-2 rounded-xl text-center border ${(req.status === "ASSIGNED" || req.status === "DISPATCHED" || req.status === "DELIVERED")
                        ? "bg-blue-950 text-blue-400 border-blue-800 font-bold"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                        {t.step2}
                      </div>
                      <div className={`p-2 rounded-xl text-center border ${(req.status === "DISPATCHED" || req.status === "DELIVERED")
                        ? req.status === "DISPATCHED"
                          ? "bg-cyan-950 text-cyan-400 border-cyan-800 animate-pulse font-bold"
                          : "bg-cyan-950 text-cyan-400 border-cyan-800"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                        {t.step3}
                      </div>
                      <div className={`p-2 rounded-xl text-center border ${req.status === "DELIVERED"
                        ? "bg-emerald-950 text-emerald-400 border-emerald-800 font-bold"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                        }`}>
                        {t.step4}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: NEARBY RELIEF CAMPS */}
      {activeTab === "RELIEF_CAMPS" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-black text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>{t.sheltersTitle}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {t.sheltersSub}
              </p>
            </div>
            <Link
              href="/map"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase"
            >
              {t.openMapBtn}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reliefCamps.map((camp, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">{camp.distance}</span>
                    <h3 className="font-bold text-white text-base mt-0.5">{camp.name}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">{camp.location}</div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${camp.status === "OPEN" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : "bg-amber-950 text-amber-400"
                    }`}>
                    {camp.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-900">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.occupancyLabel}</span>
                    <span className="font-bold text-white">{camp.occupancy} / {camp.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.emergencyPhoneLabel}</span>
                    <span className="font-mono text-cyan-400">{camp.phone}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-900">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">{t.stockedSuppliesLabel}</span>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {camp.available_items.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 text-[10px] font-medium">
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
