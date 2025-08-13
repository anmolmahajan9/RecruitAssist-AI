
'use client';

import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';


const GoogleIcon = () => (
  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
    <path fill="none" d="M1 1h22v22H1z" />
  </svg>
);


export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const userEmail = result.user.email;

      if (userEmail && userEmail.endsWith('@suitable.ai')) {
         router.push('/dashboard');
      } else {
        await auth.signOut();
        setError('Access denied. Please sign in with a @suitable.ai email address.');
      }
    } catch (error) {
      console.error('Error signing in with Google', error);
      setError('An error occurred during sign-in. Please try again.');
    }
  };

  useEffect(() => {
    if (!loading && user) {
       if (user.email && user.email.endsWith('@suitable.ai')) {
        router.push('/dashboard');
      } else {
        // This case handles if a user is already logged in but with a non-approved domain
        // and they try to access the login page again.
        auth.signOut();
      }
    }
  }, [user, loading, router]);


  return (
     <div className="flex flex-col flex-grow items-center justify-center p-4 min-h-screen">
      <header className="absolute top-0 right-0 p-4 sm:p-6 md:p-8">
        <ThemeToggle />
      </header>

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
          RecruitAssist AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Employee Management Portal
        </p>
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Sign in to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}
          <Button onClick={handleSignIn} className="w-full" size="lg">
            <GoogleIcon />
            Sign in with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
