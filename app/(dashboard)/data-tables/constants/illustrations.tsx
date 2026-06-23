export function ImportIllustration() {
  return (
    <div className="relative h-28 w-40">
      <svg
        width="156"
        height="112"
        viewBox="0 0 156 112"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="docClip">
            <rect x="18" y="8" width="54" height="76" rx="5" />
          </clipPath>
          <marker
            id="arrowhead"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
          <style>{`
            @keyframes scan {
              0%   { transform: translateY(0px);  opacity: 1; }
              80%  { transform: translateY(62px); opacity: 1; }
              100% { transform: translateY(62px); opacity: 0; }
            }
            @keyframes scanGlow {
              0%   { transform: translateY(0px);  opacity: 0.15; }
              80%  { transform: translateY(62px); opacity: 0.15; }
              100% { transform: translateY(62px); opacity: 0; }
            }
            @keyframes dotSlide {
              0%   { transform: translateX(0px);  opacity: 0; }
              10%  { opacity: 1; }
              80%  { transform: translateX(24px); opacity: 1; }
              100% { transform: translateX(24px); opacity: 0; }
            }
            .scan-line { animation: scan 2.2s cubic-bezier(0.4,0,0.6,1) infinite; }
            .scan-glow  { animation: scanGlow 2.2s cubic-bezier(0.4,0,0.6,1) infinite; }
            .dot1 { animation: dotSlide 2.2s 0.2s infinite; }
            .dot2 { animation: dotSlide 2.2s 0.5s infinite; }
            .dot3 { animation: dotSlide 2.2s 0.8s infinite; }
          `}</style>
        </defs>

        {/* Document */}
        <rect
          x="18"
          y="8"
          width="54"
          height="76"
          rx="5"
          className="fill-secondary stroke-border"
          strokeWidth="1"
        />
        <path
          d="M54 8 L72 26 L54 26 Z"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />
        <path
          d="M54 8 L72 26"
          className="stroke-border"
          strokeWidth="0.5"
          fill="none"
        />
        <rect
          x="26"
          y="36"
          width="26"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/50"
        />
        <rect
          x="26"
          y="44"
          width="36"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/40"
        />
        <rect
          x="26"
          y="52"
          width="30"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/30"
        />
        <rect
          x="26"
          y="60"
          width="34"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/20"
        />

        {/* Scan glow + line */}
        <rect
          className="scan-glow"
          x="18"
          y="8"
          width="54"
          height="12"
          fill="hsl(var(--primary))"
          clipPath="url(#docClip)"
        />
        <rect
          className="scan-line"
          x="16"
          y="8"
          width="58"
          height="1.5"
          rx="0.75"
          fill="hsl(var(--primary))"
          clipPath="url(#docClip)"
        />

        {/* Arrow at y=58 */}
        <path
          d="M74 58 Q86 58 98 58"
          fill="none"
          className="stroke-muted-foreground/50"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          markerEnd="url(#arrowhead)"
        />

        {/* 3 dots above the arrow at y=50, sliding left→right */}
        <circle
          className="dot1"
          cx="78"
          cy="50"
          r="2.5"
          fill="hsl(var(--primary))"
        />
        <circle
          className="dot2"
          cx="86"
          cy="50"
          r="2.5"
          fill="hsl(var(--primary))"
        />
        <circle
          className="dot3"
          cx="94"
          cy="50"
          r="2.5"
          fill="hsl(var(--primary))"
        />

        {/* Spreadsheet */}
        <rect
          x="100"
          y="28"
          width="38"
          height="54"
          rx="4"
          className="fill-background stroke-border"
          strokeWidth="1"
        />
        <rect
          x="100"
          y="28"
          width="38"
          height="10"
          rx="4"
          className="fill-muted"
        />
        <rect x="100" y="32" width="38" height="6" className="fill-muted" />
        <line
          x1="113"
          y1="28"
          x2="113"
          y2="82"
          className="stroke-border/40"
          strokeWidth="0.5"
        />
        <line
          x1="126"
          y1="28"
          x2="126"
          y2="82"
          className="stroke-border/40"
          strokeWidth="0.5"
        />
        <line
          x1="100"
          y1="38"
          x2="138"
          y2="38"
          className="stroke-border/40"
          strokeWidth="0.5"
        />
        <line
          x1="100"
          y1="50"
          x2="138"
          y2="50"
          className="stroke-border/40"
          strokeWidth="0.5"
        />
        <line
          x1="100"
          y1="62"
          x2="138"
          y2="62"
          className="stroke-border/40"
          strokeWidth="0.5"
        />
        <line
          x1="100"
          y1="74"
          x2="138"
          y2="74"
          className="stroke-border/40"
          strokeWidth="0.5"
        />

        {/* Header pills */}
        <rect
          x="104"
          y="31"
          width="7"
          height="2.5"
          rx="1"
          fill="hsl(var(--primary))"
          opacity="0.7"
        />
        <rect
          x="116"
          y="31"
          width="7"
          height="2.5"
          rx="1"
          fill="hsl(var(--primary))"
          opacity="0.7"
        />
        <rect
          x="129"
          y="31"
          width="7"
          height="2.5"
          rx="1"
          fill="hsl(var(--primary))"
          opacity="0.7"
        />

        {/* Cells */}
        {[42, 54, 66].map((y, i) => (
          <g key={y}>
            <rect
              x="104"
              y={y}
              width={[8, 10, 7][i]}
              height="2.5"
              rx="1"
              className="fill-muted-foreground"
              opacity={0.45 - i * 0.08}
            />
            <rect
              x="116"
              y={y}
              width={[9, 7, 10][i]}
              height="2.5"
              rx="1"
              className="fill-muted-foreground"
              opacity={0.38 - i * 0.08}
            />
            <rect
              x="129"
              y={y}
              width={[7, 9, 8][i]}
              height="2.5"
              rx="1"
              className="fill-muted-foreground"
              opacity={0.32 - i * 0.08}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}

export function FileScanIllustration() {
  return (
    <div className="relative">
      <svg
        width="96"
        height="88"
        viewBox="0 0 112 88"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="fileScanClip">
            <rect x="20" y="8" width="50" height="68" rx="4" />
          </clipPath>
          <style>{`
            @keyframes scanLine {
              0%   { transform: translateY(0px);  opacity: 1; }
              80%  { transform: translateY(54px); opacity: 1; }
              100% { transform: translateY(54px); opacity: 0; }
            }
            @keyframes scanGlow {
              0%   { transform: translateY(0px);  opacity: 0.15; }
              80%  { transform: translateY(54px); opacity: 0.15; }
              100% { transform: translateY(54px); opacity: 0; }
            }
            @keyframes magMove {
              0%   { transform: translate(35px, 16px); }
              30%  { transform: translate(55px, 24px); }
              60%  { transform: translate(40px, 52px); }
              80%  { transform: translate(58px, 56px); }
              100% { transform: translate(35px, 16px); }
            }
            .scan-line { animation: scanLine 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
            .scan-glow { animation: scanGlow 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
            .mag-group { animation: magMove 4s ease-in-out infinite; }
          `}</style>
        </defs>
        {/* Document */}
        <rect
          x="20"
          y="8"
          width="50"
          height="68"
          rx="4"
          className="fill-secondary stroke-border"
          strokeWidth="1"
        />
        <path
          d="M54 8 L70 24 L54 24 Z"
          className="fill-muted stroke-border"
          strokeWidth="0.5"
        />
        <rect
          x="28"
          y="32"
          width="24"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/50"
        />
        <rect
          x="28"
          y="40"
          width="34"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/40"
        />
        <rect
          x="28"
          y="48"
          width="28"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/30"
        />
        <rect
          x="28"
          y="56"
          width="32"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/20"
        />
        <rect
          x="28"
          y="64"
          width="22"
          height="3"
          rx="1.5"
          className="fill-muted-foreground/15"
        />
        <rect
          className="scan-glow"
          x="20"
          y="8"
          width="50"
          height="12"
          fill="hsl(var(--primary))"
          clipPath="url(#fileScanClip)"
        />
        <rect
          className="scan-line"
          x="18"
          y="8"
          width="54"
          height="1.5"
          rx="0.75"
          fill="hsl(var(--primary))"
          clipPath="url(#fileScanClip)"
        />
        {/* Magnifying glass */}
        <g className="mag-group">
          <circle
            cx="0"
            cy="0"
            r="12"
            className="fill-background"
            opacity="0.85"
          />
          <circle
            cx="0"
            cy="0"
            r="12"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            opacity="0.9"
          />
          <circle
            cx="0"
            cy="0"
            r="11"
            fill="hsl(var(--primary))"
            opacity="0.08"
          />
          <circle cx="-4" cy="-4" r="3.5" fill="white" opacity="0.25" />
          <line
            x1="9"
            y1="9"
            x2="17"
            y2="18"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />
        </g>
      </svg>
    </div>
  );
}
