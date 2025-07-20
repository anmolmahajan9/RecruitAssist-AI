import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AnalysisResult } from '@/lib/types';
import { BooleanQueryCard } from './BooleanQueryCard';
import { BookOpen, BrainCircuit, ListTodo, Briefcase, Users, Star } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  return (
    <div className="space-y-6">
      <BooleanQueryCard initialQuery={result.BooleanQuery} />

      <Accordion type="multiple" defaultValue={['breakdown', 'terms']} className="w-full space-y-4">
        <AccordionItem value="breakdown" className="border-none">
          <Card className="rounded-2xl shadow-lg">
            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                <ListTodo className="h-6 w-6 text-primary" />
                Job Role Breakdown
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-md mb-3 flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" />Role-Specific Tasks</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-2">
                    {result.Tasks.SpecificTasks.map((task, i) => <li key={i}>{task}</li>)}
                  </ul>
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-md mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-gray-500" />General Tasks</h3>
                  <ul className="list-disc list-inside space-y-1.5 text-muted-foreground pl-2">
                    {result.Tasks.GeneralTasks.map((task, i) => <li key={i}>{task}</li>)}
                  </ul>
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>
        
        <AccordionItem value="terms" className="border-none">
          <Card className="rounded-2xl shadow-lg">
            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                Definitions of Terms
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-6">
                 <div>
                  <h3 className="font-semibold text-md mb-3">Specific to Role</h3>
                  {result.TechnicalTermsAndJargon.SpecificToRole.map((term, i) => (
                    <div key={i} className="mb-3 text-muted-foreground">
                      <p><strong className="text-foreground">{term.term}</strong>: {term.definition}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-md mb-3">General Terms</h3>
                  {result.TechnicalTermsAndJargon.GeneralTerms.map((term, i) => (
                    <div key={i} className="mb-3 text-muted-foreground">
                     <p><strong className="text-foreground">{term.term}</strong>: {term.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </Card>
        </AccordionItem>

        <AccordionItem value="explanations" className="border-none">
          <Card className="rounded-2xl shadow-lg">
            <AccordionTrigger className="p-6 text-lg font-semibold hover:no-underline">
              <div className="flex items-center gap-3">
                <BrainCircuit className="h-6 w-6 text-primary" />
                Simplified Explanations
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <Tabs defaultValue="recruiter" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="recruiter">Recruiter</TabsTrigger>
                  <TabsTrigger value="undergrad">Undergrad</TabsTrigger>
                  <TabsTrigger value="child">5-year-old</TabsTrigger>
                </TabsList>
                <TabsContent value="recruiter" className="mt-4 p-4 border rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground leading-relaxed">{result.JobRoleExplained.Recruiter}</p>
                </TabsContent>
                <TabsContent value="undergrad" className="mt-4 p-4 border rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground leading-relaxed">{result.JobRoleExplained.Intermediate}</p>
                </TabsContent>
                <TabsContent value="child" className="mt-4 p-4 border rounded-lg bg-secondary/50">
                  <p className="text-muted-foreground leading-relaxed">{result.JobRoleExplained.Easy}</p>
                </TabsContent>
              </Tabs>
            </AccordionContent>
          </Card>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
