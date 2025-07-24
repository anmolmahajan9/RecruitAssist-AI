'use server';
/**
 * @fileOverview An AI agent for parsing unstructured candidate text into structured data.
 *
 * - parseCandidates - A function that handles the parsing process.
 */

import { ai } from '@/ai/genkit';
import { googleAI } from '@genkit-ai/googleai';
import {
  CandidateParserInputSchema,
  type CandidateParserInput,
  CandidateParserOutputSchema,
  type CandidateParserOutput,
} from '@/ai/schemas/candidate-parser-schema';
import { logQuery } from '@/services/loggingService';

export async function parseCandidates(
  input: CandidateParserInput
): Promise<CandidateParserOutput> {
  await logQuery('candidateParserFlow', input);
  return candidateParserFlow(input);
}

const candidateParserPrompt = ai.definePrompt({
  name: 'candidateParserPrompt',
  model: googleAI.model('gemini-1.5-flash-latest'),
  input: { schema: CandidateParserInputSchema },
  output: { schema: CandidateParserOutputSchema },
  prompt: `## Role and Objective

You are an expert data extraction system for recruiters. Your task is to parse unstructured text containing information about multiple job candidates and convert it into a structured JSON format.

## Input
A block of text containing details for one or more candidates. Candidates may be separated by "---" or newlines.
{{{candidatesDetails}}}

## Task

1.  Identify each individual candidate from the provided text.
2.  For each candidate, extract the following information. If a piece of information is not available, leave the corresponding field as an empty string or empty array.
    -   **name**: The full name of the candidate.
    -   **designation**: Their current or most recent job title.
    -   **experience**: Total years of professional experience (e.g., "5 years").
    -   **ctc**: Their current or expected salary (Cost to Company).
    -   **currentLocation**: The city or country where they are currently based.
    -   **preferredLocation**: The city or country where they would like to work.
    -   **keySkills**: A list of their most important technical or professional skills.
    -   **preferredSkills**: A list of skills they are interested in or prefer to use.

## Output Format
Return a single JSON object with a key 'parsedCandidates', which is an array of objects. Each object in the array represents one candidate and contains all the fields listed in the "Task" section.
`,
});

const candidateParserFlow = ai.defineFlow(
  {
    name: 'candidateParserFlow',
    inputSchema: CandidateParserInputSchema,
    outputSchema: CandidateParserOutputSchema,
  },
  async (input) => {
    const { output } = await candidateParserPrompt(input);
if (!output) {
      throw new Error(
        'An unexpected error occurred and the AI returned no parsable output.'
      );
    }
    return output;
  }
);
