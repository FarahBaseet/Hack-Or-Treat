"use client";

import { useEffect } from "react";
import type { LostInfo } from "@/lib/api";

type Props = { info: LostInfo | null; onClose: () => void };

function directionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
}

export default function LostModal({ info, onClose }: Props) {
  // Stop the page behind from scrolling while this is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lost-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 px-4 py-4 text-white"
    >
      <div className="mx-auto flex min-h-full max-w-lg flex-col gap-3">
        <div>
          <h2 id="lost-title" className="text-2xl font-extrabold">
            Stay calm. You&apos;re okay.
          </h2>
          <p className="mt-1 text-base text-slate-300">Your caregiver has been told. Help is on the way.</p>
        </div>

        {info ? (
          <>
            <section className="rounded-2xl bg-white p-4 text-slate-950">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Home</h3>
              <p className="mt-1 text-lg font-bold leading-snug">{info.profile.home_address}</p>
            </section>

            <section className="rounded-2xl bg-white p-4 text-slate-950">
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">Call for help</h3>
              <p className="mt-1 text-lg font-bold">{info.profile.emergency_contact_name}</p>
              <a
                href={`tel:${info.profile.emergency_contact_phone}`}
                className="mt-2 flex min-h-12 items-center justify-center rounded-xl bg-green-700 px-4 text-lg font-bold text-white"
              >
                📞 Call {info.profile.emergency_contact_phone}
              </a>
            </section>

            {info.places.length > 0 && (
              <section className="rounded-2xl bg-white p-4 text-slate-950">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Places you know · tap for directions
                </h3>
                <ul className="mt-2 flex flex-col gap-2">
                  {info.places.map((p) => (
                    <li key={p.id}>
                      <a
                        href={directionsUrl(p.address)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-xl bg-slate-100 px-3 py-2 transition hover:bg-slate-200"
                      >
                        <span className="text-xl" aria-hidden="true">📍</span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold">{p.name}</span>
                          <span className="block truncate text-xs text-slate-600">{p.address}</span>
                        </span>
                        <span className="shrink-0 text-sm font-bold text-blue-700">Go →</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p className="rounded-2xl bg-white p-4 text-base text-slate-950">
            Loading your info... If this takes long, ask someone nearby for help.
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-auto min-h-12 rounded-xl border-2 border-white px-4 text-lg font-bold"
        >
          I&apos;m okay now
        </button>
      </div>
    </div>
  );
}