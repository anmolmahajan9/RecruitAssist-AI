/**
 * @fileoverview This file exports a singleton Genkit `ai` object.
 *
 * This object is used to define and call Genkit actions, such as flows and
 * prompts. You can also use it to create and reference other Genkit objects,
 * such as models, indexes, and retrievers.
 */
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      apiVersion: ['v1beta'],
    }),
  ],
});
