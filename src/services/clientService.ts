
'use server';

import { firestore } from '@/lib/firebase';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import type { Client } from '@/types/client';

const clientsCollection = collection(firestore, 'clients');

export async function addClient(name: string): Promise<Client> {
  const docRef = await addDoc(clientsCollection, { name });
  return { id: docRef.id, name };
}

export async function getClients(): Promise<Client[]> {
  const q = query(clientsCollection, orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as { name: string }),
  }));
}

export async function updateClient(id: string, name: string): Promise<void> {
  const clientDoc = doc(firestore, 'clients', id);
  await updateDoc(clientDoc, { name });
}

export async function deleteClient(id: string): Promise<void> {
  const clientDoc = doc(firestore, 'clients', id);
  await deleteDoc(clientDoc);
}
