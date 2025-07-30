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
  clientPocName: z.string().describe('The name of the client contact person.'),
  jobRole: z.string().describe('The job title the candidates are being submitted for.'),
  candidateDetails: z
    .string()
    .describe(
      'The core candidate information, typically in a table or list format.'
    ),
  requiredColumns: z
    .string()
    .optional()
    .describe(
      'An optional string of comma-separated column headers for the output table.'
    ),
  instructions: z
    .string()
    .optional()
    .describe('Any additional instructions for drafting the email.'),
});
export type EmailDrafterInput = z.infer<typeof EmailDrafterInputSchema>;

// Output Schema
export const EmailDrafterOutputSchema = z.object({
  emailBody: z.string().describe('The full generated email body.'),
});
export type EmailDrafterOutput = z.infer<typeof EmailDrafterOutputSchema>;
