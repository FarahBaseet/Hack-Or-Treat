"use client";

import type { LostInfo } from "@/lib/api";

type Props = { info: LostInfo | null; onClose: () => void };

export default function LostModal({ info, onClose }: Props) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lost-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950 px-5 py-6 text-white"
    >
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <h2 id="lost-title" className="text-3xl font-extrabold">
          Stay calm. You&apos;re okay.
        </h2>
        <p className="text-xl text-slate-200">Your caregiver has been told. Help is on the way.</p>

        {info ? (
          <>
            <section className="rounded-2xl bg-white p-5 text-slate-950">
              <h3 className="text-lg font-bold uppercase tracking-wide text-slate-600">Home</h3>
              <p className="mt-1 text-2xl font-bold">{info.profile.home_address}</p>
            </section>

            <section className="rounded-2xl bg-white p-5 text-slate-950">
              <h3 className="text-lg font-bold uppercase tracking-wide text-slate-600">Call for help</h3>
              <p className="mt-1 text-2xl font-bold">{info.profile.emergency_contact_name}</p>
              <a
                href={`tel:${info.profile.emergency_contact_phone}`}
                className="mt-3 flex min-h-14 items-center justify-center rounded-xl bg-green-700 px-4 text-2xl font-bold text-white"
              >
                Call {info.profile.emergency_contact_phone}
              </a>
            </section>

            {info.places.length > 0 && (
              <section className="rounded-2xl bg-white p-5 text-slate-950">
                <h3 className="text-lg font-bold uppercase tracking-wide text-slate-600">Familiar places</h3>
                <ul className="mt-2 flex flex-col gap-3">
                  {info.places.map((p) => (
                    <li key={p.id}>
                      <p className="text-xl font-bold">{p.name}</p>
                      <p className="text-lg text-slate-700">{p.address}</p>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p className="rounded-2xl bg-white p-5 text-xl text-slate-950">
            Loading your info... If this takes long, ask someone nearby for help.
          </p>
        )}

        <button
          type="button"
          onClick={onClose}
          className="min-h-14 rounded-xl border-2 border-white px-4 text-2xl font-bold"
        >
          I&apos;m okay now
        </button>
      </div>
    </div>
  );
}
