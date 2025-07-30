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
import { logQuery } from '@/services/loggingService';

export async function draftEmail(
  input: EmailDrafterInput
): Promise<EmailDrafterOutput> {
  await logQuery('emailDrafterFlow', { input });
  return emailDrafterFlow(input);
}

const emailDrafterPrompt = ai.definePrompt({
  name: 'emailDrafterPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: EmailDrafterInputSchema },
  output: { schema: EmailDrafterOutputSchema },
  prompt: `## Role and Objective
You are a recruitment consultant writing a professional HTML email to a client for candidate submission.

## Inputs

- **Client POC Name:** {{{clientPocName}}}
- **Job Role:** {{{jobRole}}}
- **Candidate Details Table:** This is the core data, often in a markdown table format.
{{{candidateDetails}}}
- **Required Columns (Optional):** This is an ordered list of columns required in the final candidate table. This order MUST be maintained.
{{{requiredColumns}}}
- **Additional Instructions (Optional):**
{{{instructions}}}

## Task
1. Construct a full HTML email body using the provided inputs.
2. The final candidate table in the email MUST be constructed as per the 'Required Columns' input if it is provided. If 'Required Columns' is empty, use the columns from the 'Candidate Details Table' as-is. Maintain the specified order strictly.
3. Incorporate any 'Additional Instructions' into the email body logically.

## **Instructions for Output:**

1.  The entire output must be a single HTML string in the 'emailBody' field.
2.  **Wrap the entire email body in a single \`<div>\` with inline CSS to set the font to Arial, size 10pt (e.g., \`<div style="font-family: Arial, sans-serif; font-size: 10pt;">...\`**
3.  Use the provided 'Client POC Name' and 'Job Role'. If they seem like placeholders in the input, use generic placeholders like "[Client Name]" or "[Role Name]" in the output and highlight them with a yellow background.
4.  Wrap all sentences and paragraphs in <p> tags to preserve line breaks. Use one line space between most lines.
5.  Convert the candidate table from the 'Candidate Details' input into a proper HTML table.
6.  To ensure the table works in Microsoft Outlook, use the following structure and styles:
    -   **Table Tag:** Use \`<table border="1" cellspacing="0" cellpadding="8" style="border-collapse: collapse; border: 1px solid black;">\`
    -   **Header Cells (th):** Use \`<th style="border: 1px solid black; padding: 8px; background-color: #88d7e2; white-space: nowrap;">\`
    -   **Data Cells (td):** Use \`<td style="border: 1px solid black; padding: 8px; white-space: normal; word-break: keep-all;">\`
    -   Ensure all candidate details in the table are reproduced verbatim as is in the required columns, no candidate detail should be changed.
7.  Start with a greeting (e.g., "<p>Hi {{{clientPocName}}},</p>").
8.  Add a professional opening line (e.g., "<p>Hope you’re doing well.</p>").
9.  State the purpose: submitting candidates for the role (e.g., "<p>Please find below the candidate details for the {{{jobRole}}} position for your review.</p>").
10. Insert the formatted HTML table.
11. After the table, write a short closing line (e.g., "<p>Looking forward to your feedback.</p>").
12. Maintain a polite and business-friendly tone.
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
