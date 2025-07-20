/**
 * @fileoverview This file exports a singleton Genkit `ai` object.
 *
 * This object is used to define and call Genkit actions, such as flows and
 * prompts. You can also use it to create and reference other Genkit objects,
_ * such as models, indexes, and retrievers.
 */

import { genkit } from 'genkit';
export const ai = genkit;
