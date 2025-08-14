
'use client';

import { useState } from 'react';
import { CandidateRankerForm } from '@/components/candidate-ranker-form';
import { CandidateRankerDisplay } from '@/components/candidate-ranker-display';
import {
  type CandidateRankerInput,
  type CandidateRankerOutput,
} from '@/ai/schemas/candidate-ranker-schema';
import {
  type CandidateParserInput,
  type CandidateParserOutput,
} from '@/ai/schemas/candidate-parser-schema';
import { rankCandidates } from '@/ai/flows/candidate-ranker-flow';
import { parseCandidates } from '@/ai/flows/candidate-parser-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ChevronRight } from 'lucide-react';
import { type ParsedCandidate } from '@/ai/schemas/candidate-parser-schema';

export default function CandidateRankerPage() {
  const [analysis, setAnalysis] = useState<CandidateRankerOutput | null>(null);
  const [parsedCandidatesList, setParsedCandidatesList] = useState<
    ParsedCandidate[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobRequirements, setJobRequirements] = useState('');

  const handleFormSubmit = async (data: {
    jobTitle: string;
    jobRequirements: string;
    candidatesDetails: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setParsedCandidatesList([]);
    setJobRequirements(data.jobRequirements);

    try {
      // Step 1: Parse the unstructured candidate text
      const parserInput: CandidateParserInput = {
        candidatesDetails: data.candidatesDetails,
      };
      const parsedResult: CandidateParserOutput =
        await parseCandidates(parserInput);
      setParsedCandidatesList(parsedResult.parsedCandidates);

      // Step 2: Rank the parsed candidates
      const rankerInput: CandidateRankerInput = {
        jobTitle: data.jobTitle,
        jobRequirements: data.jobRequirements,
        candidatesJson: JSON.stringify(parsedResult.parsedCandidates, null, 2),
      };
      const rankerResult = await rankCandidates(rankerInput);

      // Ensure results are sorted by rank client-side for consistency
      rankerResult.rankedCandidates.sort((a, b) => a.rank - b.rank);
      setAnalysis(rankerResult);
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
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
    setJobRequirements('');
    setParsedCandidatesList([]);
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
            <span className="text-primary">Candidate Ranker</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <CandidateRankerForm
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        onReset={handleReset}
        hasResults={!!analysis || !!error}
      />

      {isLoading && !analysis && (
        <Card className="mt-8">
          <CardContent className="p-6 flex items-center justify-center">
            <Loader2 className="mr-2 h-8 w-8 animate-spin" />
            <span className="text-lg">
              Parsing and ranking candidates...
            </span>
          </CardContent>
        </Card>
      )}

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

      {analysis && (
        <div className="mt-8">
          <CandidateRankerDisplay
            analysis={analysis}
            jobRequirements={jobRequirements}
            parsedCandidates={parsedCandidatesList}
          />
        </div>
      )}
    </div>
  );
}
