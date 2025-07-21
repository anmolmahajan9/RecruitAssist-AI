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
import { Trophy, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface CandidateRankerDisplayProps {
  analysis: CandidateRankerOutput;
}

const getRankColor = (rank: number) => {
  if (rank === 1) return 'text-yellow-400';
  if (rank === 2) return 'text-gray-400';
  if (rank === 3) return 'text-yellow-600';
  return 'text-muted-foreground';
};

const StatusIcon = ({ status }: { status: 'Yes' | 'No' | 'Maybe' }) => {
  switch (status) {
    case 'Yes':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'No':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'Maybe':
      return <HelpCircle className="h-5 w-5 text-yellow-500" />;
    default:
      return null;
  }
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
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full font-bold text-lg ${getRankColor(
                      candidate.rank
                    )}`}
                  >
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
                  {candidate.mustHaves?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">
                        Must-Have Requirements
                      </h4>
                      <div className="space-y-2">
                        {candidate.mustHaves.map((req, reqIndex) => (
                          <div
                            key={reqIndex}
                            className="flex items-center justify-between p-2 bg-secondary/50 rounded-md"
                          >
                            <span className="text-foreground">
                              {req.must_have}
                            </span>
                            <StatusIcon status={req.status} />
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
