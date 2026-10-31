"use client";

import { useRouter } from "next/navigation";
import { ListIcon, tile } from "./ui";

/** "Full day routine" tile. Opens the full day schedule. */
export default function RoutineTile() {
  const router = useRouter();
  return (
    <button type="button" onClick={() => router.push("/routine")} className={`${tile} text-routine`}>
      <ListIcon className="size-8" />
      Full day routine
    </button>
  );
}
