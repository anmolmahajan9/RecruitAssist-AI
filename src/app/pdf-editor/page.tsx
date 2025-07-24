'use client';

import { useState } from 'react';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CombinePdfs } from '@/components/pdf-tools/combine-pdfs';
import { InsertImage } from '@/components/pdf-tools/insert-image';

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
            PDF Editor
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Simple tools to combine PDFs or add images.
          </p>
        </div>
      </header>

      <main>
        <Tabs defaultValue="combine">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="combine">Combine PDFs</TabsTrigger>
            <TabsTrigger value="insert-image">Insert Image</TabsTrigger>
          </TabsList>
          <TabsContent value="combine">
            <CombinePdfs />
          </TabsContent>
          <TabsContent value="insert-image">
            <InsertImage />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
