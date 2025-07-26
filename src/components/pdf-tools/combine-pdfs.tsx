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
import {
  Loader2,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const MAX_FILES = 5;

export function CombinePdfs() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (pdfFiles.length + newFiles.length > MAX_FILES) {
        setError(`You can select a maximum of ${MAX_FILES} files.`);
        return;
      }
      setPdfFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setError(null);
    }
  };

  const handleCombine = async () => {
    if (pdfFiles.length < 2) {
      setError('Please select at least two PDF files to combine.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const pdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(
          pdfDoc,
          pdfDoc.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();

      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'combined.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to combine PDFs.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPdfFiles([]);
    setError(null);
    const fileInput = document.getElementById(
      'pdf-files-combine'
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    const newFiles = [...pdfFiles];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex >= 0 && newIndex < newFiles.length) {
      const temp = newFiles[index];
      newFiles[index] = newFiles[newIndex];
      newFiles[newIndex] = temp;
      setPdfFiles(newFiles);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Combine PDFs</CardTitle>
        <CardDescription>
          Select multiple PDF files (up to {MAX_FILES}) to merge them into a single
          document. You can reorder the files before combining.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="pdf-files-combine">PDF Files</Label>
          <Input
            id="pdf-files-combine"
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            disabled={pdfFiles.length >= MAX_FILES}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
          />
        </div>

        {pdfFiles.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2">Selected Files (in order):</h4>
            <ul className="space-y-2">
              {pdfFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm text-muted-foreground bg-secondary/50 p-2 rounded-md"
                >
                  <span className="truncate pr-2">
                    {index + 1}. {file.name}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="h-7 w-7"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === pdfFiles.length - 1}
                      className="h-7 w-7"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleCombine}
            disabled={isLoading || pdfFiles.length < 2}
            size="lg"
            className="w-full text-lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Combining...' : 'Combine & Download'}
          </Button>

          {pdfFiles.length > 0 && (
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
