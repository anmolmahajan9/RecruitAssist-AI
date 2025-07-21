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
import { Medal, Star, ThumbsDown, Trophy } from 'lucide-react';

interface CandidateRankerDisplayProps {
  analysis: CandidateRankerOutput;
}

const getMedalColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-yellow-600';
  return 'text-muted-foreground';
};

export function CandidateRankerDisplay({
  analysis,
}: CandidateRankerDisplayProps) {
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
        <Accordion type="multiple" className="space-y-4">
          {analysis.rankedCandidates.map((candidate, index) => (
            <AccordionItem
              key={index}
              value={`candidate-${index}`}
              className="border rounded-lg"
            >
              <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline">
                <div className="flex items-center gap-4 w-full">
                  <Medal
                    className={`h-8 w-8 ${getMedalColor(candidate.rank)}`}
                  />
                  <div className="flex-grow text-left">
                    <span className="font-bold">{candidate.name}</span>
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      (Rank: {candidate.rank})
                    </span>
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
                  <div>
                    <h4 className="font-semibold mb-2">Rationale</h4>
                    <p className="text-muted-foreground">
                      {candidate.rationale}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">
                      Original Candidate Details
                    </h4>
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-words p-3 bg-secondary/50 rounded-lg border">
                      {JSON.stringify(candidate.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
