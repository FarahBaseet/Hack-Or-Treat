"use client";

import { useNow } from "@/lib/clock";

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Greeting, date and time, live from the device clock. Sits on the background with no box. */
export default function GreetingClock() {
  const now = useNow();
  // Non-breaking spaces keep the block's height while the clock loads, so nothing jumps.
  const blank = " ";

  const greeting = now ? greetingFor(now.getHours()) : blank;
  const date = now
    ? now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : blank;
  const time = now ? `${now.getHours() % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")}` : blank;
  const ampm = now ? (now.getHours() < 12 ? "AM" : "PM") : "";

  return (
    <div>
      <h1 className="font-display text-[2.125rem] leading-tight font-bold text-soft">{greeting}</h1>
      <p className="mt-1.5 font-display text-xl leading-snug font-semibold">
        <span className="text-soft">Today is</span> <strong className="font-semibold text-white">{date}</strong>
      </p>
      <p className="flex items-baseline gap-2 font-display font-bold text-sage">
        <span className="text-[2.5rem] leading-tight">{time}</span>
        <span className="text-xl">{ampm}</span>
      </p>
    </div>
  );
}
