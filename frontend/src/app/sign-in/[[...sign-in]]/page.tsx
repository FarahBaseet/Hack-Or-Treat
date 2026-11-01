import { SignIn } from "@clerk/nextjs";
import { Suspense } from "react";
export const instant = false;

function BrainBridgeLogo() {
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* rounded tile */}
      <rect x="4" y="4" width="56" height="56" rx="14" fill="rgb(4 40 29 / 0.55)" stroke="rgb(207 241 221 / 0.3)" strokeWidth={2} />
      {/* bridge arch */}
      <path d="M14 40 Q32 14 50 40" />
      {/* bridge deck */}
      <path d="M12 40 H52" />
      {/* cables */}
      <path d="M22 40 V30 M32 40 V24 M42 40 V30" />
      {/* two points it connects */}
      <circle cx="14" cy="46" r="2.5" fill="currentColor" />
      <circle cx="50" cy="46" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <div className="flex flex-col items-center gap-2 text-label">
        <BrainBridgeLogo />
        <p className="text-sm font-bold uppercase tracking-[0.3em]">BrainBridge</p>
      </div>
      <Suspense fallback={<p className="text-soft">Loading…</p>}>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#117550",
              borderRadius: "0px",
            },
          }}
        />
      </Suspense>
    </main>
  );
}