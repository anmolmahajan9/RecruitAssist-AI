/**
 * @fileOverview Defines the data schemas for the table preview AI flow.
 *
 * - TablePreviewInputSchema - The Zod schema for the input to the flow.
 * - TablePreviewInput - The TypeScript type for the flow's input.
 * - TablePreviewOutputSchema - The Zod schema for the output of the flow.
 * - TablePreviewOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema
export const TablePreviewInputSchema = z.object({
  requiredColumns: z
    .string()
    .describe('A comma-separated string of column headers.'),
});
export type TablePreviewInput = z.infer<typeof TablePreviewInputSchema>;

// Output Schema
export const TablePreviewOutputSchema = z.object({
  htmlTable: z.string().describe('The full generated HTML table header string.'),
});
export type TablePreviewOutput = z.infer<typeof TablePreviewOutputSchema>;
