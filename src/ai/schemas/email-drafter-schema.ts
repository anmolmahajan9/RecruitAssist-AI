/**
 * @fileOverview Defines the data schemas for the email drafter AI flow.
 *
 * - EmailDrafterInputSchema - The Zod schema for the input to the flow.
 * - EmailDrafterInput - The TypeScript type for the flow's input.
 * - EmailDrafterOutputSchema - The Zod schema for the output of the flow.
 * - EmailDrafterOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema
export const EmailDrafterInputSchema = z.object({
  unstructuredText: z
    .string()
    .describe(
      'The unstructured text containing the candidate table, and optionally the client name and role name.'
    ),
});
export type EmailDrafterInput = z.infer<typeof EmailDrafterInputSchema>;

// Output Schema
export const EmailDrafterOutputSchema = z.object({
  emailBody: z.string().describe('The full generated email body.'),
});
export type EmailDrafterOutput = z.infer<typeof EmailDrafterOutputSchema>;
