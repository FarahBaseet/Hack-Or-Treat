import FaceCamera from "@/components/FaceCamera";
import GreetingClock from "@/components/GreetingClock";
import LostButton from "@/components/LostButton";
import NextUpCard from "@/components/NextUpCard";
import RoutineTile from "@/components/RoutineTile";

export default function Dashboard() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-3 px-4 pb-4">
      <GreetingClock />
      <LostButton />
      <div className="grid grid-cols-2 gap-3">
        <RoutineTile />
        <FaceCamera />
      </div>
      <div className="fade-up" style={{ animationDelay: "0.15s" }}>
        <NextUpCard />
      </div>
    </main>
  );
}