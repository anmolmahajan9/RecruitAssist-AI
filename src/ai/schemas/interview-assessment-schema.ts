/**
 * @fileOverview Defines the data schemas for the interview assessment AI flow.
 *
 * - InterviewAssessmentInputSchema - The Zod schema for the input to the flow.
 * - InterviewAssessmentInput - The TypeScript type for the flow's input.
 * - InterviewAssessmentOutputSchema - The Zod schema for the output of the flow.
 * - InterviewAssessmentOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema
export const InterviewAssessmentInputSchema = z.object({
  callAssessmentText: z
    .string()
    .describe('The full text of the call assessment, including scores and notes.'),
});
export type InterviewAssessmentInput = z.infer<typeof InterviewAssessmentInputSchema>;

const AssessmentCriterionSchema = z.object({
  criteria: z.string().describe('The restructured name of the criterion being assessed (e.g., "Technical Skills" instead of "must have technical skills").'),
  assessment: z.string().describe("The restructured, positive-only assessment for the criterion."),
  score: z.number().describe("The numerical score for the criterion as found in the text.")
});

// Output Schema
export const InterviewAssessmentOutputSchema = z.object({
  candidate_name: z.string().describe("The full name of the candidate."),
  interviewed_role: z.string().describe("The job role the candidate interviewed for."),
  interview_datetime: z.string().describe("The date and time of the interview in 'DD MMM, YYYY HH:MM' format."),
  call_recording_link: z.string().describe("The URL to the call recording."),
  assessment_criteria: z.array(AssessmentCriterionSchema).describe("An array of assessment criteria, scores, and restructured positive feedback."),
  interview_summary: z.string().describe("A comprehensive summary of the candidate's performance, rephrased to be positive and without mentioning CTC or notice period."),
  overall_status: z.enum(['Pass', 'Fail']).describe("The final interview outcome."),
});
export type InterviewAssessmentOutput = z.infer<typeof InterviewAssessmentOutputSchema>;
