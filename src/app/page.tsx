import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowRight, Briefcase, Search } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center p-4">
      <header className="absolute top-0 right-0 p-4 sm:p-6 md:p-8">
        <ThemeToggle />
      </header>

      <div className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
          RecruitAssist AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Making daily life of recruiters easy
        </p>
      </div>

      <main className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        <Link href="/job-analyzer">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-primary" />
                Job Analyzer
              </CardTitle>
              <CardDescription className="pt-2 text-base">
                Break down job descriptions into key tasks, technical terms, and
                easy-to-understand explanations.
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>

        <Link href="/boolean-query">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Search className="w-7 h-7 text-primary" />
                Boolean Query Generator
              </CardTitle>
              <CardDescription className="pt-2 text-base">
                Automatically generate an optimized Boolean search query based
                on a job description.
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Generate Query <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
      </main>
    </div>
  );
}
