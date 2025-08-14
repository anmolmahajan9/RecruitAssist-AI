
export type OnboardingStatus = 'Done' | 'Pending' | 'In-Progress' | 'NA';

export interface OnboardingStep {
  id: string;
  header: string;
  description: string;
  status: OnboardingStatus;
  updatedBy?: string;
  updatedAt?: any;
}

export const onboardingTemplate: Omit<
  OnboardingStep,
  'status' | 'updatedBy' | 'updatedAt'
>[] = [
  {
    id: 'resignationEmail',
    header: 'Resignation Email',
    description:
      "Confirm receipt of the candidate's resignation email from their previous employer.",
  },
  {
    id: 'aadharCard',
    header: 'Aadhar Card',
    description:
      "Collect a copy of the candidate's Aadhar card for verification.",
  },
  {
    id: 'panCard',
    header: 'PAN Card',
    description: "Collect a copy of the candidate's PAN card for tax purposes.",
  },
  {
    id: 'payslips',
    header: 'Payslips (6 months)',
    description:
      'Collect the last 6 months of payslips from the previous employer.',
  },
  {
    id: 'educationDocs',
    header: 'Education Documents',
    description:
      'Collect all relevant educational certificates and mark sheets.',
  },
  {
    id: 'experienceDocs',
    header: 'Experience Documents',
    description: 'Collect all experience certificates from previous employers.',
  },
  {
    id: 'offerLetter',
    header: 'Offer Letter',
    description:
      'Generate and send the official offer letter to the candidate.',
  },
  {
    id: 'relievingDocs',
    header: 'Relieving Documents',
    description: 'Collect relieving letters from all previous employers.',
  },
  {
    id: 'bgv',
    header: 'Background Verification (BGV)',
    description: 'Initiate and track the background verification process.',
  },
  {
    id: 'callRefCheck',
    header: 'Call Reference Check',
    description: 'Conduct a telephonic reference check with previous managers.',
  },
  {
    id: 'addToPlum',
    header: 'Add to Plum',
    description: 'Add the new employee to the Plum health insurance portal.',
  },
  {
    id: 'welcomeMail',
    header: 'Welcome Mail',
    description:
      'Send the official welcome email with Suitable AI credentials and first-day instructions.',
  },
  {
    id: 'companyDetailsMail',
    header: 'Company Details Mail',
    description:
      'Send an email covering leave policy, Plum, payroll details, etc.',
  },
  {
    id: 'onboardingCall',
    header: 'Onboarding Call',
    description:
      'Conduct the final onboarding call to welcome the employee to the team.',
  },
];

export interface OnboardingTracker {
  steps: OnboardingStep[];
  documentsLink: string; // Keep this for the general documents link if needed
}

export interface Employee {
  id?: string;
  poc: string;
  client: string;
  name: string;
  status: 'Active' | 'Ended' | 'Pending';
  role: string;
  doj: string;
  poEndDate: string;
  ctc: string;
  billingRate: string;
  city: string;
  state: string;
  recruiter: string;
  onboarding: OnboardingTracker;
  notes?: string;
  createdAt?: any;
}

export const initialClientNames = [
  'Spiro',
  'Vivance',
  'TASL',
  'Biotek Ortho',
  'Billdesk',
  'Marelli',
  'Aptean',
  'Schiebel',
  'Zomato',
  'Simon',
].sort();


export const timesheetStatuses = [
  'Pending',
  'Received',
  'Sent to Client',
  'Approved',
  'Not Applicable',
] as const;

export const invoiceStatuses = [
  'Not Due',
  'Due, Not Raised',
  'Sent to Client',
  'Paid',
  'Not Applicable',
] as const;

export type TimesheetStatus = (typeof timesheetStatuses)[number];
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export interface Timesheet {
  id?: string;
  employeeId: string;
  month: string; // YYYY-MM format
  timesheetStatus: TimesheetStatus;
  timesheetUpdatedAt?: any;
  timesheetUpdatedBy?: string;
  invoiceStatus: InvoiceStatus;
  invoiceUpdatedAt?: any;
  invoiceUpdatedBy?: string;
}
