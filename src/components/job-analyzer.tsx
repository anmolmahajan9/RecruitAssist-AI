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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  type JobAnalysisInput,
  type JobAnalysisOutput,
} from '@/ai/schemas/job-analyzer-schema';
import { analyzeJobDescription } from '@/ai/flows/job-analyzer-flow';
import { Loader2, Copy, Check } from 'lucide-react';

export function JobAnalyzer() {
  const [formData, setFormData] = useState<JobAnalysisInput>({
    jobTitle: '',
    jobDescription: '',
  });
  const [analysis, setAnalysis] = useState<JobAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeJobDescription(formData);
      setAnalysis(result);
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

  const handleCopy = () => {
    if (!analysis?.BooleanQuery) return;
    navigator.clipboard.writeText(analysis.BooleanQuery);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTermList = (
    terms: { term: string; definition: string }[]
  ) => (
    <ul className="space-y-3">
      {terms.map((item, index) => (
        <li key={index}>
          <p className="font-semibold text-gray-800">{item.term}</p>
          <p className="text-gray-600">{item.definition}</p>
        </li>
      ))}
    </ul>
  );

  const renderTaskList = (tasks: string[]) => (
    <ul className="space-y-2 list-disc list-inside">
      {tasks.map((task, index) => (
        <li key={index} className="text-gray-600">
          {task}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-xl overflow-hidden">
        <CardHeader>
          <CardTitle>Enter Job Details</CardTitle>
          <CardDescription>
            Provide a job title and description to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
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
              <Label htmlFor="jobDescription">Job Description</Label>
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
            <Button
              type="submit"
              disabled={isLoading || !formData.jobTitle || !formData.jobDescription}
              className="w-full"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isLoading ? 'Analyzing...' : 'Analyze Job'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-50 border-red-200 text-red-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {analysis && (
        <div className="space-y-6">
          <Card className="shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle>Boolean Query for Naukri.com</CardTitle>
              <CardDescription>
                A ready-to-use search query to find the best candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-mono text-gray-700">
                  {analysis.BooleanQuery}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-gray-500 hover:bg-gray-200"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Accordion
            type="multiple"
            className="space-y-6"
            defaultValue={['item-1', 'item-2', 'item-3']}
          >
            <AccordionItem value="item-1" className="bg-white shadow-lg rounded-xl border-none">
              <AccordionTrigger className="p-6 font-semibold text-lg">Job Role Explained</AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-4">
                <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2">For a 5-year-old:</h4>
                  <p className="text-gray-600">{analysis.JobRoleExplained.Easy}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2">For a College Undergrad:</h4>
                  <p className="text-gray-600">{analysis.JobRoleExplained.Intermediate}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2">For a Recruiter:</h4>
                  <p className="text-gray-600">{analysis.JobRoleExplained.Recruiter}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-white shadow-lg rounded-xl border-none">
              <AccordionTrigger className="p-6 font-semibold text-lg">Technical Terms & Jargon</AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-4">
                 <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2">Most Specific to the Role</h4>
                  {renderTermList(analysis.TechnicalTermsAndJargon.SpecificToRole)}
                </div>
                 <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2 mt-4">General Terms</h4>
                  {renderTermList(analysis.TechnicalTermsAndJargon.GeneralTerms)}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white shadow-lg rounded-xl border-none">
              <AccordionTrigger className="p-6 font-semibold text-lg">Key Tasks</AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-4">
                <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2">Specific Tasks</h4>
                  {renderTaskList(analysis.Tasks.SpecificTasks)}
                </div>
                 <div>
                  <h4 className="font-semibold text-md text-gray-800 mb-2 mt-4">General Tasks</h4>
                  {renderTaskList(analysis.Tasks.GeneralTasks)}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </div>
  );
}
