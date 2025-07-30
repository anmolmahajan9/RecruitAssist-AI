'use client';

import type { EmailDrafterOutput } from '@/ai/schemas/email-drafter-schema';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Copy, Check, MailCheck, Wand2, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface EmailDrafterDisplayProps {
  result: EmailDrafterOutput;
  onRefine: (newInstructions: string) => Promise<void>;
  isRefining: boolean;
}

export function EmailDrafterDisplay({ result, onRefine, isRefining }: EmailDrafterDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [instructions, setInstructions] = useState('');
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
  
  const handleRefineClick = () => {
    onRefine(instructions);
  }

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
      <CardContent className="overflow-x-auto p-4 border-b">
        <div
          ref={emailBodyRef}
          dangerouslySetInnerHTML={{ __html: result.emailBody }}
        />
      </CardContent>
       <CardFooter className="p-6 bg-secondary/30">
        <div className="w-full space-y-4">
          <div>
            <Label htmlFor="refine-instructions" className="text-base font-bold flex items-center gap-2 mb-2">
              <Wand2 className="w-5 h-5 text-primary" />
              Need changes?
            </Label>
            <Textarea
              id="refine-instructions"
              placeholder="e.g., 'Make the tone more formal' or 'Change the closing to Best Regards'"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <Button
            onClick={handleRefineClick}
            disabled={isRefining || !instructions}
            className="w-full"
            size="lg"
          >
            {isRefining ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-5 w-5" />
            )}
            {isRefining ? 'Refining...' : 'Refine Email'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
