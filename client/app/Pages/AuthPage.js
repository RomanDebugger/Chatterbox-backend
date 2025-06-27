'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import FloatingBackground from '../components/FloatingBackground';
import AuthHeader from '../components/auth/AuthHeader';
import AuthToggle from '../components/auth/AuthToggle';
import AuthForm from '../components/auth/AuthForm';
import AuthFooter from '../components/auth/AuthFooter';
import LoadingSpinner from '../components/auth/LoadingSpinner';

export default function AuthPage() {
  const [activeForm, setActiveForm] = useState('login');
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [signupData, setSignupData] = useState({ username: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login, signup } = useAuth();
  const router = useRouter();

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
      if (activeForm === 'signup' && signupData.password !== signupData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      const result = activeForm === 'login'
        ? await login(loginData)
        : await signup(signupData);

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

  // if (!mounted) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-700">
  //       <div className="w-24 h-24 animate-pulse rounded-full bg-gradient-to-r from-amber-400/20 to-rose-400/20"></div>
  //     </div>
  //   );
  // }

  if (isLoading || !mounted) {
    return <LoadingSpinner />;
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-700 overflow-hidden relative">
      <FloatingBackground className="absolute inset-0 z-0" />
      <div className="relative bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 w-full max-w-md mx-4 shadow-xl">
        {error && (
          <div className="mb-4 p-3 bg-red-900/50 text-red-100 rounded-lg text-sm">
            {error}
          </div>
        )}
        <AuthHeader primaryGradient={PRIMARY_GRADIENT} />
        <AuthToggle
          activeForm={activeForm}
          setActiveForm={setActiveForm}
          primaryGradient={PRIMARY_GRADIENT}
          secondaryGradient={SECONDARY_GRADIENT}
        />
        <AuthForm
          activeForm={activeForm}
          loginData={loginData}
          signupData={signupData}
          setLoginData={setLoginData}
          setSignupData={setSignupData}
          handleSubmit={handleSubmit}
          isLoading={isLoading}
          primaryGradient={PRIMARY_GRADIENT}
          secondaryGradient={SECONDARY_GRADIENT}
        />
        <AuthFooter activeForm={activeForm} />
      </div>
    </div>
  );
}
