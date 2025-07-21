'use client';

import { useState } from 'react';
import { CandidateRankerForm } from '@/components/candidate-ranker-form';
import { CandidateRankerDisplay } from '@/components/candidate-ranker-display';
import {
  type CandidateRankerInput,
  type CandidateRankerOutput,
} from '@/ai/schemas/candidate-ranker-schema';
import { rankCandidates } from '@/ai/flows/candidate-ranker-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CandidateRankerPage() {
  const [analysis, setAnalysis] = useState<CandidateRankerOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: CandidateRankerInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      // Basic JSON validation before sending
      JSON.parse(data.candidatesDetails);
    } catch (e) {
      setError(
        'Invalid JSON format for candidates. Please check the structure.'
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await rankCandidates(data);
      // Ensure results are sorted by rank client-side for consistency
      result.rankedCandidates.sort((a, b) => a.rank - b.rank);
      setAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
          </div>
          <ThemeToggle />
        </div>
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Candidate Ranker
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Rank candidates against a job description based on their details.
          </p>
        </div>
      </header>

      <CandidateRankerForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!analysis || !!error}
      />

      {error && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>An Error Occurred</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="mt-8">
          <CandidateRankerDisplay analysis={analysis} />
        </div>
      )}
    </div>
  );
}
