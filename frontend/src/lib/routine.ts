import type { RoutineStep } from "./api";

/** "15:00" -> "3:00 PM" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}

/** Current local time as "HH:MM". Call only in effects/handlers (not during render). */
export function nowHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** A Date as "HH:MM" (24-hour), the same format as RoutineStep.time. */
export function toHHMM(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Whole minutes from `now` until "HH:MM" today (negative if it has passed). */
export function minutesUntil(hhmm: string, now: Date): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m - (now.getHours() * 60 + now.getMinutes());
}

/** "now", "in 1 minute", "in 38 minutes", "in 1 hour", "in 2 hours 5 minutes" */
export function countdownLabel(minutes: number): string {
  if (minutes <= 0) return "now";
  const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `in ${plural(m, "minute")}`;
  return m === 0 ? `in ${plural(h, "hour")}` : `in ${plural(h, "hour")} ${plural(m, "minute")}`;
}

/**
 * Split "Take your medicine (the green pills)" into a title and a detail line.
 * Tasks without a trailing "(...)" have no detail.
 */
export function splitTask(task: string): { title: string; detail: string | null } {
  const match = task.match(/^(.*\S)\s*\(([^()]+)\)\s*$/);
  if (!match) return { title: task, detail: null };
  const detail = match[2].trim();
  return { title: match[1], detail: detail.charAt(0).toUpperCase() + detail.slice(1) };
}

/** First not-done step at or after `now`. Steps are sorted by time ("HH:MM" sorts as strings). */
export function pickNextStep(steps: RoutineStep[], now: string): RoutineStep | null {
  return steps.find((s) => !s.done && s.time >= now) ?? null;
}
