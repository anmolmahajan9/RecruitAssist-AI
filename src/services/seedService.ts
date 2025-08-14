
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import type { Employee, OnboardingStep } from '@/types/employee';
import { onboardingTemplate } from '@/types/employee';


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
