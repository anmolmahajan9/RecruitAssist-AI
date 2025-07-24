'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Trash2, ImageUp, FileUp } from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';

export function InsertImage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!pdfFile || !imageFile) {
      setError('Please select both a PDF and an image file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const imageBytes = await imageFile.arrayBuffer();

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const image = await pdfDoc.embedPng(imageBytes);

      const firstPage = pdfDoc.getPages()[0];
      const { width, height } = firstPage.getSize();
      
      // Example: Place image at bottom-left with a margin
      const imageDims = image.scale(0.25); // Scale image to 25% of its original size
      firstPage.drawImage(image, {
        x: 50,
        y: 50,
        width: imageDims.width,
        height: imageDims.height,
      });

      const modifiedPdfBytes = await pdfDoc.save();

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'modified.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to process files.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReset = () => {
    setPdfFile(null);
    setImageFile(null);
    setError(null);
    const pdfInput = document.getElementById('pdf-file-insert') as HTMLInputElement;
    const imageInput = document.getElementById('image-file-insert') as HTMLInputElement;
    if (pdfInput) pdfInput.value = '';
    if (imageInput) imageInput.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insert Image into PDF</CardTitle>
        <CardDescription>
          Upload a PDF and an image to embed the image on the first page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="pdf-file-insert">PDF File</Label>
            <Input
              id="pdf-file-insert"
              type="file"
              accept="application/pdf"
              onChange={handlePdfChange}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-file-insert">Image File</Label>
            <Input
              id="image-file-insert"
              type="file"
              accept="image/png"
              onChange={handleImageChange}
               className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>
        </div>
        
        {pdfFile && (
          <p className="text-sm text-muted-foreground flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
            <FileUp className="w-4 h-4" /> PDF: {pdfFile.name}
          </p>
        )}
        {imageFile && (
           <p className="text-sm text-muted-foreground flex items-center gap-2 bg-secondary/50 p-2 rounded-md">
            <ImageUp className="w-4 h-4" /> Image: {imageFile.name}
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleProcess}
            disabled={isLoading || !pdfFile || !imageFile}
            size="lg"
            className="w-full text-lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Processing...' : 'Process & Download'}
          </Button>

          {(pdfFile || imageFile) && (
             <Button
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto text-lg"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                Clear
              </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
