'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { JobExplainerOutput } from '@/ai/schemas/job-explainer-schema';
import {
  Briefcase,
  BrainCircuit,
  FileText,
  Baby,
  School,
  Users,
} from 'lucide-react';

interface JobExplainerDisplayProps {
  explanation: JobExplainerOutput;
}

export function JobExplainerDisplay({ explanation }: JobExplainerDisplayProps) {
  const renderTermList = (terms: { term: string; definition: string }[]) => (
    <div className="space-y-4">
      {terms.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-1 p-3 bg-secondary/50 rounded-lg"
        >
          <p className="md:col-span-1 font-semibold text-foreground">
            {item.term}
          </p>
          <p className="md:col-span-2 text-muted-foreground">
            {item.definition}
          </p>
        </div>
      ))}
    </div>
  );

  const renderTaskList = (tasks: string[]) => (
    <ul className="space-y-2 list-disc list-inside">
      {tasks.map((task, index) => (
        <li key={index} className="text-muted-foreground">
          {task}
        </li>
      ))}
    </ul>
  );

  return (
    <Accordion
      type="multiple"
      defaultValue={['job-role', 'tech-terms', 'key-tasks']}
      className="space-y-6"
    >
      <AccordionItem value="job-role" className="border-b-0">
        <Card>
          <AccordionTrigger className="p-6 hover:no-underline">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-primary" />
              Job Role Explained
            </CardTitle>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <Accordion
              type="multiple"
              defaultValue={['exp-easy', 'exp-intermediate', 'exp-recruiter']}
              className="space-y-2"
            >
              <AccordionItem value="exp-easy" className="border-0">
                <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Baby className="w-6 h-6 text-primary" />
                    Easy explanation
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2">
                  <p className="text-muted-foreground">
                    {explanation.JobRoleExplained.Easy}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="exp-intermediate" className="border-0">
                <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <School className="w-6 h-6 text-primary" />
                    Intermediate explanation
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2">
                  <p className="text-muted-foreground">
                    {explanation.JobRoleExplained.Intermediate}
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="exp-recruiter" className="border-0">
                <AccordionTrigger className="p-4 text-lg font-bold hover:no-underline bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-primary" />
                    Recruiter explanation
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-2">
                  <p className="text-muted-foreground">
                    {explanation.JobRoleExplained.Recruiter}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="tech-terms" className="border-b-0">
        <Card>
          <AccordionTrigger className="p-6 hover:no-underline">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <BrainCircuit className="w-7 h-7 text-primary" />
              Technical Terms &amp; Jargon
            </CardTitle>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-4 pb-2 border-b">
                Specific
              </h4>
              {renderTermList(explanation.TechnicalTermsAndJargon.SpecificToRole)}
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4 mt-6 pb-2 border-b">
                General
              </h4>
              {renderTermList(explanation.TechnicalTermsAndJargon.GeneralTerms)}
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>

      <AccordionItem value="key-tasks" className="border-b-0">
        <Card>
          <AccordionTrigger className="p-6 hover:no-underline">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <FileText className="w-7 h-7 text-primary" />
              Key Tasks
            </CardTitle>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6 space-y-6">
            <div>
              <h4 className="text-xl font-bold mb-4 pb-2 border-b">
                Specific Tasks
              </h4>
              {renderTaskList(explanation.Tasks.SpecificTasks)}
            </div>
            <div>
              <h4 className="text-xl font-bold mb-4 mt-6 pb-2 border-b">
                General Tasks
              </h4>
              {renderTaskList(explanation.Tasks.GeneralTasks)}
            </div>
          </AccordionContent>
        </Card>
      </AccordionItem>
    </Accordion>
  );
}
