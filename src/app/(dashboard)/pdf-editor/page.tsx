
'use client';

import { PdfActions } from '@/components/pdf-tools/pdf-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export default function PdfEditorPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1 text-base sm:text-xl font-semibold text-foreground flex-wrap">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            </Link>
            <Link
              href="/"
              className="hover:text-primary transition-colors"
            >
              RecruitAssist AI
            </Link>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
            <span className="text-primary">PDF Tools</span>
          </div>
          <ThemeToggle />
        </div>
      </header>
      <PdfActions />
    </div>
  );
}
