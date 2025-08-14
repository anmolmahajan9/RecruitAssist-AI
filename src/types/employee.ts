export type OnboardingStatus = 'Done' | 'Pending' | 'In-Progress' | 'NA';

export interface OnboardingTracker {
  offerLetter: OnboardingStatus;
  resignationEmail: OnboardingStatus;
  aadharCard: OnboardingStatus;
  panCard: OnboardingStatus;
  payslips: OnboardingStatus;
  referenceCheck: OnboardingStatus;
  bgCheck: OnboardingStatus;
  relievingLetter: OnboardingStatus;
  addToPlum: OnboardingStatus;
  documentsLink: string;
  leavePolicy: OnboardingStatus;
  welcomeMail: OnboardingStatus;
  onboardingCall: OnboardingStatus;
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
  location: string;
  recruiter: string;
  stage: 'Joined' | 'In-Progress';
  experience: 'IN' | 'OUT' | 'NA';
  optForPF: boolean;
  optForHealth: boolean;
  onboarding: OnboardingTracker;
  createdAt?: any;
}
