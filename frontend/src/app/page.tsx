"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/caregiver");
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-6 px-5 py-10">
      <header className="text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-300">
          MemoryMate
        </p>
        <h1 className="mt-3 text-4xl font-extrabold">Caregiver sign in</h1>
        <p className="mt-3 text-lg text-slate-300">
          Sign in to keep an eye on your favorite zombie.
        </p>
      </header>

      <form
        onSubmit={signIn}
        className="flex flex-col gap-5 rounded-3xl bg-slate-800 p-6 shadow-xl"
      >
        <label className="flex flex-col gap-2 text-lg font-semibold">
          Email
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="min-h-14 rounded-xl bg-white px-4 text-slate-950"
          />
        </label>

        <label className="flex flex-col gap-2 text-lg font-semibold">
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="min-h-14 rounded-xl bg-white px-4 text-slate-950"
          />
        </label>

        <button
          type="submit"
          className="min-h-14 rounded-xl bg-indigo-600 px-4 text-xl font-bold text-white active:bg-indigo-700"
        >
          Sign in
        </button>
      </form>

      <p className="text-center text-sm text-slate-400">
        Demo sign-in only: any email and password are accepted. Alert emails are sent to the
        caregiver address configured in the backend.
      </p>
    </main>
  );
}
