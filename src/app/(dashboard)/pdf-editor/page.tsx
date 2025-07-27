
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CombinePdfs } from '@/components/pdf-tools/combine-pdfs';
import { InsertImage } from '@/components/pdf-tools/insert-image';

export default function PdfEditorPage() {
  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
          PDF Tools
        </h1>
        <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
          A collection of simple tools to manipulate PDF documents.
        </p>
      </div>

      <Tabs defaultValue="combine" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="combine">Combine PDFs</TabsTrigger>
          <TabsTrigger value="insert-image">Insert Watermark</TabsTrigger>
        </TabsList>
        <TabsContent value="combine">
          <CombinePdfs />
        </TabsContent>
        <TabsContent value="insert-image">
          <InsertImage />
        </TabsContent>
      </Tabs>
    </div>
  );
}
