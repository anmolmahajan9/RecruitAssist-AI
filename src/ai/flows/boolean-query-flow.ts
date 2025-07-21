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
  model: googleAI.model('gemini-1.5-flash-latest'),
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

2. Prepare relevant list of keywords and their related synonyms for boolean search. Categorize these into "Specific Keywords" (this means those terms which are only relevant for ideal candidate specific to the given job role) and "General Keywords" (this means those terms which will generally be applicable to other candidates in other similar roles also). These should reflect keywords you would look for in this job role's ideal candidate's resumes. 

3. Also generate all the possible variations of the keywords and synonyms that a candidate may write in their resume. 

## Output

Provide a table with columns : "Area" , "Primary Keywords", "Synonyms / Resume Variants"

And provide 3 variations of Boolean search strings considering only keywords (not experience or location):
1. Basic
2. Intermediate (More advanced than basic)
3. Advanced (More advanced and in-depth than intermediate)
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
