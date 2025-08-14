
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  Timestamp
} from 'firebase/firestore';
import type { MonthlyTracker } from '@/types/employee';

const monthlyTrackerCollection = collection(firestore, 'monthly-tracker');

/**
 * Fetches all monthly tracker entries for a given month.
 * @param month - The month in YYYY-MM format.
 * @returns An array of MonthlyTracker objects.
 */
export async function getTrackerEntriesForMonth(month: string): Promise<MonthlyTracker[]> {
  const q = query(monthlyTrackerCollection, where('month', '==', month));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
      const data = doc.data();
      const serializableData: { [key: string]: any } = { ...data };
      for (const key in serializableData) {
        if (serializableData[key] instanceof Timestamp) {
          serializableData[key] = serializableData[key].toDate();
        }
      }
      return { id: doc.id, ...serializableData } as MonthlyTracker;
  });
}

/**
 * Creates or updates a monthly tracker entry. It identifies an entry by a composite
 * key of employeeId and month.
 * @param data - The partial tracker data. Must include employeeId and month.
 * @returns The updated or created MonthlyTracker document.
 */
export async function upsertTrackerEntry(data: Partial<MonthlyTracker>): Promise<MonthlyTracker> {
    if (!data.employeeId || !data.month) {
        throw new Error("employeeId and month are required to upsert a tracker entry.");
    }

    const q = query(monthlyTrackerCollection, 
        where('employeeId', '==', data.employeeId), 
        where('month', '==', data.month)
    );
    
    const snapshot = await getDocs(q);
    
    let docRef;
    let existingData: Partial<MonthlyTracker> = {};

    if (snapshot.empty) {
        docRef = doc(monthlyTrackerCollection);
    } else {
        docRef = snapshot.docs[0].ref;
        existingData = snapshot.docs[0].data();
    }
    
    const dataToSet = {
        ...existingData,
        ...data,
    };
    
    await setDoc(docRef, dataToSet, { merge: true });

    const finalData = {
        id: docRef.id,
        ...dataToSet
    } as MonthlyTracker;
    
    const serializableData: { [key: string]: any } = { ...finalData };
    for (const key in serializableData) {
      if (serializableData[key] instanceof Timestamp) {
        serializableData[key] = serializableData[key].toDate();
      }
    }

    return serializableData as MonthlyTracker;
}
