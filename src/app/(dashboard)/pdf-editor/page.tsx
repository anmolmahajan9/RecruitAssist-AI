
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CombinePdfs } from '@/components/pdf-tools/combine-pdfs';
import { InsertImage } from '@/components/pdf-tools/insert-image';

export default function PdfEditorPage() {
  return (
    <div className="mx-auto grid w-full max-w-6xl gap-2">
      <h1 className="text-3xl font-semibold">PDF Tools</h1>
      <p className="text-sm text-muted-foreground mb-4">
        A collection of simple tools to manipulate PDF documents.
      </p>

      <div className="flex w-full">
        <Tabs defaultValue="combine" className="w-full">
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
      </div>
    </div>
  );
}
