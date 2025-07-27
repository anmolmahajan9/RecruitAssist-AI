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

interface CandidateRankerFormProps {
  onSubmit: (formData: {
    jobTitle: string;
    jobRequirements: string;
    candidatesDetails: string;
  }) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
}

const placeholderText = `Alice Johnson
Frontend Developer with 5 years of experience in React, TypeScript, and Next.js. Lives in New York, wants to work in San Francisco. CTC: 120k USD.

---

Bob Williams
Full-stack developer skilled in React, Node.js, and GraphQL. 3 years exp. Based in Chicago.
`;

export function CandidateRankerForm({
  onSubmit,
  isLoading,
  onReset,
  hasResults,
}: CandidateRankerFormProps) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    jobRequirements: '',
    candidatesDetails: '',
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
      candidatesDetails: '',
    });
    onReset();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Enter Details</CardTitle>
        <CardDescription>
          Provide job details and paste the candidate information below.
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
              placeholder="List each requirement on a new line for best results..."
              value={formData.jobRequirements}
              onChange={handleInputChange}
              required
              className="min-h-[120px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="candidatesDetails" className="font-semibold">
              Candidate Details
            </Label>
            <Textarea
              id="candidatesDetails"
              name="candidatesDetails"
              placeholder={placeholderText}
              value={formData.candidatesDetails}
              onChange={handleInputChange}
              required
              className="min-h-[250px] font-mono text-sm"
            />
             <p className="text-xs text-muted-foreground">
              You can paste multiple resumes or candidate summaries here. Separate each candidate with "---" for best results.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.jobTitle ||
                !formData.jobRequirements ||
                !formData.candidatesDetails
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
