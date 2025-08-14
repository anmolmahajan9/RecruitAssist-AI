
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, User, Building, Calendar, Briefcase, ChevronRight, CheckCircle, AlertTriangle, CircleDotDashed, CircleAlert } from 'lucide-react';
import type { Employee, OnboardingStep } from '@/types/employee';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { onboardingTemplate } from '@/types/employee';


interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  isLoading: boolean;
  error: string | null;
}

interface GroupedEmployees {
  [key: string]: Employee[];
}

const getOnboardingStatusCounts = (steps?: OnboardingStep[]) => {
    if (!steps || steps.length === 0) {
      // Ensure we have a valid steps array, merge with template if needed.
      const templateSteps = onboardingTemplate.map(t => ({...t, status: 'Pending' as const}));
      steps = templateSteps;
    }
    
    let completed = 0;
    let pending = 0;
    let inProgress = 0;
    
    // Ensure all template steps are accounted for, merging statuses from employee data
    const allSteps = onboardingTemplate.map(templateStep => {
        const foundStep = steps?.find(s => s.id === templateStep.id);
        return foundStep || {...templateStep, status: 'Pending'};
    });

    allSteps.forEach(step => {
        switch (step.status) {
            case 'Done':
            case 'NA':
                completed++;
                break;
            case 'Pending':
                pending++;
                break;
            case 'In-Progress':
                inProgress++;
                break;
        }
    });

    return { completed, pending, inProgress };
}


const getPoProgress = (doj: string, poEndDate: string): { percentage: number, daysLeft: number } => {
    const startDate = new Date(doj);
    const endDate = new Date(poEndDate);
    const today = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || startDate >= endDate) {
      return { percentage: 100, daysLeft: 0 };
    }
    
    const timeLeft = endDate.getTime() - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

    if (today >= endDate) return { percentage: 100, daysLeft: 0 };
    if (today <= startDate) {
      const totalDuration = endDate.getTime() - startDate.getTime();
      return { percentage: 0, daysLeft: Math.ceil(totalDuration / (1000 * 60 * 60 * 24)) };
    }

    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    const percentage = Math.round((elapsedDuration / totalDuration) * 100);

    return { percentage, daysLeft };
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

  const getStatusColorClass = (status: string) => {
    switch(status) {
        case 'Active': return 'bg-green-500';
        case 'Ended': return 'bg-red-500';
        case 'Pending': return 'bg-yellow-500';
        default: return 'bg-gray-500';
    }
  }

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
                const onboardingCount = getOnboardingStatusCounts(employee.onboarding?.steps);
                const poProgressData = getPoProgress(employee.doj, employee.poEndDate);
                const poProgress = poProgressData.percentage;
                const daysLeft = poProgressData.daysLeft;

                let progressBarColorClass = 'bg-green-500';
                if (daysLeft < 30) {
                    progressBarColorClass = 'bg-red-500';
                } else if (daysLeft <= 45) {
                    progressBarColorClass = 'bg-yellow-500';
                }
                
                return (
                    <Card 
                        key={employee.id} 
                        className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="p-4 grid grid-cols-12 items-center gap-4">
                            {/* Left part: Name, Role, Status */}
                            <div className="col-span-12 md:col-span-3">
                                <CardTitle className="text-xl font-bold">{employee.name}</CardTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                    <Briefcase className="w-4 h-4"/>
                                    {employee.role}
                                </p>
                                <Badge variant={getStatusVariant(employee.status)} className={cn("mt-2 text-white", getStatusColorClass(employee.status))}>{employee.status}</Badge>
                            </div>
                            {/* Middle part: Client and DOJ */}
                            <div className="col-span-12 md:col-span-3 text-sm text-muted-foreground space-y-2">
                                <div className="flex items-center gap-2"><Building className="w-4 h-4 text-primary"/><span>{employee.client}</span></div>
                                <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/><span>Joined: {employee.doj}</span></div>
                            </div>
                            {/* Progress Bars & Counts */}
                            <div className="col-span-12 md:col-span-5 space-y-3">
                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <Label className="text-xs font-semibold">Contract Duration</Label>
                                        <Badge variant="outline" className={cn(
                                            daysLeft < 30 && 'text-red-600 border-red-400',
                                            daysLeft >= 30 && daysLeft <= 45 && 'text-yellow-600 border-yellow-400'
                                        )}>
                                            <AlertTriangle className="w-3 h-3 mr-1.5" />
                                            {daysLeft} days left
                                        </Badge>
                                    </div>
                                    <Progress value={poProgress} indicatorClassName={progressBarColorClass} className="h-2"/>
                                </div>
                                <div className="flex items-center gap-2 pt-1">
                                    <Label className="text-xs font-semibold">Onboarding:</Label>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="secondary" className="font-bold bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700">
                                            <CheckCircle className="w-3 h-3 mr-1"/>
                                            {onboardingCount.completed}
                                        </Badge>
                                        {onboardingCount.inProgress > 0 && (
                                            <Badge variant="secondary" className="font-bold bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700">
                                                <CircleAlert className="w-3 h-3 mr-1"/>
                                                {onboardingCount.inProgress}
                                            </Badge>
                                        )}
                                        {onboardingCount.pending > 0 && (
                                            <Badge variant="secondary" className="font-bold bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700">
                                                <CircleDotDashed className="w-3 h-3 mr-1"/>
                                                {onboardingCount.pending}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Action Button */}
                            <div className="col-span-12 md:col-span-1 flex justify-end">
                                <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}>
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
