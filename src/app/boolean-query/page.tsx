'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { JobInputForm } from '@/components/job-input-form';
import { BooleanQueryDisplay } from '@/components/boolean-query-display';
import { JobAnalysisDisplay } from '@/components/job-analysis-display';
import {
  type BooleanQueryInput,
  type BooleanQueryOutput,
} from '@/ai/schemas/boolean-query-schema';
import {
  type JobAnalysisInput,
  type JobAnalysisOutput,
} from '@/ai/schemas/job-analyzer-schema';
import { generateBooleanQuery } from '@/ai/flows/boolean-query-flow';
import { analyzeJobDescription } from '@/ai/flows/job-analyzer-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Briefcase, Loader2 } from 'lucide-react';

function BooleanQueryComponent() {
  // Primary (Boolean Query) state
  const [booleanQueryAnalysis, setBooleanQueryAnalysis] =
    useState<BooleanQueryOutput | null>(null);
  const [isBooleanQueryLoading, setIsBooleanQueryLoading] = useState(false);
  const [booleanQueryError, setBooleanQueryError] = useState<string | null>(
    null
  );

  // Secondary (Job Analysis) state
  const [jobAnalysis, setJobAnalysis] = useState<JobAnalysisOutput | null>(
    null
  );
  const [isJobAnalysisLoading, setIsJobAnalysisLoading] = useState(false);
  const [jobAnalysisError, setJobAnalysisError] = useState<string | null>(null);

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
    setJobAnalysis(null); // Clear secondary analysis
    setJobAnalysisError(null);

    try {
      const result = await generateBooleanQuery(data);
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

  const handleJobAnalysis = async (data: JobAnalysisInput) => {
    setIsJobAnalysisLoading(true);
    setJobAnalysisError(null);
    setJobAnalysis(null);

    try {
      const result = await analyzeJobDescription(data);
      setJobAnalysis(result);
    } catch (err) {
      setJobAnalysisError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsJobAnalysisLoading(false);
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
    setJobAnalysis(null);
    setJobAnalysisError(null);
    setIsJobAnalysisLoading(false);
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
              onClick={() => handleJobAnalysis(formData)}
              disabled={isJobAnalysisLoading || !!jobAnalysis}
              size="lg"
              className="font-bold rounded-xl"
            >
              {isJobAnalysisLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Briefcase className="mr-2 h-5 w-5" />
              )}
              {isJobAnalysisLoading
                ? 'Analyzing...'
                : jobAnalysis
                  ? 'Analysis Complete'
                  : 'Analyze Job Description'}
            </Button>
          </div>
        </div>
      )}

      {jobAnalysisError && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>Job Analysis Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{jobAnalysisError}</p>
          </CardContent>
        </Card>
      )}

      {jobAnalysis && (
        <div className="mt-8">
          <JobAnalysisDisplay analysis={jobAnalysis} />
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
