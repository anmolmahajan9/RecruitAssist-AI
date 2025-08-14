
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';
import { EmployeeForm } from '@/components/employee/employee-form';
import { EmployeeList } from '@/components/employee/employee-list';
import type { Employee } from '@/types/employee';
import { getEmployees } from '@/services/employeeService';
import { seedDatabase } from '@/services/seedService';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(true);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const fetchedEmployees = await getEmployees();
      setEmployees(fetchedEmployees);
      setError(null);
    } catch (e) {
      setError('Failed to fetch employees. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const runSeeder = async () => {
        console.log("Attempting to seed database...");
        try {
            const result = await seedDatabase();
            console.log(result.message);
        } catch (e) {
            console.error("Seeding failed:", e);
        } finally {
            setIsSeeding(false);
            fetchEmployees();
        }
    };
    runSeeder();
  }, []);

  const handleFormSuccess = () => {
    fetchEmployees();
    setIsFormOpen(false);
    setSelectedEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };

  const openNewForm = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  }

  return (
    <div>
       <div className="flex justify-between items-center bg-card p-4 rounded-2xl shadow-sm mb-6">
            <p className="text-lg text-muted-foreground max-w-2xl">
                Add, view, and manage all your on-site employee records.
            </p>
            <Button onClick={openNewForm} size="lg" className="font-bold">
              <PlusCircle className="mr-2 h-5 w-5" />
              Add New Employee
            </Button>
        </div>
      
      <main>
        <EmployeeList 
            employees={employees} 
            onEdit={handleEdit} 
            isLoading={isLoading || isSeeding}
            error={error}
        />
      </main>

      <EmployeeForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
