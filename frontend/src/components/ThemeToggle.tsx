"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem("theme"); } catch {}
    const isDark = saved ? saved === "dark" : true;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Switch light or dark mode"
      className="flex h-11 w-11 items-center justify-center rounded-full text-xl shadow-md transition hover:scale-110"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}