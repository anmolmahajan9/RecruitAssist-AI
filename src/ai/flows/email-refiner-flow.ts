'use server';
/**
 * @fileOverview An AI agent for refining previously drafted emails.
 *
 * - refineEmail - A function that handles the email refinement process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  EmailRefinerInputSchema,
  type EmailRefinerInput,
  EmailDrafterOutputSchema, // Output is the same as the drafter
  type EmailDrafterOutput,
} from '@/ai/schemas/email-refiner-schema';
import { logQuery } from '@/services/loggingService';

export async function refineEmail(
  input: EmailRefinerInput
): Promise<EmailDrafterOutput> {
  await logQuery('emailRefinerFlow', input);
  return emailRefinerFlow(input);
}

const emailRefinerPrompt = ai.definePrompt({
  name: 'emailRefinerPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: EmailRefinerInputSchema },
  output: { schema: EmailDrafterOutputSchema },
  prompt: `## Role and Objective
You are an expert editor for a recruitment consultant. Your task is to revise a previously generated HTML email based on new instructions. You must maintain the specified HTML structure and styling.

## Context

### Original User Input
This was the original, unstructured text provided by the user to generate the first draft.
\`\`\`
{{{originalInput.unstructuredText}}}
\`\`\`

### Required Columns (from original request)
{{{originalInput.requiredColumns}}}

### Previous HTML Email
This is the HTML email you need to edit.
\`\`\`html
{{{previousEmailBody}}}
\`\`\`

## Task
Modify the "Previous HTML Email" based on the "New Instructions" below.

### New Instructions
\`\`\`
{{{newInstructions}}}
\`\`\`

## Important Rules
1.  **Preserve HTML Structure:** Your entire output must be a single HTML string in the 'emailBody' field. Adhere strictly to the original HTML structure (e.g., \`<div style="font-family: Arial, sans-serif; font-size: 10pt;">\`, \`<table>\`, etc.).
2.  **Apply Changes:** Carefully apply the user's "New Instructions" to the content and structure of the email.
3.  **Maintain Styling:** Ensure the final HTML has the correct inline styles for the main div, table, cells, and headers as specified in the original email creation. Table headers (\`<th>\`) must have a light blue background (\`#88d7e2\`).
4.  **Reproduce Data Verbatim:** Do not alter candidate data in the table unless explicitly told to do so by the new instructions.
`,
});

const emailRefinerFlow = ai.defineFlow(
  {
    name: 'emailRefinerFlow',
    inputSchema: EmailRefinerInputSchema,
    outputSchema: EmailDrafterOutputSchema,
  },
  async (input) => {
    const { output } = await emailRefinerPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output during refinement.'
      );
    }
    return output;
  }
);
