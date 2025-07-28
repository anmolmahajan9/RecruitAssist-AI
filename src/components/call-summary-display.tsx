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
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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
      
      const margin = 50;
      const maxWidth = width - 2 * margin;
      let y = height - margin;

      const drawText = (text: string, f: any, size: number, indent = 0) => {
        const lines = text.split('\n');
        for (const line of lines) {
           if (y < margin) { 
              // This basic implementation doesn't add new pages.
              // For long text, a more complex solution would be needed.
              return; 
            }
            page.drawText(line, {
              x: margin + indent,
              y,
              font: f,
              size,
              color: rgb(0, 0, 0),
              maxWidth: maxWidth - indent,
            });
            y -= size * 1.4; // Line height
        }
      }

      drawText('Call Assessment Summary', boldFont, 18);
      y -= 20;

      drawText('Detailed Assessment', boldFont, 14);
      y -= 5;
      drawText(summary.detailedAssessment, font, 11);
      y -= 20;

      drawText('Overall Summary', boldFont, 14);
      y -= 5;
      drawText(summary.summary, font, 11);

      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'call-summary.pdf';
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
