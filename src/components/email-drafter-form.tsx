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
import type { EmailDrafterInput } from '@/ai/schemas/email-drafter-schema';

interface EmailDrafterFormProps {
  onSubmit: (formData: EmailDrafterInput) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
}

const placeholderText = `Client: Ravi
Role: Senior Frontend Developer
Comments: Combine both tables

Candidate | Experience | Availability
--- | --- | ---
John Doe | 8 Years | Next Monday
Jane Smith | 6 Years | Immediate
`;

export function EmailDrafterForm({
  onSubmit,
  isLoading,
  onReset,
  hasResults,
}: EmailDrafterFormProps) {
  const [unstructuredText, setUnstructuredText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ unstructuredText });
  };

  const handleReset = () => {
    setUnstructuredText('');
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Enter Submission Details
        </CardTitle>
        <CardDescription>
          Paste the client name, role, and candidate table below. The AI will
          generate the email text around your table.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="unstructuredText" className="font-semibold">
              Submission Details
            </Label>
            <Textarea
              id="unstructuredText"
              name="unstructuredText"
              placeholder={placeholderText}
              value={unstructuredText}
              onChange={(e) => setUnstructuredText(e.target.value)}
              required
              className="min-h-[250px] font-mono text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isLoading || !unstructuredText}
              className="w-full text-lg py-6 font-bold transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Drafting...' : 'Draft Email'}
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
  );
}
