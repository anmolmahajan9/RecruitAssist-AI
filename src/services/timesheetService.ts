
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
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
      // Convert any Firestore Timestamps to JS Date objects to make them serializable
      const serializableData = { ...data };
      if (serializableData.timesheetUpdatedAt?.toDate) {
          serializableData.timesheetUpdatedAt = serializableData.timesheetUpdatedAt.toDate();
      }
      if (serializableData.invoiceUpdatedAt?.toDate) {
          serializableData.invoiceUpdatedAt = serializableData.invoiceUpdatedAt.toDate();
      }
      return { id: doc.id, ...serializableData } as Timesheet;
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
    
    // Merge new data with existing data
    const dataToSet = {
        ...existingData,
        ...data,
    };
    
    await setDoc(docRef, dataToSet, { merge: true });

    // Return the merged data, ensuring dates are correctly represented as serializable objects
    const finalData = {
        id: docRef.id,
        ...dataToSet
    } as Timesheet;
    
    if (finalData.timesheetUpdatedAt?.toDate) {
        finalData.timesheetUpdatedAt = finalData.timesheetUpdatedAt.toDate();
    }
     if (finalData.invoiceUpdatedAt?.toDate) {
        finalData.invoiceUpdatedAt = finalData.invoiceUpdatedAt.toDate();
    }

    return finalData;
}
