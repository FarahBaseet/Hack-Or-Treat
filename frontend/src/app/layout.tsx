import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces } from "next/font/google";
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
  title: "Zombie Helper",
  description: "A little help for when the brain fog rolls in.",
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
        {children}
        <ReminderWatcher />
      </body>
    </html>
  );
}
