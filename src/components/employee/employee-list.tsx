
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, User, Building, Calendar, Briefcase, ChevronRight, CheckCircle, AlertTriangle, CircleDotDashed, CircleAlert, ChevronDown, ChevronUp } from 'lucide-react';
import type { Employee, OnboardingStep } from '@/types/employee';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { onboardingTemplate } from '@/types/employee';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';


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
    const totalSteps = onboardingTemplate.length;
    if (!steps || steps.length === 0) {
      return { completed: 0, pending: totalSteps, inProgress: 0, total: totalSteps };
    }
    
    let completed = 0;
    let pending = 0;
    let inProgress = 0;
    
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

    return { completed, pending, inProgress, total: totalSteps };
}


const getPoProgress = (doj: string, poEndDate: string): { percentage: number, daysLeft: number } => {
    const startDate = new Date(doj);
    const endDate = new Date(poEndDate);
    
    // Create a new Date object for today and reset time to midnight for consistent day comparison
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

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

const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        // Check for invalid date, which can happen with empty or malformed strings
        if (isNaN(date.getTime())) return dateString;

        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
        const year = date.getUTCFullYear();
        
        return `${day}-${month}-${year}`;
    } catch (e) {
        return dateString; // Return original string on error
    }
};


export function EmployeeList({ employees, onEdit, isLoading, error }: EmployeeListProps) {

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
  
  const renderEmployeeCard = (employee: Employee) => {
    const onboardingCount = getOnboardingStatusCounts(employee.onboarding?.steps);
    const poProgressData = getPoProgress(employee.doj, employee.poEndDate);
    const poProgress = poProgressData.percentage;
    const daysLeft = poProgressData.daysLeft;

    let pillColorClass = '';
    if (daysLeft > 45) {
        pillColorClass = 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700';
    } else if (daysLeft > 30) {
        pillColorClass = 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700';
    } else {
        pillColorClass = 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';
    }
    
     const getStatusColor = (status: string) => {
      switch (status) {
        case 'Active': return 'bg-green-500';
        case 'Ended': return 'bg-red-500';
        case 'Pending': return 'bg-yellow-500';
        default: return 'bg-gray-400';
      }
    }

    return (
        <div className="p-4 pl-8 grid grid-cols-12 items-center gap-4">
            {/* Left part: Name, Role, Status */}
            <div className="col-span-12 md:col-span-4">
                <CardTitle className="text-xl font-bold">{employee.name}</CardTitle>
                <div className="text-sm text-muted-foreground space-y-1 mt-2">
                  <div className="flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground"/><span>{employee.client}</span></div>
                  <div className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-muted-foreground"/><span>{employee.role}</span></div>
                </div>
            </div>
            {/* Middle part: Onboarding Icons */}
             <div className="col-span-12 md:col-span-3">
                 <TooltipProvider>
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center gap-2">
                             <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="secondary" className={cn("font-bold w-fit", employee.status === 'Ended' ? 'bg-gray-100 text-gray-500 border-gray-300' : 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700')}>
                                        <CheckCircle className="w-3 h-3 mr-1"/>
                                        {onboardingCount.completed}
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Completed</p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">Completed</span>
                        </div>
                        {onboardingCount.inProgress > 0 && (
                            <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className={cn("font-bold w-fit", employee.status === 'Ended' ? 'bg-gray-100 text-gray-500 border-gray-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700')}>
                                            <CircleAlert className="w-3 h-3 mr-1"/>
                                            {onboardingCount.inProgress}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>In Progress</p>
                                    </TooltipContent>
                                </Tooltip>
                                <span className="text-xs text-muted-foreground">In Progress</span>
                            </div>
                        )}
                        {onboardingCount.pending > 0 && (
                             <div className="flex items-center gap-2">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Badge variant="secondary" className={cn("font-bold w-fit", employee.status === 'Ended' ? 'bg-gray-100 text-gray-500 border-gray-300' : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700')}>
                                            <CircleDotDashed className="w-3 h-3 mr-1"/>
                                            {onboardingCount.pending}
                                        </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Pending</p>
                                    </TooltipContent>
                                </Tooltip>
                                 <span className="text-xs text-muted-foreground">Pending</span>
                            </div>
                        )}
                    </div>
                    </TooltipProvider>
            </div>

            {/* Progress Bars & Counts */}
            <div className="col-span-12 md:col-span-4 space-y-3">
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs font-semibold">PO Duration</Label>
                        {employee.status !== 'Ended' && (
                            <Badge variant="secondary" className={cn('font-bold', pillColorClass)}>
                                <AlertTriangle className="w-3 h-3 mr-1.5" />
                                {daysLeft} days left
                            </Badge>
                        )}
                    </div>
                    <Progress 
                      value={100}
                      indicatorClassName={cn(employee.status === 'Ended' ? 'bg-gray-300' : (daysLeft > 45 ? 'bg-green-400' : 'bg-yellow-400'))}
                      value2={poProgress} 
                      indicator2ClassName={cn(employee.status === 'Ended' ? 'bg-gray-300' : 'bg-red-400')}
                      className="h-2"
                    />
                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                      <span>{formatDate(employee.doj)}</span>
                      <span>{formatDate(employee.poEndDate)}</span>
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
    )
  }

  return (
    <div className="space-y-8">
      {sortedMonthKeys.map(month => (
        <div key={month}>
            <h2 className="text-2xl font-bold tracking-tight text-foreground mb-4 pb-2 border-b-2 border-primary/20">{month}</h2>
            <div className="space-y-4">
              {groupedEmployees[month].map((employee) => {
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case 'Active': return 'bg-green-500';
                    case 'Ended': return 'bg-red-500';
                    case 'Pending': return 'bg-yellow-500';
                    default: return 'bg-gray-400';
                  }
                };

                if (employee.status === 'Ended') {
                  return (
                    <Accordion key={employee.id} type="single" collapsible className="w-full">
                       <AccordionItem value={`employee-${employee.id}`} className="border-none">
                         <Card className="group transform transition-all duration-300 hover:shadow-xl relative overflow-hidden">
                            <AccordionTrigger className="w-full hover:no-underline p-0 data-[state=open]:border-b">
                                <div className="p-4 pl-8 grid grid-cols-12 items-center gap-4 w-full">
                                    <div className={cn(
                                        "absolute left-0 top-0 h-full w-2 group-hover:w-8 transition-all duration-300 ease-in-out flex items-center justify-center", 
                                        getStatusColor(employee.status)
                                    )}>
                                        <span className="text-white font-bold text-sm -rotate-90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                                            {employee.status}
                                        </span>
                                    </div>
                                    <div className="col-span-11 flex items-center">
                                        <CardTitle className="text-xl font-bold">{employee.name}</CardTitle>
                                        <span className="text-xl font-normal text-muted-foreground mx-2">-</span>
                                        <span className="text-xl font-semibold text-muted-foreground">{employee.client}</span>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                      <ChevronDown className="h-6 w-6 text-muted-foreground transition-transform duration-200 group-data-[state=open]:hidden" />
                                      <ChevronUp className="h-6 w-6 text-muted-foreground transition-transform duration-200 group-data-[state=closed]:hidden" />
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                {renderEmployeeCard(employee)}
                            </AccordionContent>
                         </Card>
                       </AccordionItem>
                    </Accordion>
                  )
                }
                
                return (
                    <Card 
                        key={employee.id} 
                        className="group transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative overflow-hidden"
                    >
                         <div className={cn(
                            "absolute left-0 top-0 h-full w-2 group-hover:w-8 transition-all duration-300 ease-in-out flex items-center justify-center", 
                            getStatusColor(employee.status)
                        )}>
                            <span className="text-white font-bold text-sm -rotate-90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-150">
                                {employee.status}
                            </span>
                        </div>
                        {renderEmployeeCard(employee)}
                    </Card>
                )
              })}
            </div>
        </div>
      ))}
    </div>
  );
}
