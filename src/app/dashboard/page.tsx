'use client';

import withAuth from '@/components/with-auth';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
       <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
             <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => auth.signOut()}>Sign Out</Button>
            <ThemeToggle />
          </div>
        </div>
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Dashboard
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Welcome, {user?.displayName || 'User'}! This is the employee management portal.
          </p>
        </div>
      </header>

      <main>
        {/* Placeholder for future content */}
        <div className="border-2 border-dashed border-muted rounded-lg p-12 text-center">
            <p className="text-muted-foreground">Employee management features will be added here soon.</p>
        </div>
      </main>

    </div>
  );
}

export default withAuth(Dashboard);
