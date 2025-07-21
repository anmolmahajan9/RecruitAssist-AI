/**
 * @fileOverview Defines the data schemas for the candidate ranker AI flow.
 *
 * - CandidateRankerInputSchema - The Zod schema for the input to the flow.
 * - CandidateRankerInput - The TypeScript type for the flow's input.
 * - CandidateRankerOutputSchema - The Zod schema for the output of the flow.
 * - CandidateRankerOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema
export const CandidateRankerInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobRequirements: z.string().describe('The key requirements for the job.'),
  candidatesDetails: z
    .string()
    .describe('A string containing the details of candidates (e.g., copy-pasted resumes).'),
});
export type CandidateRankerInput = z.infer<typeof CandidateRankerInputSchema>;

// Output Schema
const RankedCandidateSchema = z.object({
  rank: z.number().describe('The numerical rank of the candidate.'),
  name: z.string().describe("The candidate's name."),
  score: z.number().describe('The match score (1-100) for the candidate.'),
  mustHaves: z
    .array(z.string())
    .describe(
      'An array of emojis (✅, 🟡, ❌) corresponding to each must-have requirement.'
    ),
});

export const CandidateRankerOutputSchema = z.object({
  rankedCandidates: z.array(RankedCandidateSchema),
});
export type CandidateRankerOutput = z.infer<
  typeof CandidateRankerOutputSchema
>;
