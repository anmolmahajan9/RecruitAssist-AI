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
  prompt: `
    ## Role and Objective
    You are an expert technical recruiter. Your task is to rank a list of candidates based on how well they fit a given job description.

    ## Job Title
    {{{jobTitle}}}

    ## Job Requirements
    {{{jobRequirements}}}

    ## Candidates (JSON format)
    {{{candidatesJson}}}

    ## Task
    1.  Carefully review the Job Requirements.
    2.  For each candidate in the provided JSON, evaluate their experience, skills, and qualifications against the job requirements.
    3.  Provide a score for each candidate from 1 to 100, where 100 is a perfect match.
    4.  Provide a concise rationale (2-3 sentences) for your ranking of each candidate, highlighting their strengths and weaknesses for this specific role.
    5.  Return the list of candidates ranked from best to worst fit.
`,
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
