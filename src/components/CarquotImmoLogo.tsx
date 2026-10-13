interface LogoProps {
  size?: number;
}

export function CarquotImmoLogo({ size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Heart outline */}
      <path
        d="M24 43s-1.2-1.1-3.1-2.8C17.3 36.9 8 30.5 8 20.5 8 13.6 13.1 9 18.5 9c2.6 0 4.9 1 5.5 2.7C24.6 10 26.9 9 29.5 9 34.9 9 40 13.6 40 20.5c0 10-9.3 16.4-12.9 19.7C25.2 41.9 24 43 24 43z"
        fill="url(#heartGradient)"
        stroke="currentColor"
        strokeWidth="1.5"
        className="text-teal-600 dark:text-teal-400"
        strokeLinejoin="round"
      />
      {/* Building silhouette inside the heart */}
      <g fill="white" opacity="0.95">
        {/* Left tower */}
        <rect x="16" y="20" width="6" height="14" rx="0.5" />
        {/* Right tower */}
        <rect x="23" y="16" width="6" height="18" rx="0.5" />
        {/* Windows on left tower */}
        <rect x="17.2" y="22" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="19.3" y="22" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="17.2" y="25" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="19.3" y="25" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="17.2" y="28" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="19.3" y="28" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        {/* Windows on right tower */}
        <rect x="24.2" y="18" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="26.3" y="18" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="24.2" y="21" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="26.3" y="21" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="24.2" y="24" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="26.3" y="24" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="24.2" y="27" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
        <rect x="26.3" y="27" width="1.5" height="1.5" rx="0.2" fill="#0d9488" opacity="0.5" />
      </g>
      {/* T+L initials at the bottom of the heart */}
      <text
        x="24"
        y="40"
        textAnchor="middle"
        fontSize="5.5"
        fontWeight="700"
        fill="white"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        T+L
      </text>
      <defs>
        <linearGradient id="heartGradient" x1="8" y1="9" x2="40" y2="43" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
    </svg>
  );
}
