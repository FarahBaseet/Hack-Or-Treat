import { redirect } from "next/navigation";

// Sign-in is handled by Clerk (Google). Signed-in users go straight to the dashboard.
export default function Home() {
  redirect("/dashboard");
}