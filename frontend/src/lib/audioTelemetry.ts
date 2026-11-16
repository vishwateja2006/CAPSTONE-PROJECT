"use client";

// ResQLink Web Audio API Tactical Sound Synthesizer
// Synthesizes low-latency tactical emergency sound effects without external audio file dependencies.

const MUTE_STORAGE_KEY = "resqlink_audio_muted";

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContextClass();
  }
  if (sharedAudioCtx.state === "suspended") {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

export function isAudioMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, muted ? "true" : "false");
    window.dispatchEvent(new CustomEvent("resqlink_audio_mute_changed", { detail: muted }));
  } catch {}
}

export function toggleAudioMute(): boolean {
  const current = isAudioMuted();
  const next = !current;
  setAudioMuted(next);
  return next;
}

export function subscribeToAudioMute(callback: (muted: boolean) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (e: any) => {
    callback(typeof e.detail === "boolean" ? e.detail : isAudioMuted());
  };
  window.addEventListener("resqlink_audio_mute_changed", handler);
  return () => window.removeEventListener("resqlink_audio_mute_changed", handler);
}

/**
 * 1. Emergency Beacon Transmission Chirp
 * Synthesizes a high-frequency satellite distress telemetry chirp when a citizen transmits an SOS beacon.
 */
export function playBeaconChirp(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Primary rising FM chirp oscillator
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now);
  // Rapid tactical frequency sweep upwards from 880Hz to 1760Hz
  osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.12);

  // Attack & exponential decay envelope
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.exponentialRampToValueAtTime(0.18, now + 0.015);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.20);

  // Secondary acknowledgement harmonics chirp
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();

  osc2.type = "triangle";
  osc2.frequency.setValueAtTime(1320, now + 0.08);
  osc2.frequency.exponentialRampToValueAtTime(2640, now + 0.20);

  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.001, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.095);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc2.start(now + 0.08);
  osc2.stop(now + 0.26);
}

/**
 * 2. Sonar / Radar Acoustic Ping
 * Synthesizes the authentic resonant acoustic radar/sonar ping when detecting GPS or sweeping radar.
 */
export function playSonarPing(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Main high-pitch resonant ping (pure sine wave at 980 Hz)
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(987.77, now); // B5 note (clear resonant nautical sonar)
  osc.frequency.exponentialRampToValueAtTime(975, now + 0.6); // slight acoustic doppler downward shift

  // High attack, long exponential resonant decay (authentic submarine/radar sonar)
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.22, now + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.80);

  // Deep acoustic sub-harmonic body (low-frequency resonance at 493.88 Hz)
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();

  subOsc.type = "sine";
  subOsc.frequency.setValueAtTime(493.88, now);

  subGain.gain.setValueAtTime(0.001, now);
  subGain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
  subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

  subOsc.connect(subGain);
  subGain.connect(ctx.destination);

  subOsc.start(now);
  subOsc.stop(now + 0.50);
}

/**
 * 3. GPS Carrier Lock Chime
 * Synthesizes a crisp double-tone confirmation chime when live coordinates are locked.
 */
export function playGpsLockChime(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // First Tone: C6 (1046.5 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(1046.5, now);
  gain1.gain.setValueAtTime(0.001, now);
  gain1.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
  gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.10);
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.12);

  // Second Tone: E6 (1318.5 Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1318.5, now + 0.08);
  gain2.gain.setValueAtTime(0.001, now);
  gain2.gain.setValueAtTime(0.001, now + 0.08);
  gain2.gain.exponentialRampToValueAtTime(0.14, now + 0.09);
  gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.08);
  osc2.stop(now + 0.24);
}
