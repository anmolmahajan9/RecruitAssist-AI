/**
 * @fileOverview Defines the data schemas for the boolean query AI flow.
 *
 * - BooleanQueryInputSchema - The Zod schema for the input to the flow.
 * - BooleanQueryInput - The TypeScript type for the flow's input.
 * - BooleanQueryOutputSchema - The Zod schema for the output of the flow.
 * - BooleanQueryOutput - The TypeScript type for the flow's output.
 */

import { z } from 'zod';

// Input Schema (can be shared or duplicated, here duplicated for clarity)
export const BooleanQueryInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  jobDescription: z
    .string()
    .describe('The full job description or user understanding of the role.'),
});
export type BooleanQueryInput = z.infer<typeof BooleanQueryInputSchema>;

// Output Schema
export const BooleanQueryOutputSchema = z.object({
  keywordTable: z
    .array(
      z.object({
        area: z.string().describe('The area, skill, or tool.'),
        primaryKeywords: z
          .string()
          .describe('The primary keywords for the area.'),
        synonyms: z
          .string()
          .describe('The synonyms or resume variants for the keywords.'),
      })
    )
    .describe(
      'A table of keywords, skills, and tools with their synonyms.'
    ),
  booleanQueries: z.object({
    basic: z.string().describe('A basic boolean search query.'),
    intermediate: z
      .string()
      .describe('An intermediate boolean search query.'),
    advanced: z.string().describe('An advanced boolean search query.'),
  }),
});
export type BooleanQueryOutput = z.infer<typeof BooleanQueryOutputSchema>;
