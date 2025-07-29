
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
} from 'lucide-react';
import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFFont,
  PDFPage,
} from 'pdf-lib';
import { assessInterview } from '@/ai/flows/interview-assessment-flow';
import type { InterviewAssessmentOutput } from '@/ai/schemas/interview-assessment-schema';
import { cn } from '@/lib/utils';

const DEFAULT_LOGO_URL = 'https://recruitassist-ai-knbnk.web.app/logo.png';

export function ReportGenerator() {
  const [assessmentText, setAssessmentText] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [includeResume, setIncludeResume] = useState<'yes' | 'no'>('yes');
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(false);
    setError(null);
    setIncludeResume('yes');
  };

  const handleProcessRequest = async () => {
    if (!assessmentText || (includeResume === 'yes' && !resumeFile)) {
      setError('Please provide the assessment text and a resume PDF.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Generate Assessment PDF
      const assessmentResult = await assessInterview({
        callAssessmentText: assessmentText,
      });
      const assessmentPdfBytes = await createAssessmentPdf(assessmentResult);

      let finalPdfBytes: Uint8Array;

      if (includeResume === 'yes' && resumeFile) {
        // Step 2: Watermark Resume
        const resumeBytes = await resumeFile.arrayBuffer();
        const watermarkedResumeBytes = await watermarkPdf(resumeBytes);

        // Step 3: Combine PDFs
        const assessmentPdfDoc = await PDFDocument.load(assessmentPdfBytes);
        const resumePdfDoc = await PDFDocument.load(watermarkedResumeBytes);

        const combinedPdfDoc = await PDFDocument.create();

        const assessmentPages = await combinedPdfDoc.copyPages(
          assessmentPdfDoc,
          assessmentPdfDoc.getPageIndices()
        );
        assessmentPages.forEach((page) => combinedPdfDoc.addPage(page));

        const resumePages = await combinedPdfDoc.copyPages(
          resumePdfDoc,
          resumePdfDoc.getPageIndices()
        );
        resumePages.forEach((page) => combinedPdfDoc.addPage(page));

        finalPdfBytes = await combinedPdfDoc.save();
      } else {
        finalPdfBytes = assessmentPdfBytes;
      }

      // Step 4: Download
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const candidateName = assessmentResult.candidate_name.replace(
        /\s+/g,
        '_'
      );
      const jobName = assessmentResult.interviewed_role.replace(/\s+/g, '_');
      link.download = `${candidateName}-${jobName}-suitable-ai.pdf`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const watermarkPdf = async (pdfBytes: ArrayBuffer): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const response = await fetch(DEFAULT_LOGO_URL);
    if (!response.ok) {
      throw new Error(`Failed to load default logo: ${response.statusText}`);
    }
    const imageBytes = await response.arrayBuffer();
    const watermarkImage = await pdfDoc.embedPng(imageBytes);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      const logoDims = watermarkImage.scale(0.08);
      page.drawImage(watermarkImage, {
        x: width - logoDims.width - 20,
        y: height - logoDims.height - 20,
        width: logoDims.width,
        height: logoDims.height,
        opacity: 0.5,
      });
    }
    return pdfDoc.save();
  };

  const createAssessmentPdf = async (
    assessment: InterviewAssessmentOutput
  ): Promise<Uint8Array> => {
    const {
      candidate_name,
      interviewed_role,
      client_name,
      interview_datetime,
      overall_status,
      assessment_criteria,
      interview_summary,
    } = assessment;

    const pdfDoc = await PDFDocument.create();

    const addWatermark = async (doc: PDFDocument) => {
      const response = await fetch(DEFAULT_LOGO_URL);
      if (!response.ok) {
        throw new Error(`Failed to load default logo: ${response.statusText}`);
      }
      const imageBytes = await response.arrayBuffer();
      const watermarkImage = await doc.embedPng(imageBytes);
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const logoDims = watermarkImage.scale(0.08);
        page.drawImage(watermarkImage, {
          x: width - logoDims.width - 20,
          y: height - logoDims.height - 20,
          width: logoDims.width,
          height: logoDims.height,
          opacity: 0.5,
        });
      }
    };

    let page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 50;
    const contentWidth = width - margin * 2;
    let y = height - margin - 50; // Extra space for watermark

    const wrapText = (
      text: string,
      font: PDFFont,
      fontSize: number,
      maxWidth: number
    ): string[] => {
      const lines: string[] = [];
      if (!text) return lines;

      const paragraphs = text.split('\n');
      for (const paragraph of paragraphs) {
        if (paragraph.trim() === '') {
          lines.push('');
          continue;
        }
        let currentLine = '';
        const words = paragraph.split(' ');
        for (const word of words) {
          const potentialLine =
            currentLine === '' ? word : `${currentLine} ${word}`;
          const width = font.widthOfTextAtSize(potentialLine, fontSize);

          if (width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = potentialLine;
          }
        }
        lines.push(currentLine);
      }
      return lines;
    };

    const checkPageBreak = (spaceNeeded: number) => {
      if (y - spaceNeeded < margin) {
        page = pdfDoc.addPage();
        y = height - margin - 50; // Extra space for watermark
        return true;
      }
      return false;
    };

    const textPrimary = rgb(0.1, 0.1, 0.1);
    const textSecondary = rgb(0.4, 0.4, 0.4);
    const green = rgb(34 / 255, 197 / 255, 94 / 255);
    const red = rgb(239 / 255, 68 / 255, 68 / 255);
    const barBg = rgb(224 / 255, 224 / 255, 224 / 255);
    const borderColor = rgb(0.9, 0.9, 0.9);
    const yellow = rgb(253 / 255, 186 / 255, 116 / 255);
    const headerBgColor = rgb(220 / 255, 237 / 255, 248 / 255);
    const containerRadius = 8;
    const barHeight = 6;

    const passPillFill = rgb(217 / 255, 249 / 255, 230 / 255);
    const passPillBorder = rgb(52 / 255, 211 / 255, 153 / 255);
    const passPillText = rgb(5 / 255, 150 / 255, 105 / 255);
    const failPillFill = rgb(255 / 255, 200 / 255, 200 / 255);
    const failPillBorder = rgb(150 / 255, 30 / 255, 30 / 255);
    const failPillText = rgb(100 / 255, 0 / 255, 0 / 255);

    const drawPill = (
      x: number,
      y: number,
      pillWidth: number,
      pillHeight: number,
      color: any
    ) => {
      const radius = pillHeight / 2;

      if (pillWidth < pillHeight) {
        if (pillWidth > 0)
          page.drawCircle({ x: x + radius, y: y + radius, size: radius, color });
        return;
      }

      page.drawCircle({ x: x + radius, y: y + radius, size: radius, color });
      page.drawCircle({
        x: x + pillWidth - radius,
        y: y + radius,
        size: radius,
        color,
      });
      page.drawRectangle({
        x: x + radius,
        y: y,
        width: pillWidth - 2 * radius,
        height: pillHeight,
        color,
      });
    };

    // --- Draw Header ---
    const headerHeight = 120;
    if (checkPageBreak(headerHeight + 20)) y = height - margin;
    const headerStartY = y;

    page.drawRectangle({
      x: margin,
      y: y - headerHeight,
      width: contentWidth,
      height: headerHeight,
      color: headerBgColor,
      // No border for this style
    });

    y -= 40;
    page.drawText(candidate_name, {
      x: margin + 20,
      y,
      font: boldFont,
      size: 30,
      color: textPrimary,
    });
    y -= 25;
    if (client_name) {
      page.drawText(client_name, {
        x: margin + 20,
        y,
        font: boldFont,
        size: 14,
        color: textSecondary,
      });
      y -= 18;
    }
    page.drawText(interviewed_role, {
      x: margin + 20,
      y,
      font: font,
      size: 14,
      color: textSecondary,
    });
    y -= 18;
    page.drawText(interview_datetime, {
      x: margin + 20,
      y,
      font: font,
      size: 14,
      color: textSecondary,
    });

    const status = overall_status.toLowerCase();
    const statusText = overall_status;
    const statusTextWidth = boldFont.widthOfTextAtSize(statusText, 12);

    const pillWidth = statusTextWidth + 40;
    const pillHeight = 25;
    const pillX = width - margin - pillWidth - 30;
    const pillY = headerStartY - headerHeight / 2 - pillHeight / 2;

    page.drawRectangle({
      x: pillX,
      y: pillY,
      width: pillWidth,
      height: pillHeight,
      color: status === 'pass' ? passPillFill : failPillFill,
      borderColor: status === 'pass' ? passPillBorder : failPillBorder,
      borderWidth: 1.5,
      borderRadius: pillHeight / 2,
    });

    page.drawText(statusText, {
      x: pillX + (pillWidth - statusTextWidth) / 2,
      y: pillY + (pillHeight - 10) / 2,
      font: boldFont,
      size: 12,
      color: status === 'pass' ? passPillText : failPillText,
    });

    y = headerStartY - headerHeight - 20;

    // --- Draw Interview Summary ---
    const summaryTitle = 'Interview Summary';
    const summaryLines = wrapText(
      interview_summary,
      font,
      10,
      contentWidth - 40
    );
    const summaryHeight = 20 + 20 + 15 + summaryLines.length * 14 + 15;

    if (checkPageBreak(summaryHeight + 20)) y = height - margin;
    const summaryStartY = y;

    page.drawRectangle({
      x: margin,
      y: summaryStartY - summaryHeight,
      width: contentWidth,
      height: summaryHeight,
      borderColor: borderColor,
      borderWidth: 1,
      borderRadius: containerRadius,
    });

    y -= 30; // Increased top padding
    page.drawText(summaryTitle, {
      x: margin + 20,
      y,
      font: boldFont,
      size: 16,
      color: textPrimary,
    });
    y -= 25; // Increased space after title

    for (const line of summaryLines) {
      if (checkPageBreak(14)) y = height - margin - 50;
      page.drawText(line, {
        x: margin + 20,
        y,
        font: font,
        size: 10,
        color: textSecondary,
        lineHeight: 14,
      });
      y -= 14;
    }
    y = summaryStartY - summaryHeight - 20;

    // --- Draw Detailed Assessment ---
    const filteredCriteria = assessment_criteria.filter(
      (item) => item.criterion.toLowerCase() !== 'job fit'
    );

    for (const item of filteredCriteria) {
      const assessmentLines = wrapText(
        item.assessment,
        font,
        10,
        contentWidth - 40
      );
      const PADDING_V = 20;
      const SPACE_TITLE_BAR = 12;
      const SPACE_BAR_TEXT = 12;
      const blockHeight =
        PADDING_V +
        12 +
        SPACE_TITLE_BAR +
        barHeight +
        SPACE_BAR_TEXT +
        assessmentLines.length * 14 +
        PADDING_V;

      if (checkPageBreak(blockHeight)) y = height - margin - 50;

      const startBlockY = y;

      page.drawRectangle({
        x: margin,
        y: startBlockY - blockHeight,
        width: contentWidth,
        height: blockHeight,
        borderColor: borderColor,
        borderWidth: 1,
        borderRadius: containerRadius,
      });

      y -= PADDING_V; // top padding

      // Draw title and score
      y -= 12; // Height of title text
      page.drawText(item.criterion, {
        x: margin + 20,
        y,
        font: boldFont,
        size: 12,
        color: textPrimary,
      });

      const barColor =
        item.score >= 3 ? green : item.score >= 2 ? yellow : red;

      const scoreText = `${item.score}/5`;
      const scoreWidth = boldFont.widthOfTextAtSize(scoreText, 12);
      page.drawText(scoreText, {
        x: width - margin - scoreWidth - 20,
        y,
        font: boldFont,
        size: 12,
        color: barColor,
      });

      y -= SPACE_TITLE_BAR;

      // Draw progress bar
      const barWidth = contentWidth - 40;
      const filledWidth = (item.score / 5) * barWidth;

      y -= barHeight;
      drawPill(margin + 20, y, barWidth, barHeight, barBg);
      drawPill(margin + 20, y, filledWidth, barHeight, barColor);

      y -= SPACE_BAR_TEXT;

      // Draw assessment text
      for (const line of assessmentLines) {
        if (checkPageBreak(14)) y = height - margin - 50;
        y -= 14;
        page.drawText(line, {
          x: margin + 20,
          y,
          font: font,
          size: 10,
          color: textSecondary,
          lineHeight: 14,
        });
      }
      y = startBlockY - blockHeight - 20;
    }

    await addWatermark(pdfDoc);
    return pdfDoc.save();
  };

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
            value={includeResume}
            onValueChange={(value) => setIncludeResume(value as 'yes' | 'no')}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <Label htmlFor="r-yes">
              <Card
                className={cn(
                  'cursor-pointer h-full p-4 flex flex-col items-center justify-center text-center transition-colors border-2',
                  includeResume === 'yes'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
              >
                <RadioGroupItem value="yes" id="r-yes" className="sr-only" />
                <Combine className="w-10 h-10 mb-2 text-primary" />
                <span className="font-semibold">Assessment + Resume</span>
                <span className="text-xs text-muted-foreground mt-1">
                  Generates a full report.
                </span>
              </Card>
            </Label>
            <Label htmlFor="r-no">
              <Card
                className={cn(
                  'cursor-pointer h-full p-4 flex flex-col items-center justify-center text-center transition-colors border-2',
                  includeResume === 'no'
                    ? 'border-primary bg-primary/5'
                    : 'hover:border-primary/50'
                )}
              >
                <RadioGroupItem value="no" id="r-no" className="sr-only" />
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

        {includeResume === 'yes' && (
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
          disabled={
            isLoading || !assessmentText || (includeResume === 'yes' && !resumeFile)
          }
          className="w-full text-lg py-6 font-bold"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Download className="mr-2 h-5 w-5" />
          )}
          {isLoading ? 'Generating Report...' : 'Generate and Download'}
        </Button>
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
      </CardFooter>
    </Card>
  );
}
