'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-blue-400">Stellar Finance Hub</h1>
        <p className="mt-2 text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
