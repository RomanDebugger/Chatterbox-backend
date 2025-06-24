'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AuthPage() {
  const [activeForm, setActiveForm] = useState('login');
  const [loginData, setLoginData] = useState({
  username: '',
  password: ''
  });

const [signupData, setSignupData] = useState({
  username: '',
  password: '',
  confirmPassword: ''
});

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

  // Muted but vibrant gradients
  const PRIMARY_GRADIENT = 'from-amber-400 to-rose-400';
  const SECONDARY_GRADIENT = 'from-sky-400 to-indigo-400';
  

  useEffect(() => {
  setLoginData({ username: '', password: '' });
  setSignupData({ username: '', password: '', confirmPassword: '' });
}, [activeForm]);


  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let result;
      if (activeForm === 'signup') {
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
  }
      if (activeForm === 'login') {
        result = await login(loginData);
      } else {
        result = await signup(signupData);
      }

      if (result.success) {
        router.push('/chat');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Only render the form after mounting to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-700">
        {/* Simple loading state that matches your design */}
        <div className="w-24 h-24 animate-pulse rounded-full bg-gradient-to-r from-amber-400/20 to-rose-400/20"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-700 overflow-hidden relative">
      {/* Floating particles - now with stable keys */}
      <div className="floating-elements fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {['✉️', '💬', '🗨️', '🔒', '👻', '🎙️'].map((emoji, i) => (
          <div 
            key={`emoji-${i}`}
            className="absolute text-xl text-white/20"
            style={{
              left: `${(i * 15 + 10) % 90}%`,
              top: `${(i * 20 + 10) % 90}%`,
              animation: `float ${15 + (i * 2)}s linear ${i}s infinite`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      <div className="relative bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 w-full max-w-md mx-4 shadow-xl">
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Logo header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-24 h-24 mb-4">
            <svg 
              viewBox="0 0 100 100" 
              className="w-full h-full drop-shadow-lg animate-float"
            >
              {/* Modern mailbox design */}
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
          <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${PRIMARY_GRADIENT} bg-clip-text text-transparent`}>
            Chatterbox
          </h1>
          <p className="text-slate-300 font-mono">"Chat or are we cooked? 💀"</p>
          <p className="text-slate-400 text-sm mt-1 font-mono">no emails, just vibes</p>
        </div>

        {/* Toggle */}
        <div className="flex bg-slate-700/50 rounded-lg p-1 mb-6">
          <button 
            className={`flex-1 py-2 rounded-md transition-all ${activeForm === 'login' ? `bg-gradient-to-r ${PRIMARY_GRADIENT} text-white shadow-md` : 'text-slate-300 hover:text-white'}`}
            onClick={() => setActiveForm('login')}
          >
            Login
          </button>
          <button 
            className={`flex-1 py-2 rounded-md transition-all ${activeForm === 'signup' ? `bg-gradient-to-r ${SECONDARY_GRADIENT} text-white shadow-md` : 'text-slate-300 hover:text-white'}`}
            onClick={() => setActiveForm('signup')}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="username"
            value={activeForm === 'login' ? loginData.username : signupData.username}
            onChange={(e) => {
            const value = e.target.value;
            if (activeForm === 'login') {
            setLoginData({ ...loginData, username: value });
            } else {
            setSignupData({ ...signupData, username: value });
            }
        }}
            className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30"
            placeholder="Username"
            required
          />
          <input
            name="password"
            type="password"
            value={activeForm === 'login' ? loginData.password : signupData.password}
            onChange={(e) => {
            const value = e.target.value;
            if (activeForm === 'login') {
            setLoginData({ ...loginData, password: value });
            } else {
            setSignupData({ ...signupData, password: value });
            }
            }}
            className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            placeholder="Password"
            required
          />
          {activeForm === 'signup' && (
            <input
            name="confirm password"
            type="password"
            value={signupData.confirmPassword}
            onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
            className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30"
            placeholder="Confirm password"
            required
          />)
          }
          {activeForm === 'signup' && signupData.password && signupData.confirmPassword && signupData.password !== signupData.confirmPassword && (
  <p className="text-sm text-rose-400">Password do not match</p>
)}

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 font-medium rounded-lg text-white ${
              activeForm === 'login' 
                ? `bg-gradient-to-r ${PRIMARY_GRADIENT}` 
                : `bg-gradient-to-r ${SECONDARY_GRADIENT}`
            } hover:shadow-md transition-all flex items-center justify-center`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {activeForm === 'login' ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              activeForm === 'login' ? 'Let me in! 🚪' : 'Let me cook! 🍳'
            )}
          </button>
        </form>

        {/* Footer meme */}
        <div className="mt-6 text-center">
          <p className="text-slate-500 text-xs font-mono">
            {activeForm === 'login' 
              ? '"forgot password? skill issue much?"'
              : '"we don\'t track you (much)"'
            }
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}