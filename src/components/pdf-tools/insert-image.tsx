'use client';

import React, { useState, useCallback, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Loader2,
  Download,
  Trash2,
  UploadCloud,
  File as FileIcon,
  ImageIcon,
  Building,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const MAX_FILES = 100;
const DEFAULT_LOGO_URL = 'https://recruitassist-ai-knbnk.web.app/logo.png'; // Path to the logo in the public folder

export function InsertImage() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [watermarkSource, setWatermarkSource] = useState<'upload' | 'default'>(
    'default'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const pdfFileInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);

  const handleAddPdfFiles = (files: File[]) => {
    if (pdfFiles.length + files.length > MAX_FILES) {
      setError(`You cannot process more than ${MAX_FILES} files at once.`);
      return;
    }
    const newFiles = files.filter(
      (file) => file.type === 'application/pdf'
    );
    setPdfFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setError(null);
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleAddPdfFiles(Array.from(e.target.files));
      if (pdfFileInputRef.current) {
        pdfFileInputRef.current.value = '';
      }
    }
  };

  const handleWatermarkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
      setWatermarkFile(file);
      setError(null);
    } else {
      setWatermarkFile(null);
      setError('Please select a valid PNG or JPEG image for the watermark.');
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

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleAddPdfFiles(Array.from(files));
      }
    },
    [pdfFiles]
  );

  const removeFile = (index: number) => {
    setPdfFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleAddFilesClick = () => {
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.click();
    }
  };

  const handleWatermarkClick = () => {
    if (watermarkInputRef.current) {
      watermarkInputRef.current.click();
    }
  };

  const handleProcess = async () => {
    if (pdfFiles.length === 0) {
      setError('Please select at least one PDF file.');
      return;
    }
    if (watermarkSource === 'upload' && !watermarkFile) {
      setError('Please upload a watermark image or select the default logo.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let imageBytes: ArrayBuffer;
      let imageType: 'png' | 'jpeg';

      if (watermarkSource === 'upload' && watermarkFile) {
        imageBytes = await watermarkFile.arrayBuffer();
        imageType = watermarkFile.type === 'image/png' ? 'png' : 'jpeg';
      } else {
        const response = await fetch(DEFAULT_LOGO_URL);
        if (!response.ok) {
           throw new Error(`Failed to load default logo: ${response.statusText}`);
        }
        imageBytes = await response.arrayBuffer();
        imageType = 'png';
      }

      for (const pdfFile of pdfFiles) {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);

        let watermarkImage;
        if (imageType === 'png') {
          watermarkImage = await pdfDoc.embedPng(imageBytes);
        } else {
          watermarkImage = await pdfDoc.embedJpg(imageBytes);
        }

        const pages = pdfDoc.getPages();
        for (const page of pages) {
          const { width, height } = page.getSize();
          const logoDims = watermarkImage.scale(0.1);
          page.drawImage(watermarkImage, {
            x: width - logoDims.width - 20,
            y: height - logoDims.height - 20,
            width: logoDims.width,
            height: logoDims.height,
            opacity: 0.5,
          });
        }

        const modifiedPdfBytes = await pdfDoc.save();
        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const originalName = pdfFile.name.replace(/\.pdf$/i, '');
        a.download = `${originalName}-suitable-ai.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error(err);
      setError(
        'An error occurred while processing the PDFs. Please ensure files and network are okay.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPdfFiles([]);
    setWatermarkFile(null);
    setWatermarkSource('default');
    setError(null);
    if (pdfFileInputRef.current) {
      pdfFileInputRef.current.value = '';
    }
    if (watermarkInputRef.current) {
      watermarkInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Insert Watermark</CardTitle>
        <CardDescription>
          Choose a watermark, then select PDF files to apply it to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-semibold">1. Choose Watermark Source</h4>
          <RadioGroup
            value={watermarkSource}
            onValueChange={(value) => setWatermarkSource(value as 'upload' | 'default')}
            className="flex gap-4"
          >
            <Label htmlFor="r-default" className="flex-1">
              <Card className="cursor-pointer hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                  <RadioGroupItem value="default" id="r-default" />
                  <Building className="h-6 w-6 text-muted-foreground" />
                  <span className="font-bold">Use Default Logo</span>
                </CardHeader>
              </Card>
            </Label>
             <Label htmlFor="r-upload" className="flex-1">
              <Card className="cursor-pointer hover:border-primary">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0 p-4">
                  <RadioGroupItem value="upload" id="r-upload" />
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  <span className="font-bold">Upload an Image</span>
                </CardHeader>
              </Card>
            </Label>
          </RadioGroup>

          {watermarkSource === 'upload' && (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
                'hover:border-primary hover:bg-primary/10 cursor-pointer'
              )}
              onClick={handleWatermarkClick}
            >
              <Input
                id="watermark-file"
                type="file"
                accept="image/png, image/jpeg"
                className="hidden"
                onChange={handleWatermarkChange}
                ref={watermarkInputRef}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <ImageIcon className="w-12 h-12 text-muted-foreground" />
                {watermarkFile ? (
                  <p className="text-sm font-medium text-foreground">
                    {watermarkFile.name}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{' '}
                    a PNG or JPG
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

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
          <h4 className="font-semibold mb-4">2. Upload PDFs</h4>
          <Input
            id="pdf-files"
            type="file"
            accept="application/pdf"
            multiple
            className="hidden"
            onChange={handlePdfChange}
            ref={pdfFileInputRef}
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-primary">Click to upload</span>{' '}
              or drag and drop
            </p>
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

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
      </CardContent>
      {pdfFiles.length > 0 && (
        <CardFooter className="flex-col sm:flex-row gap-2 pt-4">
          <Button
            onClick={handleProcess}
            disabled={
              isLoading ||
              pdfFiles.length === 0 ||
              (watermarkSource === 'upload' && !watermarkFile)
            }
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
