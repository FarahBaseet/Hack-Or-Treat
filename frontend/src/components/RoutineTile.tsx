import Link from "next/link";
import { ListIcon, tile } from "./ui";

export default function RoutineTile() {
  return (
    <Link href="/routine" className={`${tile} text-routine`}>
      <ListIcon className="size-8" />
      Full day routine
    </Link>
  );
}