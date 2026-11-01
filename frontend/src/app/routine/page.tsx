"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRoutine, updateStep, type RoutineStep } from "@/lib/api";
import { formatTime } from "@/lib/routine";
import { box, CheckIcon, focusRing } from "@/components/ui";

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
    <main className="mx-auto flex max-w-lg flex-col gap-3 px-4 py-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold">Today&apos;s routine</h1>
        <Link
          href="/dashboard"
          className={`${box} ${focusRing} shrink-0 px-3 py-2 text-base font-bold`}
        >
          ← Dashboard
        </Link>
      </div>

      {error && <p className="text-lg">Can&apos;t reach the brain bank. Try again soon.</p>}
      {!steps && !error && <p className="text-lg opacity-70">Loading...</p>}

      <ul className="flex flex-col gap-1.5">
        {steps?.map((step) => (
          <li key={step.id}>
            <button
              type="button"
              onClick={() => toggle(step)}
              aria-pressed={step.done}
              className={`${box} ${focusRing} flex w-full items-center gap-3 px-3 py-2 text-left ${
                step.done ? "opacity-60" : ""
              }`}
            >
              <span
                className={`flex size-7 shrink-0 items-center justify-center border-2 ${
                  step.done ? "border-green-400 bg-green-600 text-white" : "border-current"
                }`}
              >
                {step.done && <CheckIcon className="size-4" />}
              </span>
              <span className="w-20 shrink-0 font-bold">{formatTime(step.time)}</span>
              <span className={`flex-1 leading-snug ${step.done ? "line-through" : ""}`}>
                {step.task}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}