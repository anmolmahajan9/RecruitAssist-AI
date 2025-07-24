import { firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs a query to Firestore.
 * @param flowName The name of the AI flow being executed.
 * @param input The input object for the flow.
 */
export async function logQuery(flowName: string, input: any): Promise<void> {
  try {
    await addDoc(collection(firestore, 'queries'), {
      flowName,
      input,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error writing document to Firestore: ', error);
    // Depending on the use case, you might want to handle this error
    // more gracefully, but for now, we'll just log it.
  }
}
