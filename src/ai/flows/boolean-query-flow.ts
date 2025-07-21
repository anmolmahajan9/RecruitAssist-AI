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

1. Review and understand the Job based on details provided.

2. Prepare list of keywords relevant to this job role. These should reflect keywords you would look for in this job role's ideal candidate's resumes. note that you are not limited to the keywords provided in the Job description so cover all relevant terms that may even be missing in the provided job description. 

3. The above list of keywords should be marked either "Specific" (this means those terms which are only relevant for ideal candidate specific to the given job role) or "General" (this means those terms which will generally be applicable to other candidates in other similar roles also).  

4. Also generate all the possible variations of the keywords and synonyms that a candidate may write in their resume. 

5. Generate variations of Boolean search strings.

## Output

Provide a table with columns having Primary and Synonyms.

And provide 3 variations of Boolean search strings based on keywords (not considering experience or location):
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
