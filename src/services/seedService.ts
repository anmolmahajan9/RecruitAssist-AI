
'use server';

import { firestore } from '@/lib/firebase';
import { collection, addDoc, getDocs, writeBatch } from 'firebase/firestore';
import type { Employee, OnboardingStatus } from '@/types/employee';

const employees: Omit<Employee, 'id'>[] = [
    {
        poc: 'Aakriti', client: 'Spiro', name: 'Rohit Mande', status: 'Active', role: 'Independent Contractor',
        doj: '2024-11-01', poEndDate: '2025-07-31', ctc: '225,000', billingRate: '@INR7500 per hour',
        location: 'Pune, Maharashtra', recruiter: '-', stage: 'Joined', experience: 'NA',
        optForPF: false, optForHealth: false,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'NA', aadharCard: 'NA', panCard: 'NA', payslips: 'NA',
            referenceCheck: 'NA', bgCheck: 'NA', relievingLetter: 'NA', addToPlum: 'NA', documentsLink: 'NA',
            leavePolicy: 'NA', welcomeMail: 'NA', onboardingCall: 'NA'
        }
    },
    {
        poc: 'Aakriti', client: 'Spiro', name: 'Sonali', status: 'Ended', role: 'Independent Contractor',
        doj: '2024-11-01', poEndDate: '2024-11-30', ctc: '', billingRate: '',
        location: '', recruiter: '-', stage: 'Joined', experience: 'NA',
        optForPF: false, optForHealth: false,
        onboarding: {
            offerLetter: 'NA', resignationEmail: 'NA', aadharCard: 'NA', panCard: 'NA', payslips: 'NA',
            referenceCheck: 'NA', bgCheck: 'NA', relievingLetter: 'NA', addToPlum: 'NA', documentsLink: '',
            leavePolicy: 'NA', welcomeMail: 'NA', onboardingCall: 'NA'
        }
    },
    {
        poc: 'Aakriti', client: 'Vivance', name: 'Alokeparna Chaudhary', status: 'Active', role: 'Lead QA/RA',
        doj: '2024-11-18', poEndDate: '2025-07-31', ctc: '183,333', billingRate: '@INR1370 per hour',
        location: 'Bangalore, Karnataka', recruiter: 'Nancy', stage: 'Joined', experience: 'IN',
        optForPF: true, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'NA',
            referenceCheck: 'NA', bgCheck: 'NA', relievingLetter: 'NA', addToPlum: 'NA', documentsLink: 'Yes',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Tata Advanced Systems Limited', name: 'Shivprasad Sanjay Shresthi', status: 'Active', role: 'Technical Publication Specialist',
        doj: '2025-07-20', poEndDate: '2025-07-20', ctc: '66,667', billingRate: 'INR 83,333 per month',
        location: 'Bangalore, Karnataka', recruiter: 'Neha', stage: 'Joined', experience: 'IN',
        optForPF: true, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'Done',
            referenceCheck: 'Done', bgCheck: 'Done', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: 'Shivprasad sanjay tasl.zip',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Marelli India Pvt. Ltd.', name: 'Monikandan SU', status: 'Active', role: 'Calibration Engineer',
        doj: '2025-03-03', poEndDate: '2025-09-18', ctc: '166,667', billingRate: '@INR1500 per hour (594 hours)',
        location: 'Gurugram, Haryana', recruiter: 'Shivani', stage: 'Joined', experience: 'IN',
        optForPF: true, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'Done',
            referenceCheck: 'Done', bgCheck: 'Done', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: 'Monikundan SU.zip',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Marelli India Pvt. Ltd.', name: 'Aditya Bhimavarapu', status: 'Active', role: 'Lead Calibration Engineer',
        doj: '2025-03-18', poEndDate: '2025-09-17', ctc: '333,333', billingRate: '@INR2400 per hour (1188 hours)',
        location: 'Gurugram, Haryana', recruiter: 'Shivani', stage: 'Joined', experience: 'OUT',
        optForPF: true, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'Done',
            referenceCheck: 'Pending', bgCheck: 'Pending', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: 'Aditya -Mareli',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Aptean', name: 'P Samuel Vasanth', status: 'Active', role: 'Redwood Implementation Consultant',
        doj: '2025-04-21', poEndDate: '2025-10-20', ctc: '1,850,000', billingRate: '@1137.5 per hour (160 hours per month)',
        location: 'Bangalore, Karnataka', recruiter: 'Neha', stage: 'Joined', experience: 'OUT',
        optForPF: false, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'Done',
            referenceCheck: 'Done', bgCheck: 'Done', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: 'vasnat documents.zip',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Marelli India Pvt. Ltd.', name: 'Chaitanya Chennamsety', status: 'Active', role: 'Propulsion System Validation Engineer',
        doj: '2025-05-02', poEndDate: '2025-10-20', ctc: '900,000', billingRate: '',
        location: 'Bangalore, Karnataka', recruiter: 'Shivani', stage: 'Joined', experience: 'IN',
        optForPF: true, optForHealth: false,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'Done',
            referenceCheck: 'Done', bgCheck: 'Done', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: 'Chaitnya.zip',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Aptean', name: 'Deepak', status: 'Active', role: 'HR Data Analyst',
        doj: '2025-05-15', poEndDate: '2025-12-01', ctc: '14,50,000', billingRate: '',
        location: '', recruiter: 'Pending', stage: 'Joined', experience: 'IN',
        optForPF: false, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Pending', aadharCard: 'Pending', panCard: 'Pending', payslips: 'Pending',
            referenceCheck: 'Pending', bgCheck: 'Pending', relievingLetter: 'Pending', addToPlum: 'Pending', documentsLink: 'Deepak',
            leavePolicy: 'Pending', welcomeMail: 'Yes', onboardingCall: 'Pending'
        }
    },
    {
        poc: 'Aakriti', client: 'Marelli India Pvt. Ltd.', name: 'Akshay Wagh', status: 'Active', role: 'Calibration Engineer',
        doj: '2025-06-09', poEndDate: '2025-12-30', ctc: '1,700,000', billingRate: '',
        location: 'Pune', recruiter: 'Shivani', stage: 'Joined', experience: 'IN',
        optForPF: false, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Pending', aadharCard: 'Pending', panCard: 'Pending', payslips: 'Pending',
            referenceCheck: 'Pending', bgCheck: 'Pending', relievingLetter: 'Pending', addToPlum: 'Pending', documentsLink: 'Akshay Documents.zip',
            leavePolicy: 'Pending', welcomeMail: 'Yes', onboardingCall: 'Pending'
        }
    },
    {
        poc: 'Aakriti', client: 'Marelli India Pvt. Ltd.', name: 'Ajay Kumar', status: 'Active', role: 'Calibration Engineer',
        doj: '2025-06-10', poEndDate: '2025-12-30', ctc: '900,000', billingRate: '',
        location: 'Pune', recruiter: 'Shivani', stage: 'Joined', experience: 'IN',
        optForPF: false, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Pending', aadharCard: 'Pending', panCard: 'Pending', payslips: 'Pending',
            referenceCheck: 'Pending', bgCheck: 'Pending', relievingLetter: 'Pending', addToPlum: 'Pending', documentsLink: 'Ajay Kumar_Documents (1).zip',
            leavePolicy: 'Pending', welcomeMail: 'Yes', onboardingCall: 'Pending'
        }
    },
    {
        poc: 'Aakriti', client: 'Marelli India Pvt. Ltd.', name: 'Pritam', status: 'Active', role: 'Calibration Engineer',
        doj: '2025-07-04', poEndDate: '', ctc: '', billingRate: '',
        location: 'Pune', recruiter: 'Shivani', stage: 'Joined', experience: 'IN',
        optForPF: false, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Pending', aadharCard: 'Pending', panCard: 'Pending', payslips: 'Pending',
            referenceCheck: 'Pending', bgCheck: 'Pending', relievingLetter: 'Pending', addToPlum: 'Pending', documentsLink: 'pritam.zip',
            leavePolicy: 'Pending', welcomeMail: 'Yes', onboardingCall: 'Pending'
        }
    },
    {
        poc: 'Aakriti', client: 'Simon', name: 'Prashant', status: 'Active', role: 'React Native',
        doj: '2025-07-02', poEndDate: '', ctc: '1,800,000', billingRate: 'INR 1250@ Per hour',
        location: 'Bangalore, Karnataka', recruiter: 'Riya', stage: 'Joined', experience: 'IN',
        optForPF: false, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Pending', aadharCard: 'Pending', panCard: 'Pending', payslips: 'Pending',
            referenceCheck: 'Pending', bgCheck: 'Pending', relievingLetter: 'Pending', addToPlum: 'Yes', documentsLink: '',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Simon', name: 'Raksha', status: 'Active', role: 'React Native',
        doj: '2025-07-21', poEndDate: '', ctc: '1,250,000', billingRate: 'INR 869@ Per hour',
        location: 'Bangalore, Karnataka', recruiter: 'Anushka', stage: 'Joined', experience: 'IN',
        optForPF: true, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Pending', aadharCard: 'Pending', panCard: 'Pending', payslips: 'Pending',
            referenceCheck: 'Done', bgCheck: 'Done', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: '',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    },
    {
        poc: 'Aakriti', client: 'Aptean', name: 'Krishna Priya', status: 'Active', role: 'Dot Net Developer',
        doj: '2025-08-11', poEndDate: '', ctc: '10,50,000', billingRate: '',
        location: 'Bangalore, Karnataka', recruiter: 'Shivani', stage: 'Joined', experience: 'IN',
        optForPF: true, optForHealth: true,
        onboarding: {
            offerLetter: 'Done', resignationEmail: 'Done', aadharCard: 'Done', panCard: 'Done', payslips: 'Done',
            referenceCheck: 'Done', bgCheck: 'Done', relievingLetter: 'Done', addToPlum: 'Done', documentsLink: '',
            leavePolicy: 'Yes', welcomeMail: 'Yes', onboardingCall: 'Yes'
        }
    }
];

export async function seedDatabase() {
  const employeesCollectionRef = collection(firestore, 'employees');

  // Check if the collection is already populated to prevent re-seeding
  const snapshot = await getDocs(employeesCollectionRef);
  if (!snapshot.empty) {
    console.log('Database already seeded.');
    return { success: true, message: 'Database already contains data. No action taken.' };
  }

  // Use a batch write for efficiency
  const batch = writeBatch(firestore);
  employees.forEach((employee) => {
    const docRef = doc(employeesCollectionRef); // Automatically generate a new ID
    batch.set(docRef, { ...employee, createdAt: new Date() });
  });

  try {
    await batch.commit();
    console.log('Database seeded successfully.');
    return { success: true, message: 'Database seeded successfully with initial employee data.' };
  } catch (error) {
    console.error('Error seeding database: ', error);
    return { success: false, message: `Error seeding database: ${error}` };
  }
}

    