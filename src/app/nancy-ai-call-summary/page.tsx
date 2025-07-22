'use client';

import { useState } from 'react';
import { CallSummaryForm } from '@/components/call-summary-form';
import { CallSummaryDisplay } from '@/components/call-summary-display';
import {
  type CallSummaryInput,
  type CallSummaryOutput,
} from '@/ai/schemas/call-summary-schema';
import { generateCallSummary } from '@/ai/flows/call-summary-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NancyAiCallSummaryPage() {
  const [summary, setSummary] = useState<CallSummaryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: CallSummaryInput) => {
    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const result = await generateCallSummary(data);
      setSummary(result);
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
    setSummary(null);
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
            Nancy AI Call Summary
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Generate a summary of a candidate call assessment.
          </p>
        </div>
      </header>

      <CallSummaryForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!summary || !!error}
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

      {summary && (
        <div className="mt-8">
          <CallSummaryDisplay summary={summary} />
        </div>
      )}
    </div>
  );
}
