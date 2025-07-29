
'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ReportGeneratorForm } from '@/components/report-generator-form';
import { CallSummaryDisplay } from '@/components/call-summary-display';
import type { InterviewAssessmentOutput } from '@/ai/schemas/interview-assessment-schema';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function ReportGeneratorPage() {
  const [assessment, setAssessment] = useState<InterviewAssessmentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            Report Generator
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Generate a combined PDF with a call assessment and a watermarked resume.
          </p>
        </div>
      </header>
      <ReportGeneratorForm
        setAssessment={setAssessment}
        setIsLoading={setIsLoading}
        setError={setError}
        onReset={handleReset}
        isLoading={isLoading}
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

      {assessment && !error && (
        <div className="mt-8">
          <CallSummaryDisplay assessment={assessment} showFooter={false} />
        </div>
      )}
    </div>
  );
}
