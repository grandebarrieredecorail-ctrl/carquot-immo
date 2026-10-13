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
      role="img"
      aria-label="Carquot Immo"
    >
      <defs>
        <linearGradient id="logoGrad" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#14b8a6" />
          <stop offset="1" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      {/* Rounded square background */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoGrad)" />
      {/* White heart outline */}
      <path
        d="M24 38s-1-0.9-2.5-2.3C18.2 32.6 11 27.5 11 19.5 11 14.8 14.3 11 18 11c2.2 0 4 1.2 6 3.5 2-2.3 3.8-3.5 6-3.5 3.7 0 7 3.8 7 8.5 0 8-7.2 13.1-10.5 16.2C25 37.1 24 38 24 38z"
        fill="none"
        stroke="white"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Simple building silhouette inside */}
      <g fill="white" opacity="0.9">
        <rect x="18" y="21" width="5" height="11" rx="0.5" />
        <rect x="25" y="18" width="5" height="14" rx="0.5" />
      </g>
      {/* Window dots */}
      <g fill="#0d9488" opacity="0.35">
        <rect x="19.3" y="23" width="1.3" height="1.3" rx="0.2" />
        <rect x="21" y="23" width="1.3" height="1.3" rx="0.2" />
        <rect x="19.3" y="26" width="1.3" height="1.3" rx="0.2" />
        <rect x="21" y="26" width="1.3" height="1.3" rx="0.2" />
        <rect x="26.3" y="20" width="1.3" height="1.3" rx="0.2" />
        <rect x="28" y="20" width="1.3" height="1.3" rx="0.2" />
        <rect x="26.3" y="23" width="1.3" height="1.3" rx="0.2" />
        <rect x="28" y="23" width="1.3" height="1.3" rx="0.2" />
        <rect x="26.3" y="26" width="1.3" height="1.3" rx="0.2" />
        <rect x="28" y="26" width="1.3" height="1.3" rx="0.2" />
      </g>
    </svg>
  );
}
