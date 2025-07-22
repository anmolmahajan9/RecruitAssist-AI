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
  prompt: `You are a recruitment consultant writing a professional HTML email to a client for candidate submission.

You will be given a block of unstructured text that contains a candidate table, and may also contain the client's name and the job title.

Your task is to identify the candidate table from the unstructured text and construct a full HTML email body around it.

**Instructions for Output:**

1.  The entire output must be a single HTML string in the 'emailBody' field.
2.  Identify the client's name and job title from the text. If not present, use generic placeholders like "[Client Name]" and "[Role Name]".
3.  Wrap all sentences and paragraphs in <p> tags to preserve line breaks.
4.  Convert the candidate table from the input text into a proper HTML table (i.e., use <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags). Ensure the table has a border (e.g., style="border: 1px solid black; border-collapse: collapse;") and cells have padding and a border (e.g., style="border: 1px solid black; padding: 8px;").
5.  Start with a greeting (e.g., "<p>Hi [Client Name],</p>").
6.  Add a professional opening line (e.g., "<p>Hope you’re doing well.</p>").
7.  State the purpose: submitting candidates for the role (e.g., "<p>Please find below the candidate details for the [Role Name] position for your review.</p>").
8.  Insert the formatted HTML table.
9.  After the table, write a short closing line (e.g., "<p>Looking forward to your feedback.</p>").
10. Maintain a polite and business-friendly tone.

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
