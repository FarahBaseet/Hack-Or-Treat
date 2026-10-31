"use client";

// Placeholder for the Who Is This? camera. The real version (getUserMedia + face-api,
// loaded with dynamic(..., { ssr: false })) replaces the panel below.

import { useState } from "react";

export default function FaceCamera() {
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-3xl bg-white p-6 text-slate-950 shadow">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-20 w-full items-center justify-center rounded-2xl bg-indigo-700 px-4 text-3xl font-extrabold text-white active:bg-indigo-800"
      >
        {open ? "Close camera" : "Who is this?"}
      </button>

      {open && (
        <div className="mt-4 flex aspect-video items-center justify-center rounded-2xl bg-slate-200 p-4 text-center text-xl text-slate-700">
          Camera coming soon. For now, ask them their name!
        </div>
      )}
    </section>
  );
}
