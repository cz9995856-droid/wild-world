export function YouthIconDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute" }}>
      <defs>
        <symbol id="i-paw" viewBox="0 0 32 32">
          <g fill="currentColor">
            <ellipse cx="16" cy="20" rx="7" ry="5.5" />
            <ellipse cx="7.5" cy="12" rx="2.8" ry="3.6" />
            <ellipse cx="13" cy="7.5" rx="2.8" ry="3.6" />
            <ellipse cx="19" cy="7.5" rx="2.8" ry="3.6" />
            <ellipse cx="24.5" cy="12" rx="2.8" ry="3.6" />
          </g>
        </symbol>
        <symbol id="i-map" viewBox="0 0 32 32">
          <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
            <path d="M4 8l8-3 8 3 8-3v19l-8 3-8-3-8 3z" />
            <path d="M12 5v19M20 8v19" />
          </g>
        </symbol>
        <symbol id="i-cards" viewBox="0 0 32 32">
          <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
            <rect x="9" y="4" width="16" height="22" rx="3" />
            <path d="M5 9v17a2 2 0 002 2h12" />
            <path d="M14 11h6M14 16h6" />
          </g>
        </symbol>
        <symbol id="i-target" viewBox="0 0 32 32">
          <g fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="16" cy="16" r="11" />
            <circle cx="16" cy="16" r="6" />
            <circle cx="16" cy="16" r="1.6" fill="currentColor" />
          </g>
        </symbol>
        <symbol id="i-spark" viewBox="0 0 32 32">
          <path
            fill="currentColor"
            d="M16 3l2.6 8.2L27 14l-8.4 2.8L16 25l-2.6-8.2L5 14l8.4-2.8z"
          />
        </symbol>
        <symbol id="i-book" viewBox="0 0 32 32">
          <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
            <path d="M6 5h9a3 3 0 013 3v19a3 3 0 00-3-3H6z" />
            <path d="M26 5h-9a3 3 0 00-3 3v19a3 3 0 013-3h9z" />
          </g>
        </symbol>
      </defs>
    </svg>
  );
}

export function YIcon({ name, className }: { name: "paw" | "map" | "cards" | "target" | "spark" | "book"; className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <use href={`#i-${name}`} />
    </svg>
  );
}