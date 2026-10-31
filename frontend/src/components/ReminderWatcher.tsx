"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getRoutine, type RoutineStep } from "@/lib/api";
import { formatTime } from "@/lib/routine";

const LEAD_MINUTES = 150; // remind this many minutes before a step
const CHECK_EVERY_MS = 15_000; // how often we look at the clock
const REFETCH_EVERY_MS = 30_000; // how often we re-read the routine from the API

// ---------- sound (Web Audio, no file needed) ----------
let audioCtx: AudioContext | null = null;

function unlockAudio() {
  // Browsers only allow sound after the user clicks or presses a key once.
  audioCtx ??= new AudioContext();
  void audioCtx.resume();
}

function playChime() {
  if (!audioCtx || audioCtx.state !== "running") return;
  const ctx = audioCtx;
  const t0 = ctx.currentTime;
  [880, 1318.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = t0 + i * 0.18;
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.65);
  });
}

// ---------- "already reminded today" memory ----------
const remindedFallback = new Set<string>();

function reminderKey(step: RoutineStep, now: Date) {
  return `reminded:${now.toDateString()}:${step.id}`;
}

function wasReminded(key: string) {
  try {
    return sessionStorage.getItem(key) === "1";
  } catch {
    return remindedFallback.has(key);
  }
}

function markReminded(key: string) {
  remindedFallback.add(key);
  try {
    sessionStorage.setItem(key, "1");
  } catch {
    /* storage blocked: the in-memory set still works */
  }
}

/** Minutes from `now` until "HH:MM" today (can be negative). */
function minutesUntil(hhmm: string, now: Date) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m - (now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60);
}

export default function ReminderWatcher() {
  const pathname = usePathname();
  const isCaregiver = pathname?.startsWith("/caregiver") ?? false;
  const [toasts, setToasts] = useState<RoutineStep[]>([]);
  const [enabled, setEnabled] = useState(false);

  const fire = useCallback((step: RoutineStep) => {
    playChime();
    setToasts((t) => [...t, step]);
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`In ${LEAD_MINUTES} minutes (${formatTime(step.time)})`, { body: step.task });
    }
  }, []);

  // Unlock sound on the first click/keypress anywhere on the page.
  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Watch the clock and fire reminders.
  useEffect(() => {
    if (isCaregiver) return;
    let steps: RoutineStep[] = [];
    let lastFetch = 0;

    const check = async () => {
      if (Date.now() - lastFetch > REFETCH_EVERY_MS) {
        try {
          steps = await getRoutine();
          lastFetch = Date.now();
        } catch {
          return; // backend down, try again next tick
        }
      }
      const now = new Date();
      for (const step of steps) {
        if (step.done) continue;
        const mins = minutesUntil(step.time, now);
        if (mins <= 0 || mins > LEAD_MINUTES) continue;
        const key = reminderKey(step, now);
        if (wasReminded(key)) continue;
        markReminded(key);
        fire(step);
      }
    };

    void check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [isCaregiver, fire]);

  const enable = async () => {
    unlockAudio();
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
    setEnabled(true);
    playChime(); // test chime so you know it works
  };

  if (isCaregiver) return null;

  return (
    <>
      {!enabled && (
        <button
          onClick={enable}
          className="fixed bottom-4 right-4 z-50 rounded-full bg-emerald-500 px-4 py-2 font-bold text-slate-950 shadow-lg"
        >
          🔔 Turn on reminders
        </button>
      )}

      <div className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((step) => (
          <div
            key={step.id}
            role="alert"
            className="flex w-full max-w-md items-start gap-3 rounded-2xl bg-emerald-400 p-4 text-slate-950 shadow-xl"
          >
            <span className="text-2xl">⏰</span>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase">
                In {LEAD_MINUTES} min · {formatTime(step.time)}
              </p>
              <p className="text-lg font-semibold">{step.task}</p>
            </div>
            <button
              onClick={() => setToasts((t) => t.filter((x) => x.id !== step.id))}
              className="rounded-lg bg-slate-950 px-3 py-1 text-sm font-bold text-white"
            >
              Got it
            </button>
          </div>
        ))}
      </div>
    </>
  );
}