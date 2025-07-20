'use server';

/**
 * @fileOverview A job description analyzer AI agent.
 *
 * - getJobAnalysis - A function that handles the job description analysis process.
 * - JobAnalysisInput - The input type for the getJobAnalysis function.
 * - JobAnalysisOutput - The return type for the getJobAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const JobAnalysisInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z.string().describe('The full job description.'),
});
export type JobAnalysisInput = z.infer<typeof JobAnalysisInputSchema>;

const JobAnalysisOutputSchema = z.object({
  JobRoleExplained: z.object({
    Easy: z.string().describe('Explanation for a 5-year-old.'),
    Intermediate: z.string().describe('Explanation for a college student.'),
    Recruiter: z.string().describe('Explanation for another recruiter.'),
  }),
  TechnicalTermsAndJargon: z.object({
    SpecificToRole: z.array(
      z.object({
        term: z.string().describe('Technical term specific to the role.'),
        definition: z.string().describe('Definition of the term.'),
      })
    ),
    GeneralTerms: z.array(
      z.object({
        term: z.string().describe('General technical term.'),
        definition: z.string().describe('Definition of the term.'),
      })
    ),
  }),
  Tasks: z.object({
    SpecificTasks: z.array(z.string()).describe('Specific tasks for the role.'),
    GeneralTasks: z.array(z.string()).describe('General tasks applicable to similar roles.'),
  }),
  BooleanQuery: z.string().describe('A Boolean search query optimized for Naukri.com.'),
});
export type JobAnalysisOutput = z.infer<typeof JobAnalysisOutputSchema>;

export async function getJobAnalysis(input: JobAnalysisInput): Promise<JobAnalysisOutput> {
  return jobAnalyzerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'jobAnalyzerPrompt',
  input: {schema: JobAnalysisInputSchema},
  output: {schema: JobAnalysisOutputSchema},
  prompt: `## Objective
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

5. Based on the above breakdown, formulate a boolean query to search for candidates in Naukri.com

## Job title: 
{{jobTitle}}

## Job details:

{{jobDescription}}
`,
});

const jobAnalyzerFlow = ai.defineFlow(
  {
    name: 'jobAnalyzerFlow',
    inputSchema: JobAnalysisInputSchema,
    outputSchema: JobAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('AI failed to generate a response.');
    }
    return output;
  }
);
