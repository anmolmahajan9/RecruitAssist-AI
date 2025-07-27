
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CombinePdfs } from '@/components/pdf-tools/combine-pdfs';
import { InsertImage } from '@/components/pdf-tools/insert-image';
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
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Combine multiple PDFs into a single file or insert images
          </p>
        </div>
      </header>

      <Tabs defaultValue="combine" className="w-full">
        <TabsList className="grid w-full grid-cols-2 p-1 h-auto rounded-lg bg-secondary/80">
          <TabsTrigger
            value="combine"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md py-2 transition-all duration-300 hover:bg-primary/20"
          >
            Combine PDFs
          </TabsTrigger>
          <TabsTrigger
            value="insert-image"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg rounded-md py-2 transition-all duration-300 hover:bg-primary/20"
          >
            Insert Watermark
          </TabsTrigger>
        </TabsList>
        <TabsContent value="combine" className="mt-6">
          <CombinePdfs />
        </TabsContent>
        <TabsContent value="insert-image" className="mt-6">
          <InsertImage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
