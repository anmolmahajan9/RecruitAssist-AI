'use client';

import type { BooleanQueryOutput } from '@/ai/schemas/boolean-query-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Copy, Check, ListChecks, SearchCode } from 'lucide-react';
import { useState } from 'react';

interface BooleanQueryDisplayProps {
  analysis: BooleanQueryOutput;
}

function QueryDisplay({
  title,
  query,
}: {
  title: string;
  query: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-bold">{title}</h4>
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
      </div>
      <pre className="text-sm font-mono text-foreground whitespace-pre-wrap break-words p-4 bg-secondary/50 rounded-lg border">
        {query}
      </pre>
    </div>
  );
}

export function BooleanQueryDisplay({ analysis }: BooleanQueryDisplayProps) {
  if (!analysis) return null;

  const { keywordTable, booleanQueries } = analysis;

  const renderKeywordRows = (
    rows: { primaryKeywords: string; synonyms: string }[]
  ) =>
    rows.map((row, index) => (
      <TableRow key={index}>
        <TableCell className="font-medium">{row.primaryKeywords}</TableCell>
        <TableCell>{row.synonyms}</TableCell>
      </TableRow>
    ));

  return (
    <Accordion
      type="multiple"
      defaultValue={['keyword-breakdown', 'boolean-strings']}
      className="space-y-6"
    >
      <AccordionItem value="keyword-breakdown" className="border-b-0">
        <Card>
          <AccordionTrigger className="p-6 hover:no-underline">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ListChecks className="w-7 h-7 text-primary" />
              Keyword Breakdown
            </CardTitle>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">Primary Keywords</TableHead>
                  <TableHead className="font-bold">
                    Synonyms / Resume Variants
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keywordTable.specificKeywords?.length > 0 && (
                  <>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableCell
                        colSpan={2}
                        className="font-bold text-lg text-foreground"
                      >
                        Specific Keywords
                      </TableCell>
                    </TableRow>
                    {renderKeywordRows(keywordTable.specificKeywords)}
                  </>
                )}
                {keywordTable.generalKeywords?.length > 0 && (
                  <>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableCell
                        colSpan={2}
                        className="font-bold text-lg text-foreground pt-6"
                      >
                        General Keywords
                      </TableCell>
                    </TableRow>
                    {renderKeywordRows(keywordTable.generalKeywords)}
                  </>
                )}
              </TableBody>
            </Table>
          </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="boolean-strings" className="border-b-0">
        <Card>
          <AccordionTrigger className="p-6 hover:no-underline">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <SearchCode className="w-7 h-7 text-primary" />
              Boolean Search Strings
            </CardTitle>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <div className="space-y-6">
              <QueryDisplay
                title="1. Basic Query"
                query={booleanQueries.basic}
              />
              <QueryDisplay
                title="2. Intermediate Query"
                query={booleanQueries.intermediate}
              />
              <QueryDisplay
                title="3. Advanced Query"
                query={booleanQueries.advanced}
              />
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
