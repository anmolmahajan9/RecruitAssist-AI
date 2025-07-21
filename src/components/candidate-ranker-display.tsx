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
import type { ParsedCandidate } from '@/ai/schemas/candidate-parser-schema';
import { Trophy } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';

interface CandidateRankerDisplayProps {
  analysis: CandidateRankerOutput;
  jobRequirements: string;
  parsedCandidates: ParsedCandidate[];
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | string[] | undefined;
}) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  return (
    <div>
      <h5 className="font-semibold text-sm text-muted-foreground">{label}</h5>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-2 mt-1">
          {value.map((item) => (
            <Badge key={item} variant="secondary">
              {item}
            </Badge>
          ))}
        </div>
      ) : (
        <p className="text-foreground">{value}</p>
      )}
    </div>
  );
}

export function CandidateRankerDisplay({
  analysis,
  jobRequirements,
  parsedCandidates,
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
          {analysis.rankedCandidates.map((candidate, index) => {
            const parsedDetail = parsedCandidates.find(
              (p) => p.name === candidate.name
            );

            return (
              <AccordionItem
                key={index}
                value={`candidate-${index}`}
                className="border rounded-lg"
              >
                <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted font-bold text-lg text-muted-foreground">
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
                      <span className="text-sm text-muted-foreground">
                        / 100
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 border-b pb-6">
                    <DetailItem
                      label="Designation"
                      value={parsedDetail?.designation}
                    />
                    <DetailItem
                      label="Experience"
                      value={parsedDetail?.experience}
                    />
                    <DetailItem label="CTC" value={parsedDetail?.ctc} />
                    <DetailItem
                      label="Current Location"
                      value={parsedDetail?.currentLocation}
                    />
                    <DetailItem
                      label="Preferred Location"
                      value={parsedDetail?.preferredLocation}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6">
                    <DetailItem
                      label="Key Skills"
                      value={parsedDetail?.keySkills}
                    />
                    <DetailItem
                      label="Preferred Skills"
                      value={parsedDetail?.preferredSkills}
                    />
                  </div>

                  {candidate.mustHaves?.length > 0 &&
                    requirementsList.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 mt-4 pt-4 border-t">
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
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
