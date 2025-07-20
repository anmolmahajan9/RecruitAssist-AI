import { JobAnalyzer } from "@/components/job-analyzer";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 sm:p-6 md:p-8">
      <div className="mx-auto max-w-4xl">
        <header className="text-center my-8 md:my-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 tracking-tight">
            Recruiter Assistant
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
            Break down any job description and instantly generate a powerful boolean search query for Naukri.com.
          </p>
        </header>
        <JobAnalyzer />
      </div>
    </main>
  );
}
