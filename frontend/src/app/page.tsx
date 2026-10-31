import DateTimeCard from "@/components/DateTimeCard";
import FaceCamera from "@/components/FaceCamera";
import LostButton from "@/components/LostButton";
import NextUpCard from "@/components/NextUpCard";
import TopBar from "@/components/TopBar";

export default function Dashboard() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-3 px-4 pb-4">
      <TopBar />
      <LostButton />
      <div className="fade-up" style={{ animationDelay: "0.1s" }}><DateTimeCard /></div>
      <div className="fade-up" style={{ animationDelay: "0.15s" }}><NextUpCard /></div>
      <FaceCamera />
    </main>
  );
}