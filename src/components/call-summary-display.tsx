
'use client';

import type { InterviewAssessmentOutput } from '@/ai/schemas/interview-assessment-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CallSummaryDisplayProps {
  assessment: InterviewAssessmentOutput;
}

const ScoreBar = ({
  skill,
  score,
  rating,
}: {
  skill: string;
  score: number;
  rating: string;
}) => {
  const ratingColor =
    rating.toLowerCase() === 'excellent'
      ? 'text-green-600'
      : rating.toLowerCase() === 'good'
        ? 'text-green-500'
        : rating.toLowerCase() === 'average'
          ? 'text-yellow-500'
          : 'text-red-500';

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="font-medium">{skill}</p>
        <p className={cn('font-semibold', ratingColor)}>{rating}</p>
      </div>
      <Progress value={score} />
    </div>
  );
};

export function CallSummaryDisplay({ assessment }: CallSummaryDisplayProps) {
  if (!assessment) return null;
  const {
    candidateName,
    role,
    email,
    interviewDate,
    overallStatus,
    scores,
    summary,
  } = assessment;

  const statusColor =
    overallStatus.toLowerCase() === 'pass'
      ? 'bg-green-500 text-white'
      : 'bg-red-500 text-white';

  return (
    <Card className="overflow-hidden">
      <div className="bg-secondary/30 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {candidateName}
            </h2>
            <p className="text-muted-foreground mt-1">
              {role} | {email}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Interview Date: {interviewDate}
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-3">
            <div
              className={cn(
                'px-6 py-2 rounded-full font-bold text-lg',
                statusColor
              )}
            >
              {overallStatus}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Button variant="outline">
            <Video className="mr-2 h-4 w-4" />
            Watch interview
          </Button>
        </div>
      </div>
      <CardContent className="p-6 space-y-8">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Scores</h3>
          <div className="space-y-6">
            {scores.map((scoreItem) => (
              <ScoreBar key={scoreItem.skill} {...scoreItem} />
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Summary</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
            {summary}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
