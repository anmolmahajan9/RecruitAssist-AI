
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  getDocs,
  writeBatch,
  doc,
} from 'firebase/firestore';
import type { Employee, OnboardingStep } from '@/types/employee';
import { onboardingTemplate, initialClientNames } from '@/types/employee';


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

async function seedCollection(collectionName: string, data: any[], checkField?: string) {
    const collectionRef = collection(firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    if (!snapshot.empty) {
        console.log(`Collection ${collectionName} is already populated.`);
        return { success: true, message: `Collection ${collectionName} already contains data.` };
    }

    const batch = writeBatch(firestore);
    if (collectionName === 'clients') {
        data.forEach(name => {
            const docRef = doc(collectionRef);
            batch.set(docRef, { name });
        });
    } else {
        data.forEach(item => {
            const docRef = doc(collectionRef);
            batch.set(docRef, { ...item, createdAt: new Date() });
        });
    }

    await batch.commit();
    console.log(`Collection ${collectionName} seeded successfully.`);
    return { success: true, message: `Collection ${collectionName} seeded successfully.` };
}


export async function seedDatabase() {
  try {
    // Seed clients first
    await seedCollection('clients', initialClientNames);

    // Then seed employees
    await seedCollection('employees', employees_old);

    return { success: true, message: 'Database seeded successfully.' };
  } catch (error) {
     console.error('Error seeding database: ', error);
     return { success: false, message: `Error seeding database: ${error}` };
  }
}
