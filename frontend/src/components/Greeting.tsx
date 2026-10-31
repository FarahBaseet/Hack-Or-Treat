"use client";
import { useEffect, useState } from "react";

export default function Greeting() {
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);

  return (
    <header>
      <h1 className="mt-0.5 text-2xl font-bold">{greeting} 👋</h1>
      <p className="muted text-sm">Here&apos;s your day.</p>
    </header>
  );
}