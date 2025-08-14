
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import type { Employee, OnboardingStep } from '@/types/employee';

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

const employees_old: Omit<Employee, 'id'>[] = [
  {
    poc: 'Aakriti',
    client: 'Spiro',
    name: 'Rohit Mande',
    status: 'Active',
    role: 'Independent Contractor',
    doj: '2024-11-01',
    poEndDate: '2025-07-31',
    ctc: '225,000',
    billingRate: '@INR7500 per hour',
    city: 'Pune',
    state: 'Maharashtra',
    recruiter: '-',
    onboarding: {
      steps: getInitialOnboardingSteps().map(s => ({...s, status: s.id === 'offerLetter' ? 'Done' : 'NA' })),
      documentsLink: 'NA',
    },
  },
  // Add other employees here, converting their old onboarding to the new structure
];

export async function seedDatabase() {
  const employeesCollectionRef = collection(firestore, 'employees');

  // Check if the collection is already populated to prevent re-seeding
  const snapshot = await getDocs(employeesCollectionRef);
  if (!snapshot.empty) {
    console.log('Database already seeded.');
    return {
      success: true,
      message: 'Database already contains data. No action taken.',
    };
  }

  // Use a batch write for efficiency
  const batch = writeBatch(firestore);
  employees_old.forEach((employee) => {
    const docRef = doc(employeesCollectionRef); // Automatically generate a new ID
    batch.set(docRef, { ...employee, createdAt: new Date() });
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully.');
    return {
      success: true,
      message: 'Database seeded successfully with initial employee data.',
    };
  } catch (error) {
    console.error('Error seeding database: ', error);
    return { success: false, message: `Error seeding database: ${error}` };
  }
}
