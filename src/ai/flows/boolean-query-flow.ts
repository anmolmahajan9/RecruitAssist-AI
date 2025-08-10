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
import { logQuery } from '@/services/loggingService';

// The prompt remains the same for both models
const booleanQuerySystemPrompt = `## Role and Objective

You are an experienced recruitment consultant. Your objective is to generate keywords to use in boolean searches for sourcing candidates based on the given job role.

## Task

1. Review and understand the Job based on details provided.

2. Prepare list of keywords relevant to this job role. These should reflect keywords you would look for in this job role's ideal candidate's resumes. Note that you are not limited to the keywords provided in the provided job description so cover all relevant terms that may even be missing in the provided job description. 

3. The above list of keywords should be clubbed under two subheads "Specific Keywords" (this means those terms which are only relevant for ideal candidate specific to the given job role) and "General Keywords" (this means those terms which will generally be applicable to other candidates in other similar roles also).  

4. Also generate all the possible variations of the keywords and synonyms that a candidate may write in their resume. 

5. Generate variations of Boolean search strings.

## Output

Provide a table with columns having "Primary Keywords" with subheads as "Specific to the role" and "General" along with Resume Variants in another colum.

And provide 3 variations of Boolean search strings based on keywords (not considering experience or location):
1. Basic
2. Intermediate (More advanced than basic)
3. Advanced (More advanced and in-depth than intermediate)
`;

export async function runBooleanQuery(
  model: 'Google Gemini' | 'Claude Sonnet',
  input: BooleanQueryInput
): Promise<BooleanQueryOutput> {
  await logQuery('booleanQueryFlow', { model, ...input });

  if (model === 'Claude Sonnet') {
    return await claudeBooleanQueryFlow(input);
  }
  return await geminiBooleanQueryFlow(input);
}

// Gemini specific flow using Genkit
const geminiBooleanQueryFlow = async (
  input: BooleanQueryInput
): Promise<BooleanQueryOutput> => {
  const prompt = ai.definePrompt({
    name: 'booleanQueryPrompt',
    model: googleAI.model('gemini-1.5-flash-latest'),
    input: { schema: BooleanQueryInputSchema },
    output: { schema: BooleanQueryOutputSchema },
    prompt: `${booleanQuerySystemPrompt}
## Job Title
{{{jobTitle}}}

## Job Details

{{{jobDescription}}}
`,
  });

  const { output } = await prompt(input);
  if (!output) {
    throw new Error(
      'An unexpected error occurred and the AI returned no output.'
    );
  }
  return output;
};

// Claude specific flow using the Firebase Cloud Function
const claudeBooleanQueryFlow = async (
  input: BooleanQueryInput
): Promise<BooleanQueryOutput> => {
  const CLAUDE_FN_URL = process.env.NEXT_PUBLIC_CLAUDE_FN_URL;
  if (!CLAUDE_FN_URL) {
    throw new Error('Claude function URL is not configured.');
  }

  const userPrompt = `## Job Title
${input.jobTitle}

## Job Details

${input.jobDescription}
`;

  const response = await fetch(CLAUDE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: userPrompt,
      systemPrompt: `${booleanQuerySystemPrompt}
You must respond with a valid JSON object that conforms to this Zod schema:
${JSON.stringify(BooleanQueryOutputSchema.shape, null, 2)}
`,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Claude API request failed with status ${response.status}: ${errorText}`
    );
  }

  const result = await response.json();
  const parsed = JSON.parse(result.data);

  // Validate the output from Claude against the Zod schema
  const validation = BooleanQueryOutputSchema.safeParse(parsed);
  if (!validation.success) {
    console.error('Claude output validation error:', validation.error);
    throw new Error('The AI returned an invalid data structure.');
  }

  return validation.data;
};
