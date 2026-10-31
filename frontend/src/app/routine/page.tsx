"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRoutine, updateStep, type RoutineStep } from "@/lib/api";
import { formatTime } from "@/lib/routine";

export default function RoutinePage() {
  const [steps, setSteps] = useState<RoutineStep[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getRoutine().then(setSteps).catch(() => setError(true));
  }, []);

  const toggle = async (step: RoutineStep) => {
    const done = !step.done;
    setSteps((s) => s?.map((x) => (x.id === step.id ? { ...x, done } : x)) ?? s);
    try {
      await updateStep(step.id, done);
    } catch {
      setSteps((s) => s?.map((x) => (x.id === step.id ? { ...x, done: !done } : x)) ?? s);
    }
  };

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-5">
      <Link
        href="/"
        className="flex min-h-14 items-center justify-center rounded-xl border-2 border-white text-xl font-bold"
      >
        ← Back home
      </Link>
      <h1 className="text-3xl font-extrabold">Today&apos;s routine</h1>

      {error && <p className="text-xl">Can&apos;t reach the brain bank. Try again soon.</p>}
      {!steps && !error && <p className="text-xl text-slate-300">Loading...</p>}

      <ul className="flex flex-col gap-3">
        {steps?.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => toggle(step)}
              aria-pressed={step.done}
              className={`flex min-h-20 w-full items-center gap-4 rounded-2xl p-4 text-left ${
                step.done ? "bg-slate-700 text-slate-300" : "bg-white text-slate-950"
              }`}
            >
              <span
                className={`flex size-12 shrink-0 items-center justify-center rounded-full border-4 text-2xl font-bold ${
                  step.done ? "border-green-500 bg-green-600 text-white" : "border-slate-400"
                }`}
              >
                {step.done ? "✓" : ""}
              </span>
              <span className="flex-1">
                <span className="block text-2xl font-bold">{formatTime(step.time)}</span>
                <span className={`block text-xl ${step.done ? "line-through" : ""}`}>{step.task}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
