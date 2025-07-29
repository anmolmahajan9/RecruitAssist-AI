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
  assessmentText: z
    .string()
    .describe('The full text of the call assessment, including scores and notes.'),
});
export type InterviewAssessmentInput = z.infer<typeof InterviewAssessmentInputSchema>;

const SkillScoreSchema = z.object({
  skill: z.string().describe('The name of the skill being assessed (e.g., "Technical Skills").'),
  score: z.number().min(0).max(100).describe('The numerical score from 0 to 100.'),
  rating: z.string().describe('The qualitative rating (e.g., "Excellent", "Good", "Poor").'),
});

// Output Schema
export const InterviewAssessmentOutputSchema = z.object({
  candidateName: z.string().describe("The full name of the candidate."),
  role: z.string().describe("The job role the candidate interviewed for."),
  email: z.string().describe("The candidate's email address."),
  interviewDate: z.string().describe("The date and time of the interview in 'DD MMM, YYYY HH:MM' format."),
  overallStatus: z.enum(['Pass', 'Fail', 'Hold']).describe("The final interview outcome."),
  scores: z.array(SkillScoreSchema).describe("An array of scores for different skills."),
  summary: z.string().describe("A detailed summary of the candidate's performance, covering both strengths and weaknesses."),
});
export type InterviewAssessmentOutput = z.infer<typeof InterviewAssessmentOutputSchema>;
