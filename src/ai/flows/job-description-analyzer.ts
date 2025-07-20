'use server';

/**
 * @fileOverview A job description analyzer AI agent.
 *
 * - analyzeJobDescription - A function that handles the job description analysis process.
 * - AnalyzeJobDescriptionInput - The input type for the analyzeJobDescription function.
 * - AnalyzeJobDescriptionOutput - The return type for the analyzeJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeJobDescriptionInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z.string().describe('The full job description.'),
});
export type AnalyzeJobDescriptionInput = z.infer<typeof AnalyzeJobDescriptionInputSchema>;

const AnalyzeJobDescriptionOutputSchema = z.object({
  JobRoleExplained: z.object({
    Easy: z.string(),
    Intermediate: z.string(),
    Recruiter: z.string(),
  }),
  TechnicalTermsAndJargon: z.object({
    SpecificToRole: z.array(z.object({term: z.string(), definition: z.string()})),
    GeneralTerms: z.array(z.object({term: z.string(), definition: z.string()})),
  }),
  Tasks: z.object({
    SpecificTasks: z.array(z.string()),
    GeneralTasks: z.array(z.string()),
  }),
  BooleanQuery: z.string(),
});
export type AnalyzeJobDescriptionOutput = z.infer<typeof AnalyzeJobDescriptionOutputSchema>;

export async function analyzeJobDescription(input: AnalyzeJobDescriptionInput): Promise<AnalyzeJobDescriptionOutput> {
  return analyzeJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeJobDescriptionPrompt',
  input: {schema: AnalyzeJobDescriptionInputSchema},
  output: {schema: AnalyzeJobDescriptionOutputSchema},
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
  },
  "BooleanQuery": "string"
}
`,
});

const analyzeJobDescriptionFlow = ai.defineFlow(
  {
    name: 'analyzeJobDescriptionFlow',
    inputSchema: AnalyzeJobDescriptionInputSchema,
    outputSchema: AnalyzeJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
