"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowRight,
  Package,
  Users,
  Truck,
  Cpu,
  CheckCircle2,
  Activity,
  Layers,
  MapPin,
  ShieldCheck,
  ClipboardList,
  Sparkles,
  TrendingUp,
  Compass,
  Lock
} from "lucide-react";
import { getAuthSession, subscribeToAuth, AuthSession } from "../lib/auth";
import {
  getStoredLanguage,
  subscribeToLanguage,
  translations,
  AppLanguage
} from "../lib/i18n";

export default function LandingPage() {
  const [auth, setAuth] = useState<AuthSession | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>("EN");

  const t = translations[selectedLanguage]?.home || translations.EN.home;

  useEffect(() => {
    setIsMounted(true);
    setAuth(getAuthSession());
    setSelectedLanguage(getStoredLanguage());

    const unsubscribeAuth = subscribeToAuth((newAuth) => {
      setAuth(newAuth);
    });

    const unsubscribeLang = subscribeToLanguage((newLang) => {
      setSelectedLanguage(newLang);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeLang();
    };
  }, []);

  return (
    <div className="space-y-14 py-2">
      
      {/* Enhanced Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800/80 p-8 sm:p-14 overflow-hidden shadow-2xl">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-amber-500/15 via-red-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-inner backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">{t.tagTitle}</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">{t.tagSub}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
              {t.heroHeading1} <br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-white bg-clip-text text-transparent">
                {t.heroHeading2}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              {t.heroDesc}
            </p>
          </div>

          {/* Hero Right Visual: Platform Highlights Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-6 space-y-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{t.coreTitle}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                  {t.coreOnline}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{t.coreModel1}</span>
                  </span>
                  <span className="text-cyan-400 font-mono font-bold">{t.coreModel1Status}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{t.coreModel2}</span>
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">{t.coreModel2Status}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Compass className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.coreModel3}</span>
                  </span>
                  <span className="text-amber-400 font-mono font-bold">{t.coreModel3Status}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <span className="text-slate-300 flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>{t.coreModel4}</span>
                  </span>
                  <span className="text-purple-400 font-mono font-bold">{t.coreModel4Status}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modern Operational Metrics Ticker */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <Activity className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">{t.tickerSurveillanceTitle}</div>
            <div className="text-white font-bold text-sm">{t.tickerSurveillanceDesc}</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <Layers className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">{t.tickerAccessTitle}</div>
            <div className="text-white font-bold text-sm">{t.tickerAccessDesc}</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <Cpu className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">{t.tickerModelsTitle}</div>
            <div className="text-white font-bold text-sm">{t.tickerModelsDesc}</div>
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="text-slate-400 text-[11px]">{t.tickerFairnessTitle}</div>
            <div className="text-white font-bold text-sm">{t.tickerFairnessDesc}</div>
          </div>
        </div>
      </div>

      {/* Structured Dual-Portal Architecture Showcase */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.portalHeader}</h2>
          <p className="text-sm text-slate-400">{t.portalSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: Citizen / User Portal */}
          <div className="rounded-3xl bg-slate-900/80 border border-blue-900/40 p-8 flex flex-col justify-between hover:border-blue-500/50 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-blue-950/80 border border-blue-800/80 text-blue-400">
                  <Users className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/80 text-blue-300 font-mono text-xs font-bold">
                  {t.userTag}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">
                  {t.userTitle}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {t.userDesc}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <ClipboardList className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t.userBullet1Title}</strong> {t.userBullet1Desc}</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Truck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t.userBullet2Title}</strong> {t.userBullet2Desc}</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t.userBullet3Title}</strong> {t.userBullet3Desc}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link
                href="/login?role=USER&redirect=/dashboard/user"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/20"
              >
                <span>{t.userBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Admin Command Center */}
          <div className="rounded-3xl bg-slate-900/80 border border-amber-900/40 p-8 flex flex-col justify-between hover:border-amber-500/50 transition-all shadow-xl group">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="p-3.5 rounded-2xl bg-amber-950/80 border border-amber-800/80 text-amber-400">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 font-mono text-xs font-bold">
                  {t.adminTag}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">
                  {t.adminTitle}
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  {t.adminDesc}
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Cpu className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t.adminBullet1Title}</strong> {t.adminBullet1Desc}</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <Package className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t.adminBullet2Title}</strong> {t.adminBullet2Desc}</span>
                </div>
                <div className="flex items-start space-x-3 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>{t.adminBullet3Title}</strong> {t.adminBullet3Desc}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
              <Link
                href="/login?role=ADMIN&redirect=/dashboard/admin"
                className="w-full flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <span>{t.adminBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
