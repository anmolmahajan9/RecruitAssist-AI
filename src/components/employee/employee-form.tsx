
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, User, FileText, CheckCircle, XCircle, AlertCircle, CircleDot } from 'lucide-react';
import { addEmployee, updateEmployee } from '@/services/employeeService';
import type { Employee, OnboardingTracker } from '@/types/employee';
import { cn } from '@/lib/utils';


interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

const initialOnboardingState: OnboardingTracker = {
  offerLetter: 'Pending',
  resignationEmail: 'Pending',
  aadharCard: 'Pending',
  panCard: 'Pending',
  payslips: 'Pending',
  referenceCheck: 'Pending',
  bgCheck: 'Pending',
  relievingLetter: 'Pending',
  addToPlum: 'Pending',
  documentsLink: '',
  leavePolicy: 'Pending',
  welcomeMail: 'Pending',
  onboardingCall: 'Pending',
};

const initialEmployeeState: Omit<Employee, 'id'> = {
  poc: 'Aakriti',
  client: '',
  name: '',
  status: 'Active',
  role: '',
  doj: '',
  poEndDate: '',
  ctc: '',
  billingRate: '',
  location: '',
  recruiter: '',
  stage: 'In-Progress',
  experience: 'NA',
  optForPF: false,
  optForHealth: false,
  onboarding: initialOnboardingState,
};

const statusConfig = {
    Done: { icon: CheckCircle, color: 'text-green-500', label: 'Done' },
    Pending: { icon: XCircle, color: 'text-red-500', label: 'Pending' },
    'In-Progress': { icon: AlertCircle, color: 'text-yellow-500', label: 'In Progress' },
    NA: { icon: CircleDot, color: 'text-muted-foreground', label: 'N/A' },
};

export function EmployeeForm({
  isOpen,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormProps) {
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(initialEmployeeState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
        if (employee) {
            const employeeCopy = JSON.parse(JSON.stringify(employee));
            setFormData({
                ...initialEmployeeState,
                ...employeeCopy,
                onboarding: {
                ...initialOnboardingState,
                ...(employeeCopy.onboarding || {}),
                },
            });
        } else {
            setFormData(initialEmployeeState);
        }
    }
  }, [isOpen, employee]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'optForPF' | 'optForHealth', checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };
  
  const handleOnboardingChange = (
    field: keyof OnboardingTracker,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      onboarding: { ...prev.onboarding, [field]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (employee && employee.id) {
        await updateEmployee(employee.id, formData);
      } else {
        await addEmployee(formData);
      }
      onSuccess();
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClose = (open: boolean) => {
      if (!open) {
        setError(null);
      }
      onOpenChange(open);
  }

  const onboardingFields: { key: keyof OnboardingTracker; label: string, type: 'status' | 'text' }[] = [
    { key: 'offerLetter', label: 'Offer Letter', type: 'status' },
    { key: 'resignationEmail', label: 'Resignation Email', type: 'status' },
    { key: 'aadharCard', label: 'Aadhar Card', type: 'status' },
    { key: 'panCard', label: 'Pan Card', type: 'status' },
    { key: 'payslips', label: 'Payslips (6 months)', type: 'status' },
    { key: 'referenceCheck', label: 'Reference Check', type: 'status' },
    { key: 'bgCheck', label: 'BG Check', type: 'status' },
    { key: 'relievingLetter', label: 'Relieving Letter', type: 'status' },
    { key: 'addToPlum', label: 'Add to Plum', type: 'status' },
    { key: 'leavePolicy', label: 'Leave Policy Shared', type: 'status' },
    { key: 'welcomeMail', label: 'Welcome Mail Sent', type: 'status' },
    { key: 'onboardingCall', label: 'Onboarding Call Done', type: 'status' },
    { key: 'documentsLink', label: 'Documents Link', type: 'text' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl">
            {employee ? 'Edit Employee Record' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the on-site employee. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
        <ScrollArea className="h-full">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
                {/* Employee Details Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center"><User className="mr-2 h-5 w-5 text-primary"/> Employee Details</h3>
                    <div className="p-6 rounded-2xl bg-secondary/30 border">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                            <div><Label htmlFor="name">Name</Label><Input id="name" name="name" value={formData.name} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="client">Client</Label><Input id="client" name="client" value={formData.client} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="role">Role</Label><Input id="role" name="role" value={formData.role} onChange={handleInputChange} required /></div>
                            <div><Label htmlFor="poc">POC</Label><Input id="poc" name="poc" value={formData.poc} onChange={handleInputChange}/></div>
                            <div><Label htmlFor="recruiter">Recruiter</Label><Input id="recruiter" name="recruiter" value={formData.recruiter} onChange={handleInputChange}/></div>
                            <div><Label htmlFor="location">Location</Label><Input id="location" name="location" value={formData.location} onChange={handleInputChange}/></div>
                            <div><Label htmlFor="doj">Date of Joining</Label><Input id="doj" name="doj" type="date" value={formData.doj} onChange={handleInputChange}/></div>
                            <div><Label htmlFor="poEndDate">PO End Date</Label><Input id="poEndDate" name="poEndDate" type="date" value={formData.poEndDate} onChange={handleInputChange}/></div>
                            <div><Label htmlFor="ctc">Candidate CTC</Label><Input id="ctc" name="ctc" value={formData.ctc} onChange={handleInputChange}/></div>
                            <div><Label htmlFor="billingRate">Billing Rate (PO)</Label><Input id="billingRate" name="billingRate" value={formData.billingRate} onChange={handleInputChange}/></div>
                            <div><Label>Status</Label><Select name="status" value={formData.status} onValueChange={(v) => handleSelectChange('status', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Ended">Ended</SelectItem><SelectItem value="Pending">Pending</SelectItem></SelectContent></Select></div>
                            <div><Label>Stage</Label><Select name="stage" value={formData.stage} onValueChange={(v) => handleSelectChange('stage', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Joined">Joined</SelectItem><SelectItem value="In-Progress">In-Progress</SelectItem></SelectContent></Select></div>
                            <div className="lg:col-span-3"><Label>Experience Source</Label><Select name="experience" value={formData.experience} onValueChange={(v) => handleSelectChange('experience', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IN">IN</SelectItem><SelectItem value="OUT">OUT</SelectItem><SelectItem value="NA">NA</SelectItem></SelectContent></Select></div>
                            <div className="lg:col-span-3 flex items-center space-x-6 pt-2">
                                <div className="flex items-center space-x-2"><Checkbox id="optForPF" checked={formData.optForPF} onCheckedChange={(c) => handleCheckboxChange('optForPF', c as boolean)} /><Label htmlFor="optForPF">Opt for PF?</Label></div>
                                <div className="flex items-center space-x-2"><Checkbox id="optForHealth" checked={formData.optForHealth} onCheckedChange={(c) => handleCheckboxChange('optForHealth', c as boolean)} /><Label htmlFor="optForHealth">Opt for Health Insurance?</Label></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Onboarding Tracker Section */}
                <div className="space-y-4">
                     <h3 className="text-lg font-semibold flex items-center"><FileText className="mr-2 h-5 w-5 text-primary"/> Onboarding Tracker</h3>
                     <div className="p-6 rounded-2xl bg-secondary/30 border">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {onboardingFields.map(field => (
                                <div key={field.key}>
                                    {field.type === 'status' ? (
                                        <div className="space-y-2">
                                            <Label className="font-medium text-foreground">{field.label}</Label>
                                            <Select
                                                value={formData.onboarding[field.key as keyof Omit<OnboardingTracker, 'documentsLink'>]}
                                                onValueChange={(v) => handleOnboardingChange(field.key, v)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "font-semibold",
                                                    formData.onboarding[field.key as keyof Omit<OnboardingTracker, 'documentsLink'>] === 'Done' && 'bg-green-100/80 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-300',
                                                    formData.onboarding[field.key as keyof Omit<OnboardingTracker, 'documentsLink'>] === 'Pending' && 'bg-red-100/80 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300',
                                                    formData.onboarding[field.key as keyof Omit<OnboardingTracker, 'documentsLink'>] === 'In-Progress' && 'bg-yellow-100/80 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-300',
                                                    formData.onboarding[field.key as keyof Omit<OnboardingTracker, 'documentsLink'>] === 'NA' && 'bg-slate-100/80 border-slate-200 text-slate-800 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300',
                                                )}>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Object.entries(statusConfig).map(([status, { icon: Icon, color, label }]) => (
                                                        <SelectItem key={status} value={status}>
                                                            <div className="flex items-center gap-2">
                                                                <Icon className={cn("h-4 w-4", color)} />
                                                                <span>{label}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    ) : (
                                         <div><Label htmlFor={field.key} className="font-medium text-foreground">{field.label}</Label><Input id={field.key} name={field.key} value={formData.onboarding[field.key]} onChange={(e) => handleOnboardingChange(field.key, e.target.value)} /></div>
                                    )}
                                </div>
                            ))}
                        </div>
                     </div>
                </div>

                <DialogFooter className="p-4 mt-6 -mx-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-t">
                    {error && <p className="text-sm text-destructive mr-auto">{error}</p>}
                    <Button type="button" variant="outline" onClick={() => handleClose(false)}>
                    Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {employee ? 'Save Changes' : 'Create Employee'}
                    </Button>
                </DialogFooter>
            </form>
        </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
