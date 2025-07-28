
'use client';

import type { CallSummaryOutput } from '@/ai/schemas/call-summary-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Copy,
  Check,
  FileText,
  BookCheck,
  Download,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';

interface CallSummaryDisplayProps {
  summary: CallSummaryOutput;
}

function CopyableBlock({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-3">
          {icon}
          {title}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="text-sm"
        >
          {copied ? (
            <Check className="mr-2 h-4 w-4 text-green-500" />
          ) : (
            <Copy className="mr-2 h-4 w-4" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-lg border bg-secondary/30 p-4">
          {text}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to wrap text
const wrapText = (text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] => {
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = '';

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
    return lines;
};


export function CallSummaryDisplay({ summary }: CallSummaryDisplayProps) {
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  if (!summary) return null;

  const fullTextToCopy = `Detailed Assessment:\n${summary.detailedAssessment}\n\nSummary:\n${summary.summary}`;

  const handleDownloadPdf = async () => {
    setIsPdfLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const gray = rgb(0.3, 0.3, 0.3);
      const lightGray = rgb(0.5, 0.5, 0.5);
      const black = rgb(0, 0, 0);
      const blue = rgb(0.1, 0.4, 0.9);
      const margin = 40;
      let y = height - margin;

      // 1. Header
      const logoUrl = 'https://recruitassist-ai-knbnk.web.app/logo.png';
      const logoResponse = await fetch(logoUrl);
      const logoBytes = await logoResponse.arrayBuffer();
      const logoImage = await pdfDoc.embedPng(logoBytes);
      const logoDims = logoImage.scale(0.25);
      page.drawImage(logoImage, {
        x: margin,
        y: y - logoDims.height + 15,
        width: logoDims.width,
        height: logoDims.height,
      });

      page.drawText('Interview Report', { x: width - margin - 110, y: y, font: boldFont, size: 16, color: black });
      const generationDate = `Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
      page.drawText(generationDate, { x: width - margin - font.widthOfTextAtSize(generationDate, 10), y: y - 15, font, size: 10, color: lightGray });
      
      y -= 70; // Space after header

      // Line separator
      page.drawLine({
          start: { x: margin, y },
          end: { x: width - margin, y },
          thickness: 1,
          color: rgb(0.9, 0.9, 0.9),
      });

      y -= 40; // Space for content


      // 2. Summary Section
      page.drawText('Summary', { x: margin, y, font: boldFont, size: 18, color: black });
      y -= 25;
      
      const summaryLines = wrapText(summary.summary, font, 11, width - 2 * margin);
      summaryLines.forEach(line => {
        page.drawText(line, { x: margin, y, font, size: 11, color: gray, lineHeight: 15 });
        y -= 15;
      });

      y -= 20; // Space before next section

      // 3. Interviewer Feedback / Detailed Assessment
      page.drawText('Interviewer Feedback', { x: margin, y, font: boldFont, size: 18, color: black });
      y -= 25;

      const assessmentLines = wrapText(summary.detailedAssessment, font, 11, width - 2 * margin);
      assessmentLines.forEach(line => {
          page.drawText(line, { x: margin, y, font, size: 11, color: gray, lineHeight: 15 });
          y -= 15;
      });

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'call-summary-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to generate PDF', error);
    } finally {
      setIsPdfLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            Client-Ready Summary
          </CardTitle>
          <Button
            onClick={handleDownloadPdf}
            disabled={isPdfLoading}
            variant="outline"
          >
            {isPdfLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isPdfLoading ? 'Generating...' : 'Download as PDF'}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <CopyableBlock
              title="Detailed Assessment"
              text={summary.detailedAssessment}
              icon={<FileText className="w-6 h-6 text-primary" />}
            />
            <CopyableBlock
              title="Overall Summary"
              text={summary.summary}
              icon={<BookCheck className="w-6 h-6 text-primary" />}
            />
            <CopyableBlock
              title="Copy All"
              text={fullTextToCopy}
              icon={<Copy className="w-6 h-6 text-primary" />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
