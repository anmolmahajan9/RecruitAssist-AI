
'use client';

import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import withAuth from '@/components/with-auth';
import {
  Card,
  CardHeader,
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Users, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';


function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  const getActiveTab = () => {
    if (pathname === '/dashboard/employees') return 'employees';
    return 'dashboard';
  };

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
            Welcome, {user?.displayName || 'User'}! This is your management portal.
          </p>
        </div>
      </header>

      <main>
        <Tabs value={getActiveTab()} className="w-full mb-6">
            <TabsList className="grid w-full grid-cols-2 h-auto">
                <TabsTrigger value="dashboard" asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <LayoutDashboard className="h-4 w-4"/>
                        Dashboard
                    </Link>
                </TabsTrigger>
                <TabsTrigger value="employees" asChild>
                    <Link href="/dashboard/employees" className="flex items-center gap-2">
                         <Users className="h-4 w-4"/>
                         All Employees
                    </Link>
                </TabsTrigger>
            </TabsList>
        </Tabs>
        {children}
      </main>
    </div>
  );
}

export default withAuth(DashboardLayout);
