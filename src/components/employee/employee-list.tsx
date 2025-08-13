
'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2, User, Building, Calendar, Briefcase } from 'lucide-react';
import type { Employee } from '@/types/employee';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  isLoading: boolean;
  error: string | null;
}

const getOnboardingProgress = (onboarding: Employee['onboarding']) => {
    const fields = Object.keys(onboarding).filter(key => key !== 'documentsLink');
    const total = fields.length;
    if (total === 0) return 0;
    
    const doneCount = fields.filter(key => onboarding[key as keyof typeof onboarding] === 'Done').length;
    return Math.round((doneCount / total) * 100);
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {employees.map((employee) => {
        const onboardingProgress = getOnboardingProgress(employee.onboarding);
        return (
          <Card key={employee.id} className="flex flex-col transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold">{employee.name}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                    <Briefcase className="w-4 h-4"/>
                    {employee.role}
                </p>
              </div>
              <Badge variant={getStatusVariant(employee.status)}>{employee.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-4 flex-grow">
                <div className="text-sm text-muted-foreground space-y-2">
                    <div className="flex items-center gap-2"><Building className="w-4 h-4 text-primary"/><span>{employee.client}</span></div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary"/><span>Joined: {employee.doj}</span></div>
                </div>
                <div>
                    <Label className="text-xs font-semibold">Onboarding Progress</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <Progress value={onboardingProgress} className="h-2"/>
                        <span className="text-xs font-bold text-primary">{onboardingProgress}%</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
               <Button variant="outline" className="w-full" onClick={() => onEdit(employee)}>
                    <Edit className="mr-2 h-4 w-4" />
                    View & Edit
                </Button>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  );
}
