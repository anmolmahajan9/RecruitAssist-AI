'use server';

import { analyzeJobDescription } from '@/ai/flows/job-description-analyzer';
import type { AnalyzeJobDescriptionInput } from '@/ai/flows/job-description-analyzer';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function getAnalysisAction(input: AnalyzeJobDescriptionInput) {
    const { jobTitle, jobDescription } = input;
    
    if (!jobTitle || jobTitle.length < 3) {
        throw new Error('Job title must be at least 3 characters.');
    }

    if (!jobDescription || jobDescription.length < 50) {
        throw new Error('Job description must be at least 50 characters.');
    }

    try {
        const analysis = await analyzeJobDescription({ jobTitle, jobDescription });

        if (!analysis) {
            throw new Error('Failed to get analysis from AI. The response was empty.');
        }

        await addDoc(collection(db, 'analyses'), {
          jobTitle,
          jobDescription,
          analysis,
          createdAt: serverTimestamp(),
        });

        return analysis;
    } catch (error) {
        console.error('Error in getAnalysisAction:', error);
        // Provide a more user-friendly error message
        if (error instanceof Error && error.message.includes('deadline')) {
            throw new Error('The request timed out. Please try again.');
        }
        throw new Error('An unexpected error occurred while processing your request. Please try again.');
    }
}
