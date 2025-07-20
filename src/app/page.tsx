'use client';

import { useState } from 'react';
import { JobForm } from '@/components/JobForm';
import { AnalysisResults } from '@/components/AnalysisResults';
import { getAnalysisAction } from '@/app/actions';
import type { AnalysisResult } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Terminal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export default function Home() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { jobTitle: string; jobDescription: string }) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await getAnalysisAction(values);
      setAnalysis(result);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-1/3 rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
      </Card>
      <Card className="p-6">
        <Skeleton className="h-8 w-1/2 rounded-lg" />
      </Card>
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-3xl space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">
            RecruitAssist AI
          </h1>
          <p className="text-muted-foreground mt-2">
            Simplify job descriptions and build powerful search queries with AI.
          </p>
        </header>
        
        <JobForm onSubmit={handleSubmit} isLoading={isLoading} />

        {isLoading && <LoadingSkeleton />}
        
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {analysis && !isLoading && <AnalysisResults result={analysis} />}
      </div>
    </main>
  );
}
