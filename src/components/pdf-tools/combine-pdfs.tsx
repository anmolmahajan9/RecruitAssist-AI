
'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  UploadCloud,
  File as FileIcon,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';

const MAX_FILES = 5;

export function CombinePdfs() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setPdfFiles((prevFiles) =>
        [...prevFiles, ...newFiles].slice(0, MAX_FILES)
      );
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files).filter(
        (file) => file.type === 'application/pdf'
      );
      setPdfFiles((prevFiles) =>
        [...prevFiles, ...newFiles].slice(0, MAX_FILES)
      );
      setError(null);
    }
  }, []);

  const removeFile = (index: number) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== index));
  };

  const handleAddFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Combine PDFs</CardTitle>
        <CardDescription>
          Merge multiple PDF files into a single document. Reorder them as
          needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleAddFilesClick}
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragging ? 'border-primary bg-accent' : 'border-border',
            'hover:border-primary hover:bg-muted/50 cursor-pointer'
          )}
        >
          <Input
            id="pdf-files-combine"
            type="file"
            accept="application/pdf"
            multiple
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              Up to {MAX_FILES} PDFs
            </p>
          </div>
        </div>

        {pdfFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Selected Files (in order):</h4>
            <ul className="space-y-2">
              {pdfFiles.map((file, index) => (
                <li
                  key={file.name + index}
                  className="flex items-center justify-between p-2 rounded-md bg-muted"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span
                      className="font-medium text-sm truncate"
                      title={file.name}
                    >
                      {index + 1}. {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      ({(file.size / 1024).toFixed(2)} KB)
                    </span>
                  </div>
                  <div className="flex gap-1 items-center flex-shrink-0">
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                      className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error && <p className="text-sm text-destructive text-center">{error}</p>}
      </CardContent>
      {pdfFiles.length > 0 && (
        <CardFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            onClick={handleCombine}
            disabled={isLoading || pdfFiles.length < 2}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Combining...' : `Combine ${pdfFiles.length} Files`}
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-5 w-5" />
            Clear
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
