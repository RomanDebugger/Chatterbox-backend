'use client';
import { useState, useEffect } from 'react';
import FloatingBackground from '../FloatingBackground';

export default function LoadingSpinner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-700 overflow-hidden relative">
      {mounted && <FloatingBackground className="absolute inset-0 z-0" />}
      <div className="animate-spin rounded-full h-16 w-16 border-t-10 border-b-blue-700 border-primary"></div>
    </div>
  );
}
