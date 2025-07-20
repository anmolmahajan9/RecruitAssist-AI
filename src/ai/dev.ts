/**
 * @fileoverview This file is the entrypoint for the Genkit developer server.
 *
 * It is not included in the production build.
 */

import { genkit, type Plugin } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';
import { next } from '@genkit-ai/next';
import {genkitxRun} from 'genkitx-run';

const localPlugins: Plugin[] = [];
if (process.env.GENKIT_ENV === 'dev' && !process.env.FUNCTIONS_URI) {
  localPlugins.push(
    genkitxRun({
      // Your configuration here
    })
  );
}

genkit({
  plugins: [
    next(),
    googleAI({
      apiVersion: ['v1beta'],
    }),
    ...localPlugins
  ],
  flowStateStore: 'firebase',
  traceStore: 'firebase',
  enableTracingAndMetrics: true,
  logLevel: 'debug',
});
