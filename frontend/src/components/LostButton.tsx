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
import { box, focusRing } from "./ui";

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
        className={`${box} ${focusRing} flex min-h-25 w-full flex-col items-center justify-center gap-1 px-4 py-3 text-center`}
      >
        <span className="font-display text-4xl leading-tight font-bold text-lost">I&apos;m lost</span>
        <span className="font-body text-base text-white">Tap and we will help you get home</span>
      </button>
      {open && <LostModal info={info} onClose={() => setOpen(false)} />}
    </>
  );
}
