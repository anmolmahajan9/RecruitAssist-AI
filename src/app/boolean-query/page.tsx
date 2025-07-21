'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobInputForm } from '@/components/job-input-form';
import { BooleanQueryDisplay } from '@/components/boolean-query-display';
import {
  type BooleanQueryInput,
  type BooleanQueryOutput,
} from '@/ai/schemas/boolean-query-schema';
import { generateBooleanQuery } from '@/ai/flows/boolean-query-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function BooleanQueryPage() {
  const [analysis, setAnalysis] = useState<BooleanQueryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAnalysis = async (formData: BooleanQueryInput) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await generateBooleanQuery(formData);
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
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back</span>
            </Button>
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
            Boolean Query Helper
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Generate an optimized search query from a job description.
          </p>
        </div>
      </header>

      <JobInputForm
        onSubmit={handleAnalysis}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!analysis || !!error}
        buttonText="Generate Query"
        loadingText="Generating..."
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
          <BooleanQueryDisplay analysis={analysis} />
        </div>
      )}
    </div>
  );
}
