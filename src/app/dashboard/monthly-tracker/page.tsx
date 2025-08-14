
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { Employee, MonthlyTracker, TimesheetStatus, InvoiceStatus, HrCheckinStatus } from '@/types/employee';
import { getEmployees } from '@/services/employeeService';
import { getTrackerEntriesForMonth, upsertTrackerEntry } from '@/services/timesheetService';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, ArrowLeft, ArrowRight, History, Building } from 'lucide-react';
import { cn } from '@/lib/utils';
import { timesheetStatuses, invoiceStatuses, hrCheckinStatuses } from '@/types/employee';
import { useAuth } from '@/context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const getStatusColor = (status: TimesheetStatus | InvoiceStatus | HrCheckinStatus) => {
    switch (status) {
        // Timesheet
        case 'Pending': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        case 'Received': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case 'Sent to Client': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case 'Approved': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';

        // Invoice
        case 'Not Due': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        case 'Due, Not Raised': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300';
        case 'Paid': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300';

        // HR Checkin
        case 'Done': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        
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


export default function MonthlyTrackerPage() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [trackerData, setTrackerData] = useState<Record<string, MonthlyTracker>>({});
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
            const [fetchedEmployees, fetchedTrackerEntries] = await Promise.all([
                getEmployees(),
                getTrackerEntriesForMonth(month)
            ]);

            const viewMonthStart = new Date(`${month}-01T00:00:00Z`);

            const filteredEmployees = fetchedEmployees.filter(e => {
                if (!e.doj) return false;

                const doj = new Date(e.doj);
                const poEndDate = e.poEndDate ? new Date(e.poEndDate) : null;
                
                const dojMonthStart = new Date(Date.UTC(doj.getUTCFullYear(), doj.getUTCMonth(), 1));

                if (dojMonthStart > viewMonthStart) {
                    return false;
                }

                if (poEndDate) {
                    const poEndMonthEnd = new Date(Date.UTC(poEndDate.getUTCFullYear(), poEndDate.getUTCMonth() + 1, 0));
                    if (poEndMonthEnd < viewMonthStart) {
                        return false;
                    }
                }
                
                return true;
            });

            setEmployees(filteredEmployees);

            const trackerMap = fetchedTrackerEntries.reduce((acc, ts) => {
                acc[ts.employeeId] = ts;
                return acc;
            }, {} as Record<string, MonthlyTracker>);
            setTrackerData(trackerMap);

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
        type: 'timesheet' | 'invoice' | 'hrCheckin12th' | 'hrCheckin25th', 
        status: TimesheetStatus | InvoiceStatus | HrCheckinStatus
    ) => {
        const existingEntry = trackerData[employeeId] || {
            employeeId,
            month: formattedMonth,
            timesheetStatus: 'Pending',
            invoiceStatus: 'Not Due',
            hrCheckin12thStatus: 'Pending',
            hrCheckin25thStatus: 'Pending'
        };

        const updaterName = user?.displayName || 'Unknown User';
        const updateTime = new Date();

        let updatedEntry: Partial<MonthlyTracker> = { ...existingEntry };

        switch (type) {
            case 'timesheet':
                updatedEntry.timesheetStatus = status as TimesheetStatus;
                updatedEntry.timesheetUpdatedBy = updaterName;
                updatedEntry.timesheetUpdatedAt = updateTime;
                break;
            case 'invoice':
                updatedEntry.invoiceStatus = status as InvoiceStatus;
                updatedEntry.invoiceUpdatedBy = updaterName;
                updatedEntry.invoiceUpdatedAt = updateTime;
                break;
            case 'hrCheckin12th':
                updatedEntry.hrCheckin12thStatus = status as HrCheckinStatus;
                updatedEntry.hrCheckin12thUpdatedBy = updaterName;
                updatedEntry.hrCheckin12thUpdatedAt = updateTime;
                break;
            case 'hrCheckin25th':
                updatedEntry.hrCheckin25thStatus = status as HrCheckinStatus;
                updatedEntry.hrCheckin25thUpdatedBy = updaterName;
                updatedEntry.hrCheckin25thUpdatedAt = updateTime;
                break;
        }
        
        try {
            const newDoc = await upsertTrackerEntry(updatedEntry);
            setTrackerData(prev => ({ ...prev, [employeeId]: { ...existingEntry, ...newDoc } as MonthlyTracker }));
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
                        <CardTitle>Monthly Employee Tracker</CardTitle>
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
                                <TableHead>HR Check-in (12th)</TableHead>
                                <TableHead>HR Check-in (25th)</TableHead>
                                <TableHead>Timesheet</TableHead>
                                <TableHead>Invoice</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedClients.map(clientName => (
                                <React.Fragment key={clientName}>
                                    <TableRow className="bg-secondary/30 hover:bg-secondary/40">
                                        <TableCell colSpan={5} className="font-bold text-lg">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-5 w-5 text-primary"/>
                                                {clientName}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                    {groupedEmployees[clientName].map(employee => {
                                        const entry = trackerData[employee.id!] || { 
                                            timesheetStatus: 'Pending', 
                                            invoiceStatus: 'Not Due',
                                            hrCheckin12thStatus: 'Pending',
                                            hrCheckin25thStatus: 'Pending'
                                        };
                                        
                                        const tooltips = {
                                           timesheet: entry.timesheetUpdatedAt ? `Last updated by ${entry.timesheetUpdatedBy} on ${formatUpdateDate(entry.timesheetUpdatedAt)}` : null,
                                           invoice: entry.invoiceUpdatedAt ? `Last updated by ${entry.invoiceUpdatedBy} on ${formatUpdateDate(entry.invoiceUpdatedAt)}` : null,
                                           hrCheckin12th: entry.hrCheckin12thUpdatedAt ? `Last updated by ${entry.hrCheckin12thUpdatedBy} on ${formatUpdateDate(entry.hrCheckin12thUpdatedAt)}` : null,
                                           hrCheckin25th: entry.hrCheckin25thUpdatedAt ? `Last updated by ${entry.hrCheckin25thUpdatedBy} on ${formatUpdateDate(entry.hrCheckin25thUpdatedAt)}` : null
                                        };

                                        return (
                                            <TableRow key={employee.id}>
                                                <TableCell className="font-medium">{employee.name}</TableCell>
                                                
                                                {/* HR Check-in 12th */}
                                                <TableCell>
                                                   <div className="flex items-center gap-2">
                                                      <Select 
                                                          value={entry.hrCheckin12thStatus}
                                                          onValueChange={(v: HrCheckinStatus) => handleStatusChange(employee.id!, 'hrCheckin12th', v)}
                                                      >
                                                          <SelectTrigger className={cn("w-32", getStatusColor(entry.hrCheckin12thStatus))}>
                                                              <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                              {hrCheckinStatuses.map(status => (
                                                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                                              ))}
                                                          </SelectContent>
                                                      </Select>
                                                      {tooltips.hrCheckin12th && <Tooltip><TooltipTrigger asChild><History className="h-4 w-4 text-muted-foreground cursor-pointer" /></TooltipTrigger><TooltipContent>{tooltips.hrCheckin12th}</TooltipContent></Tooltip>}
                                                    </div>
                                                </TableCell>
                                                
                                                {/* HR Check-in 25th */}
                                                <TableCell>
                                                   <div className="flex items-center gap-2">
                                                      <Select 
                                                          value={entry.hrCheckin25thStatus}
                                                          onValueChange={(v: HrCheckinStatus) => handleStatusChange(employee.id!, 'hrCheckin25th', v)}
                                                      >
                                                          <SelectTrigger className={cn("w-32", getStatusColor(entry.hrCheckin25thStatus))}>
                                                              <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                              {hrCheckinStatuses.map(status => (
                                                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                                              ))}
                                                          </SelectContent>
                                                      </Select>
                                                      {tooltips.hrCheckin25th && <Tooltip><TooltipTrigger asChild><History className="h-4 w-4 text-muted-foreground cursor-pointer" /></TooltipTrigger><TooltipContent>{tooltips.hrCheckin25th}</TooltipContent></Tooltip>}
                                                    </div>
                                                </TableCell>

                                                {/* Timesheet Status */}
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Select 
                                                            value={entry.timesheetStatus} 
                                                            onValueChange={(v: TimesheetStatus) => handleStatusChange(employee.id!, 'timesheet', v)}
                                                        >
                                                            <SelectTrigger className={cn("w-40", getStatusColor(entry.timesheetStatus))}>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {timesheetStatuses.map(status => (
                                                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {tooltips.timesheet && <Tooltip><TooltipTrigger asChild><History className="h-4 w-4 text-muted-foreground cursor-pointer" /></TooltipTrigger><TooltipContent>{tooltips.timesheet}</TooltipContent></Tooltip>}
                                                    </div>
                                                </TableCell>

                                                {/* Invoice Status */}
                                                <TableCell>
                                                   <div className="flex items-center gap-2">
                                                      <Select 
                                                          value={entry.invoiceStatus}
                                                          onValueChange={(v: InvoiceStatus) => handleStatusChange(employee.id!, 'invoice', v)}
                                                      >
                                                          <SelectTrigger className={cn("w-40", getStatusColor(entry.invoiceStatus))}>
                                                              <SelectValue />
                                                          </SelectTrigger>
                                                          <SelectContent>
                                                              {invoiceStatuses.map(status => (
                                                                  <SelectItem key={status} value={status}>{status}</SelectItem>
                                                              ))}
                                                          </SelectContent>
                                                      </Select>
                                                      {tooltips.invoice && <Tooltip><TooltipTrigger asChild><History className="h-4 w-4 text-muted-foreground cursor-pointer" /></TooltipTrigger><TooltipContent>{tooltips.invoice}</TooltipContent></Tooltip>}
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
