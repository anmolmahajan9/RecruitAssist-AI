
'use client';

import type { InterviewAssessmentOutput } from '@/ai/schemas/interview-assessment-schema';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Download, FileText, Star, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { useState } from 'react';

interface CallSummaryDisplayProps {
  assessment: InterviewAssessmentOutput;
}

export function CallSummaryDisplay({ assessment }: CallSummaryDisplayProps) {
  if (!assessment) return null;
  const {
    candidate_name,
    interviewed_role,
    interview_datetime,
    overall_status,
    assessment_criteria,
    interview_summary,
    call_recording_link,
  } = assessment;

  const [isPdfDownloading, setIsPdfDownloading] = useState(false);

  const statusColor =
    overall_status.toLowerCase() === 'pass'
      ? 'bg-green-100 text-green-800 border-green-300'
      : 'bg-red-100 text-red-800 border-red-300';

  const statusColorDark =
    overall_status.toLowerCase() === 'pass'
      ? 'dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
      : 'dark:bg-red-900/50 dark:text-red-300 dark:border-red-700';

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

  const handleDownloadPdf = async () => {
    setIsPdfDownloading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const margin = 50;
      const contentWidth = width - margin * 2;
      let y = height - margin;

      const checkPageBreak = (spaceNeeded: number) => {
        if (y - spaceNeeded < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
          return true;
        }
        return false;
      };

      const headerBg = rgb(239 / 255, 246 / 255, 255 / 255); 
      const textPrimary = rgb(0.1, 0.1, 0.1);
      const textSecondary = rgb(0.4, 0.4, 0.4);
      const green = rgb(34 / 255, 197 / 255, 94 / 255);
      const red = rgb(239 / 255, 68 / 255, 68 / 255);
      const barBg = rgb(224 / 255, 224 / 255, 224 / 255);
      const white = rgb(1, 1, 1);
      const borderColor = rgb(0.9, 0.9, 0.9);

      checkPageBreak(80);
      const headerHeight = 90;
      y = height - 40;
      const status = overall_status.toLowerCase();
      const statusColorVal = status === 'pass' ? green : red;
      const statusCircleRadius = 25;

      page.drawText(candidate_name, { x: margin, y, font: boldFont, size: 24, color: textPrimary });
      y -= 20;
      page.drawText(interviewed_role, { x: margin, y, font: font, size: 12, color: textSecondary });
      y -= 15;
      page.drawText(`Interview Date: ${interview_datetime}`, { x: margin, y, font: font, size: 12, color: textSecondary });

      const statusCircleX = width - margin - statusCircleRadius;
      const statusCircleY = height - 65;
      page.drawCircle({ x: statusCircleX, y: statusCircleY, size: statusCircleRadius, color: statusColorVal });

      const statusText = overall_status;
      const statusTextWidth = boldFont.widthOfTextAtSize(statusText, 12);
      page.drawText(statusText, {
        x: statusCircleX - statusTextWidth / 2,
        y: statusCircleY - 6,
        font: boldFont,
        size: 12,
        color: white,
      });
      
      y = height - headerHeight - 40;

      checkPageBreak(40);
      page.drawText('Interview Summary', { x: margin, y, font: boldFont, size: 16, color: textPrimary });
      y -= 25;
      const summaryLines = wrapText(interview_summary, font, 10, contentWidth);
      for (const line of summaryLines) {
        checkPageBreak(14);
        page.drawText(line, { x: margin, y, font: font, size: 10, color: textSecondary });
        y -= 14;
      }
      y -= 20;

      checkPageBreak(40);
      page.drawText('Detailed Assessment', { x: margin, y, font: boldFont, size: 16, color: textPrimary });
      y -= 10;

      for (const item of assessment_criteria) {
        y -= 20; // Space before container
        const assessmentLines = wrapText(item.assessment, font, 10, contentWidth - 30);
        const blockHeight = 40 + assessmentLines.length * 14 + 30; // Title+Score + Text + Bar + Padding

        if (checkPageBreak(blockHeight)) {
           page.drawText('Detailed Assessment (Continued)', { x: margin, y, font: boldFont, size: 16, color: textPrimary });
           y -= 30;
        }

        const startBlockY = y;
        
        y -= 20; // top padding
        page.drawText(item.criteria, { x: margin + 15, y, font: boldFont, size: 12, color: textPrimary });
        const scoreText = `${item.score}/5`;
        const scoreWidth = boldFont.widthOfTextAtSize(scoreText, 12);
        page.drawText(scoreText, { x: width - margin - scoreWidth - 15, y, font: boldFont, size: 12, color: textPrimary });
        y -= 20;

        for (const line of assessmentLines) {
          page.drawText(line, { x: margin + 15, y, font: font, size: 10, color: textSecondary });
          y -= 14;
        }
        y -= 10;

        const barHeight = 8;
        const barWidth = contentWidth - 30;
        const filledWidth = (item.score / 5) * barWidth;
        const barColor = item.score >= 3 ? green : red;

        page.drawRectangle({ x: margin + 15, y, width: barWidth, height: barHeight, color: barBg, });
        page.drawRectangle({ x: margin + 15, y, width: filledWidth, height: barHeight, color: barColor });
        y -= 20; // bottom padding
        
        const endBlockY = y;
        const calculatedHeight = startBlockY - endBlockY;

        page.drawRectangle({
          x: margin,
          y: endBlockY,
          width: contentWidth,
          height: calculatedHeight,
          borderColor: borderColor,
          borderWidth: 1,
          borderRadius: 8
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Assessment-${candidate_name.replace(/ /g, '_')}.pdf`;
      link.click();
    } catch (err) {
      console.error(err);
    } finally {
      setIsPdfDownloading(false);
    }
  };


  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-6 bg-primary/10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground">
              {candidate_name}
            </h2>
            <div className="flex flex-col mt-2 text-muted-foreground gap-1">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{interviewed_role}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{interview_datetime}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'px-4 py-1.5 rounded-full font-semibold text-sm border',
                statusColor,
                statusColorDark
              )}
            >
              {overall_status}
            </div>
            <a
              href={call_recording_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline">
                <Video className="mr-2 h-4 w-4" />
                Listen to Call
              </Button>
            </a>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Interview Summary
          </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
            {interview_summary}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            Detailed Assessment
          </h3>
          <div className="space-y-6">
            {assessment_criteria.map((item, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-background shadow-sm"
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg text-foreground">
                    {item.criteria}
                  </h4>
                  <span className="font-bold text-xl text-primary">
                    {item.score}/5
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 whitespace-pre-line">
                  {item.assessment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 bg-primary/10 flex justify-end gap-4">
        <Button onClick={handleDownloadPdf} disabled={isPdfDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isPdfDownloading ? 'Generating PDF...' : 'Download as PDF'}
        </Button>
      </CardFooter>
    </Card>
  );
}
