'use client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Loader2 } from 'lucide-react';
import type { Employee } from '@/types/employee';

interface EmployeeListProps {
  employees: Employee[];
  onEdit: (employee: Employee) => void;
  isLoading: boolean;
  error: string | null;
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Records</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
            <div className="text-center text-destructive">{error}</div>
        ) : employees.length === 0 ? (
          <div className="text-center text-muted-foreground h-40 flex justify-center items-center">
            No employees found. Click "Add New Employee" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>DOJ</TableHead>
                  <TableHead>PO End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.client}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(employee.status)}>{employee.status}</Badge>
                    </TableCell>
                    <TableCell>{employee.doj}</TableCell>
                    <TableCell>{employee.poEndDate}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(employee)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
