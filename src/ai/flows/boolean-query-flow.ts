'use server';
/**
 * @fileOverview A boolean query generation AI agent.
 *
 * - generateBooleanQuery - A function that handles boolean query generation.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  BooleanQueryInputSchema,
  type BooleanQueryInput,
  BooleanQueryOutputSchema,
  type BooleanQueryOutput,
} from '@/ai/schemas/boolean-query-schema';

export async function generateBooleanQuery(
  input: BooleanQueryInput
): Promise<BooleanQueryOutput> {
  return booleanQueryFlow(input);
}

const booleanQueryPrompt = ai.definePrompt({
  name: 'booleanQueryPrompt',
  model: googleAI.model('gemini-1.5-pro-latest'),
  input: { schema: BooleanQueryInputSchema },
  output: { schema: BooleanQueryOutputSchema },
  prompt: `## Role and Objective

You are an experienced recruitment consultant. Your objective is to generate keywords to use in boolean searches for sourcing candidates based on the given job role.

## Job Title
{{{jobTitle}}}

## Job Details

{{{jobDescription}}}

## Task

1. Review and understand the Job

2. Prepare relevant list of keywords and their related synonyms for boolean search. These should reflect keywords you would look for in an ideal candidate's resumes. Also generate all the possible variations of the keywords and synonyms that a candidate may write in their resume. Finally, combine them into a single boolean query string for Naukri.com.
`,
});

const booleanQueryFlow = ai.defineFlow(
  {
    name: 'booleanQueryFlow',
    inputSchema: BooleanQueryInputSchema,
    outputSchema: BooleanQueryOutputSchema,
  },
  async (input) => {
    const { output } = await booleanQueryPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
