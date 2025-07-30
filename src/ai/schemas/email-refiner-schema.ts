/**
 * @fileOverview Defines the data schemas for the email refiner AI flow.
 *
 * - EmailRefinerInputSchema - The Zod schema for the input to the flow.
 * - EmailRefinerInput - The TypeScript type for the flow's input.
 * - EmailDrafterOutputSchema - The Zod schema for the output (re-uses from drafter).
 * - EmailDrafterOutput - The TypeScript type for the output (re-uses from drafter).
 */

import { z } from 'zod';
import { EmailDrafterInputSchema, EmailDrafterOutputSchema } from './email-drafter-schema';
export { EmailDrafterOutputSchema, type EmailDrafterOutput } from './email-drafter-schema';


// Input Schema for the refinement flow
export const EmailRefinerInputSchema = z.object({
  originalInput: EmailDrafterInputSchema.describe("The original input that generated the first draft."),
  previousEmailBody: z
    .string()
    .describe('The full HTML body of the previously generated email.'),
  newInstructions: z
    .string()
    .describe('The new instructions from the user on what to change.'),
});
export type EmailRefinerInput = z.infer<typeof EmailRefinerInputSchema>;
