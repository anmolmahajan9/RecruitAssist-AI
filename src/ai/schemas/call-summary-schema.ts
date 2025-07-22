/**
 * @fileOverview Defines the data schemas for the call summary AI flow.
 *
 * - CallSummaryInputSchema - The Zod schema for the input to the flow.
 * - CallSummaryInput - The TypeScript type for the flow's input.
 * - CallSummaryOutputSchema - The Zod schema for the output of the flow.
 * - CallSummaryOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema
export const CallSummaryInputSchema = z.object({
  callAssessmentText: z
    .string()
    .describe('The full text of the call assessment.'),
});
export type CallSummaryInput = z.infer<typeof CallSummaryInputSchema>;

// Output Schema
export const CallSummaryOutputSchema = z.object({
  detailedAssessment: z
    .string()
    .describe(
      'The assessment for each criterion in a highly readable format using numbering and bullets.'
    ),
  summary: z
    .string()
    .describe('The overall summary of the assessment without any negative points.'),
});
export type CallSummaryOutput = z.infer<typeof CallSummaryOutputSchema>;
