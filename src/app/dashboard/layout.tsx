
'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import withAuth from '@/components/with-auth';
import { Card, CardHeader } from '@/components/ui/card';
import { LayoutDashboard, Users, ArrowLeft, CalendarCheck, ChevronRight } from 'lucide-react';
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
          <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <span className="text-primary">Employee Management</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => auth.signOut()}>Sign Out</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        <div className="flex items-center gap-2 mb-8 border-b">
           <Link
              href="/dashboard"
              className={cn(
                'px-4 py-2 text-sm font-semibold transition-colors',
                activeTab === 'dashboard'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              Dashboard
            </Link>
             <Link
              href="/dashboard/employees"
              className={cn(
                'px-4 py-2 text-sm font-semibold transition-colors',
                activeTab === 'employees'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              All Employees
            </Link>
             <Link
              href="/dashboard/monthly-tracker"
              className={cn(
                'px-4 py-2 text-sm font-semibold transition-colors',
                activeTab === 'monthly-tracker'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-primary'
              )}
            >
              Monthly Tracker
            </Link>
        </div>
        {children}
      </main>
    </div>
  );
}

export default withAuth(DashboardLayout);
