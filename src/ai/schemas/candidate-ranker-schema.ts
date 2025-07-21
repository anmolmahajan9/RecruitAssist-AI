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
  candidatesJson: z
    .string()
    .describe('A JSON string containing an array of candidate objects.'),
});
export type CandidateRankerInput = z.infer<typeof CandidateRankerInputSchema>;

const MustHaveSchema = z.object({
  requirement: z.string().describe('The specific requirement being evaluated.'),
  status: z
    .enum(['Yes', 'No', 'Maybe'])
    .describe('The evaluation status for the requirement.'),
});

// Output Schema
const RankedCandidateSchema = z.object({
  rank: z.number().describe('The numerical rank of the candidate.'),
  name: z.string().describe("The candidate's name."),
  score: z.number().describe('The match score (1-100) for the candidate.'),
  rationale: z
    .string()
    .describe('A brief rationale for the assigned score and rank.'),
  details: z.any().describe('The original candidate details provided.'),
  mustHaves: z
    .array(MustHaveSchema)
    .describe(
      "An array evaluating the candidate against each 'must-have' requirement."
    ),
});

export const CandidateRankerOutputSchema = z.object({
  rankedCandidates: z.array(RankedCandidateSchema),
});
export type CandidateRankerOutput = z.infer<
  typeof CandidateRankerOutputSchema
>;
