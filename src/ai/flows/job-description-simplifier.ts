'use server';
/**
 * @fileOverview An AI agent that simplifies job descriptions for different audiences.
 *
 * - simplifyJobDescription - A function that simplifies the job description.
 * - SimplifyJobDescriptionInput - The input type for the simplifyJobDescription function.
 * - SimplifyJobDescriptionOutput - The return type for the simplifyJobDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyJobDescriptionInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z.string().describe('The full job description.'),
});
export type SimplifyJobDescriptionInput = z.infer<typeof SimplifyJobDescriptionInputSchema>;

const SimplifyJobDescriptionOutputSchema = z.object({
  jobRoleExplained: z.object({
    easy: z.string().describe('Explanation for a 5-year-old.'),
    intermediate: z.string().describe('Explanation for a college student.'),
    recruiter: z.string().describe('Explanation for another recruiter.'),
  }).describe('Simplified explanations of the job role for different audiences.'),
  technicalTermsAndJargon: z.object({
    specificToRole: z.array(
      z.object({
        term: z.string().describe('Technical term specific to the role.'),
        definition: z.string().describe('Definition of the term.'),
      })
    ).describe('Technical terms specifically related to the job role.'),
    generalTerms: z.array(
      z.object({
        term: z.string().describe('General technical term.'),
        definition: z.string().describe('Definition of the term.'),
      })
    ).describe('General technical terms applicable to similar roles.'),
  }).describe('Definitions of technical terms and jargon.'),
  tasks: z.object({
    specificTasks: z.array(z.string()).describe('Specific tasks for the role.'),
    generalTasks: z.array(z.string()).describe('General tasks applicable to similar roles.'),
  }).describe('Categorization of specific vs general tasks.'),
  booleanQuery: z.string().describe('Boolean query for Naukri.com.'),
});
export type SimplifyJobDescriptionOutput = z.infer<typeof SimplifyJobDescriptionOutputSchema>;

export async function simplifyJobDescription(input: SimplifyJobDescriptionInput): Promise<SimplifyJobDescriptionOutput> {
  return simplifyJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyJobDescriptionPrompt',
  input: {schema: SimplifyJobDescriptionInputSchema},
  output: {schema: SimplifyJobDescriptionOutputSchema},
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
}`,
});

const simplifyJobDescriptionFlow = ai.defineFlow(
  {
    name: 'simplifyJobDescriptionFlow',
    inputSchema: SimplifyJobDescriptionInputSchema,
    outputSchema: SimplifyJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

