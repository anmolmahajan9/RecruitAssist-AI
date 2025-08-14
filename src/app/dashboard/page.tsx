
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Users,
  Building,
  UserCheck,
  Loader2,
  Bell,
  CheckCircle2,
  ArrowRight,
  Landmark
} from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { getEmployees } from '@/services/employeeService';
import { getClients } from '@/services/clientService';
import type { Employee } from '@/types/employee';
import type { Client } from '@/types/client';
import { onboardingTemplate } from '@/types/employee';
import { ClientManager } from '@/components/client/client-manager';

interface DashboardStats {
  totalActive: number;
  totalClients: number;
  onboardingComplete: number;
  onboardingPending: number;
  upcomingPoEnds: Employee[];
  statusCounts: {
    active: number;
    pending: number;
    ended: number;
  };
}

const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (isNaN(date.getTime())) return dateString;
    // Use UTC methods to avoid timezone issues during rendering
    const dayFormatted = String(date.getUTCDate()).padStart(2, '0');
    const monthFormatted = date.toLocaleString('default', {
      month: 'short',
      timeZone: 'UTC',
    });
    const yearFormatted = date.getUTCFullYear();
    return `${dayFormatted}-${monthFormatted}-${yearFormatted}`;
  } catch (e) {
    return dateString;
  }
};


export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClientManagerOpen, setIsClientManagerOpen] = useState(false);

  const fetchStats = async () => {
      setIsLoading(true);
      
      const [employees, clients] = await Promise.all([
         getEmployees(),
         getClients()
      ]);
      
      const now = new Date();
      now.setUTCHours(0, 0, 0, 0);
      
      const thresholdDate = new Date();
      thresholdDate.setUTCDate(now.getUTCDate() + 45);
      thresholdDate.setUTCHours(0,0,0,0);

      const totalActive = employees.filter(
        (e) => e.status === 'Active'
      ).length;

      const totalClients = clients.length;

      let onboardingComplete = 0;
      let onboardingPending = 0;
      employees.forEach((emp) => {
        if (emp.status !== 'Active') return;
        const totalSteps = onboardingTemplate.length;
        // Defensive check for onboarding and steps array
        const completedSteps =
          emp.onboarding?.steps?.filter(
            (s) => s.status === 'Done' || s.status === 'NA'
          ).length || 0;
        if (completedSteps === totalSteps) {
          onboardingComplete++;
        } else {
          onboardingPending++;
        }
      });
      
      const upcomingPoEnds = employees
        .filter((e) => {
            if (e.status !== 'Active' || !e.poEndDate) return false;
            try {
                // Ensure consistent date parsing
                const [year, month, day] = e.poEndDate.split('-').map(Number);
                const endDate = new Date(Date.UTC(year, month - 1, day));
                return !isNaN(endDate.getTime()) && endDate > now && endDate <= thresholdDate;
            } catch {
                return false;
            }
        })
        .sort((a, b) => new Date(a.poEndDate).getTime() - new Date(b.poEndDate).getTime());


      const statusCounts = employees.reduce(
        (acc, e) => {
          if (e.status === 'Active') acc.active++;
          else if (e.status === 'Pending') acc.pending++;
          else if (e.status === 'Ended') acc.ended++;
          return acc;
        },
        { active: 0, pending: 0, ended: 0 }
      );

      setStats({
        totalActive,
        totalClients,
        onboardingComplete,
        onboardingPending,
        upcomingPoEnds,
        statusCounts,
      });
      setIsLoading(false);
    }
    
  useEffect(() => {
    fetchStats();
  }, []);

  return (
      <main>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : (
          stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat Cards */}
               <Link href="/dashboard/employees">
                 <Card className="flex flex-col bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer h-full">
                    <CardHeader className="flex-grow flex flex-col items-center text-center p-6 pb-2">
                        <Users className="w-12 h-12 text-primary mb-4" />
                        <CardTitle className="text-5xl font-extrabold text-foreground">
                        {stats.totalActive}
                        </CardTitle>
                        <CardDescription className="text-lg font-medium">
                        Active Employees
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-end items-center text-primary font-semibold">
                       View All <ArrowRight className="ml-2 h-4 w-4" />
                    </CardFooter>
                 </Card>
               </Link>
               
               <Card 
                  className="flex flex-col bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer h-full"
                  onClick={() => setIsClientManagerOpen(true)}
               >
                    <CardHeader className="flex-grow flex flex-col items-center text-center p-6 pb-2">
                        <Landmark className="w-12 h-12 text-primary mb-4" />
                        <CardTitle className="text-5xl font-extrabold text-foreground">
                        {stats.totalClients}
                        </CardTitle>
                        <CardDescription className="text-lg font-medium">
                        Total Clients
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="p-4 pt-0 flex justify-end items-center text-primary font-semibold">
                       Manage Clients <ArrowRight className="ml-2 h-4 w-4" />
                    </CardFooter>
                 </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <UserCheck className="w-6 h-6 text-primary" />
                    Onboarding Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex justify-around items-center text-center">
                        <div>
                            <p className="text-5xl font-bold text-green-500">{stats.onboardingComplete}</p>
                            <p className="text-sm text-muted-foreground mt-2">Completed</p>
                        </div>
                        <div>
                            <p className="text-5xl font-bold text-yellow-500">{stats.onboardingPending}</p>
                            <p className="text-sm text-muted-foreground mt-2">Pending</p>
                        </div>
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building className="w-6 h-6 text-primary" />
                    Status Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-around items-center text-center">
                    <div>
                      <p className="text-5xl font-bold text-green-500">
                        {stats.statusCounts.active}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Active</p>
                    </div>
                    <div>
                      <p className="text-5xl font-bold text-yellow-500">
                        {stats.statusCounts.pending}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Pending</p>
                    </div>
                    <div>
                      <p className="text-5xl font-bold text-red-500">
                        {stats.statusCounts.ended}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">Ended</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

                {/* Upcoming PO Ends Card */}
                <Card className="md:col-span-2 lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Bell className="w-6 h-6 text-primary" />
                            Upcoming PO End Dates (Next 45 Days)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.upcomingPoEnds.length > 0 ? (
                             <ul className="space-y-3">
                                {stats.upcomingPoEnds.map(emp => (
                                    <li key={emp.id} className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold">{emp.name}</p>
                                            <p className="text-sm text-muted-foreground">{emp.client}</p>
                                        </div>
                                        <p className="font-semibold text-destructive">{formatDate(emp.poEndDate)}</p>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-6">
                               <CheckCircle2 className="w-12 h-12 text-green-500 mb-2"/>
                               <p>No contracts are ending in the next 45 days.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </div>
          )
        )}
        <ClientManager 
            isOpen={isClientManagerOpen}
            onOpenChange={setIsClientManagerOpen}
            onClientsUpdate={fetchStats}
        />
      </main>
  );
}
