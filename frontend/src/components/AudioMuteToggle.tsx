"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { isAudioMuted, toggleAudioMute, subscribeToAudioMute } from "../lib/audioTelemetry";

interface AudioMuteToggleProps {
  compact?: boolean;
  className?: string;
}

export default function AudioMuteToggle({ compact = false, className = "" }: AudioMuteToggleProps) {
  const [muted, setMuted] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    setMuted(isAudioMuted());
    const unsub = subscribeToAudioMute((newMuted) => {
      setMuted(newMuted);
    });
    return unsub;
  }, []);

  if (!isMounted) {
    return (
      <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 ${className}`}>
        <Volume2 className="w-4 h-4 opacity-40" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => toggleAudioMute()}
      className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
        muted
          ? "bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200"
          : "bg-cyan-950/40 border-cyan-700/60 text-cyan-300 hover:bg-cyan-900/40 hover:border-cyan-500 shadow-sm shadow-cyan-950/50"
      } ${className}`}
      title={muted ? "Audio Telemetry Muted • Click to Unmute Sound Effects" : "Audio Telemetry Active • Click to Mute"}
      aria-label={muted ? "Unmute audio effects" : "Mute audio effects"}
    >
      {muted ? (
        <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
      ) : (
        <Volume2 className="w-4 h-4 text-cyan-400 shrink-0 animate-pulse" />
      )}
      {!compact && (
        <span className="font-mono text-[11px] font-bold">
          {muted ? "Muted" : "Audio FX"}
        </span>
      )}
    </button>
  );
}
