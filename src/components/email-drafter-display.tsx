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
    // Create a temporary element to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result.emailBody;
    document.body.appendChild(tempDiv);

    try {
      // Select the content of the temporary element
      const range = document.createRange();
      range.selectNodeContents(tempDiv);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      // Execute the copy command
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy HTML: ', err);
    } finally {
      // Clean up the temporary element and clear the selection
      document.body.removeChild(tempDiv);
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
      <CardContent className="overflow-x-auto p-4">
        <div
          ref={emailBodyRef}
          dangerouslySetInnerHTML={{ __html: result.emailBody }}
        />
      </CardContent>
    </Card>
  );
}
