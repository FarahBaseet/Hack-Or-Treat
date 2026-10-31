import type { Metadata, Viewport } from "next";
import "./globals.css";
import ReminderWatcher from "@/components/ReminderWatcher";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-slate-900 text-white">
        {children}
        <ReminderWatcher />
      </body>
    </html>
  );
}
