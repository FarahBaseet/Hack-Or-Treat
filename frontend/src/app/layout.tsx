import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
import { ClerkProvider, Show, SignOutButton } from "@clerk/nextjs";
import { Suspense } from "react";
import "./globals.css";
import ReminderWatcher from "@/components/ReminderWatcher";

// Dashboard fonts (see design/memorymate-design-handoff.md). Exposed as CSS variables for Tailwind.
const fraunces = Fraunces({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-fraunces" });
const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
});

export const metadata: Metadata = {
  title: "BrainBridge",
  description: "A daily companion for people with memory loss, and their caregivers.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // "dark" keeps the other pages on the dark theme now that the dashboard has no theme toggle.
    <html lang="en" className={`dark h-full antialiased ${fraunces.variable} ${atkinson.variable}`}>
      <body className="min-h-full text-white">
        {/* Clerk: Google sign-in on every page, using our own green sign-in page */}
        <ClerkProvider signInUrl="/sign-in" afterSignOutUrl="/sign-in">
          {/* Sign out button, top right, only when signed in */}
          <Suspense>
            <Show when="signed-in">
              <div className="fixed right-4 top-4 z-40">
                <SignOutButton>
                  <button
                    type="button"
                    className="border border-box-border bg-box px-3 py-2 text-sm font-bold text-soft hover:bg-black/30"
                  >
                    Sign out
                  </button>
                </SignOutButton>
              </div>
            </Show>
          </Suspense>
          {children}
          <ReminderWatcher />
        </ClerkProvider>
      </body>
    </html>
  );
}