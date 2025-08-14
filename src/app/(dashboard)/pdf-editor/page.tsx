
'use client';

import { PdfActions } from '@/components/pdf-tools/pdf-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PdfEditorPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="text-xl font-bold text-foreground hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
          </div>
          <ThemeToggle />
        </div>
        <div className="text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
            PDF Tools
          </h1>
        </div>
      </header>
      <PdfActions />
    </div>
  );
}
