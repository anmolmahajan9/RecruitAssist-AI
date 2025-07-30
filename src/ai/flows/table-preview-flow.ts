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
You are an intelligent text processor and HTML generator. Your task is to parse a string of column headers, clean it up, and then generate an HTML table header.

## Input
A string of column headers, which may be messy.
\`\`\`
{{{requiredColumns}}}
\`\`\`

## Task
1.  **Parse and Clean:** Read the input string and identify all the distinct column headers. Format them into a clean, single-line, comma-separated string.
2.  **Generate HTML Table:** Using the cleaned list of headers, generate an HTML table (\`<table>\`).
3.  **Style the table:**
    -   Table: \`<table style="border: 1px solid black; border-collapse: collapse; width: 100%;">\`
    -   Header Cells (th): \`<th style="border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;">\`
4.  **Final Output:** Your final output must be a JSON object containing two fields:
    -   \`formattedColumns\`: The cleaned, comma-separated string of column headers.
    -   \`htmlTable\`: The full HTML string for the table header. Do not include any other text or explanation in this field.

## Example
If the input is "Name, Email,  Phone Number", the output object should be:
{
  "formattedColumns": "Name, Email, Phone Number",
  "htmlTable": "<table style=\"border: 1px solid black; border-collapse: collapse; width: 100%;\"><thead><tr><th style=\"border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;\">Name</th><th style=\"border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;\">Email</th><th style=\"border: 1px solid black; padding: 8px; background-color: #88d7e2; color: black; text-align: left;\">Phone Number</th></tr></thead></table>"
}
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
