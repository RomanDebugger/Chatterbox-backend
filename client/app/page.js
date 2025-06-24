'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
  <div className="flex h-screen items-center justify-center text-white">
    Redirecting...
  </div>
);
; 
}
