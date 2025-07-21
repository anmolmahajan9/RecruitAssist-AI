'use client';

import { useState } from 'react';
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
import type { CandidateRankerInput } from '@/ai/schemas/candidate-ranker-schema';

interface CandidateRankerFormProps {
  onSubmit: (formData: CandidateRankerInput) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
}

const placeholderJson = JSON.stringify(
  [
    {
      "name": "Alice Johnson",
      "experience": "5 years in frontend development",
      "skills": ["React", "TypeScript", "Next.js", "CSS"]
    },
    {
      "name": "Bob Williams",
      "experience": "3 years in full-stack development",
      "skills": ["React", "Node.js", "GraphQL", "Docker"]
    }
  ],
  null,
  2
);


export function CandidateRankerForm({
  onSubmit,
  isLoading,
  onReset,
  hasResults,
}: CandidateRankerFormProps) {
  const [formData, setFormData] = useState<CandidateRankerInput>({
    jobTitle: '',
    jobRequirements: '',
    candidatesJson: placeholderJson,
  });

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
    setFormData({
      jobTitle: '',
      jobRequirements: '',
      candidatesJson: placeholderJson,
    });
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Enter Details</CardTitle>
        <CardDescription>
          Provide job details and a list of candidates in JSON format.
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
              placeholder="e.g., Senior React Developer"
              value={formData.jobTitle}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobRequirements" className="font-semibold">
              Job Requirements
            </Label>
            <Textarea
              id="jobRequirements"
              name="jobRequirements"
              placeholder="e.g., 5+ years of React experience, proficiency in TypeScript, experience with state management..."
              value={formData.jobRequirements}
              onChange={handleInputChange}
              required
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidatesJson" className="font-semibold">
              Candidates (JSON Array)
            </Label>
            <Textarea
              id="candidatesJson"
              name="candidatesJson"
              placeholder="Paste an array of candidate objects here..."
              value={formData.candidatesJson}
              onChange={handleInputChange}
              required
              className="min-h-[250px] font-mono text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.jobTitle ||
                !formData.jobRequirements ||
                !formData.candidatesJson
              }
              className="w-full text-lg py-6 font-bold transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Ranking...' : 'Rank Candidates'}
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
