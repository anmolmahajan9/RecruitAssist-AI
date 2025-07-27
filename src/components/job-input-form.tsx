'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import type { JobExplainerInput } from '@/ai/schemas/job-explainer-schema';

interface JobInputFormProps {
  onSubmit: (formData: JobExplainerInput) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
  buttonText: string;
  loadingText: string;
  initialData?: JobExplainerInput;
}

export function JobInputForm({
  onSubmit,
  isLoading,
  onReset,
  hasResults,
  buttonText,
  loadingText,
  initialData,
}: JobInputFormProps) {
  const [formData, setFormData] = useState<JobExplainerInput>({
    jobTitle: '',
    jobDescription: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({ jobTitle: '', jobDescription: '' });
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Enter Job Details</CardTitle>
        <CardDescription>
          Provide a job title and description to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="jobTitle" className="font-semibold">
              Job Title
            </Label>
            <Input
              id="jobTitle"
              name="jobTitle"
              placeholder="e.g., Senior Software Engineer"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription" className="font-semibold">
              Job Description
            </Label>
            <Textarea
              id="jobDescription"
              name="jobDescription"
              placeholder="Paste the job description here..."
              value={formData.jobDescription}
              onChange={handleInputChange}
              required
              className="min-h-[150px]"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={
                isLoading || !formData.jobTitle || !formData.jobDescription
              }
              className="w-full text-lg py-6 font-bold transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? loadingText : buttonText}
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
