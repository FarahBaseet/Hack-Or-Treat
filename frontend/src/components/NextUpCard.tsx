"use client";

import { useEffect, useState } from "react";
import { getRoutine, updateStep, type RoutineStep } from "@/lib/api";
import { useNow } from "@/lib/clock";
import { countdownLabel, formatTime, minutesUntil, pickNextStep, splitTask, toHHMM } from "@/lib/routine";
import { box, CheckIcon, focusRing } from "./ui";

/** How long a just-finished step stays on the card (with undo) before the next one shows. */
const KEEP_DONE_MS = 60_000;

export default function NextUpCard() {
  const [steps, setSteps] = useState<RoutineStep[] | null>(null);
  const [error, setError] = useState(false);
  // The step the user last tapped. It stays on the card so "Tap to undo" is possible.
  const [pinnedId, setPinnedId] = useState<number | null>(null);
  const now = useNow();

  useEffect(() => {
    getRoutine().then(setSteps).catch(() => setError(true));
  }, []);

  const pinned = steps?.find((s) => s.id === pinnedId) ?? null;

  // Once a pinned step has been done for a minute, let the card move on to the next step.
  useEffect(() => {
    if (!pinned?.done) return;
    const timer = setTimeout(() => setPinnedId(null), KEEP_DONE_MS);
    return () => clearTimeout(timer);
  }, [pinned]);

  const step = pinned ?? (steps && now ? pickNextStep(steps, toHHMM(now)) : null);

  const setDone = async (target: RoutineStep, done: boolean) => {
    setPinnedId(target.id);
    setSteps((s) => s?.map((x) => (x.id === target.id ? { ...x, done } : x)) ?? s);
    try {
      await updateStep(target.id, done); // saved on the backend, so the routine page agrees
    } catch {
      setSteps((s) => s?.map((x) => (x.id === target.id ? { ...x, done: !done } : x)) ?? s);
    }
  };

  const message = (text: string) => (
    <p className="font-display text-[1.375rem] leading-snug font-semibold text-white">{text}</p>
  );

  let body;
  if (error) body = message("Can't reach the brain bank. Try again soon.");
  else if (!steps || !now) body = message("Loading...");
  else if (!step) body = message("Nothing else today. Rest those bones!");
  else {
    const { title, detail } = splitTask(step.task);
    body = (
      <>
        <div className="flex flex-col gap-1">
          <p className="font-display text-[1.875rem] leading-tight font-bold text-sage">{title}</p>
          {detail && (
            <p className="font-display text-[1.375rem] leading-snug font-semibold text-white">{detail}</p>
          )}
          <p className="font-body text-lg text-muted">{formatTime(step.time)}</p>
        </div>
        <button
          type="button"
          onClick={() => setDone(step, !step.done)}
          aria-pressed={step.done}
          className={`${focusRing} flex min-h-15 w-full items-center justify-center gap-3 rounded-none border border-box-border bg-white/8 px-4 py-2 font-display leading-tight font-bold text-done ${
            step.done ? "text-xl" : "text-[1.375rem]"
          }`}
        >
          <CheckIcon className="size-6 shrink-0" />
          {step.done ? "Done. Tap to undo" : "I did it"}
        </button>
      </>
    );
  }

  return (
    <section aria-label="Next up" className={`${box} flex flex-col gap-3.5 px-5.5 py-5`}>
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-body text-sm font-bold tracking-[0.12em] text-label uppercase">Next up</h2>
        {step && now && !step.done && (
          <span className="font-body text-[0.9375rem] font-bold text-muted">
            {countdownLabel(minutesUntil(step.time, now))}
          </span>
        )}
      </div>
      {body}
    </section>
  );
}
