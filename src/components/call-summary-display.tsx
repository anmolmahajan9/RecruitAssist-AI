'use client';

import type { CallSummaryOutput } from '@/ai/schemas/call-summary-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, FileText, BookCheck } from 'lucide-react';
import { useState } from 'react';

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
  if (!summary) return null;

  const fullTextToCopy = `Detailed Assessment:\n${summary.detailedAssessment}\n\nSummary:\n${summary.summary}`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Client-Ready Summary
          </CardTitle>
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