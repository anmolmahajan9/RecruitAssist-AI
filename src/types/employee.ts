
export type OnboardingStatus = 'Done' | 'Pending' | 'In-Progress' | 'NA';

export interface OnboardingStep {
  id: string;
  header: string;
  description: string;
  status: OnboardingStatus;
}

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
  createdAt?: any;
}
