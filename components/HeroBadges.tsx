"use client";

// Static radial glow mesh — replaces animated floating tier badges
export default function HeroBadges() {
  return (
    <div className="float-layer" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, opacity: 0.55 }}
      >
        <defs>
          <radialGradient id="g1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#5b6ef5" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#5b6ef5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="g3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* Primary orb — center-top */}
        <ellipse cx="720" cy="120" rx="560" ry="340" fill="url(#g1)" />
        {/* Accent orb — right */}
        <ellipse cx="1240" cy="500" rx="320" ry="260" fill="url(#g2)" />
        {/* Secondary orb — left */}
        <ellipse cx="220" cy="680" rx="260" ry="200" fill="url(#g3)" />
        {/* Dot grid */}
        {Array.from({ length: 12 }).map((_, row) =>
          Array.from({ length: 20 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={col * 78 + 20}
              cy={row * 78 + 20}
              r={1.2}
              fill="rgba(255,255,255,0.18)"
            />
          ))
        )}
      </svg>
    </div>
  );
}
