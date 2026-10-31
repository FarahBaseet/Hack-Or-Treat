import FaceCamera from "@/components/FaceCamera";
import GreetingClock from "@/components/GreetingClock";
import LostButton from "@/components/LostButton";
import NextUpCard from "@/components/NextUpCard";

export default function Dashboard() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-3 px-4 pb-4">
      <GreetingClock />
      <LostButton />
      <div className="fade-up" style={{ animationDelay: "0.15s" }}>
        <NextUpCard />
      </div>
      <FaceCamera />
    </main>
  );
}
