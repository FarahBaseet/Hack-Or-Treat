"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { getRoutine, updateStep, type RoutineStep } from "@/lib/api";
import { formatTime, nowHHMM, pickNextStep } from "@/lib/routine";

// Clock as an external store: null while prerendering, "HH:MM" in the browser.
const subscribeClock = (onChange: () => void) => {
  const timer = setInterval(onChange, 30_000);
  return () => clearInterval(timer);
};

export default function NextUpCard() {
  const [steps, setSteps] = useState<RoutineStep[] | null>(null);
  const [error, setError] = useState(false);
  const now = useSyncExternalStore(subscribeClock, nowHHMM, () => null);

  useEffect(() => {
    getRoutine().then(setSteps).catch(() => setError(true));
  }, []);

  const next = steps && now ? pickNextStep(steps, now) : null;

  const markDone = async (step: RoutineStep) => {
    setSteps((s) => s?.map((x) => (x.id === step.id ? { ...x, done: true } : x)) ?? s);
    try {
      await updateStep(step.id, true);
    } catch {
      setSteps((s) => s?.map((x) => (x.id === step.id ? { ...x, done: false } : x)) ?? s);
    }
  };

  return (
    <section className="rounded-3xl bg-white p-6 text-slate-950 shadow">
      <h2 className="text-lg font-bold uppercase tracking-wide text-slate-600">Next up</h2>

      {error ? (
        <p className="mt-2 text-2xl">Can&apos;t reach the brain bank. Try again soon.</p>
      ) : !steps || !now ? (
        <p className="mt-2 text-2xl text-slate-500">Loading...</p>
      ) : next ? (
        <div className="mt-2 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-3xl font-extrabold">{formatTime(next.time)}</p>
            <p className="mt-1 text-2xl">{next.task}</p>
          </div>
          <button
            type="button"
            onClick={() => markDone(next)}
            aria-label={`Mark "${next.task}" as done`}
            className="flex size-20 shrink-0 items-center justify-center rounded-full bg-green-700 text-4xl font-bold text-white active:bg-green-800"
          >
            ✓
          </button>
        </div>
      ) : (
        <p className="mt-2 text-2xl">Nothing else today. Rest those bones!</p>
      )}

      <Link
        href="/routine"
        className="mt-5 flex min-h-14 items-center justify-center rounded-xl border-2 border-slate-900 text-xl font-bold"
      >
        See full day
      </Link>
    </section>
  );
}
