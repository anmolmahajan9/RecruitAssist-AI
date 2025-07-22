'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, XCircle } from 'lucide-react';
import type { CallSummaryInput } from '@/ai/schemas/call-summary-schema';

interface CallSummaryFormProps {
  onSubmit: (formData: CallSummaryInput) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
}

export function CallSummaryForm({
  onSubmit,
  isLoading,
  onReset,
  hasResults,
}: CallSummaryFormProps) {
  const [assessmentText, setAssessmentText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ callAssessmentText: assessmentText });
  };

  const handleReset = () => {
    setAssessmentText('');
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Enter Call Assessment
        </CardTitle>
        <CardDescription>
          Paste the raw assessment text from the call interview below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="callAssessmentText" className="font-semibold">
              Assessment Text
            </Label>
            <Textarea
              id="callAssessmentText"
              name="callAssessmentText"
              placeholder="Paste the entire call assessment here..."
              value={assessmentText}
              onChange={(e) => setAssessmentText(e.target.value)}
              required
              className="min-h-[250px] font-mono text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isLoading || !assessmentText}
              className="w-full text-lg py-6 font-bold transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Summarizing...' : 'Generate Client Summary'}
            </Button>
            {hasResults && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto text-lg py-6 font-bold rounded-xl"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Clear & Start Over
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  </change>
  <change>
    <file>src/components/call-summary-display.tsx</file>
    <content><![CDATA['use client';

import type { CallSummaryOutput } from '@/ai/schemas/call-summary-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileText, BookCheck } from 'lucide-react';
import { useState } from 'react';

interface CallSummaryDisplayProps {
  summary: CallSummaryOutput;
}

function CopyableBlock({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          {icon}
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-sm"
        >
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-lg border bg-secondary/30 p-4">
          {text}
        </div>
      </CardContent>
    </Card>
  );
}

export function CallSummaryDisplay({ summary }: CallSummaryDisplayProps) {
  if (!summary) return null;

  const fullTextToCopy = `Detailed Assessment:\n${summary.detailedAssessment}\n\nSummary:\n${summary.summary}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Client-Ready Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <CopyableBlock
              title="Detailed Assessment"
              text={summary.detailedAssessment}
              icon={<FileText className="w-6 h-6 text-primary" />}
            />
            <CopyableBlock
              title="Overall Summary"
              text={summary.summary}
              icon={<BookCheck className="w-6 h-6 text-primary" />}
            />
             <CopyableBlock
              title="Copy All"
              text={fullTextToCopy}
              icon={<Copy className="w-6 h-6 text-primary" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
