
'use client';

import { useState, useRef, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Loader2,
  XCircle,
  File as FileIcon,
  UploadCloud,
  Download,
  Combine,
  FileText,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportGeneratorFormProps {
  onGenerate: (
    assessmentText: string,
    reportType: 'combined' | 'separate' | 'assessment_only',
    resumeFile: File | null
  ) => Promise<void>;
  onReset: () => void;
  isLoading: boolean;
  isProcessingPdf: boolean;
  hasResults: boolean;
}

export function ReportGeneratorForm({
  onGenerate,
  onReset,
  isLoading,
  isProcessingPdf,
  hasResults,
}: ReportGeneratorFormProps) {
  const [assessmentText, setAssessmentText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [reportType, setReportType] = useState<
    'combined' | 'separate' | 'assessment_only'
  >('separate');
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf') {
        setResumeFile(file);
        setError(null);
      } else {
        setError('Please upload a valid PDF file for the resume.');
        setResumeFile(null);
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      if (files[0].type === 'application/pdf') {
        setResumeFile(files[0]);
        setError(null);
      } else {
        setError('Please upload a valid PDF file for the resume.');
        setResumeFile(null);
      }
    }
  }, []);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleReset = () => {
    setAssessmentText('');
    setResumeFile(null);
    setReportType('separate');
    setError(null);
    onReset();
  };

  const handleProcessRequest = async () => {
    onGenerate(assessmentText, reportType, resumeFile);
  };

  const isButtonDisabled =
    isLoading ||
    isProcessingPdf ||
    !assessmentText ||
    (reportType !== 'assessment_only' && !resumeFile);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Enter Assessment and Resume
        </CardTitle>
        <CardDescription>
          Provide the assessment text and optionally upload a resume to
          generate a combined report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="font-semibold">1. Report Type</Label>
          <RadioGroup
            value={reportType}
            onValueChange={(value) =>
              setReportType(
                value as 'combined' | 'separate' | 'assessment_only'
              )
            }
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <Label htmlFor="r-separate">
              <Card
                className={cn(
                  'cursor-pointer h-full p-4 flex flex-col items-center justify-center text-center transition-colors border-2',
                  reportType === 'separate'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
              >
                <RadioGroupItem
                  value="separate"
                  id="r-separate"
                  className="sr-only"
                />
                <Server className="w-10 h-10 mb-2 text-primary" />
                <span className="font-semibold">
                  Assessment + Resume (Separate)
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Downloads two separate PDFs.
                </span>
              </Card>
            </Label>
            <Label htmlFor="r-combined">
              <Card
                className={cn(
                  'cursor-pointer h-full p-4 flex flex-col items-center justify-center text-center transition-colors border-2',
                  reportType === 'combined'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
              >
                <RadioGroupItem
                  value="combined"
                  id="r-combined"
                  className="sr-only"
                />
                <Combine className="w-10 h-10 mb-2 text-primary" />
                <span className="font-semibold">
                  Assessment + Resume (Combined)
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Generates a single report.
                </span>
              </Card>
            </Label>
            <Label htmlFor="r-assessment-only">
              <Card
                className={cn(
                  'cursor-pointer h-full p-4 flex flex-col items-center justify-center text-center transition-colors border-2',
                  reportType === 'assessment_only'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
              >
                <RadioGroupItem
                  value="assessment_only"
                  id="r-assessment-only"
                  className="sr-only"
                />
                <FileText className="w-10 h-10 mb-2 text-primary" />
                <span className="font-semibold">Assessment Only</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Generates the assessment PDF.
                </span>
              </Card>
            </Label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="callAssessmentText" className="font-semibold">
            2. Assessment Text
          </Label>
          <Textarea
            id="callAssessmentText"
            name="callAssessmentText"
            placeholder="Paste the entire call assessment here..."
            value={assessmentText}
            onChange={(e) => setAssessmentText(e.target.value)}
            required
            className="min-h-[200px] font-mono text-sm"
          />
        </div>

        {reportType !== 'assessment_only' && (
          <div className="space-y-2">
            <Label htmlFor="resumeFile" className="font-semibold">
              3. Candidate Resume
            </Label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                dragging ? 'border-primary bg-accent' : 'border-border',
                'hover:border-primary hover:bg-primary/10 cursor-pointer'
              )}
            >
              <Input
                id="resumeFile"
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
              />
              {resumeFile ? (
                <div className="flex items-center justify-center gap-2 text-foreground">
                  <FileIcon className="h-6 w-6" />
                  <span className="font-medium">{resumeFile.name}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2">
                  <UploadCloud className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{' '}
                    or drag and drop resume PDF
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4">
        <Button
          onClick={handleProcessRequest}
          disabled={isButtonDisabled}
          className="w-full text-lg py-6 font-bold"
          size="lg"
        >
          {isLoading || isProcessingPdf ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {isLoading
            ? 'Running AI...'
            : isProcessingPdf
              ? 'Generating PDF...'
              : 'Generate and Download'}
        </Button>
        {(hasResults || assessmentText || resumeFile) && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="w-full sm:w-auto text-lg py-6 font-bold rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
          >
            <XCircle className="mr-2 h-5 w-5" />
            Clear
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
