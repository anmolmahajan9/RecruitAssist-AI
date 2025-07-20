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
import { Loader2, Copy, Check, Briefcase, Code, FileText, BrainCircuit } from 'lucide-react';

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
        <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1 p-3 bg-slate-50 rounded-lg">
          <p className="md:col-span-1 font-semibold text-slate-800">{item.term}</p>
          <p className="md:col-span-2 text-slate-600">{item.definition}</p>
        </div>
      ))}
    </div>
  );

  const renderTaskList = (tasks: string[]) => (
    <ul className="space-y-2 list-disc list-inside">
      {tasks.map((task, index) => (
        <li key={index} className="text-slate-600">
          {task}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="space-y-8">
      <Card className="shadow-lg rounded-xl overflow-hidden border-0">
        <CardHeader>
          <CardTitle className="text-2xl">Enter Job Details</CardTitle>
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
                className="bg-slate-50"
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
                className="min-h-[150px] bg-slate-50"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !formData.jobTitle || !formData.jobDescription}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isLoading && (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
          <Card className="shadow-lg rounded-xl border-0">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-primary"/>
                <CardTitle className="text-2xl">Boolean Query for Naukri.com</CardTitle>
              </div>
              <CardDescription>
                A ready-to-use search query to find the best candidates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-mono text-slate-700 whitespace-pre-wrap break-words">
                  {analysis.BooleanQuery}
                </p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 text-slate-500 hover:bg-slate-200"
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
              <AccordionTrigger className="p-6 text-lg">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-6 h-6 text-primary"/>
                  Job Role Explained
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-4">
                <div>
                  <h4 className="font-semibold text-md text-slate-800 mb-2">For a 5-year-old:</h4>
                  <p className="text-slate-600">{analysis.JobRoleExplained.Easy}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md text-slate-800 mb-2">For a College Undergrad:</h4>
                  <p className="text-slate-600">{analysis.JobRoleExplained.Intermediate}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-md text-slate-800 mb-2">For a Recruiter:</h4>
                  <p className="text-slate-600">{analysis.JobRoleExplained.Recruiter}</p>
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="item-2" className="bg-white shadow-lg rounded-xl border-none">
              <AccordionTrigger className="p-6 text-lg">
                 <div className="flex items-center gap-3">
                  <BrainCircuit className="w-6 h-6 text-primary"/>
                  Technical Terms & Jargon
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-6">
                 <div>
                  <h4 className="font-bold text-lg text-slate-800 mb-3 pb-2 border-b">Most Specific to the Role</h4>
                  {renderTermList(analysis.TechnicalTermsAndJargon.SpecificToRole)}
                </div>
                 <div>
                  <h4 className="font-bold text-lg text-slate-800 mb-3 mt-6 pb-2 border-b">General Terms</h4>
                  {renderTermList(analysis.TechnicalTermsAndJargon.GeneralTerms)}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="bg-white shadow-lg rounded-xl border-none">
              <AccordionTrigger className="p-6 text-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-primary"/>
                  Key Tasks
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-6 pt-0 space-y-6">
                <div>
                  <h4 className="font-bold text-lg text-slate-800 mb-3 pb-2 border-b">Specific Tasks</h4>
                  {renderTaskList(analysis.Tasks.SpecificTasks)}
                </div>
                 <div>
                  <h4 className="font-bold text-lg text-slate-800 mb-3 mt-6 pb-2 border-b">General Tasks</h4>
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
