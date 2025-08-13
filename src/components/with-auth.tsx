'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

export default function withAuth<P extends object>(Component: ComponentType<P>) {
  return function WithAuth(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      }
    }, [user, loading, router]);

    if (loading || !user) {
       return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
    }

    return <Component {...props} />;
  };
}
