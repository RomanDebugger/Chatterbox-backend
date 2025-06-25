'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import NewRoomModal from '../components/newRoomModal';
import { initializeSocket, destroySocket } from '@/app/lib/socket';

export default function MainLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [showNewRoom, setShowNewRoom] = useState(false);

  // Handle auth + redirect
  useEffect(() => {
    if (!loading) {
      if (!user) {
        if (pathname !== '/auth') {
          router.push('/auth');
        }
      } else {
        setReady(true);
      }
    }
  }, [loading, user, router, pathname]);

  // Handle socket init / cleanup
  useEffect(() => {
  if (!user?.token) return;
  initializeSocket(user.token);
  return () => destroySocket();
}, [user?.token]);



  if (loading || !ready) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-700">
      <NewRoomModal open={showNewRoom} onClose={() => setShowNewRoom(false)} />
      
      <div className="fixed left-0 top-0 h-full w-20 bg-slate-800/80 backdrop-blur-md border-r border-slate-700/50 flex flex-col items-center py-6 z-10">
        
<div className="mb-8">
          <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-lg animate-float">
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

        <nav className="flex-1 space-y-6 flex flex-col items-center">
    

          <button 
            className="p-3 h-15 w-15 bg-slate-700/50 rounded-xl hover:bg-slate-600/50 transition-all cursor-pointer"
            onClick={() => setShowNewRoom(true)}
          >
            <span className="text-2xl">💬</span>
          </button>

          <button
            className="p-3 h-15 w-15 bg-red-600/50 rounded-xl hover:bg-red-600/70 transition-all cursor-pointer text-white text-xs"
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                logout();
                router.push('/auth');
              }
            }}
          >
            <span className="text-2xl">🚪</span>
          </button>
        </nav>
      </div>

      <main className="ml-20 h-full">
        {children}
      </main>
    </div>
  );
}
