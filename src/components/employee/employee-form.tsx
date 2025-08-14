
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Loader2,
  User,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  CircleDot,
} from 'lucide-react';
import { addEmployee, updateEmployee } from '@/services/employeeService';
import type { Employee, OnboardingStep } from '@/types/employee';
import { cn } from '@/lib/utils';

interface EmployeeFormProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

const onboardingTemplate: Omit<OnboardingStep, 'status'>[] = [
    { id: 'offerLetter', header: 'Offer Letter', description: 'Generate and send the official offer letter to the candidate.' },
    { id: 'resignationEmail', header: 'Resignation Email', description: 'Confirm receipt of the candidate\'s resignation email from their previous employer.' },
    { id: 'aadharCard', header: 'Aadhar Card', description: 'Collect a copy of the candidate\'s Aadhar card for verification.' },
    { id: 'panCard', header: 'PAN Card', description: 'Collect a copy of the candidate\'s PAN card for tax purposes.' },
    { id: 'payslips', header: 'Payslips (6 months)', description: 'Collect the last 6 months of payslips from the previous employer.' },
    { id: 'educationDocs', header: 'Education Documents', description: 'Collect all relevant educational certificates and mark sheets.' },
    { id: 'offerLetters', header: 'Previous Offer Letters', description: 'Collect offer letters from previous employments.' },
    { id: 'relievingDocs', header: 'Relieving Documents', description: 'Collect relieving letters from all previous employers.' },
    { id: 'experienceDocs', header: 'Experience Documents', description: 'Collect all experience certificates from previous employers.' },
    { id: 'bgv', header: 'Background Verification (BGV)', description: 'Initiate and track the background verification process.' },
    { id: 'callRefCheck', header: 'Call Reference Check', description: 'Conduct a telephonic reference check with previous managers.' },
    { id: 'addToPlum', header: 'Add to Plum', description: 'Add the new employee to the Plum health insurance portal.' },
    { id: 'welcomeMail', header: 'Welcome Mail', description: 'Send the official welcome email with Suitable AI credentials and first-day instructions.' },
    { id: 'companyDetailsMail', header: 'Company Details Mail', description: 'Send an email covering leave policy, Plum, payroll details, etc.' },
    { id: 'onboardingCall', header: 'Onboarding Call', description: 'Conduct the final onboarding call to welcome the employee to the team.' },
];

const getInitialOnboardingSteps = (): OnboardingStep[] => {
    return onboardingTemplate.map(step => ({
        ...step,
        status: 'Pending'
    }));
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
  city: '',
  state: '',
  recruiter: '',
  onboarding: {
    steps: getInitialOnboardingSteps(),
    documentsLink: '',
  },
};

const statusConfig = {
  Done: { icon: CheckCircle, color: 'text-green-500', label: 'Done' },
  Pending: { icon: XCircle, color: 'text-red-500', label: 'Pending' },
  'In-Progress': {
    icon: AlertCircle,
    color: 'text-yellow-500',
    label: 'In Progress',
  },
  NA: { icon: CircleDot, color: 'text-muted-foreground', label: 'N/A' },
};

export function EmployeeForm({
  isOpen,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormProps) {
  const [formData, setFormData] =
    useState<Omit<Employee, 'id'>>(initialEmployeeState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        const employeeCopy = JSON.parse(JSON.stringify(employee));
        // Merge saved steps with the template to ensure all steps are present
        const savedSteps = employeeCopy.onboarding?.steps || [];
        const mergedSteps = getInitialOnboardingSteps().map(templateStep => {
            const savedStep = savedSteps.find((s: OnboardingStep) => s.id === templateStep.id);
            return savedStep ? { ...templateStep, status: savedStep.status } : templateStep;
        });

        setFormData({
          ...initialEmployeeState,
          ...employeeCopy,
          onboarding: {
            steps: mergedSteps,
            documentsLink: employeeCopy.onboarding?.documentsLink || '',
          },
        });
      } else {
        setFormData({
          ...initialEmployeeState,
          onboarding: {
            steps: getInitialOnboardingSteps(),
            documentsLink: '',
          }
        });
      }
    }
  }, [isOpen, employee]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleDocLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        documentsLink: value,
      }
    }))
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOnboardingStatusChange = (stepId: string, newStatus: string) => {
    setFormData((prev) => ({
      ...prev,
      onboarding: {
        ...prev.onboarding,
        steps: prev.onboarding.steps.map((step) =>
          step.id === stepId ? { ...step, status: newStatus as any } : step
        ),
      },
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="text-2xl">
            {employee ? 'Edit Employee Record' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the on-site employee. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Employee Details Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <User className="mr-2 h-5 w-5 text-primary" /> Employee
                  Details
                </h3>
                <div className="p-6 rounded-2xl bg-secondary/30 border">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        name="client"
                        value={formData.client}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Input
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="poc">POC</Label>
                      <Input
                        id="poc"
                        name="poc"
                        value={formData.poc}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="recruiter">Recruiter</Label>
                      <Input
                        id="recruiter"
                        name="recruiter"
                        value={formData.recruiter}
                        onChange={handleInputChange}
                      />
                    </div>
                     <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        name="status"
                        value={formData.status}
                        onValueChange={(v) => handleSelectChange('status', v)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Ended">Ended</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                     <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="doj">Date of Joining</Label>
                      <Input
                        id="doj"
                        name="doj"
                        type="date"
                        value={formData.doj}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="poEndDate">PO End Date</Label>
                      <Input
                        id="poEndDate"
                        name="poEndDate"
                        type="date"
                        value={formData.poEndDate}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="ctc">Candidate CTC</Label>
                      <Input
                        id="ctc"
                        name="ctc"
                        value={formData.ctc}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingRate">Billing Rate (PO)</Label>
                      <Input
                        id="billingRate"
                        name="billingRate"
                        value={formData.billingRate}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Onboarding Tracker Section */}
              <div className="space-y-4 pt-4">
                <h3 className="text-xl font-semibold flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" /> Onboarding
                  Timeline
                </h3>
                <div className="space-y-6 relative pl-5">
                   {/* Timeline vertical line */}
                   <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-border -z-10"></div>
                   
                   {formData.onboarding.steps.map((step, index) => {
                       const stepStatus = step.status || 'Pending';
                       const config = statusConfig[stepStatus];
                       const Icon = config.icon;
                       return (
                           <div key={step.id} className="relative flex items-start gap-5">
                                <div className={cn("mt-1 flex h-10 w-10 items-center justify-center rounded-full z-10", 
                                    stepStatus === 'Done' && 'bg-green-100',
                                    stepStatus === 'Pending' && 'bg-red-100',
                                    stepStatus === 'In-Progress' && 'bg-yellow-100',
                                    stepStatus === 'NA' && 'bg-slate-100',
                                )}>
                                    <Icon className={cn("h-5 w-5", config.color)} />
                                </div>
                               <div className="flex-1 p-4 rounded-2xl bg-secondary/30 border">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                        <div className="flex-1 mb-2 sm:mb-0">
                                            <h4 className="font-semibold text-foreground">{step.header}</h4>
                                            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                                        </div>
                                        <div className="w-full sm:w-48">
                                            <Select
                                                value={stepStatus}
                                                onValueChange={(v) => handleOnboardingStatusChange(step.id, v)}
                                            >
                                                <SelectTrigger className={cn(
                                                    "font-semibold",
                                                    stepStatus === 'Done' && 'bg-green-100/80 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-800 dark:text-green-300',
                                                    stepStatus === 'Pending' && 'bg-red-100/80 border-red-200 text-red-800 dark:bg-red-900/50 dark:border-red-800 dark:text-red-300',
                                                    stepStatus === 'In-Progress' && 'bg-yellow-100/80 border-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:border-yellow-800 dark:text-yellow-300',
                                                    stepStatus === 'NA' && 'bg-slate-100/80 border-slate-200 text-slate-800 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-300',
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
                                    </div>
                               </div>
                           </div>
                       )
                   })}
                </div>
                <div className="pt-4">
                  <Label htmlFor="documentsLink">Documents Link</Label>
                  <Input id="documentsLink" name="documentsLink" value={formData.onboarding.documentsLink} onChange={handleDocLinkChange}/>
                </div>
              </div>

              <DialogFooter className="p-4 mt-6 -mx-6 sticky bottom-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 border-t">
                {error && (
                  <p className="text-sm text-destructive mr-auto">{error}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleClose(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
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
