
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
import { Loader2 } from 'lucide-react';
import { addEmployee, updateEmployee } from '@/services/employeeService';
import type { Employee, OnboardingTracker, OnboardingStatus } from '@/types/employee';

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
    if (employee) {
      setFormData({
        ...initialEmployeeState,
        ...employee,
        onboarding: {
          ...initialOnboardingState,
          ...employee.onboarding,
        },
      });
    } else {
      setFormData(initialEmployeeState);
    }
  }, [employee]);

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
      if (employee) {
        await updateEmployee(employee.id!, formData);
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
        setFormData(initialEmployeeState);
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the on-site employee.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex-grow overflow-hidden">
          <ScrollArea className="h-full px-6">
            <div className="space-y-4 pt-2 pb-6">
                <h4 className="text-lg font-semibold text-primary border-b pb-2 mb-4">Employee Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                   <div><Label>Experience Source</Label><Select name="experience" value={formData.experience} onValueChange={(v) => handleSelectChange('experience', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="IN">IN</SelectItem><SelectItem value="OUT">OUT</SelectItem><SelectItem value="NA">NA</SelectItem></SelectContent></Select></div>
                </div>
                 <div className="flex items-center space-x-4 pt-4">
                    <div className="flex items-center space-x-2"><Checkbox id="optForPF" checked={formData.optForPF} onCheckedChange={(c) => handleCheckboxChange('optForPF', c as boolean)} /><Label htmlFor="optForPF">Opt for PF?</Label></div>
                    <div className="flex items-center space-x-2"><Checkbox id="optForHealth" checked={formData.optForHealth} onCheckedChange={(c) => handleCheckboxChange('optForHealth', c as boolean)} /><Label htmlFor="optForHealth">Opt for Health?</Label></div>
                </div>
                
                <h4 className="text-lg font-semibold text-primary border-b pb-2 pt-6 mb-4">Onboarding Tracker</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
                    {onboardingFields.map(field => (
                        <div key={field.key}>
                            <Label>{field.label}</Label>
                            {field.type === 'status' ? (
                                <RadioGroup
                                    value={formData.onboarding[field.key as keyof Omit<OnboardingTracker, 'documentsLink'>]}
                                    onValueChange={(v) => handleOnboardingChange(field.key, v)}
                                    className="flex items-center space-x-4 pt-2"
                                >
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Done" id={`${field.key}-done`}/><Label htmlFor={`${field.key}-done`}>Done</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="Pending" id={`${field.key}-pending`}/><Label htmlFor={`${field.key}-pending`}>Pending</Label></div>
                                    <div className="flex items-center space-x-2"><RadioGroupItem value="NA" id={`${field.key}-na`}/><Label htmlFor={`${field.key}-na`}>N/A</Label></div>
                                </RadioGroup>
                            ) : (
                                <Input name={field.key} value={formData.onboarding[field.key]} onChange={(e) => handleOnboardingChange(field.key, e.target.value)} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
          </ScrollArea>
           <DialogFooter className="p-6 pt-4 border-t">
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
      </DialogContent>
    </Dialog>
  );
}
