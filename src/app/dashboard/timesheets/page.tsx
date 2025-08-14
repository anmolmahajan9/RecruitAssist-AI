
'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Employee, Timesheet, TimesheetStatus, InvoiceStatus } from '@/types/employee';
import { getEmployees } from '@/services/employeeService';
import { getTimesheetsForMonth, upsertTimesheet } from '@/services/timesheetService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight, History, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timesheetStatuses, invoiceStatuses } from '@/types/employee';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getStatusColor = (status: TimesheetStatus | InvoiceStatus) => {
    switch (status) {
        // Timesheet
        case 'Pending': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        case 'Received': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Sent to Client': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';

        // Invoice
        case 'Not Due': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'Due, Not Raised': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
        // 'Sent to Client' uses yellow from above
        case 'Paid': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';

        case 'Not Applicable': return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
        default: return 'bg-white dark:bg-black';
    }
}

const formatUpdateDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};


export default function TimesheetsPage() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [timesheetData, setTimesheetData] = useState<Record<string, Timesheet>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const formattedMonth = useMemo(() => {
        return currentMonth.toISOString().slice(0, 7); // YYYY-MM
    }, [currentMonth]);
    
    const fetchAllData = async (month: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const [fetchedEmployees, fetchedTimesheets] = await Promise.all([
                getEmployees(),
                getTimesheetsForMonth(month)
            ]);

            const viewMonthStart = new Date(`${month}-01T00:00:00Z`);

            const filteredEmployees = fetchedEmployees.filter(e => {
                if (!e.doj) return false;

                const doj = new Date(e.doj);
                const poEndDate = e.poEndDate ? new Date(e.poEndDate) : null;
                
                // Set to start of the month for DOJ
                const dojMonthStart = new Date(Date.UTC(doj.getUTCFullYear(), doj.getUTCMonth(), 1));

                // If DOJ is in a future month, don't show
                if (dojMonthStart > viewMonthStart) {
                    return false;
                }

                // If PO End Date exists
                if (poEndDate) {
                    // Set to end of the month for PO End Date to include the whole month
                    const poEndMonthEnd = new Date(Date.UTC(poEndDate.getUTCFullYear(), poEndDate.getUTCMonth() + 1, 0));
                    if (poEndMonthEnd < viewMonthStart) {
                        return false;
                    }
                }
                
                // If DOJ is valid and we passed the PO end date checks (or there was no PO end date)
                return true;
            });


            setEmployees(filteredEmployees);

            const timesheetMap = fetchedTimesheets.reduce((acc, ts) => {
                acc[ts.employeeId] = ts;
                return acc;
            }, {} as Record<string, Timesheet>);
            setTimesheetData(timesheetMap);

        } catch (e) {
            setError('Failed to fetch data. Please try again.');
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData(formattedMonth);
    }, [formattedMonth]);

    const handleStatusChange = async (
        employeeId: string, 
        type: 'timesheet' | 'invoice', 
        status: TimesheetStatus | InvoiceStatus
    ) => {
        const existingEntry = timesheetData[employeeId] || {
            employeeId,
            month: formattedMonth,
            timesheetStatus: 'Pending',
            invoiceStatus: 'Not Due'
        };

        const updaterName = user?.displayName || 'Unknown User';
        const updateTime = new Date();

        let updatedEntry: Partial<Timesheet> = { ...existingEntry };

        if (type === 'timesheet') {
            updatedEntry.timesheetStatus = status as TimesheetStatus;
            updatedEntry.timesheetUpdatedBy = updaterName;
            updatedEntry.timesheetUpdatedAt = updateTime;
        } else {
            updatedEntry.invoiceStatus = status as InvoiceStatus;
            updatedEntry.invoiceUpdatedBy = updaterName;
            updatedEntry.invoiceUpdatedAt = updateTime;
        }
        
        try {
            const newDoc = await upsertTimesheet(updatedEntry);
            setTimesheetData(prev => ({ ...prev, [employeeId]: { ...existingEntry, ...newDoc } as Timesheet }));
        } catch (e) {
            console.error("Failed to update status: ", e);
            setError("Failed to update status. Please refresh and try again.");
        }
    };
    
    const changeMonth = (amount: number) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    }

    const groupedEmployees = useMemo(() => {
        if (!employees) return {};
        return employees.reduce((acc, employee) => {
            const clientName = employee.client || 'Unassigned';
            if (!acc[clientName]) {
                acc[clientName] = [];
            }
            acc[clientName].push(employee);
            return acc;
        }, {} as Record<string, Employee[]>);
    }, [employees]);

    const sortedClients = useMemo(() => Object.keys(groupedEmployees).sort(), [groupedEmployees]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Timesheet & Invoice Tracking</CardTitle>
                        <CardDescription>Update the status for each employee for the selected month.</CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-32 text-center">
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </span>
                         <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <p className="text-destructive text-center">{error}</p>
                ) : (
                 <TooltipProvider>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Timesheet</TableHead>
                                <TableHead>Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedClients.map(clientName => (
                                <React.Fragment key={clientName}>
                                    <TableRow className="bg-secondary/30 hover:bg-secondary/40">
                                        <TableCell colSpan={3} className="font-bold text-lg">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-5 w-5 text-primary"/>
                                                {clientName}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {groupedEmployees[clientName].map(employee => {
                                        const ts = timesheetData[employee.id!] || { timesheetStatus: 'Pending', invoiceStatus: 'Not Due' };
                                        
                                        const timesheetTooltip = ts.timesheetUpdatedAt ? (
                                            <span>Last updated by <strong>{ts.timesheetUpdatedBy}</strong> on {formatUpdateDate(ts.timesheetUpdatedAt)}</span>
                                         ) : null;
                                         
                                        const invoiceTooltip = ts.invoiceUpdatedAt ? (
                                            <span>Last updated by <strong>{ts.invoiceUpdatedBy}</strong> on {formatUpdateDate(ts.invoiceUpdatedAt)}</span>
                                         ) : null;
                                        
                                        return (
                                            <TableRow key={employee.id}>
                                                <TableCell className="font-medium">{employee.name}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                      <Select 
                                                          value={ts.timesheetStatus} 
                                                          onValueChange={(v: TimesheetStatus) => handleStatusChange(employee.id!, 'timesheet', v)}
                                                      >
                                                          <SelectTrigger className={cn("w-40", getStatusColor(ts.timesheetStatus))}>
                                                              <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                              {timesheetStatuses.map(status => (
                                                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                                              ))}
                                                          </SelectContent>
                                                      </Select>
                                                       {timesheetTooltip && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <History className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>{timesheetTooltip}</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                   <div className="flex items-center gap-2">
                                                      <Select 
                                                          value={ts.invoiceStatus}
                                                          onValueChange={(v: InvoiceStatus) => handleStatusChange(employee.id!, 'invoice', v)}
                                                      >
                                                          <SelectTrigger className={cn("w-40", getStatusColor(ts.invoiceStatus))}>
                                                              <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                              {invoiceStatuses.map(status => (
                                                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                                              ))}
                                                          </SelectContent>
                                                      </Select>
                                                        {invoiceTooltip && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <History className="h-4 w-4 text-muted-foreground cursor-pointer" />
                                                                </TooltipTrigger>
                                                                <TooltipContent>{invoiceTooltip}</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                  </TooltipProvider>
                )}
            </CardContent>
        </Card>
    );
}

    

    
