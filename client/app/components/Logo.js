'use client';
export default function Logo() {
  return (
    <div className="mx-auto w-24 h-24 mb-4">
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg animate-pulse hover:scale-110 transition-transform duration-300">
        <rect x="30" y="40" width="40" height="40" rx="5" fill="url(#bodyGrad)" stroke="#fff" strokeWidth="1"/>
        <rect x="35" y="45" width="30" height="15" rx="3" fill="url(#doorGrad)"/>
        <path d="M50 20 L70 40 L30 40 Z" fill="url(#roofGrad)"/>
        <rect x="48" y="40" width="4" height="30" fill="url(#postGrad)"/>
        <rect x="65" y="30" width="10" height="5" rx="2" fill="url(#flagGrad)"/>
        <circle cx="60" cy="50" r="3" fill="#fff" opacity="0.8"/>
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b"/>
            <stop offset="100%" stopColor="#ec4899"/>
          </linearGradient>
          <linearGradient id="doorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6"/>
            <stop offset="100%" stopColor="#6366f1"/>
          </linearGradient>
          <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b"/>
            <stop offset="100%" stopColor="#475569"/>
          </linearGradient>
          <linearGradient id="postGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155"/>
            <stop offset="100%" stopColor="#1e293b"/>
          </linearGradient>
          <linearGradient id="flagGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e"/>
            <stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
