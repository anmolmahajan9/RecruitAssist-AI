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
    You are an expert technical recruiter. Your task is to assess and rank ALL candidates, one by one, based on how well they fit the provided job requirements.

    ## Job Title
    {{{jobTitle}}}

    ## Job Requirements
    These are the "must-have" criteria for the role.
    {{{jobRequirements}}}

    ## Candidates (JSON format)
    A list of candidates to be evaluated.
    {{{candidatesJson}}}

    ## Scoring Guideline
    - Build a scoring mechanism based on the "must-have" job requirements.
    - The total score for each candidate should be out of 100.

    ## Task
    1.  Carefully review the Job Requirements. These are the "must-haves".
    2.  For each candidate in the provided JSON, evaluate their experience, skills, and qualifications against EACH of the "must-have" requirements.
    3.  For each "must-have", mark the candidate's fit as "Yes", "No", or "Maybe".
    4.  Provide a total score for each candidate from 1 to 100, where 100 is a perfect match.
    5.  Provide a concise rationale (2-3 sentences) for your overall score and ranking of each candidate.
    6.  Return the complete list of candidates ranked from highest score to lowest. Do not truncate the list.

    ## Output Format
    Return a JSON object containing a 'rankedCandidates' array. Each object in the array must include:
    - rank: The numerical rank.
    - name: The candidate's name.
    - score: The calculated score (1-100).
    - rationale: Your brief analysis.
    - details: The original candidate JSON object.
    - mustHaves: An array of objects, each with a 'requirement' (the specific must-have skill/experience) and a 'status' ("Yes", "No", or "Maybe").
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
