"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";

export type ThemeMode = "light" | "dark" | "system";

export default function ThemeDropdown() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Apply theme to document element
  const applyTheme = (selectedTheme: ThemeMode) => {
    const root = document.documentElement;
    let effectiveDark = true;

    if (selectedTheme === "system") {
      effectiveDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else if (selectedTheme === "light") {
      effectiveDark = false;
    } else {
      effectiveDark = true;
    }

    if (effectiveDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    try {
      localStorage.setItem("resqlink_theme", selectedTheme);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    let savedTheme: ThemeMode = "dark";
    try {
      const stored = localStorage.getItem("resqlink_theme") as ThemeMode | null;
      if (stored === "light" || stored === "dark" || stored === "system") {
        savedTheme = stored;
      }
    } catch {}

    setTheme(savedTheme);
    applyTheme(savedTheme);

    // Listen for system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const current = localStorage.getItem("resqlink_theme") as ThemeMode | null;
      if (current === "system") {
        applyTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);

    // Close dropdown on outside click
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleSelectTheme = (selected: ThemeMode) => {
    setTheme(selected);
    applyTheme(selected);
    setIsOpen(false);
  };

  const isCurrentDark =
    !mounted ||
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Sidedown Bar Trigger Button Beside Login */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all hover:scale-[1.02] shadow-sm"
        title="Toggle Light / Dark Mode"
        aria-label="Theme mode switcher"
        aria-expanded={isOpen}
      >
        {isCurrentDark ? (
          <Moon className="w-3.5 h-3.5 text-amber-400" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        )}
        <span className="hidden sm:inline font-mono text-[11px]">
          {theme === "dark" ? "Dark" : theme === "light" ? "Light" : "Auto"}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Sidedown Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-slate-900/98 border border-slate-700/90 shadow-2xl backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
            Appearance
          </div>

          <div className="space-y-1 pt-1">
            {/* Light Mode Option */}
            <button
              type="button"
              onClick={() => handleSelectTheme("light")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                theme === "light"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </div>
              {theme === "light" && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* Dark Mode Option */}
            <button
              type="button"
              onClick={() => handleSelectTheme("dark")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                theme === "dark"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Moon className="w-4 h-4 text-blue-400" />
                <span>Dark Mode</span>
              </div>
              {theme === "dark" && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            {/* System Default Option */}
            <button
              type="button"
              onClick={() => handleSelectTheme("system")}
              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors ${
                theme === "system"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Laptop className="w-4 h-4 text-emerald-400" />
                <span>System Auto</span>
              </div>
              {theme === "system" && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
