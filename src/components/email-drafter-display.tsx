'use client';

import type { EmailDrafterOutput } from '@/ai/schemas/email-drafter-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, MailCheck } from 'lucide-react';
import { useState } from 'react';

interface EmailDrafterDisplayProps {
  result: EmailDrafterOutput;
}

export function EmailDrafterDisplay({ result }: EmailDrafterDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.emailBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <MailCheck className="w-7 h-7 text-primary" />
          Generated Email
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
          {copied ? 'Copied!' : 'Copy Email'}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap rounded-lg border bg-secondary/30 p-4">
          {result.emailBody}
        </div>
      </CardContent>
    </Card>
  );
}
