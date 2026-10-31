import FaceCamera from "@/components/FaceCamera";
import LostButton from "@/components/LostButton";
import NextUpCard from "@/components/NextUpCard";

export default function Dashboard() {
  return (
    <main className="mx-auto flex max-w-lg flex-col gap-5 px-4 py-5">
      <LostButton />
      <h1 className="text-2xl font-bold text-slate-200">Hey there, sleepyhead. Here&apos;s your day.</h1>
      <NextUpCard />
      <FaceCamera />
    </main>
  );
}
