'use server';
/**
 * @fileOverview A job explanation AI agent that breaks down job descriptions.
 *
 * - explainJobDescription - A function that handles the job explanation process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  JobExplainerInputSchema,
  type JobExplainerInput,
  JobExplainerOutputSchema,
  type JobExplainerOutput,
} from '@/ai/schemas/job-explainer-schema';
import { logQuery } from '@/services/loggingService';

// The system prompt is the same for both models
const jobExplainerSystemPrompt = `## Objective
Aim is to have a better understanding of the job role.

## Tasks

1. Understand the context of the job.

2. Assume that I do not know any of the technical terms or jargon related to the role so in the beginning define each technical term. Also add relevant terms even if those terms are not mentioned in the Job Details below. Cover as many terms as you can, never pick and choose. Categorize the technical terms in following manner:
- Most specific to the job role (this means those terms which are only relevant for ideal candidate specific to the given job role) 
- General (this means those terms which will generally be applicable to other candidates in other similar roles also)

3. Categorize the main specific tasks vs general tasks of the person in the role. Cover as many tasks as you can, never pick and choose.

4. Create must haves for the role in simple sentences like "Must have experience with..." or " Must have knowledge of..." and similar sentences. Must haves will be provided to a recruiter to screen the candidate for first level screening call, so consider everything the hiring manager is looking for as per the job details.

5. Explain the job role in bullets for these persons:
- For a 5 year old
- For a college undergrad
- For a recruiter
`;

export async function runJobExplainer(
  model: 'Google Gemini' | 'Claude Sonnet',
  input: JobExplainerInput
): Promise<JobExplainerOutput> {
  await logQuery('jobExplainerFlow', { model, ...input });

  if (model === 'Claude Sonnet') {
    return await claudeJobExplainerFlow(input);
  }
  return await geminiJobExplainerFlow(input);
}

// Gemini specific flow using Genkit
const geminiJobExplainerFlow = async (
  input: JobExplainerInput
): Promise<JobExplainerOutput> => {
  const jobExplainerPrompt = ai.definePrompt({
    name: 'jobExplainerPrompt',
    model: googleAI.model('gemini-1.5-flash-latest'),
    input: { schema: JobExplainerInputSchema },
    output: { schema: JobExplainerOutputSchema },
    prompt: `${jobExplainerSystemPrompt}
## Job title: 
{{{jobTitle}}}

## Job details:
{{{jobDescription}}}
`,
  });

  const { output } = await jobExplainerPrompt(input);
  if (!output) {
    throw new Error(
      'An unexpected error occurred and the AI returned no output.'
    );
  }
  return output;
};

// Claude specific flow using the Firebase Cloud Function
const claudeJobExplainerFlow = async (
  input: JobExplainerInput
): Promise<JobExplainerOutput> => {
  const CLAUDE_FN_URL = process.env.NEXT_PUBLIC_CLAUDE_FN_URL;
  if (!CLAUDE_FN_URL) {
    throw new Error('Claude function URL is not configured.');
  }

  const userPrompt = `
## Job title: 
${input.jobTitle}

## Job details:
${input.jobDescription}
`;

  const response = await fetch(CLAUDE_FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: userPrompt,
      systemPrompt: `${jobExplainerSystemPrompt}
You must respond with a valid JSON object that conforms to this Zod schema:
${JSON.stringify(JobExplainerOutputSchema.shape, null, 2)}
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
  const validation = JobExplainerOutputSchema.safeParse(parsed);

  if (!validation.success) {
    console.error('Claude output validation error:', validation.error);
    throw new Error('The AI returned an invalid data structure.');
  }

  return validation.data;
};
