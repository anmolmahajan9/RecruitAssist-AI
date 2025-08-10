/**
 * @fileoverview Firebase Cloud Functions for the RecruitAssist AI application.
 *
 * This file contains the backend logic for proxying requests to third-party AI APIs,
 * ensuring that sensitive API keys are not exposed on the client-side.
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Anthropic from '@anthropic-ai/sdk';
import cors from 'cors';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Initialize CORS middleware
const corsHandler = cors({ origin: true });

// Retrieve Anthropic API key from Firebase Functions configuration or environment variables
const ANTHROPIC_API_KEY =
  process.env.ANTHROPIC_API_KEY || functions.config().anthropic?.key;

if (!ANTHROPIC_API_KEY) {
  console.warn(
    'Anthropic API key is not configured. Please set it in functions/.env or using `firebase functions:config:set anthropic.key="YOUR_KEY"`'
  );
}

const anthropic = new Anthropic({
  apiKey: ANTHROPIC_API_KEY,
});

/**
 * A secure proxy for the Anthropic (Claude) API.
 *
 * This function is callable via HTTPS and forwards requests to the Anthropic API.
 * It expects a 'prompt' and a 'systemPrompt' in the request body.
 *
 * @param {functions.https.Request} req The HTTPS request object.
 * @param {functions.https.Response} res The HTTPS response object.
 */
export const claudeApiProxy = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { prompt, systemPrompt } = req.body;

      if (!prompt) {
        res.status(400).send('Bad Request: Missing prompt.');
        return;
      }

      // Construct the message for the Anthropic API
      const msg = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });

      // Assuming the response from Claude is in a format that can be sent back directly.
      // We'll send back the content of the first message in the response.
      if (msg.content && msg.content.length > 0) {
        // Assuming text-based content for now
        const responseText = msg.content
          .map((c) => (c.type === 'text' ? c.text : ''))
          .join('');
        res.status(200).send({ data: responseText });
      } else {
        res.status(500).send('No content received from Anthropic API');
      }
    } catch (error) {
      console.error('Error calling Anthropic API:', error);
      if (error instanceof Error) {
        res.status(500).send(`Internal Server Error: ${error.message}`);
      } else {
        res.status(500).send('Internal Server Error');
      }
    }
  });
});
