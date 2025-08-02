import { firestore } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Logs a query to Firestore.
 * @param flowName The name of the AI flow or action being executed.
 * @param data The data object to log.
 */
export async function logQuery(flowName: string, data: any): Promise<void> {
  const logToFirestore = addDoc(collection(firestore, 'queries'), {
    flowName,
    ...data,
    timestamp: serverTimestamp(),
  });

  const triggerN8nWebhook = async () => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log('N8N_WEBHOOK_URL not set, skipping webhook trigger.');
      return;
    }

    try {
      // Construct a new URL to safely add query parameters
      const url = new URL(webhookUrl);
      url.searchParams.append('flowName', flowName);

      // We'll serialize the data object to a JSON string to pass it as a single parameter
      // This is generally more robust than trying to flatten the object.
      const dataString = JSON.stringify(data);
      url.searchParams.append('data', dataString);
      
      // Use fetch to send a GET request. We don't need to process the response.
      await fetch(url.toString(), { method: 'GET' });

    } catch (error) {
      console.error('Error triggering n8n webhook: ', error);
      // We don't re-throw the error, as failing to trigger the webhook
      // should not block the main application flow.
    }
  };

  // Run both operations concurrently.
  // We'll log errors but won't let a webhook failure stop the firestore log.
  try {
    await Promise.all([
      logToFirestore,
      triggerN8nWebhook()
    ]);
  } catch (error) {
     console.error('Error during logging or webhook trigger: ', error);
  }
}
