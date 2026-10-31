"use client";

import { useEffect, useState } from "react";
import { getCachedLostInfo, refreshLostInfo, reportLostWithRetry, type LostInfo } from "@/lib/api";
import LostModal from "./LostModal";

export default function LostButton() {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<LostInfo | null>(null);

  // Warm the cache on load so the modal has data even if the backend later goes down.
  useEffect(() => {
    refreshLostInfo().then((fresh) => fresh && setInfo(fresh));
  }, []);

  const handlePress = () => {
    setInfo((current) => current ?? getCachedLostInfo()); // cached data shows instantly
    setOpen(true); // never wait on the network
    void reportLostWithRetry();
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
