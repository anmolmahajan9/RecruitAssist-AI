'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';

function BooleanQueryComponent() {
  const [analysis, setAnalysis] = useState<BooleanQueryOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<BooleanQueryInput>({
    jobTitle: '',
    jobDescription: '',
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const jobTitle = searchParams.get('jobTitle');
    const jobDescription = searchParams.get('jobDescription');

    if (jobTitle && jobDescription) {
      const newFormData = { jobTitle, jobDescription };
      setFormData(newFormData);
      handleAnalysis(newFormData, true); // Pass true to indicate it's an auto-run
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleAnalysis = async (
    data: BooleanQueryInput,
    isAutoRun = false
  ) => {
    setIsLoading(true);
    setError(null);
    if (!isAutoRun) {
      setAnalysis(null);
    }

    try {
      const result = await generateBooleanQuery(data);
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

  const handleFormSubmit = (data: BooleanQueryInput) => {
    setFormData(data);
    handleAnalysis(data);
  };

  const handleReset = () => {
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setFormData({ jobTitle: '', jobDescription: '' });
    router.push('/boolean-query'); // Clear URL params
  };

  const handleNavigate = () => {
    const params = new URLSearchParams();
    params.set('jobTitle', formData.jobTitle);
    params.set('jobDescription', formData.jobDescription);
    router.push(`/job-analyzer?${params.toString()}`);
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
            Boolean Query Helper
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Generate an optimized search query from a job description.
          </p>
        </div>
      </header>

      <JobInputForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!analysis || !!error}
        buttonText="Generate Query"
        loadingText="Generating..."
        initialData={formData}
      />

      {isLoading && !analysis && (
        <Card className="mt-8">
          <CardContent className="pt-6 text-center">
            <div className="flex justify-center items-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
              <p className="text-lg">Generating query, please wait...</p>
            </div>
          </CardContent>
        </Card>
      )}

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
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleNavigate}
              size="lg"
              className="font-bold rounded-xl"
            >
              <Briefcase className="mr-2 h-5 w-5" />
              Analyze Job Description
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BooleanQueryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BooleanQueryComponent />
    </Suspense>
  );
}
