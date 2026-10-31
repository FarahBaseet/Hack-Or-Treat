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

/** First not-done step at or after `now`. Steps are sorted by time ("HH:MM" sorts as strings). */
export function pickNextStep(steps: RoutineStep[], now: string): RoutineStep | null {
  return steps.find((s) => !s.done && s.time >= now) ?? null;
}
