
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import type { Timesheet } from '@/types/employee';

const timesheetsCollection = collection(firestore, 'timesheets');

/**
 * Fetches all timesheet entries for a given month.
 * @param month - The month in YYYY-MM format.
 * @returns An array of Timesheet objects.
 */
export async function getTimesheetsForMonth(month: string): Promise<Timesheet[]> {
  const q = query(timesheetsCollection, where('month', '==', month));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
      const data = doc.data();
      return { id: doc.id, ...data } as Timesheet;
  });
}

/**
 * Creates or updates a timesheet entry. It identifies an entry by a composite
 * key of employeeId and month.
 * @param data - The partial timesheet data. Must include employeeId and month.
 * @returns The updated or created Timesheet document.
 */
export async function upsertTimesheet(data: Partial<Timesheet>): Promise<Timesheet> {
    if (!data.employeeId || !data.month) {
        throw new Error("employeeId and month are required to upsert a timesheet.");
    }

    const q = query(timesheetsCollection, 
        where('employeeId', '==', data.employeeId), 
        where('month', '==', data.month)
    );
    
    const snapshot = await getDocs(q);
    
    let docRef;
    let existingData: Partial<Timesheet> = {};

    if (snapshot.empty) {
        // Create new document reference
        docRef = doc(timesheetsCollection);
    } else {
        // Get reference to existing document
        docRef = snapshot.docs[0].ref;
        existingData = snapshot.docs[0].data();
    }

    const dataToSet = {
        ...existingData,
        ...data,
        updatedAt: data.updatedAt, // Pass the client-side date object
    };
    
    // serverTimestamp() is not needed here as we are passing the date from the client
    await setDoc(docRef, dataToSet, { merge: true });

    return {
        id: docRef.id,
        ...dataToSet,
        // The `updatedAt` field is already a Date object passed from the client
    } as Timesheet;
}
