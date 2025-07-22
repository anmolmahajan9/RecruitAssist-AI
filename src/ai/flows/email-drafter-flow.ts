'use server';
/**
 * @fileOverview An AI agent for drafting candidate submission emails.
 *
 * - draftEmail - A function that handles the email drafting process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  EmailDrafterInputSchema,
  type EmailDrafterInput,
  EmailDrafterOutputSchema,
  type EmailDrafterOutput,
} from '@/ai/schemas/email-drafter-schema';

export async function draftEmail(
  input: EmailDrafterInput
): Promise<EmailDrafterOutput> {
  return emailDrafterFlow(input);
}

const emailDrafterPrompt = ai.definePrompt({
  name: 'emailDrafterPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: EmailDrafterInputSchema },
  output: { schema: EmailDrafterOutputSchema },
  prompt: `You are a recruitment consultant writing a professional email to a client for candidate submission.

You will be given a block of unstructured text that contains a candidate table, and may also contain the client's name and the job title.

Your task is to identify the candidate table and construct a full email body around it. Use the candidate table **as-is** — do **not** reformat, reword, or alter it in any way. You should only generate the introductory and closing text.

**Instructions for Output:**

1.  Identify the client's name and job title from the text if they are present. If not, use generic placeholders like "[Client Name]" and "[Role Name]".
2.  Start with a greeting (e.g., "Hi [Client Name],").
3.  Add a brief, professional opening line (e.g., “Hope you’re doing well.”).
4.  State the purpose: submitting a candidate or multiple candidates for the identified role.
5.  Say “Please find below the candidate details for your review.”
6.  Insert the original, unaltered candidate table.
7.  After the table, write a short closing line (e.g., “Let us know a convenient time to schedule interviews.” or “Looking forward to your feedback.”).
8.  Maintain a polite and business-friendly tone.
9.  The final output should be a single string in the 'emailBody' field, containing the complete email.

**Unstructured Input:**
{{{unstructuredText}}}
`,
});

const emailDrafterFlow = ai.defineFlow(
  {
    name: 'emailDrafterFlow',
    inputSchema: EmailDrafterInputSchema,
    outputSchema: EmailDrafterOutputSchema,
  },
  async (input) => {
    const { output } = await emailDrafterPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
