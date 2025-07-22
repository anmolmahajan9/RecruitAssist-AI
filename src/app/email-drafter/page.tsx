'use client';

import { useState } from 'react';
import { EmailDrafterForm } from '@/components/email-drafter-form';
import { EmailDrafterDisplay } from '@/components/email-drafter-display';
import {
  type EmailDrafterInput,
  type EmailDrafterOutput,
} from '@/ai/schemas/email-drafter-schema';
import { draftEmail } from '@/ai/flows/email-drafter-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function EmailDrafterPage() {
  const [result, setResult] = useState<EmailDrafterOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: EmailDrafterInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await draftEmail(data);
      setResult(response);
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
    setResult(null);
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
            Email Drafter
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Draft a professional email to a client for candidate submission.
          </p>
        </div>
      </header>

      <EmailDrafterForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!result || !!error}
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

      {result && (
        <div className="mt-8">
          <EmailDrafterDisplay result={result} />
        </div>
      )}
    </div>
  );
}
