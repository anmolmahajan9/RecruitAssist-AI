
'use client';

import type { InterviewAssessmentOutput } from '@/ai/schemas/interview-assessment-schema';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video, Download, FileText, Star, User, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import { useState } from 'react';
import Image from 'next/image';

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
      lines.push(''); // Add a blank line for paragraph spacing
    }
    return lines;
  };

  const handleDownloadPdf = async () => {
    setIsPdfDownloading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const margin = 50;
      let y = height - margin;

      // Logo and Header
      const logoUrl = '/logo.png';
      const logoBytes = await fetch(logoUrl).then((res) => res.arrayBuffer());
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.25);
      page.drawImage(logoImage, {
        x: margin,
        y: y - logoDims.height + 15,
        width: logoDims.width,
        height: logoDims.height,
      });

      page.drawText('Candidate Assessment Report', {
        x: width - margin - 220,
        y: y,
        font: boldFont,
        size: 16,
        color: rgb(0.1, 0.1, 0.1),
      });

      y -= logoDims.height + 10;
      page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 30;

      // Candidate Info
      page.drawText(candidate_name, { x: margin, y, font: boldFont, size: 24 });
      y -= 20;
      page.drawText(interviewed_role, { x: margin, y, font: font, size: 14, color: rgb(0.4, 0.4, 0.4) });
      y -= 15;
      page.drawText(`Interview Date: ${interview_datetime}`, { x: margin, y, font: font, size: 12, color: rgb(0.4, 0.4, 0.4) });
      
      const statusText = `Status: ${overall_status}`;
      const statusWidth = boldFont.widthOfTextAtSize(statusText, 12);
      const statusColor = overall_status.toLowerCase() === 'pass' ? {r: 0.1, g:0.8, b:0.1} : {r:0.8,g:0.1,b:0.1};
      
      page.drawRectangle({
        x: width - margin - statusWidth - 20,
        y: y - 5,
        width: statusWidth + 20,
        height: 25,
        color: rgb(statusColor.r, statusColor.g, statusColor.b),
        opacity: 0.1,
        borderRadius: 12.5,
      });

      page.drawText(statusText, {
        x: width - margin - statusWidth - 10,
        y: y,
        font: boldFont,
        size: 12,
        color: rgb(statusColor.r, statusColor.g, statusColor.b),
      });


      y -= 40;

      // Assessment Criteria
      page.drawText('Detailed Assessment', { x: margin, y, font: boldFont, size: 16 });
      y -= 25;
      for (const item of assessment_criteria) {
        page.drawText(item.criteria, { x: margin, y, font: boldFont, size: 12 });
        y -= 18;
        const assessmentLines = wrapText(item.assessment, font, 10, width - margin * 2);
        for (const line of assessmentLines) {
          page.drawText(line, { x: margin + 10, y, font: font, size: 10, color: rgb(0.3, 0.3, 0.3) });
          y -= 14;
        }
        y -= 10;
      }
      
      y -= 20;

      // Summary
      page.drawText('Interview Summary', { x: margin, y, font: boldFont, size: 16 });
      y -= 25;
      const summaryLines = wrapText(interview_summary, font, 10, width - margin * 2);
      for (const line of summaryLines) {
        page.drawText(line, { x: margin, y, font: font, size: 10, color: rgb(0.3, 0.3, 0.3) });
        y -= 14;
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
      <CardHeader className="p-6 bg-muted/30">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-foreground">{candidate_name}</h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-muted-foreground">
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
             <div className={cn('px-4 py-1.5 rounded-full font-semibold text-sm border', statusColor, statusColorDark)}>
                {overall_status}
             </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary"/>
            Detailed Assessment
          </h3>
          <div className="space-y-6">
            {assessment_criteria.map((item, index) => (
              <div key={index} className="pl-4 border-l-2 border-primary/50">
                <h4 className="font-bold text-lg">{item.criteria}</h4>
                <p className="text-muted-foreground mt-1">{item.assessment}</p>
                <div className="mt-2">
                    <Progress value={item.score} className="h-1.5" />
                    <p className="text-xs text-right font-bold text-muted-foreground mt-1">{item.score}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
           <h3 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-primary"/>
            Interview Summary
            </h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground whitespace-pre-line">
            {interview_summary}
          </div>
        </div>
      </CardContent>
       <CardFooter className="p-6 bg-muted/30 flex justify-end gap-4">
          <Button variant="outline">
            <Video className="mr-2 h-4 w-4" />
            Watch interview
          </Button>
          <Button onClick={handleDownloadPdf} disabled={isPdfDownloading}>
            <Download className="mr-2 h-4 w-4" />
            {isPdfDownloading ? 'Generating PDF...' : 'Download as PDF'}
          </Button>
       </CardFooter>
    </Card>
  );
}
