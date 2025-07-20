import { JobAnalyzer } from "@/components/job-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-background p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="text-center my-8 md:my-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight">
            RecruitAssist AI
          </h1>
          <p className="mt-3 text-lg text-slate-600 max-w-2xl mx-auto">
            Break down any job description and instantly generate a powerful boolean search query for Naukri.com.
          </p>
        </header>
        <JobAnalyzer />
      </div>
    </main>
  );
}
