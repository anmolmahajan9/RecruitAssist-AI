'use server';
/**
 * @fileOverview A job analysis AI agent that breaks down job descriptions.
 *
 * - analyzeJobDescription - A function that handles the job analysis process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  JobAnalysisInputSchema,
  type JobAnalysisInput,
  JobAnalysisOutputSchema,
  type JobAnalysisOutput,
} from '@/ai/schemas/job-analyzer-schema';
import { logQuery } from '@/services/loggingService';

// The system prompt is the same for both models
const jobAnalyzerSystemPrompt = `## Objective
Aim is to have a better understanding of the job role

## Tasks

1. Understand the context of the job.

2. Assume that I do not know any of the technical terms or jargon related to the role so in the beginning define each technical term. Also add relevant terms even if those terms are not mentioned in the Job Details below. Categorize the technical terms in following manner:
- Most specific to the job role (this means those terms which are only relevant for ideal candidate specific to the given job role) 
- General (this means those terms which will generally be applicable to other candidates in other similar roles also)

3. Categorize the main specific tasks vs general tasks of the person in the role.

4. Explain the job role in bullets for these persons:
- For a 5 year old
- For a college undergrad
- For a recruiter
`;

export async function runJobAnalysis(
  model: 'Google Gemini' | 'Claude Sonnet',
  input: JobAnalysisInput
): Promise<JobAnalysisOutput> {
  await logQuery('jobAnalyzerFlow', { model, ...input });

  if (model === 'Claude Sonnet') {
    return await claudeJobAnalyzerFlow(input);
  }
  return await geminiJobAnalyzerFlow(input);
}

// Gemini specific flow using Genkit
const geminiJobAnalyzerFlow = async (
  input: JobAnalysisInput
): Promise<JobAnalysisOutput> => {
  const jobAnalyzerPrompt = ai.definePrompt({
    name: 'jobAnalyzerPrompt',
    model: googleAI.model('gemini-1.5-flash-latest'),
    input: { schema: JobAnalysisInputSchema },
    output: { schema: JobAnalysisOutputSchema },
    prompt: `${jobAnalyzerSystemPrompt}
## Job title: 
{{{jobTitle}}}

## Job details:
{{{jobDescription}}}
`,
  });

  const { output } = await jobAnalyzerPrompt(input);
  if (!output) {
    throw new Error(
      'An unexpected error occurred and the AI returned no output.'
    );
  }
  return output;
};

// Claude specific flow using the Firebase Cloud Function
const claudeJobAnalyzerFlow = async (
  input: JobAnalysisInput
): Promise<JobAnalysisOutput> => {
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
      systemPrompt: `${jobAnalyzerSystemPrompt}
You must respond with a valid JSON object that conforms to this Zod schema:
${JSON.stringify(JobAnalysisOutputSchema.shape, null, 2)}
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
  const validation = JobAnalysisOutputSchema.safeParse(parsed);

  if (!validation.success) {
    console.error('Claude output validation error:', validation.error);
    throw new Error('The AI returned an invalid data structure.');
  }

  return validation.data;
};
