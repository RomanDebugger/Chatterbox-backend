'use client';
import { useEffect,useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import NewRoomModal from '../components/newRoomModal';
import FloatingBackground from '../components/FloatingBackground';
import Logo from '../components/Logo';
import LoadingSpinner from '../components/auth/LoadingSpinner';
export default function MainLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showNewRoom, setShowNewRoom] = useState(false);
  
  if (loading || !user) {
    return <LoadingSpinner />;
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-700">
      <FloatingBackground/>
      <NewRoomModal open={showNewRoom} onClose={() => setShowNewRoom(false)} />
      
      <div className="fixed left-0 top-0 h-full w-20 bg-slate-800/80 backdrop-blur-xs border-r border-slate-700/50 flex flex-col items-center py-6 z-10">
        
<div className="mb-8 cursor-pointer">
          <Logo className="w-12 h-12" />
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
