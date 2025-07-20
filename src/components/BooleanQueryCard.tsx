'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface BooleanQueryCardProps {
  initialQuery: string;
}

export function BooleanQueryCard({ initialQuery }: BooleanQueryCardProps) {
  const [query, setQuery] = useState(initialQuery);
  const { toast } = useToast()

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    toast({
      description: "Boolean query copied to clipboard!",
      className: "bg-accent text-accent-foreground",
    })
  };

  return (
    <Card className="shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">🧵 Boolean Search Query</CardTitle>
        <CardDescription>Use this query on platforms like Naukri.com. You can edit it below.</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={6}
          className="font-code text-sm min-h-[120px]"
          placeholder="Your boolean query..."
        />
      </CardContent>
      <CardContent>
         <Button onClick={handleCopy} className="w-full" size="lg">
           <Copy className="mr-2 h-4 w-4" />
           Copy Query
         </Button>
      </CardContent>
    </Card>
  );
}
