
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

      // Helper to add a new page if needed
      let y = height;
      const checkPageBreak = (spaceNeeded: number) => {
        if (y - spaceNeeded < margin) {
          page = pdfDoc.addPage();
          y = height - margin;
        }
      };
      
      const pastelBlue = { r: 235/255, g: 245/255, b: 255/255 };

      // === Header Section ===
      const headerHeight = 100;
      page.drawRectangle({
        x: 0,
        y: height - headerHeight,
        width,
        height: headerHeight,
        color: rgb(pastelBlue.r, pastelBlue.g, pastelBlue.b),
      });

      y = height - 40;
      
      // Candidate Name
      page.drawText(candidate_name, { x: margin, y, font: boldFont, size: 24 });
      y -= 20;
      
      // Role and Date
      page.drawText(`${interviewed_role}`, {
        x: margin,
        y,
        font: font,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
      });
      y-= 15;
      page.drawText(`${interview_datetime}`, {
        x: margin,
        y,
        font: font,
        size: 12,
        color: rgb(0.4, 0.4, 0.4),
      });
      
      // Status
      const statusText = `Status: ${overall_status}`;
      const statusWidth = boldFont.widthOfTextAtSize(statusText, 10);
      const statusColorVal =
        overall_status.toLowerCase() === 'pass'
          ? { r: 0.2, g: 0.6, b: 0.2, bg_r: 229/255, bg_g: 245/255, bg_b: 233/255 }
          : { r: 0.8, g: 0.2, b: 0.2, bg_r: 254/255, bg_g: 226/255, bg_b: 226/255 };

      const statusBoxWidth = statusWidth + 20;
      page.drawRectangle({
        x: width - margin - statusBoxWidth,
        y: height - 60,
        width: statusBoxWidth,
        height: 25,
        color: rgb(statusColorVal.bg_r, statusColorVal.bg_g, statusColorVal.bg_b),
        borderRadius: 12.5,
      });

      page.drawText(statusText, {
        x: width - margin - statusWidth - 10,
        y: height - 55,
        font: boldFont,
        size: 10,
        color: rgb(statusColorVal.r, statusColorVal.g, statusColorVal.b),
      });
      
      y = height - headerHeight - 40; // Reset Y for main content

      // === Summary Section ===
      checkPageBreak(80);
      page.drawText('Interview Summary', {
        x: margin,
        y,
        font: boldFont,
        size: 18,
      });
      y -= 25;
      const summaryLines = wrapText(
        interview_summary,
        font,
        10,
        width - margin * 2
      );
      for (const line of summaryLines) {
        checkPageBreak(14);
        page.drawText(line, {
          x: margin,
          y,
          font: font,
          size: 10,
          color: rgb(0.3, 0.3, 0.3),
        });
        y -= 14;
      }
      y -= 30;

      // === Assessment Criteria Section ===
      checkPageBreak(40);
      page.drawText('Detailed Assessment', {
        x: margin,
        y,
        font: boldFont,
        size: 18,
      });
      y -= 30;
      for (const item of assessment_criteria) {
        checkPageBreak(60);

        // Criteria Title and Score
        const scoreText = `${item.score}/5`;
        const scoreWidth = boldFont.widthOfTextAtSize(scoreText, 12);
        page.drawText(item.criteria, { x: margin, y, font: boldFont, size: 12 });
        page.drawText(scoreText, {
          x: width - margin - scoreWidth,
          y,
          font: boldFont,
          size: 12,
          color: rgb(0.1, 0.4, 0.7),
        });

        y -= 20; // Space before assessment text
        const assessmentLines = wrapText(
          item.assessment,
          font,
          10,
          width - margin * 2
        );
        for (const line of assessmentLines) {
          checkPageBreak(14);
          page.drawText(line, {
            x: margin,
            y,
            font: font,
            size: 10,
            color: rgb(0.3, 0.3, 0.3),
          });
          y -= 14;
        }
        y -= 25; // Space after each criteria block
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
