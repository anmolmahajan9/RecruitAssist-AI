'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a Boolean search query optimized for Naukri.com based on a job description.
 *
 * - generateBooleanQuery - A function that generates the Boolean query.
 * - BooleanQueryInput - The input type for the generateBooleanQuery function.
 * - BooleanQueryOutput - The return type for the generateBooleanQuery function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BooleanQueryInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z.string().describe('The description of the job.'),
});
export type BooleanQueryInput = z.infer<typeof BooleanQueryInputSchema>;

const BooleanQueryOutputSchema = z.object({
  booleanQuery: z.string().describe('A Boolean search query optimized for Naukri.com.'),
});
export type BooleanQueryOutput = z.infer<typeof BooleanQueryOutputSchema>;

export async function generateBooleanQuery(input: BooleanQueryInput): Promise<BooleanQueryOutput> {
  return generateBooleanQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'booleanQueryPrompt',
  input: {schema: BooleanQueryInputSchema},
  output: {schema: BooleanQueryOutputSchema},
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

const generateBooleanQueryFlow = ai.defineFlow(
  {
    name: 'generateBooleanQueryFlow',
    inputSchema: BooleanQueryInputSchema,
    outputSchema: BooleanQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {
      booleanQuery: output?.BooleanQuery ?? '',
    };
  }
);
