
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ArrowRight,
  Briefcase,
  Search,
  Medal,
  Phone,
  Mail,
  FileEdit,
  Combine,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col flex-grow items-center justify-center p-4 min-h-screen">
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

      <main className="w-full max-w-2xl flex flex-col gap-8">
         <Link href="/dashboard">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Users className="w-7 h-7 text-primary" />
                Employee Management
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
        <Link href="/job-explainer">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Briefcase className="w-7 h-7 text-primary" />
                Job Explainer
              </CardTitle>
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
                Boolean Query Helper
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Generate Query <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
        <Link href="/report-generator">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Combine className="w-7 h-7 text-primary" />
                Candidate Report Generator
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Generate Report <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
        <Link href="/email-drafter">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Mail className="w-7 h-7 text-primary" />
                Email Drafter
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Draft Email <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
        <Link href="/candidate-ranker">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Medal className="w-7 h-7 text-primary" />
                Candidate Ranker
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Start Ranking <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
        <Link href="/pdf-editor">
          <Card className="h-full transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer flex flex-col">
            <CardHeader className="flex-grow">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <FileEdit className="w-7 h-7 text-primary" />
                PDF Editor
              </CardTitle>
            </CardHeader>
            <div className="p-6 pt-0 flex justify-end items-center text-primary font-semibold">
              Edit PDFs <ArrowRight className="ml-2 h-5 w-5" />
            </div>
          </Card>
        </Link>
      </main>
    </div>
  );
}
