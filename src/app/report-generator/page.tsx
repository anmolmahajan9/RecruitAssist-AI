
'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { ReportGeneratorForm } from '@/components/report-generator-form';
import { CallSummaryDisplay } from '@/components/call-summary-display';
import {
  type InterviewAssessmentInput,
  type InterviewAssessmentOutput,
} from '@/ai/schemas/interview-assessment-schema';
import { assessInterview } from '@/ai/flows/interview-assessment-flow';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { logQuery } from '@/services/loggingService';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

const DEFAULT_LOGO_URL = 'https://recruitassist-ai-knbnk.web.app/logo.png';

export default function ReportGeneratorPage() {
  const [assessment, setAssessment] = useState<InterviewAssessmentOutput | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadPdf = (bytes: Uint8Array, fileName: string) => {
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    URL.revokeObjectURL(link.href);
    document.body.removeChild(link);
  };
  
  const watermarkPdf = async (pdfBytes: ArrayBuffer): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    try {
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
          x: width - logoDims.width - 40,
          y: height - logoDims.height - 40,
          width: logoDims.width,
          height: logoDims.height,
          opacity: 0.5,
        });
      }
    } catch (e) {
      console.error("Could not apply watermark", e);
    }
    return pdfDoc.save();
  };

  const createAssessmentPdf = async (
    assessmentData: InterviewAssessmentOutput
  ): Promise<Uint8Array> => {
    const {
      candidate_name,
      interviewed_role,
      overall_status,
      assessment_criteria,
      interview_summary,
    } = assessmentData;

    const pdfDoc = await PDFDocument.create();
    
    let logoHeight = 0;
    let initialY = 0;
    
    const addWatermarkToAssessment = async (doc: PDFDocument) => {
      try {
          const response = await fetch(DEFAULT_LOGO_URL);
          if (!response.ok) {
            console.error(`Failed to load default logo: ${response.statusText}`);
            return;
          }
          const imageBytes = await response.arrayBuffer();
          const watermarkImage = await doc.embedPng(imageBytes);
          const pages = doc.getPages();
          const logoDims = watermarkImage.scale(0.08);
          logoHeight = logoDims.height;
          initialY = doc.getPage(0).getHeight() - 50 - logoHeight - 40;
    
          for (const page of pages) {
            const { width, height } = page.getSize();
            page.drawImage(watermarkImage, {
              x: width - logoDims.width - 40,
              y: height - logoDims.height - 40,
              width: logoDims.width,
              height: logoDims.height,
              opacity: 0.5,
            });
          }
      } catch(e) {
          console.error("Error loading watermark image: ", e)
      }
    };
    
    let page = pdfDoc.addPage();
    await addWatermarkToAssessment(pdfDoc);

    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const margin = 50;
    const contentWidth = width - margin * 2;
    let y = initialY;

    const checkPageBreak = (spaceNeeded: number) => {
      if (y - spaceNeeded < margin) {
        page = pdfDoc.addPage();
        y = initialY;
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
    const headerBgColor = rgb(240 / 255, 248 / 255, 253 / 255);
    const containerRadius = 8;
    const barHeight = 6;
    const passPillFill = rgb(217 / 255, 249 / 255, 230 / 255);
    const passPillBorder = rgb(52 / 255, 211 / 255, 153 / 255);
    const passPillText = rgb(5 / 255, 150 / 255, 105 / 255);
    const failPillFill = rgb(255 / 255, 200 / 255, 200 / 255);
    const failPillBorder = rgb(150 / 255, 30 / 255, 30 / 255);
    const failPillText = rgb(100 / 255, 0 / 255, 0 / 255);
    
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
          const potentialLine = currentLine === '' ? word : `${currentLine} ${word}`;
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
    
    const drawPill = (x: number, y: number, pillWidth: number, pillHeight: number, color: any) => {
      const radius = pillHeight / 2;
      if (pillWidth < pillHeight) {
        if (pillWidth > 0) page.drawCircle({ x: x + radius, y: y + radius, size: radius, color });
        return;
      }
      page.drawCircle({ x: x + radius, y: y + radius, size: radius, color });
      page.drawCircle({ x: x + pillWidth - radius, y: y + radius, size: radius, color });
      page.drawRectangle({ x: x + radius, y: y, width: pillWidth - 2 * radius, height: pillHeight, color });
    };

    const headerHeight = 120;
    if (checkPageBreak(headerHeight + 20)) {
        y = initialY;
    }
    const headerStartY = y;
    page.drawRectangle({ x: margin, y: y - headerHeight, width: contentWidth, height: headerHeight, color: headerBgColor });
    y -= 40;
    page.drawText(`${candidate_name} - AI Interview Report`, { x: margin + 20, y, font: boldFont, size: 16, color: textPrimary });
    y -= 25;
    page.drawText(interviewed_role, { x: margin + 20, y, font: font, size: 14, color: textSecondary });
    const today = new Date();
    const month = today.toLocaleString('default', { month: 'short' });
    const currentDate = `${today.getDate()} ${month}, ${today.getFullYear()}`;
    y -= 18;
    page.drawText(currentDate, { x: margin + 20, y, font: font, size: 14, color: textSecondary });
    const status = overall_status.toLowerCase();
    const statusText = overall_status;
    const statusTextWidth = boldFont.widthOfTextAtSize(statusText, 12);
    const pillWidth = statusTextWidth + 40;
    const pillHeight = 25;
    const pillX = width - margin - pillWidth - 30;
    const pillY = headerStartY - headerHeight / 2 - pillHeight / 2;
    page.drawRectangle({ x: pillX, y: pillY, width: pillWidth, height: pillHeight, color: status === 'pass' ? passPillFill : failPillFill, borderColor: status === 'pass' ? passPillBorder : failPillBorder, borderWidth: 1.5, borderRadius: pillHeight / 2 });
    page.drawText(statusText, { x: pillX + (pillWidth - statusTextWidth) / 2, y: pillY + (pillHeight - 10) / 2, font: boldFont, size: 12, color: status === 'pass' ? passPillText : failPillText });
    y = headerStartY - headerHeight - 20;

    const summaryTitle = 'AI Interview Summary';
    const summaryLines = wrapText(interview_summary, font, 10, contentWidth - 40);
    const PADDING_V_SUMMARY_TOP = 20;
    const PADDING_V_SUMMARY_BOTTOM = 20;
    const summaryHeight = PADDING_V_SUMMARY_TOP + 20 + 15 + summaryLines.length * 14 + PADDING_V_SUMMARY_BOTTOM;
    if (checkPageBreak(summaryHeight + 20)) {
        y = initialY;
    }
    const summaryStartY = y;
    page.drawRectangle({ x: margin, y: summaryStartY - summaryHeight, width: contentWidth, height: summaryHeight, borderColor: borderColor, borderWidth: 1, borderRadius: containerRadius });
    y -= PADDING_V_SUMMARY_TOP + 10;
    page.drawText(summaryTitle, { x: margin + 20, y, font: boldFont, size: 16, color: textPrimary });
    y -= 25;
    for (const line of summaryLines) {
      if (checkPageBreak(14)) {
          y = initialY;
      }
      page.drawText(line, { x: margin + 20, y, font: font, size: 10, color: textSecondary, lineHeight: 14 });
      y -= 14;
    }
    y = summaryStartY - summaryHeight - 20;
    y = Math.min(y, summaryStartY - summaryHeight - 20, height - margin - PADDING_V_SUMMARY_BOTTOM);


    const filteredCriteria = assessment_criteria.filter((item) => item.criterion.toLowerCase() !== 'job fit');
    for (const item of filteredCriteria) {
      const scoreText = `${item.score}/5`;
      const scoreWidth = boldFont.widthOfTextAtSize(scoreText, 12);
      const titleMaxWidth = contentWidth - 40 - scoreWidth - 10; // 10 for padding
      const titleLines = wrapText(item.criterion, boldFont, 12, titleMaxWidth);

      const assessmentLines = wrapText(item.assessment, font, 10, contentWidth - 40);
      const PADDING_V_BLOCK_TOP = 20;
      const PADDING_V_BLOCK_BOTTOM = 20;
      const SPACE_TITLE_BAR = 12;
      const SPACE_BAR_TEXT = 12;
      const blockHeight = PADDING_V_BLOCK_TOP + (titleLines.length * 14) + SPACE_TITLE_BAR + barHeight + SPACE_BAR_TEXT + assessmentLines.length * 14 + PADDING_V_BLOCK_BOTTOM;
      if (checkPageBreak(blockHeight)) {
          y = initialY;
      }
      const startBlockY = y;
      page.drawRectangle({ x: margin, y: startBlockY - blockHeight, width: contentWidth, height: blockHeight, borderColor: borderColor, borderWidth: 1, borderRadius: containerRadius });
      y -= PADDING_V_BLOCK_TOP;
      
      const titleYStart = y;
      let currentTitleY = y;
      for (const line of titleLines) {
        y -= 14;
        if (checkPageBreak(14)) {
          y = initialY;
        };
        page.drawText(line, { x: margin + 20, y, font: boldFont, size: 12, color: textPrimary, lineHeight: 14 });
      }
      

      const barColor = item.score >= 3 ? green : item.score >= 2 ? yellow : red;
      
      page.drawText(scoreText, { x: width - margin - scoreWidth - 20, y: titleYStart - 14, font: boldFont, size: 12, color: barColor });
      
      y -= SPACE_TITLE_BAR;
      
      const barWidth = contentWidth - 40;
      const filledWidth = (item.score / 5) * barWidth;
      
      if (checkPageBreak(barHeight + SPACE_BAR_TEXT)) {
          y = initialY;
      }
      y -= barHeight;
      drawPill(margin + 20, y, barWidth, barHeight, barBg);
      drawPill(margin + 20, y, filledWidth, barHeight, barColor);
      
      y -= SPACE_BAR_TEXT;

      for (const line of assessmentLines) {
        if (checkPageBreak(14)) {
            y = initialY;
        }
        page.drawText(line, { x: margin + 20, y, font: font, size: 10, color: textSecondary, lineHeight: 14 });
        y -= 14;
      }
      y = startBlockY - blockHeight - 20;
      y = Math.min(y, startBlockY - blockHeight - 20, height - margin - PADDING_V_BLOCK_BOTTOM);
    }
    
    await addWatermarkToAssessment(pdfDoc);
    return pdfDoc.save();
  };


  const handleGenerate = async (
    assessmentText: string,
    reportType: 'combined' | 'separate' | 'assessment_only',
    resumeFile: File | null
  ) => {
    if (!assessmentText) {
      setError('Please provide the assessment text.');
      return;
    }
    if (reportType !== 'assessment_only' && !resumeFile) {
      setError('Please provide a resume PDF for this report type.');
      return;
    }
    
    setError(null);
    setIsLoading(true);
    setAssessment(null);
    
    await logQuery('reportGenerator', {
      reportType,
      input: { assessmentText },
    });

    try {
      const input: InterviewAssessmentInput = { callAssessmentText: assessmentText };
      const assessmentResult = await assessInterview(input);
      setAssessment(assessmentResult);
      
      // Now that AI is done, start PDF processing
      setIsLoading(false);
      setIsProcessingPdf(true);

      const candidateName = assessmentResult.candidate_name.replace(/\s+/g, '_');
      const jobName = assessmentResult.interviewed_role.replace(/\s+/g, '_');

      const assessmentPdfBytes = await createAssessmentPdf(assessmentResult);

      if (reportType === 'assessment_only') {
        downloadPdf(assessmentPdfBytes, `${candidateName}-${jobName}-Assessment-suitable-ai.pdf`);
      } else if (reportType === 'separate' && resumeFile) {
         downloadPdf(assessmentPdfBytes, `${candidateName}-${jobName}-Assessment-suitable-ai.pdf`);
         const resumeBytes = await resumeFile.arrayBuffer();
         const watermarkedResumeBytes = await watermarkPdf(resumeBytes);
         downloadPdf(watermarkedResumeBytes, `${candidateName}-${jobName}-Resume-suitable-ai.pdf`);
      } else if (reportType === 'combined' && resumeFile) {
        const resumeBytes = await resumeFile.arrayBuffer();
        const watermarkedResumeBytes = await watermarkPdf(resumeBytes);

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

        const finalPdfBytes = await combinedPdfDoc.save();
        downloadPdf(finalPdfBytes, `${candidateName}-${jobName}-Report-suitable-ai.pdf`);
      }

    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
      setAssessment(null);
    } finally {
      setIsLoading(false);
      setIsProcessingPdf(false);
    }
  };

  const handleReset = () => {
    setAssessment(null);
    setError(null);
    setIsLoading(false);
    setIsProcessingPdf(false);
  };

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <span className="text-primary">Report Generator</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <ReportGeneratorForm
        onGenerate={handleGenerate}
        onReset={handleReset}
        isLoading={isLoading}
        isProcessingPdf={isProcessingPdf}
        hasResults={!!assessment || !!error}
      />

      {error && !isLoading && !isProcessingPdf && (
        <Card className="mt-8 bg-destructive/10 border-destructive text-destructive-foreground">
          <CardHeader>
            <CardTitle>An Error Occurred</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {assessment && !error && !isLoading && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            AI Assessment Preview
          </h2>
          <CallSummaryDisplay assessment={assessment} showFooter={false} />
        </div>
      )}
    </div>
  );
}
