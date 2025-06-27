'use client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import AuthPage from '@/app/Pages/AuthPage';
import LoadingSpinner from '../components/auth/LoadingSpinner';

export default function Auth() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/chat');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return <LoadingSpinner />; 
  }

  return <AuthPage />;
}