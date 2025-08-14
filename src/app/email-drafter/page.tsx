
'use client';

import { useState } from 'react';
import { EmailDrafterForm } from '@/components/email-drafter-form';
import { EmailDrafterDisplay } from '@/components/email-drafter-display';
import {
  type EmailDrafterInput,
  type EmailDrafterOutput,
} from '@/ai/schemas/email-drafter-schema';
import { type EmailRefinerInput } from '@/ai/schemas/email-refiner-schema';
import { draftEmail } from '@/ai/flows/email-drafter-flow';
import { refineEmail } from '@/ai/flows/email-refiner-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function EmailDrafterPage() {
  const [result, setResult] = useState<EmailDrafterOutput | null>(null);
  const [initialInput, setInitialInput] = useState<EmailDrafterInput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (data: EmailDrafterInput) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setInitialInput(data);

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

  const handleRefineSubmit = async (newInstructions: string) => {
    if (!initialInput || !result) return;

    setIsRefining(true);
    setError(null);

    const refinerInput: EmailRefinerInput = {
      originalInput: initialInput,
      previousEmailBody: result.emailBody,
      newInstructions,
    };

    try {
      const response = await refineEmail(refinerInput);
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during refinement. Please try again.'
      );
    } finally {
      setIsRefining(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setIsRefining(false);
    setInitialInput(null);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <span className="text-primary">Email Drafter</span>
          </div>
          <ThemeToggle />
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
          <EmailDrafterDisplay
            result={result}
            onRefine={handleRefineSubmit}
            isRefining={isRefining}
          />
        </div>
      )}
    </div>
  );
}
