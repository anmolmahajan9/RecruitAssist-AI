
'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  UploadCloud,
  File as FileIcon,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const MAX_FILES = 100;

export function InsertImage() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Statically set the URL provided by the user.
    // Note: The token in this URL can expire. A more robust long-term solution
    // is to fetch the URL dynamically and ensure CORS is configured on the bucket.
    const staticLogoUrl = 'https://firebasestorage.googleapis.com/v0/b/recruitassist-ai-knbnk.firebasestorage.app/o/logo%20default.png?alt=media&token=83c8e6ca-a402-448b-9dd1-2b3745731ea8';
    setLogoUrl(staticLogoUrl);
  }, []);

  const handleAddFiles = (files: File[]) => {
    if (pdfFiles.length + files.length > MAX_FILES) {
      setError(`You cannot process more than ${MAX_FILES} files at once.`);
      return;
    }
    const newFiles = files.filter(
      (file) => file.type === 'application/pdf'
    );
    setPdfFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError(null);
  }

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleAddFiles(Array.from(e.target.files));
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
      handleAddFiles(Array.from(files));
    }
  }, [pdfFiles]);

  const removeFile = (index: number) => {
    setPdfFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddFilesClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProcess = async () => {
    if (pdfFiles.length === 0) {
      setError('Please select at least one PDF file.');
      return;
    }
    if (!logoUrl) {
      setError('Watermark image is not available. Cannot process files.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use a CORS proxy to bypass browser restrictions for fetching the image.
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const response = await fetch(proxyUrl + logoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch watermark image (status: ${response.status})`);
      }
      const imageBytes = await response.arrayBuffer();

      for (const pdfFile of pdfFiles) {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const logoImage = await pdfDoc.embedPng(imageBytes);

        const pages = pdfDoc.getPages();
        for (const page of pages) {
          const { width, height } = page.getSize();
          const logoDims = logoImage.scale(0.1);
          page.drawImage(logoImage, {
            x: width - logoDims.width - 20,
            y: height - logoDims.height - 20,
            width: logoDims.width,
            height: logoDims.height,
          });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `watermarked_${pdfFile.name}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while processing the PDFs. You may need to configure CORS on your Firebase Storage bucket to allow access.');
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Insert Watermark</CardTitle>
        <CardDescription>
          Select PDF files to add a watermark to each page.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            dragging ? 'border-primary bg-accent' : 'border-border',
            'hover:border-primary hover:bg-muted/50 cursor-pointer'
          )}
          onClick={handleAddFilesClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Input
            id="pdf-files"
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handlePdfChange}
            ref={fileInputRef}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span>{' '}
              or drag and drop
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold">Watermark Preview</h4>
          <div className="flex justify-center items-center p-4 bg-muted rounded-md min-h-[80px]">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo Preview" className="h-16 w-auto" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {pdfFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Selected Files:</h4>
            <ul className="space-y-2">
              {pdfFiles.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between p-2 rounded-md border"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <span
                      className="font-medium text-sm truncate"
                      title={file.name}
                    >
                      {file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    className="h-7 w-7 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
            onClick={handleProcess}
            disabled={isLoading || pdfFiles.length === 0 || !logoUrl}
            size="lg"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading
              ? 'Processing...'
              : `Add Watermark to ${pdfFiles.length} File(s)`}
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
