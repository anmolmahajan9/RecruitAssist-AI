'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Copy, Check, Code } from 'lucide-react';

interface BooleanQueryDisplayProps {
  query: string;
}

export function BooleanQueryDisplay({ query }: BooleanQueryDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!query) return;
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <Code className="w-6 h-6 text-primary" />
          Boolean Query
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative p-4 bg-secondary/50 rounded-lg border">
          <p className="text-sm font-mono text-muted-foreground whitespace-pre-wrap break-words">
            {query}
          </p>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:bg-accent"
            onClick={handleCopy}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
