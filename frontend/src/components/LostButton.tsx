"use client";

import { useEffect, useState } from "react";
import {
  getCachedLostInfo,
  getLocation,
  refreshLostInfo,
  reportLostWithRetry,
  type LostInfo,
} from "@/lib/api";
import LostModal from "./LostModal";

export default function LostButton() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<LostInfo | null>(null);

  // Warm the cache on load so the modal has data even if the backend later goes down.
  useEffect(() => {
    refreshLostInfo().then((fresh) => fresh && setInfo(fresh));
    // Ask for location permission now, not in a panic, and warm up a fix so the press is fast.
    void getLocation();
  }, []);

  const handlePress = () => {
    setInfo((current) => current ?? getCachedLostInfo()); // cached data shows instantly
    setOpen(true); // never wait on the network or the location
    // In the background: get the location (gives up after 8 s), then send the alert with or without it.
    void getLocation().then(reportLostWithRetry);
    if (!info) refreshLostInfo().then((fresh) => fresh && setInfo(fresh));
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePress}
        className="w-full min-h-28 rounded-3xl bg-red-600 px-6 py-6 text-4xl font-extrabold text-white shadow-lg ring-4 ring-red-300 active:scale-[0.98] active:bg-red-700"
      >
        I&apos;m Lost
      </button>
      {open && <LostModal info={info} onClose={() => setOpen(false)} />}
    </>
  );
}
