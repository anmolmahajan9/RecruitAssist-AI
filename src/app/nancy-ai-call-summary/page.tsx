
'use client';

import { useState } from 'react';
import { CallSummaryForm } from '@/components/call-summary-form';
import { CallSummaryDisplay } from '@/components/call-summary-display';
import {
  type InterviewAssessmentInput,
  type InterviewAssessmentOutput,
} from '@/ai/schemas/interview-assessment-schema';
import { assessInterview } from '@/ai/flows/interview-assessment-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NancyAiCallSummaryPage() {
  const [assessment, setAssessment] = useState<InterviewAssessmentOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: InterviewAssessmentInput) => {
    setIsLoading(true);
    setError(null);
    setAssessment(null);

    try {
      const result = await assessInterview(data);
      setAssessment(result);
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
    setAssessment(null);
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
        </div>
      </header>

      <CallSummaryForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!assessment || !!error}
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

      {assessment && (
        <div className="mt-8">
          <CallSummaryDisplay assessment={assessment} />
        </div>
      )}
    </div>
  );
}
