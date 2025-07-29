'use server';
/**
 * @fileOverview An AI agent for parsing and structuring interview assessments.
 *
 * - assessInterview - A function that handles the full assessment structuring.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  InterviewAssessmentInputSchema,
  type InterviewAssessmentInput,
  InterviewAssessmentOutputSchema,
  type InterviewAssessmentOutput,
} from '@/ai/schemas/interview-assessment-schema';

export async function assessInterview(
  input: InterviewAssessmentInput
): Promise<InterviewAssessmentOutput> {
  return interviewAssessmentFlow(input);
}

const interviewAssessmentPrompt = ai.definePrompt({
  name: 'interviewAssessmentPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: InterviewAssessmentInputSchema },
  output: { schema: InterviewAssessmentOutputSchema },
  prompt: `## Objective
To share a call interview summary and analysis of a candidate with the client.

## Assessment 

This is the assessment of a call interview of a candidate. Assessment has been done against various must have and good to have criteria.

{{{callAssessmentText}}}

## Task

Carefully analyze the provided call assessment text. Extract the following information along with restructuring wherever asked:

- Candidate's full name.
- The role they interviewed for.
- The date and time of the interview based on start time. Standardize the format to 'DD MMM, YYYY HH:MM'.
- Call recording link 
- Criteria that are assessed without mentioning "must have" or "good to have".
- Score for each criteria
- Assessment of each criteria. Now, it’s important that restructure the assessment text without the negative points. I cannot share any negative points to the client. 
- A comprehensive summary of the interview, including all notes and observations.
- The overall status (Pass or Fail).

## Output Format
Return a single JSON object that strictly adheres to the defined output schema.
`,
});

const interviewAssessmentFlow = ai.defineFlow(
  {
    name: 'interviewAssessmentFlow',
    inputSchema: InterviewAssessmentInputSchema,
    outputSchema: InterviewAssessmentOutputSchema,
  },
  async (input) => {
    const { output } = await interviewAssessmentPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
