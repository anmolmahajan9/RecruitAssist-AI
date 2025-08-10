"use strict";
/**
 * @fileoverview Firebase Cloud Functions for the RecruitAssist AI application.
 *
 * This file contains the backend logic for proxying requests to third-party AI APIs,
 * ensuring that sensitive API keys are not exposed on the client-side.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.claudeApiProxy = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const cors_1 = __importDefault(require("cors"));
// Initialize Firebase Admin SDK
admin.initializeApp();
// Initialize CORS middleware
const corsHandler = (0, cors_1.default)({ origin: true });
// Retrieve Anthropic API key from Firebase Functions configuration or environment variables
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || ((_a = functions.config().anthropic) === null || _a === void 0 ? void 0 : _a.key);
if (!ANTHROPIC_API_KEY) {
    console.warn('Anthropic API key is not configured. Please set it in functions/.env or using `firebase functions:config:set anthropic.key="YOUR_KEY"`');
}
const anthropic = new sdk_1.default({
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
exports.claudeApiProxy = functions.https.onRequest((req, res) => {
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
                model: 'claude-3-sonnet-20240229',
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
            }
            else {
                res.status(500).send('No content received from Anthropic API');
            }
        }
        catch (error) {
            console.error('Error calling Anthropic API:', error);
            if (error instanceof Error) {
                res.status(500).send(`Internal Server Error: ${error.message}`);
            }
            else {
                res.status(500).send('Internal Server Error');
            }
        }
    });
});
//# sourceMappingURL=index.js.map