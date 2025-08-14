
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { EmployeeForm } from '@/components/employee/employee-form';
import { EmployeeList } from '@/components/employee/employee-list';
import type { Employee } from '@/types/employee';
import { getEmployees } from '@/services/employeeService';
import { getClients } from '@/services/clientService';
import { seedDatabase } from '@/services/seedService';
import {
  EmployeeFilters,
  type Filters,
} from '@/components/employee/employee-filters';
import type { Client } from '@/types/client';

export default function EmployeesPage() {
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    clients: [],
    states: [],
    poDuration: 'all',
    statuses: [],
    pendingOnboarding: false,
  });

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [fetchedEmployees, fetchedClients] = await Promise.all([
        getEmployees(),
        getClients(),
      ]);
      setAllEmployees(fetchedEmployees);
      setClients(fetchedClients);
      setError(null);
    } catch (e) {
      setError('Failed to fetch initial data. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const runSeeder = async () => {
      console.log('Attempting to seed database...');
      try {
        const result = await seedDatabase();
        console.log(result.message);
      } catch (e) {
        console.error('Seeding failed:', e);
      } finally {
        setIsSeeding(false);
        fetchInitialData();
      }
    };
    runSeeder();
  }, []);

  const handleFormSuccess = () => {
    fetchInitialData();
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
  };

  const filteredEmployees = useMemo(() => {
    return allEmployees.filter((employee) => {
      // Client filter
      if (
        filters.clients.length > 0 &&
        !filters.clients.includes(employee.client)
      ) {
        return false;
      }
      // State filter
      if (
        filters.states.length > 0 &&
        !filters.states.includes(employee.state)
      ) {
        return false;
      }
      // Status filter
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(employee.status)
      ) {
        return false;
      }
      // PO Duration filter
      if (filters.poDuration !== 'all' && employee.poEndDate) {
        const now = new Date();
        now.setUTCHours(0, 0, 0, 0);
        const endDate = new Date(employee.poEndDate);
        const diffTime = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return false; // Exclude already ended POs

        if (filters.poDuration === '30' && diffDays > 30) return false;
        if (filters.poDuration === '60' && diffDays > 60) return false;
        if (filters.poDuration === '90' && diffDays > 90) return false;
      }
       // Pending Onboarding filter
      if (filters.pendingOnboarding) {
        const hasPending = employee.onboarding?.steps.some(
          (step) => step.status === 'Pending' || step.status === 'In-Progress'
        );
        if (!hasPending) return false;
      }

      return true;
    });
  }, [allEmployees, filters]);

  const availableStates = useMemo(() => {
    const states = new Set(allEmployees.map(e => e.state).filter(Boolean));
    return Array.from(states).sort();
  }, [allEmployees]);


  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-4 rounded-2xl shadow-sm mb-6 gap-4">
        <p className="text-lg text-muted-foreground max-w-2xl">
          Add, view, and manage all your on-site employee records.
        </p>
        <Button onClick={openNewForm} size="lg" className="font-bold w-full md:w-auto">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Employee
        </Button>
      </div>
      
       <div className="mb-6">
          <EmployeeFilters
            clients={clients}
            states={availableStates}
            onFilterChange={setFilters}
          />
        </div>

      <main>
        <EmployeeList
          employees={filteredEmployees}
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
