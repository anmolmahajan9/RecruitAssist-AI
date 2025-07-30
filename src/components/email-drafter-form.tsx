'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, XCircle, Eye } from 'lucide-react';
import type { EmailDrafterInput } from '@/ai/schemas/email-drafter-schema';
import { generateTablePreview } from '@/ai/flows/table-preview-flow';

interface EmailDrafterFormProps {
  onSubmit: (formData: EmailDrafterInput) => Promise<void>;
  isLoading: boolean;
  onReset: () => void;
  hasResults: boolean;
}

const placeholderText = `Client: Ravi
Role: Senior Frontend Developer
Comments: Combine both tables

Candidate | Experience | Availability
--- | --- | ---
John Doe | 8 Years | Next Monday
Jane Smith | 6 Years | Immediate
`;

export function EmailDrafterForm({
  onSubmit,
  isLoading,
  onReset,
  hasResults,
}: EmailDrafterFormProps) {
  const [unstructuredText, setUnstructuredText] = useState('');
  const [requiredColumns, setRequiredColumns] = useState('');
  const [tablePreview, setTablePreview] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ unstructuredText, requiredColumns });
  };

  const handleReset = () => {
    setUnstructuredText('');
    setRequiredColumns('');
    setTablePreview('');
    setPreviewError('');
    onReset();
  };
  
  const handlePreview = async () => {
    if (!requiredColumns) return;
    setIsPreviewLoading(true);
    setPreviewError('');
    setTablePreview('');
    try {
      const result = await generateTablePreview({ requiredColumns });
      setTablePreview(result.htmlTable);
    } catch(err) {
       setPreviewError(err instanceof Error ? err.message : 'Failed to generate preview.');
    } finally {
        setIsPreviewLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Enter Submission Details
        </CardTitle>
        <CardDescription>
          Paste the client name, role, and candidate table below. The AI will
          generate the email text around your table.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="unstructuredText" className="font-semibold">
              Submission Details
            </Label>
            <Textarea
              id="unstructuredText"
              name="unstructuredText"
              placeholder={placeholderText}
              value={unstructuredText}
              onChange={(e) => setUnstructuredText(e.target.value)}
              required
              className="min-h-[250px] font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requiredColumns" className="font-semibold">
              Required Columns (Optional)
            </Label>
            <div className="flex items-center gap-2">
                <Input
                  id="requiredColumns"
                  name="requiredColumns"
                  placeholder="e.g., Candidate, Experience, Availability, Key Skills"
                  value={requiredColumns}
                  onChange={(e) => setRequiredColumns(e.target.value)}
                  className="flex-grow"
                />
                <Button type="button" onClick={handlePreview} disabled={!requiredColumns || isPreviewLoading}>
                    {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin"/> : <Eye className="h-4 w-4" />}
                    <span className="ml-2">Preview</span>
                </Button>
            </div>
             <p className="text-xs text-muted-foreground">
              Enter a comma-separated list of column headers in the order you want them to appear.
            </p>
          </div>
          
          {previewError && <p className="text-sm text-destructive">{previewError}</p>}
          {tablePreview && (
            <div className="p-4 border rounded-lg bg-background">
                <h4 className="font-semibold text-muted-foreground mb-2">Column Preview:</h4>
                <div dangerouslySetInnerHTML={{ __html: tablePreview }} />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isLoading || !unstructuredText}
              className="w-full text-lg py-6 font-bold transition-all duration-300 ease-in-out transform hover:scale-105 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
              size="lg"
            >
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isLoading ? 'Drafting...' : 'Draft Email'}
            </Button>
            {hasResults && (
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleReset}
                className="w-full sm:w-auto text-lg py-6 font-bold rounded-xl hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
              >
                <XCircle className="mr-2 h-5 w-5" />
                Clear & Start Over
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
