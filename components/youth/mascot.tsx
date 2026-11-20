export type MascotMood = "happy" | "wow" | "cheer";

export function Mascot({ mood = "happy", className = "" }: { mood?: MascotMood; className?: string }) {
  return (
    <svg
      viewBox="0 0 96 96"
      className={`y-mascot is-${mood} ${className}`}
      role="img"
      aria-label={mood === "wow" ? "向导露出惊讶表情" : mood === "cheer" ? "向导为你加油" : "向导开心地看你"}
    >
      <ellipse cx="48" cy="84" rx="24" ry="8" fill="#1b1a17" opacity="0.12" />
      <path
        d="M48 14c-18 0-30 12-30 28s12 28 30 28 30-12 30-28-12-28-30-28z"
        fill="#FFD84D"
        stroke="#1b1a17"
        strokeWidth="3"
      />
      <path
        d="M30 20c-4-8-2-12 2-14M66 20c4-8 2-12-2-14"
        stroke="#1b1a17"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="27" cy="48" r="5" fill="#E0705A" opacity="0.5" />
      <circle cx="69" cy="48" r="5" fill="#E0705A" opacity="0.5" />

      <g className="m-happy">
        <circle cx="37" cy="38" r="4" fill="#1b1a17" />
        <circle cx="59" cy="38" r="4" fill="#1b1a17" />
        <path d="M38 52c4 6 16 6 20 0" stroke="#1b1a17" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>

      <g className="m-wow">
        <circle cx="37" cy="37" r="7" fill="#fff" stroke="#1b1a17" strokeWidth="3" />
        <circle cx="59" cy="37" r="7" fill="#fff" stroke="#1b1a17" strokeWidth="3" />
        <circle cx="37" cy="38" r="3" fill="#1b1a17" />
        <circle cx="59" cy="38" r="3" fill="#1b1a17" />
        <ellipse cx="48" cy="54" rx="5" ry="6" fill="#1b1a17" />
      </g>

      <g className="m-cheer">
        <path
          d="M31 38c3-5 8-5 11 0M54 38c3-5 8-5 11 0"
          stroke="#1b1a17"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M36 50c4 10 20 10 24 0z" fill="#1b1a17" />
        <path
          d="M20 62c-6-2-8-6-6-10M76 62c6-2 8-6 6-10"
          stroke="#1b1a17"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}