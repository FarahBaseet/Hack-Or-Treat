import { useSyncExternalStore } from "react";

// One shared device clock that ticks once per minute. Returns null while prerendering on the server.

let current: Date | null = null;
let timer: ReturnType<typeof setInterval> | undefined;
const listeners = new Set<() => void>();

const minuteOf = (d: Date) => Math.floor(d.getTime() / 60_000);

function tick() {
  const d = new Date();
  if (!current || minuteOf(d) !== minuteOf(current)) {
    current = d;
    listeners.forEach((listener) => listener());
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!timer) {
    tick();
    timer = setInterval(tick, 1000); // checks every second, re-renders only when the minute changes
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

/** The current time, updated every minute. null during server render and first paint. */
export function useNow(): Date | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
