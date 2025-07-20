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
import {
  Loader2,
  Copy,
  Check,
  Briefcase,
  Code,
  FileText,
  BrainCircuit,
  Users,
  Baby,
  School,
} from 'lucide-react';

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
    <div className="space-y-4">
      {terms.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1 p-3 bg-secondary/50 rounded-lg"
        >
          <p className="md:col-span-1 font-semibold text-foreground">
            {item.term}
          </p>
          <p className="md:col-span-2 text-muted-foreground">
            {item.definition}
          </p>
        </div>
      ))}
    </div>
  );

  const renderTaskList = (tasks: string[]) => (
    <ul className="space-y-2 list-disc list-inside">
      {tasks.map((task, index) => (
        <li key={index} className="text-muted-foreground">
          {task}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Enter Job Details
          </CardTitle>
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
            <Button
              type="submit"
              disabled={
                isLoading || !formData.jobTitle || !formData.jobDescription
              }
              className="w-full text-lg py-6 font-bold transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Analyzing...' : 'Analyze Job'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-destructive/10 border-destructive/20 text-destructive-foreground">
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
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-primary" />
                Job Role Explained
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion
                type="multiple"
                defaultValue={['exp-easy', 'exp-intermediate', 'exp-recruiter']}
                className="space-y-2"
              >
                <AccordionItem value="exp-easy" className="border-0">
                  <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Baby className="w-6 h-6 text-primary" />
                      Easy explanation
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-2">
                    <p className="text-muted-foreground">
                      {analysis.JobRoleExplained.Easy}
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="exp-intermediate" className="border-0">
                  <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <School className="w-6 h-6 text-primary" />
                      Intermediate explanation
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-2">
                    <p className="text-muted-foreground">
                      {analysis.JobRoleExplained.Intermediate}
                    </p>
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="exp-recruiter" className="border-0">
                  <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="w-6 h-6 text-primary" />
                      Recruiter explanation
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 pt-2">
                    <p className="text-muted-foreground">
                      {analysis.JobRoleExplained.Recruiter}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <BrainCircuit className="w-7 h-7 text-primary" />
                Technical Terms & Jargon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-bold mb-3 pb-2 border-b">
                  Specific
                </h4>
                {renderTermList(analysis.TechnicalTermsAndJargon.SpecificToRole)}
              </div>
              <div>
                <h4 className="text-lg font-bold mb-3 mt-6 pb-2 border-b">
                  General
                </h4>
                {renderTermList(analysis.TechnicalTermsAndJargon.GeneralTerms)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <FileText className="w-7 h-7 text-primary" />
                Key Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-lg font-bold mb-3 pb-2 border-b">
                  Specific Tasks
                </h4>
                {renderTaskList(analysis.Tasks.SpecificTasks)}
              </div>
              <div>
                <h4 className="text-lg font-bold mb-3 mt-6 pb-2 border-b">
                  General Tasks
                </h4>
                {renderTaskList(analysis.Tasks.GeneralTasks)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl font-bold">
                  Boolean Query
                </CardTitle>
              </div>
              <CardDescription>
                A ready-to-use search query to find the best candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative p-4 bg-secondary/50 rounded-lg border">
                <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">
                  {analysis.BooleanQuery}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-accent"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
