
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, User, Building, Calendar, Briefcase, ChevronRight, CheckCircle } from 'lucide-react';
import type { Employee, OnboardingStep } from '@/types/employee';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  isLoading: boolean;
  error: string | null;
}

interface GroupedEmployees {
  [key: string]: Employee[];
}

const getOnboardingProgressCount = (steps: OnboardingStep[] = []) => {
    if (!steps || steps.length === 0) return { completed: 0, total: 0 };
    
    const completedCount = steps.filter(step => step.status === 'Done' || step.status === 'NA').length;
    return { completed: completedCount, total: steps.length };
}

const getPoProgress = (doj: string, poEndDate: string): number => {
    const startDate = new Date(doj);
    const endDate = new Date(poEndDate);
    const today = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return 100; // Return 100 if dates are invalid or start is after end
    }

    if (today >= endDate) return 100;
    if (today <= startDate) return 0;

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    return Math.round((elapsedDuration / totalDuration) * 100);
}


export function EmployeeList({ employees, onEdit, isLoading, error }: EmployeeListProps) {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Ended':
        return 'destructive';
      case 'Pending':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const groupedEmployees = employees.reduce((acc, employee) => {
    let key = 'Undated';
    if (employee.doj) {
        try {
            const date = new Date(employee.doj);
            if (!isNaN(date.getTime())) {
                key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
            }
        } catch (e) {
            // Keep key as 'Undated' if date is invalid
        }
    }
    
    if (!acc[key]) {
        acc[key] = [];
    }
    acc[key].push(employee);
    return acc;
  }, {} as GroupedEmployees);

  const sortedMonthKeys = Object.keys(groupedEmployees).sort((a, b) => {
      if (a === 'Undated') return 1;
      if (b === 'Undated') return -1;
      // Sort by date, most recent first
      return new Date(b).getTime() - new Date(a).getTime();
  });


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <CardTitle className="text-destructive-foreground">An Error Occurred</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive-foreground">{error}</p>
            </CardContent>
        </Card>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center text-muted-foreground h-64 flex flex-col justify-center items-center bg-secondary/50 rounded-2xl">
        <User className="w-16 h-16 mb-4 text-muted-foreground/50"/>
        <h3 className="text-xl font-semibold">No Employees Found</h3>
        <p className="mt-2">Click "Add New Employee" to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sortedMonthKeys.map(month => (
        <div key={month}>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 pb-2 border-b-2 border-primary/20">{month}</h2>
            <div className="space-y-4">
              {groupedEmployees[month].map((employee) => {
                const onboardingCount = getOnboardingProgressCount(employee.onboarding?.steps);
                const poProgress = getPoProgress(employee.doj, employee.poEndDate);
                return (
                    <Card 
                        key={employee.id} 
                        className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="p-4 grid grid-cols-12 items-center gap-4 cursor-pointer" onClick={() => onEdit(employee)}>
                            {/* Left part: Name, Role, Status */}
                            <div className="col-span-12 md:col-span-3">
                                <CardTitle className="text-xl font-bold">{employee.name}</CardTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Briefcase className="w-4 h-4"/>
                                    {employee.role}
                                </p>
                                <Badge variant={getStatusVariant(employee.status)} className="mt-2">{employee.status}</Badge>
                            </div>
                            {/* Middle part: Client and DOJ */}
                            <div className="col-span-12 md:col-span-3 text-sm text-muted-foreground space-y-2">
                                <div className="flex items-center gap-2"><Building className="w-4 h-4 text-primary"/><span>{employee.client}</span></div>
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/><span>Joined: {employee.doj}</span></div>
                            </div>
                            {/* Progress Bars & Counts */}
                            <div className="col-span-12 md:col-span-5 space-y-3">
                                <div>
                                    <Label className="text-xs font-semibold">Contract Duration</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Progress value={poProgress} className="h-2"/>
                                        <span className="text-sm font-bold text-primary">{poProgress}%</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Label className="text-xs font-semibold">Onboarding:</Label>
                                    <Badge variant="secondary" className="font-bold text-base">
                                        <CheckCircle className="w-4 h-4 mr-1.5 text-green-500"/>
                                        {onboardingCount.completed} / {onboardingCount.total}
                                    </Badge>
                                </div>
                            </div>
                            {/* Action Button */}
                            <div className="col-span-12 md:col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon">
                                    <ChevronRight className="h-6 w-6 text-muted-foreground"/>
                                </Button>
                            </div>
                        </div>
                    </Card>
                )
              })}
            </div>
        </div>
      ))}
    </div>
  );
}
