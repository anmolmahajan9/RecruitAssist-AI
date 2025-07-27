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
  ImageUp,
  FileUp,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import { PDFDocument, rgb } from 'pdf-lib';

export function InsertImage() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter(
        (file) => file.type === 'application/pdf'
      );
      setPdfFiles(newFiles);
      setError(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedImage = e.target.files[0];
      if (!selectedImage.type.startsWith('image/')) {
        setError('Please select a valid image file (PNG, JPG, etc.).');
        setImageFile(null);
      } else {
        setImageFile(selectedImage);
        setError(null);
      }
    }
  };

  const handleProcess = async () => {
    if (pdfFiles.length === 0 || !imageFile) {
      setError('Please select at least one PDF and an image file.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const imageBytes = await imageFile.arrayBuffer();
      let image = null;

      for (const pdfFile of pdfFiles) {
        const pdfBytes = await pdfFile.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // Embed image only once per document if it hasn't been embedded yet
        if (!image) {
          if (imageFile.type === 'image/png') {
            image = await pdfDoc.embedPng(imageBytes);
          } else if (
            imageFile.type === 'image/jpeg' ||
            imageFile.type === 'image/jpg'
          ) {
            image = await pdfDoc.embedJpg(imageBytes);
          } else {
            throw new Error(
              'Unsupported image format. Please use PNG or JPG.'
            );
          }
        }

        const desiredWidth = 100;
        const imageDims = image.scale(1);
        const scaledDims = {
          width: desiredWidth,
          height: (imageDims.height / imageDims.width) * desiredWidth,
        };

        const pages = pdfDoc.getPages();
        for (const page of pages) {
          const { width, height } = page.getSize();

          page.drawImage(image, {
            x: width - scaledDims.width - 30,
            y: height - scaledDims.height - 30,
            width: scaledDims.width,
            height: scaledDims.height,
            opacity: 0.2,
          });
        }

        const modifiedPdfBytes = await pdfDoc.save();

        const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const originalName = pdfFile.name.replace(/\.pdf$/i, '');
        link.download = `${originalName}-suitable-ai.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Failed to process files.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setPdfFiles([]);
    setImageFile(null);
    setError(null);
    if (pdfInputRef.current) {
      pdfInputRef.current.value = '';
    }
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removePdfFile = (indexToRemove: number) => {
    setPdfFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToRemove)
    );
    setError(null);
  };

  const removeImageFile = () => {
    setImageFile(null);
    setError(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold">Insert Image into PDF</CardTitle>
        <CardDescription className="mt-2 text-md">
          Embed a small, semi-transparent image watermark onto every page of
          your selected PDF document(s).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label htmlFor="pdf-file-insert" className="text-lg font-semibold">
            Select PDF File(s)
          </Label>
          <Input
            id="pdf-file-insert"
            type="file"
            accept="application/pdf"
            onChange={handlePdfChange}
            multiple
            className="hidden"
            ref={pdfInputRef}
          />
          <Button
            onClick={() => pdfInputRef.current?.click()}
            className="w-full py-3 text-lg"
            variant="outline"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            {pdfFiles.length === 0 ? 'Choose PDF(s)' : 'Change PDF(s)'}
          </Button>
          {pdfFiles.length > 0 && (
            <ul className="space-y-2 mt-2">
              {pdfFiles.map((file, index) => (
                <li
                  key={file.name + index}
                  className="flex items-center justify-between p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm"
                >
                  <div className="flex items-center flex-grow min-w-0 mr-2">
                    <FileUp className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                    <span className="truncate text-base font-medium text-gray-800 dark:text-gray-200">
                      {file.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePdfFile(index)}
                    className="h-7 w-7 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 flex-shrink-0"
                  >
                    <XCircle className="h-4 w-4" />
                    <span className="sr-only">Remove PDF</span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4">
          <Label htmlFor="image-file-insert" className="text-lg font-semibold">
            Select Image File
          </Label>
          <Input
            id="image-file-insert"
            type="file"
            accept="image/png, image/jpeg"
            onChange={handleImageChange}
            className="hidden"
            ref={imageInputRef}
          />
          <Button
            onClick={() => imageInputRef.current?.click()}
            className="w-full py-3 text-lg"
            variant="outline"
          >
            <ImageUp className="mr-2 h-5 w-5" />
            {imageFile ? 'Change Image' : 'Choose Image'}
          </Button>
          {imageFile && (
            <div className="flex items-center justify-between p-2 rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm mt-2">
              <div className="flex items-center flex-grow min-w-0 mr-2">
                <ImageUp className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="truncate text-base font-medium text-gray-800 dark:text-gray-200">
                  {imageFile.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeImageFile}
                className="h-7 w-7 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 flex-shrink-0"
              >
                <XCircle className="h-4 w-4" />
                <span className="sr-only">Remove Image</span>
              </Button>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-destructive mt-4 text-center">{error}</p>}

        <div className="flex flex-col sm:flex-row gap-4 mt-6">
          <Button
            onClick={handleProcess}
            disabled={isLoading || pdfFiles.length === 0 || !imageFile}
            size="lg"
            className="flex-grow py-3 text-lg"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Download className="mr-2 h-5 w-5" />
            )}
            {isLoading ? 'Processing...' : 'Process & Download'}
          </Button>

          {(pdfFiles.length > 0 || imageFile) && (
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