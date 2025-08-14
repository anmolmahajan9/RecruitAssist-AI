
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import type { Employee } from '@/types/employee';

const employeesCollection = collection(firestore, 'employees');

// Helper function to convert Timestamps to Dates
const convertTimestamps = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(convertTimestamps);
  }
  const newData: { [key: string]: any } = {};
  for (const key in data) {
    newData[key] = convertTimestamps(data[key]);
  }
  return newData;
};


export async function addEmployee(employee: Omit<Employee, 'id'>): Promise<string> {
  const docRef = await addDoc(employeesCollection, {
    ...employee,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getEmployees(): Promise<Employee[]> {
  const q = query(employeesCollection, orderBy('doj', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
      const data = doc.data();
      // Firestore Timestamps are not serializable, so we convert them.
      const serializableData = convertTimestamps(data);
      return { id: doc.id, ...serializableData } as Employee;
  });
}

export async function updateEmployee(id: string, employee: Partial<Employee>): Promise<void> {
  const employeeDoc = doc(firestore, 'employees', id);
  await updateDoc(employeeDoc, employee);
}

export async function deleteEmployee(id: string): Promise<void> {
  const employeeDoc = doc(firestore, 'employees', id);
  await deleteDoc(employeeDoc);
}
