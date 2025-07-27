
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
const DEFAULT_LOGO_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAYFBMVEX///8BAQEAAAD8/PwICAgKCgrf39/v7+8ZGRnOzs4pKSkWFhbx8fG7u7usrKyampo+Pj47OztBQUGbm5tPT09dXV2oqKh4eHhISEiUlJRhYWGhoaGtra3CwsLs7OyQkJCAgIBVdXJYAAACsklEQVR4nO3d65KiMBQGYAgQBREBBUFA8f+/9MvSKS10QhMnlPO+8w2nDGwan9M2bVq1atXqf11I+pT0K+lD0l+lD0n/lD4k/VP6kPTP1kfSb6ePpb/Ofjb9ffq49C/so9N/to9L/9k+Jv1n+5j0f+yj0/92H5f+s31s+k/30em/3cel/2wfJ//VfTT9XxpI+g8tJH0gPZJeS3v/xEEyS4n/Xv3w9I/V/0N/nf4f/efoH4/vGv1k9Bf0s9E/os7Xda/Qf0H9aPpf6j/Vv0L9fPjP1F9aP4b6fPFP1Z9V/Rz1S9S/Vv1i9c/UL1v9C9f/jP1z9L+h/T/rT1L9M/aH1n6l/nPof2n+l/gP7n1T/pvpPqP+l+l+p/yn1P6h/Tfq3qF+x/iv1L1G/Xv2P1G9dPzL1i9bPUP169RfWv1L9T/dfqP49+6/S/2f7n1J/T/1L9L9R/f/UP1f/M+rfnX8e/bvzL1T/rvwL1b8r/3L1r8p/Sv2r8k+rflf+0erfjn8s/dvyL1L/rvyL1e9Wf2f9u9Y/Wf1r1z9e/evWv2z9y9Z/bf231n97/TfXf3/9d9S/f/331G9gP4L6jew/S/297B9O/b3sH1P9vewvUP9vewP1H9jew/xX1h9e/5L68OqX1V9d/Sz19ZWvrD6/+nnpSytfWn159bPSl1e+uvrj6u+lLy99ffXF1b9PfWn179efXn199bfS33/0urvL36o+vvr76W+uPr76u+tv776e+u/v/6v1d9f/R3199S/S3379Uvq369+lfq369+vflv9t9a/bf231r9t/bfWf2v9t9a/7b131r/vvXX1v999etb1N+Tft36N+nfpn6d+rfp36h+tfo36l+kfpH6J+nfkv6J+nfkv6l+i/p36p+q/qH6Z+ofqn6Z+kfpH6p+sfqn6x+pfrX6p+sfq36V+lfrn6Z+ufrn61+tfrn6x+t/oP6d6nfqP6d6p/t/pn6b6r/lvr36v+t/r36r+x/pv7b6t+tfqD6l+ofrf6p+n+sf6z6T6l/Tf2f1f+l/hP6b63/ivpf6j+p/k+qH6v+T6r/pPpB6h+k/pHqL6l+p/qL6p+k/pHqL6r/l+rHqv+X6r+j/t36h6pfqn6Z+mHrX6p+sfrH6g/1n0//S9o/Zv0P1f9P/T/U/1f9T9Q/TP0j1Q9UP1T9UPVP1T9Q/S9UP0S9S9Sv0r9KtWvUr9G/SrVr1F/JvVr1Z9J/erVJ9N/Rv2J9N/qv1H9T9S/Rf0L1H9J/Sv0L9B/Q/0L1O/pX6t+jPpr6V+jfpD6D+hfqT6V+lfoP516hfoX6V+lPpL6h+m/pH6t+g/q/5n6R+n/sP6Z+n/pv4n6v+u/g/qn6T+V+kfov47+nfqP6f+F+kfov6b+j/t/y+lD6//D2n9pfpP6t6jftX6T6rfqH6t+o36b6r/kvrX6P+1+i9r/y/179X/sPoP1B9IfSD0j0//P9IfkH4k/Un6l6hfof4T6x9c8X8C1atVrVb9C/wH+kO7IeLwJ1MAAAAASUVORK5CYII=';

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
        // Use fetch to decode the base64 string correctly.
        const response = await fetch(DEFAULT_LOGO_BASE64);
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
