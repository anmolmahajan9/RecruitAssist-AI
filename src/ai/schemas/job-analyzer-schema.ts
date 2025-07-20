/**
 * @fileOverview Defines the data schemas for the job analyzer AI flow.
 *
 * - JobAnalysisInputSchema - The Zod schema for the input to the flow.
 * - JobAnalysisInput - The TypeScript type for the flow's input.
 * - JobAnalysisOutputSchema - The Zod schema for the output of the flow.
 * - JobAnalysisOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema
export const JobAnalysisInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z
    .string()
    .describe('The full job description or user understanding of the role.'),
});
export type JobAnalysisInput = z.infer<typeof JobAnalysisInputSchema>;

// Output Schema
export const JobAnalysisOutputSchema = z.object({
  JobRoleExplained: z.object({
    Easy: z.string().describe('Explanation for a 5-year-old.'),
    Intermediate: z.string().describe('Explanation for a college student.'),
    Recruiter: z.string().describe('Explanation for another recruiter.'),
  }),
  TechnicalTermsAndJargon: z.object({
    SpecificToRole: z.array(
      z.object({
        term: z.string().describe('Technical term specific to the role.'),
        definition: z.string().describe('Definition of the term.'),
      })
    ),
    GeneralTerms: z.array(
      z.object({
        term: z.string().describe('General technical term.'),
        definition: z.string().describe('Definition of the term.'),
      })
    ),
  }),
  Tasks: z.object({
    SpecificTasks: z.array(z.string()).describe('Specific tasks for the role.'),
    GeneralTasks: z
      .array(z.string())
      .describe('General tasks applicable to similar roles.'),
  }),
  BooleanQuery: z
    .string()
    .describe('A Boolean search query optimized for Naukri.com.'),
});
export type JobAnalysisOutput = z.infer<typeof JobAnalysisOutputSchema>;
