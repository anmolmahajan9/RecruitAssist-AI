'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobInputForm } from '@/components/job-input-form';
import { JobExplainerDisplay } from '@/components/job-explainer-display';
import { BooleanQueryDisplay } from '@/components/boolean-query-display';
import {
  type JobExplainerInput,
  type JobExplainerOutput,
} from '@/ai/schemas/job-explainer-schema';
import {
  type BooleanQueryInput,
  type BooleanQueryOutput,
} from '@/ai/schemas/boolean-query-schema';
import { runJobExplainer } from '@/ai/flows/job-explainer-flow';
import { runBooleanQuery } from '@/ai/flows/boolean-query-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import { useModel } from '@/context/ModelContext';
import { ModelSelector } from '@/components/model-selector';

function JobExplainerComponent() {
  const { selectedModel } = useModel();

  // Primary (Job Explainer) state
  const [jobExplanation, setJobExplanation] =
    useState<JobExplainerOutput | null>(null);
  const [isJobExplanationLoading, setIsJobExplanationLoading] = useState(false);
  const [jobExplanationError, setJobExplanationError] = useState<string | null>(
    null
  );

  // Secondary (Boolean Query) state
  const [booleanQueryAnalysis, setBooleanQueryAnalysis] =
    useState<BooleanQueryOutput | null>(null);
  const [isBooleanQueryLoading, setIsBooleanQueryLoading] = useState(false);
  const [booleanQueryError, setBooleanQueryError] = useState<string | null>(
    null
  );

  const [formData, setFormData] = useState<JobExplainerInput>({
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
      handleJobExplanation(newFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial load

  const handleJobExplanation = async (data: JobExplainerInput) => {
    setIsJobExplanationLoading(true);
    setJobExplanationError(null);
    setJobExplanation(null);
    setBooleanQueryAnalysis(null); // Clear secondary analysis
    setBooleanQueryError(null);

    try {
      const result = await runJobExplainer(selectedModel, data);
      setJobExplanation(result);
    } catch (err) {
      setJobExplanationError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsJobExplanationLoading(false);
    }
  };

  const handleBooleanQueryAnalysis = async (data: BooleanQueryInput) => {
    setIsBooleanQueryLoading(true);
    setBooleanQueryError(null);
    setBooleanQueryAnalysis(null);

    try {
      const result = await runBooleanQuery(selectedModel, data);
      setBooleanQueryAnalysis(result);
    } catch (err) {
      setBooleanQueryError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsBooleanQueryLoading(false);
    }
  };

  const handleFormSubmit = (data: JobExplainerInput) => {
    setFormData(data);
    router.push('/job-explainer'); // Clear params if any
    handleJobExplanation(data);
  };

  const handleReset = () => {
    setJobExplanation(null);
    setJobExplanationError(null);
    setIsJobExplanationLoading(false);
    setBooleanQueryAnalysis(null);
    setBooleanQueryError(null);
    setIsBooleanQueryLoading(false);
    setFormData({ jobTitle: '', jobDescription: '' });
    router.push('/job-explainer');
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
          <div className="flex items-center gap-2">
            <ModelSelector />
            <ThemeToggle />
          </div>
        </div>
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            Job Explainer
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Get a detailed breakdown of any job description.
          </p>
        </div>
      </header>

      <JobInputForm
        onSubmit={handleFormSubmit}
        isLoading={isJobExplanationLoading}
        onReset={handleReset}
        hasResults={!!jobExplanation || !!jobExplanationError}
        buttonText="Explain Job"
        loadingText="Explaining..."
        initialData={formData}
      />

      {jobExplanationError && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Job Explanation Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobExplanationError}</p>
          </CardContent>
        </Card>
      )}

      {jobExplanation && (
        <div className="mt-8">
          <JobExplainerDisplay explanation={jobExplanation} />
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => handleBooleanQueryAnalysis(formData)}
              disabled={isBooleanQueryLoading || !!booleanQueryAnalysis}
              size="lg"
              className="font-bold rounded-xl"
            >
              {isBooleanQueryLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Search className="mr-2 h-5 w-5" />
              )}
              {isBooleanQueryLoading
                ? 'Generating...'
                : booleanQueryAnalysis
                ? 'Query Generated'
                : 'Generate Boolean Query'}
            </Button>
          </div>
        </div>
      )}

      {booleanQueryError && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Boolean Query Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{booleanQueryError}</p>
          </CardContent>
        </Card>
      )}

      {booleanQueryAnalysis && (
        <div className="mt-8">
          <BooleanQueryDisplay analysis={booleanQueryAnalysis} />
        </div>
      )}
    </div>
  );
}

export default function JobExplainerPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JobExplainerComponent />
    </Suspense>
  );
}
