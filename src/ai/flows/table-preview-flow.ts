'use server';
/**
 * @fileOverview An AI agent for generating an HTML table preview.
 *
 * - generateTablePreview - A function that handles the table generation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  TablePreviewInputSchema,
  type TablePreviewInput,
  TablePreviewOutputSchema,
  type TablePreviewOutput,
} from '@/ai/schemas/table-preview-schema';

export async function generateTablePreview(
  input: TablePreviewInput
): Promise<TablePreviewOutput> {
  return tablePreviewFlow(input);
}

const tablePreviewPrompt = ai.definePrompt({
  name: 'tablePreviewPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: TablePreviewInputSchema },
  output: { schema: TablePreviewOutputSchema },
  prompt: `## Role and Objective
You are an HTML generator. Your task is to create a simple HTML table header based on a given list of column names.

## Input
A comma-separated string of column headers.
\`\`\`
{{{requiredColumns}}}
\`\`\`

## Task
1.  Parse the comma-separated string into individual column headers.
2.  Generate an HTML table (\`<table>\`).
3.  The table should have a header row (\`<thead>\` with a \`<tr>\`).
4.  Each column header should be in a \`<th>\` tag inside the header row.
5.  **Style the table:**
    -   Table: \`<table style="border: 1px solid black; border-collapse: collapse; width: 100%;">\`
    -   Header Cells (th): \`<th style="border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;">\`
6.  The final output should be a single HTML string in the 'htmlTable' field. Do not include any other text or explanation.

## Example
If the input is "Name, Email, Phone", the output 'htmlTable' should be:
"<table style=\"border: 1px solid black; border-collapse: collapse; width: 100%;\"><thead><tr><th style=\"border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;\">Name</th><th style=\"border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;\">Email</th><th style=\"border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;\">Phone</th></tr></thead></table>"
`,
});

const tablePreviewFlow = ai.defineFlow(
  {
    name: 'tablePreviewFlow',
    inputSchema: TablePreviewInputSchema,
    outputSchema: TablePreviewOutputSchema,
  },
  async (input) => {
    const { output } = await tablePreviewPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
