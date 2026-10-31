"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAlerts, type Alert } from "@/lib/api";
import { connectCaregiver } from "@/lib/socket";

function formatAlertTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/** Short two-tone beep with Web Audio (no sound file needed). */
function playBeep(ctx: AudioContext | null) {
  if (!ctx) return;
  [880, 660].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.value = 0.2;
    osc.connect(gain).connect(ctx.destination);
    const start = ctx.currentTime + i * 0.3;
    osc.start(start);
    osc.stop(start + 0.25);
  });
}

export default function CaregiverPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [latest, setLatest] = useState<Alert | null>(null);
  const [connected, setConnected] = useState(false);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const loadAlerts = useCallback(() => {
    getAlerts().then(setAlerts).catch(() => {});
  }, []);

  useEffect(() => {
    loadAlerts(); // history loads even if the WebSocket never connects
    return connectCaregiver({
      onOpen: loadAlerts, // catch anything missed while disconnected
      onStatus: setConnected,
      onAlert: (alert) => {
        setAlerts((prev) => (prev.some((a) => a.id === alert.id) ? prev : [alert, ...prev].slice(0, 20)));
        setLatest(alert);
        playBeep(audioRef.current);
        if (typeof Notification !== "undefined" && Notification.permission === "granted") {
          new Notification("Your zombie is lost!", {
            body: `Lost button pressed at ${formatAlertTime(alert.created_at)}`,
          });
        }
      },
    });
  }, [loadAlerts]);

  // Browsers only allow sound (and the notification prompt) after a click, on every page load.
  const enableAlerts = async () => {
    audioRef.current ??= new AudioContext();
    await audioRef.current.resume();
    if (typeof Notification !== "undefined") await Notification.requestPermission();
    setAlertsEnabled(true);
  };

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-5">
      <h1 className="text-3xl font-extrabold">Caregiver</h1>
      <p className={`text-lg font-semibold ${connected ? "text-green-400" : "text-amber-300"}`}>
        {connected ? "● Live: watching for alerts" : "● Reconnecting..."}
      </p>

      {latest && (
        <div role="alert" className="rounded-2xl bg-red-600 p-5 text-white ring-4 ring-red-300">
          <p className="text-2xl font-extrabold">Your zombie pressed &quot;I&apos;m Lost&quot;</p>
          <p className="mt-1 text-xl">at {formatAlertTime(latest.created_at)}</p>
          <button
            type="button"
            onClick={() => setLatest(null)}
            className="mt-4 min-h-12 w-full rounded-xl bg-white text-xl font-bold text-red-700"
          >
            Got it
          </button>
        </div>
      )}

      {!alertsEnabled && (
        <button
          type="button"
          onClick={enableAlerts}
          className="min-h-14 rounded-xl bg-indigo-700 px-4 text-xl font-bold text-white"
        >
          Turn on sound &amp; notifications
        </button>
      )}

      <section className="rounded-2xl bg-white p-5 text-slate-950">
        <h2 className="text-lg font-bold uppercase tracking-wide text-slate-600">Recent alerts</h2>
        {alerts.length === 0 ? (
          <p className="mt-2 text-xl">No alerts. All quiet in the graveyard.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {alerts.map((a) => (
              <li key={a.id} className="text-xl">
                Lost at {formatAlertTime(a.created_at)}{" "}
                <span className="text-slate-500">({new Date(a.created_at).toLocaleDateString()})</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
