export const LogoMark = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
    <defs>
      <linearGradient id="aegis-g" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22D3EE" />
        <stop offset="0.5" stopColor="#3B6BFF" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
    <path d="M16 2 28 7v9c0 7.2-5.1 12.4-12 14-6.9-1.6-12-6.8-12-14V7l12-5Z" stroke="url(#aegis-g)" strokeWidth="1.6" fill="rgba(59,107,255,0.08)" />
    <path d="M16 8.5 22 22h-2.6L16 14.2 12.6 22H10L16 8.5Z" fill="url(#aegis-g)" />
    <circle cx="16" cy="19" r="1.3" fill="#E0F2FE" />
  </svg>
);

export const Logo = ({ className = "" }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <LogoMark />
    <span className="font-display text-[15px] font-semibold tracking-[0.32em] text-white">AEGIS</span>
  </div>
);
