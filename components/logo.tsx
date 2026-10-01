export function LogoMark({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="38" height="38" rx="12" fill="#123C32" />
      <path d="M10 24.5C13.5 24.5 14.4 16.5 18.1 16.5C21.9 16.5 21.8 27 25.8 27C29.2 27 30 20 31 17.5" stroke="#F3F1E8" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 14.5H15.4" stroke="#7B9B83" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

export function Brand() {
  return (
    <div className="brand-lockup">
      <LogoMark />
      <div>
        <div className="brand-name">NADI Pangan</div>
        <div className="brand-sub">Food resilience MEL</div>
      </div>
    </div>
  );
}
