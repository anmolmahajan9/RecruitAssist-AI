
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
} from 'firebase/firestore';
import type { Employee } from '@/types/employee';

const employeesCollection = collection(firestore, 'employees');

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
      // Firestore Timestamps are not serializable, so we exclude it or convert it.
      // Since we don't display it, we can just exclude it for now.
      const { createdAt, ...rest } = data;
      return { id: doc.id, ...rest } as Employee;
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
