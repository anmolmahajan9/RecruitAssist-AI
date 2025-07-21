'use client';

import { useState } from 'react';
import { JobInputForm } from '@/components/job-input-form';
import { JobAnalysisDisplay } from '@/components/job-analysis-display';
import {
  type JobAnalysisInput,
  type JobAnalysisOutput,
} from '@/ai/schemas/job-analyzer-schema';
import { analyzeJobDescription } from '@/ai/flows/job-analyzer-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function JobAnalyzerPage() {
  const [analysis, setAnalysis] = useState<JobAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async (formData: JobAnalysisInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeJobDescription(formData);
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
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center my-8 md:my-12">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              Job Analyzer
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
              Get a detailed breakdown of any job description.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/" aria-label="Back to Home">
              <Home className="h-8 w-8 text-muted-foreground hover:text-primary" />
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <JobInputForm
          onSubmit={handleAnalysis}
          isLoading={isLoading}
          onReset={handleReset}
          hasResults={!!analysis || !!error}
          buttonText="Analyze Job"
          loadingText="Analyzing..."
        />

        {error && (
          <Card className="mt-8 bg-destructive/10 border-destructive text-destructive-foreground">
            <CardHeader>
              <CardTitle>Error</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {analysis && (
          <div className="mt-8">
            <JobAnalysisDisplay analysis={analysis} />
          </div>
        )}
      </div>
    </main>
  );
}
