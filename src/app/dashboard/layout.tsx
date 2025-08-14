
'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import withAuth from '@/components/with-auth';
import { Card, CardHeader } from '@/components/ui/card';
import { LayoutDashboard, Users, ArrowLeft, CalendarCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const getActiveTab = () => {
    if (pathname.includes('/employees')) return 'employees';
    if (pathname.includes('/monthly-tracker')) return 'monthly-tracker';
    return 'dashboard';
  };

  const activeTab = getActiveTab();

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 md:p-8">
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
            On-site Employee Management
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Welcome, {user?.displayName || 'User'}! Manage on-site employees
            here.
          </p>
        </div>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link href="/dashboard">
            <Card
              className={cn(
                'cursor-pointer h-full p-4 flex items-center justify-center text-center transition-colors border-2',
                activeTab === 'dashboard'
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50 bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">Dashboard</span>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/employees">
            <Card
              className={cn(
                'cursor-pointer h-full p-4 flex items-center justify-center text-center transition-colors border-2',
                activeTab === 'employees'
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50 bg-card'
              )}
            >
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">All Employees</span>
              </div>
            </Card>
          </Link>
          <Link href="/dashboard/monthly-tracker">
            <Card
              className={cn(
                'cursor-pointer h-full p-4 flex items-center justify-center text-center transition-colors border-2',
                activeTab === 'monthly-tracker'
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/50 bg-card'
              )}
            >
               <div className="flex items-center gap-3">
                <CalendarCheck className="w-6 h-6 text-primary" />
                <span className="font-semibold text-lg">Monthly Tracker</span>
              </div>
            </Card>
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}

export default withAuth(DashboardLayout);
