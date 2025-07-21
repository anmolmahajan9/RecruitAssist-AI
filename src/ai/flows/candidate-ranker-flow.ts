'use server';
/**
 * @fileOverview An AI agent for ranking candidates against a job description.
 *
 * - rankCandidates - A function that handles the candidate ranking process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  CandidateRankerInputSchema,
  type CandidateRankerInput,
  CandidateRankerOutputSchema,
  type CandidateRankerOutput,
} from '@/ai/schemas/candidate-ranker-schema';

export async function rankCandidates(
  input: CandidateRankerInput
): Promise<CandidateRankerOutput> {
  return candidateRankerFlow(input);
}

const candidateRankerPrompt = ai.definePrompt({
  name: 'candidateRankerPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: CandidateRankerInputSchema },
  output: { schema: CandidateRankerOutputSchema },
  prompt: `## Role and Objective

You are an expert technical recruiter. Your task is to rank a list of candidates one by one based on how well they fit a given job description. You need to assess ALL candidates even if the list is long. Assessment should be on each of the Must haves to be marked as Yes, Maybe or No.

## Job Title
{{{jobTitle}}}

## Job Requirements
{{{jobRequirements}}}

## Candidates
{{{candidatesDetails}}}

## Task

1.  Carefully review the Job Requirements.

2.  For each candidate in the provided text, evaluate their experience, skills, and qualifications against the job requirements.

3.  Provide a score for each candidate from 1 to 100, where 100 is a perfect match.

## Output Format
Return a JSON object containing a 'rankedCandidates' array. Each object in the array must include:
    - rank: The numerical rank.
    - name: The candidate's name.
    - score: The calculated score (1-100).
    - mustHaves: An array of emoji strings corresponding to each requirement from the input. Use "✅" for Yes, "🟡" for Maybe, and "❌" for No. The order of emojis must match the order of the job requirements provided.
    
Do not truncate, show ALL candidates.`,
});

const candidateRankerFlow = ai.defineFlow(
  {
    name: 'candidateRankerFlow',
    inputSchema: CandidateRankerInputSchema,
    outputSchema: CandidateRankerOutputSchema,
  },
  async (input) => {
    const { output } = await candidateRankerPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
