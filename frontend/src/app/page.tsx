import FaceCamera from "@/components/FaceCamera";
import GreetingClock from "@/components/GreetingClock";
import LostButton from "@/components/LostButton";
import NextUpCard from "@/components/NextUpCard";
import RoutineTile from "@/components/RoutineTile";

// Home screen, built from design/memorymate-design-handoff.md.
export default function Dashboard() {
  return (
    // The page background comes from <body> in globals.css, shared by every page.
    <main className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col gap-3.5 px-5 pt-7 pb-6 font-body text-white">
      <GreetingClock />
      <LostButton />
      <div className="grid grid-cols-2 gap-3.5">
        <RoutineTile />
        <FaceCamera />
      </div>
      <NextUpCard />
    </main>
  );
}
