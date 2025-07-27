'use client';

import { useState, useRef } from 'react';
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
  FileText,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

const MAX_FILES = 5;

export function CombinePdfs() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf'
      );
      if (pdfFiles.length + newFiles.length > MAX_FILES) {
        setError(`You can select a maximum of ${MAX_FILES} files.`);
        return;
      }
      setPdfFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setError(null);
      // Clear the input value so the same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setPdfFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setError(null); // Clear error if files are removed
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
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Combine PDFs</CardTitle>
        <CardDescription className="mt-2 text-md">
          Merge up to {MAX_FILES} PDF files into a single document. Reorder
          them as needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="pdf-files-combine" className="text-lg font-semibold">
            Select PDF Files
          </Label>
          <Input
            id="pdf-files-combine"
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            disabled={pdfFiles.length >= MAX_FILES}
            className="hidden" // Hide the default input
            ref={fileInputRef}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={pdfFiles.length >= MAX_FILES}
            className="w-full py-3 text-lg"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {pdfFiles.length === 0 ? 'Choose Files' : 'Add More Files'}
          </Button>
        </div>

        {pdfFiles.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Selected Files ({pdfFiles.length}/{MAX_FILES}):</h4>
            <ul className="space-y-3">
              {pdfFiles.map((file, index) => (
                <li
                  key={file.name + index} // Use index as well to ensure uniqueness if file names are identical
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex items-center flex-grow min-w-0 mr-2">
                    <FileText className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="truncate text-base font-medium text-gray-800 dark:text-gray-200">
                      {index + 1}. {file.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFile(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <ArrowUp className="h-4 w-4" />
                      <span className="sr-only">Move up</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveFile(index, 'down')}
                      disabled={index === pdfFiles.length - 1}
                      className="h-8 w-8 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="sr-only">Move down</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="sr-only">Remove file</span>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            onClick={handleCombine}
            disabled={isLoading || pdfFiles.length < 2}
            size="lg"
            className="flex-grow py-3 text-lg"
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
              className="w-full sm:w-auto py-3 text-lg"
            >
              <Trash2 className="mr-2 h-5 w-5" />
              Clear All
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}