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
              {isLoading ? 'Summarizing...' : 'Generate Summary'}
            </Button>
            {hasResults && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto text-lg py-6 font-bold rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Clear & Start Over
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
