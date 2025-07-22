'use server';
/**
 * @fileOverview An AI agent for summarizing call assessments for clients.
 *
 * - generateCallSummary - A function that handles the call summary generation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  CallSummaryInputSchema,
  type CallSummaryInput,
  CallSummaryOutputSchema,
  type CallSummaryOutput,
} from '@/ai/schemas/call-summary-schema';

export async function generateCallSummary(
  input: CallSummaryInput
): Promise<CallSummaryOutput> {
  return callSummaryFlow(input);
}

const callSummaryPrompt = ai.definePrompt({
  name: 'callSummaryPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: CallSummaryInputSchema },
  output: { schema: CallSummaryOutputSchema },
  prompt: `This is the assessment of a call interview of a candidate. Assessment has been done against various must have and good to have criteria. I have to share this with my client. For this I need you to edit the assessment text in the following manner:
1. Remove the Scores
2. Keep the assessment structure and text as it is but remove the negative points. I cannot share any negative points to the client. Do not mention "must have" or "good to have" criteria.
 
Output Format (text snippet which can be copied):
 
Detailed Assessment: <<Each criterion and their assessment in a highly readable format using numbering and bullets.>>
Summary: <<Overall Summary of the assessment (without any negative points)>>
 
This is the assessment:

{{{callAssessmentText}}}
`,
});

const callSummaryFlow = ai.defineFlow(
  {
    name: 'callSummaryFlow',
    inputSchema: CallSummaryInputSchema,
    outputSchema: CallSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await callSummaryPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
