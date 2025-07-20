import { JobAnalyzer } from "@/components/job-analyzer";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
        <header className="flex justify-between items-center my-8 md:my-12">
          <div className="text-left">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              RecruitAssist AI
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
              Break down any job description and instantly generate a powerful
              boolean search query for Naukri.com.
            </p>
          </div>
          <ThemeToggle />
        </header>
        <JobAnalyzer />
      </div>
    </main>
  );
}
