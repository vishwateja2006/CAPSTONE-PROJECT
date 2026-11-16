"use client";

import React, { useState, useEffect, useRef } from "react";
import { Languages, ChevronDown, Check, Globe } from "lucide-react";
import {
  AppLanguage,
  getStoredLanguage,
  setStoredLanguage,
  subscribeToLanguage,
  languages
} from "../lib/i18n";

export type { AppLanguage };
export { getStoredLanguage, setStoredLanguage, subscribeToLanguage, languages };

export default function LanguageDropdown() {
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>("EN");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setSelectedLanguage(getStoredLanguage());

    const unsubscribe = subscribeToLanguage((newLang) => {
      setSelectedLanguage(newLang);
    });

    // Close dropdown when clicking outside
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      unsubscribe();
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelectLanguage = (code: AppLanguage) => {
    setSelectedLanguage(code);
    setStoredLanguage(code);
    setIsOpen(false);
  };

  const currentLangObj = languages.find((l) => l.code === selectedLanguage) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Down Slider Trigger Button (Beside Dark/Light mode) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:scale-[1.02] shadow-sm"
        title="Select Regional Language (English / తెలుగు / हिंदी / தமிழ்)"
        aria-label="Language selection dropdown"
        aria-expanded={isOpen}
      >
        <Languages className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-bold text-[11px] text-white">
          {currentLangObj.nativeLabel}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Down Slider Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900/98 border border-slate-700/90 shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <span className="flex items-center space-x-1">
              <Globe className="w-3 h-3 text-cyan-400" />
              <span>Regional Language</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{selectedLanguage}</span>
          </div>

          <div className="space-y-1 pt-1.5">
            {languages.map((lang) => {
              const isSelected = lang.code === selectedLanguage;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.code)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                    isSelected
                      ? "bg-cyan-950/80 text-cyan-200 border border-cyan-500/50 shadow-md shadow-cyan-950/50"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-black text-white text-xs">{lang.nativeLabel}</span>
                      <span className="text-[11px] text-slate-400">({lang.label})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-0.5">{lang.subtitle}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isSelected ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}>
                      {lang.badge}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
