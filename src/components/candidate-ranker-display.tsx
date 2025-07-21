'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { CandidateRankerOutput } from '@/ai/schemas/candidate-ranker-schema';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';

interface CandidateRankerDisplayProps {
  analysis: CandidateRankerOutput;
  jobRequirements: string;
}

export function CandidateRankerDisplay({
  analysis,
  jobRequirements,
}: CandidateRankerDisplayProps) {
  const requirementsList = useMemo(
    () =>
      jobRequirements
        .split('\n')
        .map((req) => req.trim())
        .filter(Boolean),
    [jobRequirements]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-3">
          <Trophy className="w-7 h-7 text-primary" />
          Candidate Ranking Results
        </CardTitle>
        <CardDescription>
          Candidates are ranked based on their match to the job requirements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion
          type="multiple"
          className="space-y-4"
          defaultValue={['candidate-0']}
        >
          {analysis.rankedCandidates.map((candidate, index) => (
            <AccordionItem
              key={index}
              value={`candidate-${index}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full font-bold text-lg text-muted-foreground">
                    {candidate.rank}
                  </div>
                  <div className="flex-grow text-left">
                    <span className="font-bold">{candidate.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-right mr-4">
                    <span
                      className={`font-bold text-xl ${
                        candidate.score > 75
                          ? 'text-green-500'
                          : candidate.score > 50
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }`}
                    >
                      {candidate.score}
                    </span>
                    <span className="text-sm text-muted-foreground">/ 100</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="p-4 pt-0">
                <div className="space-y-4">
                  {candidate.mustHaves?.length > 0 &&
                    requirementsList.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">
                          Must-Have Requirements
                        </h4>
                        <div className="space-y-2">
                          {requirementsList.map((req, reqIndex) => (
                            <div
                              key={reqIndex}
                              className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                            >
                              <span className="text-foreground">{req}</span>
                              <span className="text-2xl">
                                {candidate.mustHaves[reqIndex] || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
