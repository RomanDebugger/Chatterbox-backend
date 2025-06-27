'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from './components/auth/LoadingSpinner';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/auth');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);
  return (
   <>
   <LoadingSpinner/>
   </>
  ) 
; 
}
