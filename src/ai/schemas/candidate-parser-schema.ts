/**
 * @fileOverview Defines the data schemas for the candidate parser AI flow.
 *
 * - CandidateParserInputSchema - The Zod schema for the input to the flow.
 * - CandidateParserInput - The TypeScript type for the flow's input.
 * - CandidateParserOutputSchema - The Zod schema for the output of the flow.
 * - CandidateParserOutput - The TypeScript type for the flow's output.
 * - ParsedCandidate - The TypeScript type for a single parsed candidate object.
 */

import { z } from 'zod';

// Input Schema
export const CandidateParserInputSchema = z.object({
  candidatesDetails: z
    .string()
    .describe(
      'A string containing the unstructured details of one or more candidates.'
    ),
});
export type CandidateParserInput = z.infer<typeof CandidateParserInputSchema>;

// Output Schema
const ParsedCandidateSchema = z.object({
  name: z.string().describe("The candidate's full name."),
  designation: z
    .string()
    .describe("The candidate's current or most recent job title."),
  experience: z
    .string()
    .describe("The candidate's total years of professional experience."),
  ctc: z.string().describe("The candidate's Cost to Company or salary."),
  currentLocation: z.string().describe("The candidate's current location."),
  preferredLocation: z
    .string()
    .describe("The candidate's preferred work location."),
  keySkills: z
    .array(z.string())
    .describe("A list of the candidate's key skills."),
  preferredSkills: z
    .array(z.string())
    .describe("A list of the candidate's preferred skills."),
});

export const CandidateParserOutputSchema = z.object({
  parsedCandidates: z.array(ParsedCandidateSchema),
});
export type CandidateParserOutput = z.infer<
  typeof CandidateParserOutputSchema
>;
export type ParsedCandidate = z.infer<typeof ParsedCandidateSchema>;
