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

export async function explainJobDescription(
  input: JobExplainerInput
): Promise<JobExplainerOutput> {
  return jobExplainerFlow(input);
}

const jobExplainerPrompt = ai.definePrompt({
  name: 'jobExplainerPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: JobExplainerInputSchema },
  output: { schema: JobExplainerOutputSchema },
  prompt: `## Objective
Aim is to have a better understanding of the job role

## Tasks

1. Understand the context of the job.

2. Assume that I do not know any of the technical terms or jargon related to the role so in the beginning define each technical term. Also add relevant terms even if those terms are not mentioned in the Job Details below. Cover as many terms as you can, never pick and choose. Categorize the technical terms in following manner:
- Most specific to the job role (this means those terms which are only relevant for ideal candidate specific to the given job role) 
- General (this means those terms which will generally be applicable to other candidates in other similar roles also)

3. Categorize the main specific tasks vs general tasks of the person in the role. Cover as many tasks as you can, never pick and choose.

4. Explain the job role in bullets for these persons:
- For a 5 year old
- For a college undergrad
- For a recruiter

## Job title: 
{{{jobTitle}}}

## Job details:
{{{jobDescription}}}

## Output format:

{
  "JobRoleExplained": {
    "Easy": "string",
    "Intermediate": "string",
    "Recruiter": "string"
  },
  "TechnicalTermsAndJargon": {
    "SpecificToRole": [
      { "term": "string", "definition": "string" }
    ],
    "GeneralTerms": [
      { "term": "string", "definition": "string" }
    ]
  },
  "Tasks": {
    "SpecificTasks": ["string"],
    "GeneralTasks": ["string"]
  }
}
`,
});

const jobExplainerFlow = ai.defineFlow(
  {
    name: 'jobExplainerFlow',
    inputSchema: JobExplainerInputSchema,
    outputSchema: JobExplainerOutputSchema,
  },
  async (input) => {
    const { output } = await jobExplainerPrompt(input);
    if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no output.'
      );
    }
    return output;
  }
);
