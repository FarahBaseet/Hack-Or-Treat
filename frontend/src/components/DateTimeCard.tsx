"use client";
import { useEffect, useState } from "react";

export default function DateTimeCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <div className="card text-center">
      <p className="muted text-base">Today is</p>
      <p className="text-2xl font-bold">
        {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <p className="mt-1 text-xl font-semibold" style={{ color: "var(--accent)" }}>
        {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </p>
    </div>
  );
}