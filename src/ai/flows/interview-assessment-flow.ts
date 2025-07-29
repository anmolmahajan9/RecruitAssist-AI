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

## Assessment text

This is the assessment of a call interview of a candidate. Assessment has been done against various criteria.

{{{callAssessmentText}}}

## Task

Carefully analyze the provided call assessment text for the following information:

- Candidate's full name.
- The job role they interviewed for.
- The date and time of the interview based on start time. Standardize the format to 'DD MMM, YYYY HH:MM'.
- Call recording link 
- Each criterion without mentioning "must have" or "good to have". Restructure the language of the criterion to show the skill / area / criterion assessed.
- Score for each criterion as given in the assessment text
- Detailed assessment score of each criterion as given in the assessment text. Now, it’s important that restructure the assessment text without the negative points. I cannot share any negative points to the client. 
- A comprehensive summary of the interview, including all notes and observations without comments on CTC or notice. Consider the “Job fit” assessment in the interview summary itself, as it is not a separate criterion. Keep things positive.
- The overall status (Pass or Fail).

 Output Format:
 
{
  "candidate_name": "<Full Name>",
  "interviewed_role": "<Role Interviewed For>",
  "interview_datetime": "<DD MMM, YYYY HH:MM>",
  },
  "assessment_criteria": [
    {
      "criterion": "<Criteria Name>",
      "assessment": "<As provided in the assessment text restructured without negative points>",
      "score": <as provided in the assessment text>
    }
    // Repeat for each criterion separately.
  ],
  "interview_summary": "<Comprehensive positive summary including notes and observations without any negative points and without comments on CTCor notice>",
  "overall_status": "<Pass | Fail>"
}
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
