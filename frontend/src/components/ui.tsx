// Shared dashboard styles and icons (design/memorymate-design-handoff.md).

/** Every box and button on the dashboard: same fill and border, square corners. */
export const box = "rounded-none border border-box-border bg-box";

/** Visible keyboard focus ring. */
export const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus";

/** The two side-by-side tiles (routine, who is this). Add a text colour per tile. */
export const tile = `${box} ${focusRing} flex min-h-28 flex-col items-center justify-center gap-2.5 p-3 text-center font-display text-[1.375rem] leading-[1.15] font-bold`;

type IconProps = { className?: string };

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function ListIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} strokeWidth={2} className={className}>
      <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />
    </svg>
  );
}

export function CameraIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} strokeWidth={2} className={className}>
      <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
      <circle cx={12} cy={13} r={3.5} />
    </svg>
  );
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...svgProps} strokeWidth={3} className={className}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}
