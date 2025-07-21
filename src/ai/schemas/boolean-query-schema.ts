/**
 * @fileOverview Defines the data schemas for the boolean query AI flow.
 *
 * - BooleanQueryInputSchema - The Zod schema for the input to the flow.
 * - BooleanQueryInput - The TypeScript type for the flow's input.
 * - BooleanQueryOutputSchema - The Zod schema for the output of the flow.
 * - BooleanQueryOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema (can be shared or duplicated, here duplicated for clarity)
export const BooleanQueryInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z
    .string()
    .describe('The full job description or user understanding of the role.'),
});
export type BooleanQueryInput = z.infer<typeof BooleanQueryInputSchema>;

// Output Schema
export const BooleanQueryOutputSchema = z.object({
  booleanQuery: z
    .string()
    .describe('A Boolean search query optimized for Naukri.com.'),
});
export type BooleanQueryOutput = z.infer<typeof BooleanQueryOutputSchema>;
