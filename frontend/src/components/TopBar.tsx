import Greeting from "@/components/Greeting";
import ThemeToggle from "@/components/ThemeToggle";

export default function TopBar() {
  return (
    <div
      className="sticky top-0 z-40 -mx-4 flex items-center justify-between px-4 py-3"
      style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
          MemoryMate
        </p>
        <Greeting />
      </div>
      <ThemeToggle />
    </div>
  );
}