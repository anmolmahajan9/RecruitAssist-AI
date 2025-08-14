
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobInputForm } from '@/components/job-input-form';
import { BooleanQueryDisplay } from '@/components/boolean-query-display';
import { JobExplainerDisplay } from '@/components/job-explainer-display';
import {
  type BooleanQueryInput,
  type BooleanQueryOutput,
} from '@/ai/schemas/boolean-query-schema';
import {
  type JobExplainerInput,
  type JobExplainerOutput,
} from '@/ai/schemas/job-explainer-schema';
import { runBooleanQuery } from '@/ai/flows/boolean-query-flow';
import { runJobExplainer } from '@/ai/flows/job-explainer-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';
import { useModel } from '@/context/ModelContext';
import { ModelSelector } from '@/components/model-selector';

function BooleanQueryComponent() {
  const { selectedModel } = useModel();

  // Primary (Boolean Query) state
  const [booleanQueryAnalysis, setBooleanQueryAnalysis] =
    useState<BooleanQueryOutput | null>(null);
  const [isBooleanQueryLoading, setIsBooleanQueryLoading] = useState(false);
  const [booleanQueryError, setBooleanQueryError] = useState<string | null>(
    null
  );

  // Secondary (Job Explainer) state
  const [jobExplanation, setJobExplanation] =
    useState<JobExplainerOutput | null>(null);
  const [isJobExplanationLoading, setIsJobExplanationLoading] = useState(false);
  const [jobExplanationError, setJobExplanationError] = useState<
    string | null
  >(null);

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
      handleBooleanQueryAnalysis(newFormData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on initial load

  const handleBooleanQueryAnalysis = async (data: BooleanQueryInput) => {
    setIsBooleanQueryLoading(true);
    setBooleanQueryError(null);
    setBooleanQueryAnalysis(null);
    setJobExplanation(null); // Clear secondary analysis
    setJobExplanationError(null);

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

  const handleJobExplanation = async (data: JobExplainerInput) => {
    setIsJobExplanationLoading(true);
    setJobExplanationError(null);
    setJobExplanation(null);

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

  const handleFormSubmit = (data: BooleanQueryInput) => {
    setFormData(data);
    router.push('/boolean-query'); // Clear params if any
    handleBooleanQueryAnalysis(data);
  };

  const handleReset = () => {
    setBooleanQueryAnalysis(null);
    setBooleanQueryError(null);
    setIsBooleanQueryLoading(false);
    setJobExplanation(null);
    setJobExplanationError(null);
    setIsJobExplanationLoading(false);
    setFormData({ jobTitle: '', jobDescription: '' });
    router.push('/boolean-query');
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
            Boolean Query Helper
          </h1>
        </div>
      </header>

      <JobInputForm
        onSubmit={handleFormSubmit}
        isLoading={isBooleanQueryLoading}
        onReset={handleReset}
        hasResults={!!booleanQueryAnalysis || !!booleanQueryError}
        buttonText="Generate Query"
        loadingText="Generating..."
        initialData={formData}
      />

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
          <div className="mt-6 flex justify-end">
            <Button
              onClick={() => handleJobExplanation(formData)}
              disabled={isJobExplanationLoading || !!jobExplanation}
              size="lg"
              className="font-bold rounded-xl"
            >
              {isJobExplanationLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Briefcase className="mr-2 h-5 w-5" />
              )}
              {isJobExplanationLoading
                ? 'Explaining...'
                : jobExplanation
                ? 'Explanation Complete'
                : 'Explain Job Description'}
            </Button>
          </div>
        </div>
      )}

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
