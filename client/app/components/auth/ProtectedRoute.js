'use client';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

    if (loading) {
        return <LoadingSpinner />;
    }
    if (typeof window === 'undefined') {
        return <LoadingSpinner/>; 
    }
  if (!user) {
    if (typeof window !== 'undefined') {
      router.replace('/auth');
    }
    return <LoadingSpinner/>;
  }

  return children;
}