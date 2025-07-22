'use client';

import type { EmailDrafterOutput } from '@/ai/schemas/email-drafter-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, MailCheck } from 'lucide-react';
import { useState, useRef } from 'react';

interface EmailDrafterDisplayProps {
  result: EmailDrafterOutput;
}

export function EmailDrafterDisplay({ result }: EmailDrafterDisplayProps) {
  const [copied, setCopied] = useState(false);
  const emailBodyRef = useRef<HTMLDivElement>(null);

  if (!result) return null;

  const handleCopy = () => {
    if (emailBodyRef.current) {
      const range = document.createRange();
      range.selectNode(emailBodyRef.current);
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      } catch (err) {
        console.error('Failed to copy text: ', err);
      }
      window.getSelection()?.removeAllRanges();
    }
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
        <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg p-4">
           <div
            ref={emailBodyRef}
            dangerouslySetInnerHTML={{ __html: result.emailBody }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
