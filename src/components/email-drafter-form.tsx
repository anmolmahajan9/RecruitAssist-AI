
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

const placeholderText = `Candidate | Experience | Availability
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
  const [formData, setFormData] = useState<EmailDrafterInput>({
    clientPocName: '',
    jobRole: '',
    candidateDetails: '',
    requiredColumns: '',
    instructions: '',
  });

  const [tablePreview, setTablePreview] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [hasPreviewBeenRun, setHasPreviewBeenRun] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'requiredColumns') {
      setHasPreviewBeenRun(false); // Reset preview status when columns change
      setTablePreview(''); // Clear old preview
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleReset = () => {
    setFormData({
      clientPocName: '',
      jobRole: '',
      candidateDetails: '',
      requiredColumns: '',
      instructions: '',
    });
    setTablePreview('');
    setPreviewError('');
    setHasPreviewBeenRun(false);
    onReset();
  };

  const handlePreview = async () => {
    if (!formData.requiredColumns) return;
    setIsPreviewLoading(true);
    setPreviewError('');
    setTablePreview('');
    try {
      const result = await generateTablePreview({
        requiredColumns: formData.requiredColumns,
      });
      setTablePreview(result.htmlTable);
      setFormData((prev) => ({
        ...prev,
        requiredColumns: result.formattedColumns,
      }));
      setHasPreviewBeenRun(true); // Mark preview as successful
    } catch (err) {
      setPreviewError(
        err instanceof Error ? err.message : 'Failed to generate preview.'
      );
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const isDraftDisabled = isLoading || !formData.candidateDetails || (!!formData.requiredColumns && !hasPreviewBeenRun);


  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Enter Submission Details
        </CardTitle>
        <CardDescription>
          Provide the client, role, and candidate details. The AI will
          construct the email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientPocName" className="font-semibold">
                Client POC Name
              </Label>
              <Input
                id="clientPocName"
                name="clientPocName"
                placeholder="e.g., Ravi"
                value={formData.clientPocName}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobRole" className="font-semibold">
                Job Role
              </Label>
              <Input
                id="jobRole"
                name="jobRole"
                placeholder="e.g., Senior Frontend Developer"
                value={formData.jobRole}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="candidateDetails" className="font-semibold">
              Candidate Details <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="candidateDetails"
              name="candidateDetails"
              placeholder={placeholderText}
              value={formData.candidateDetails}
              onChange={handleInputChange}
              required
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Paste the candidate data here, ideally in a markdown table format.
            </p>
          </div>

          <div className="space-y-2 p-4 border rounded-lg bg-secondary/30">
            <Label htmlFor="requiredColumns" className="font-semibold">
              Required Columns (Optional)
            </Label>
            <Input
              id="requiredColumns"
              name="requiredColumns"
              placeholder="e.g., Candidate, Experience, Availability, Key Skills"
              value={formData.requiredColumns}
              onChange={handleInputChange}
              className="flex-grow"
            />
            <p className="text-xs text-muted-foreground pt-1">
              If you specify columns, you must click Preview before drafting the email.
            </p>

            {formData.requiredColumns && (
                <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handlePreview}
                      disabled={!formData.requiredColumns || isPreviewLoading}
                      className="w-full sm:w-auto"
                    >
                      {isPreviewLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="mr-2 h-4 w-4" />
                      )}
                      {isPreviewLoading ? 'Generating...' : 'Preview & Format Columns'}
                    </Button>
                </div>
            )}
            
            {previewError && (
              <p className="text-sm text-destructive pt-2">{previewError}</p>
            )}
            {tablePreview && (
              <div className="pt-4">
                <h4 className="font-semibold text-muted-foreground mb-2">
                  Column Preview:
                </h4>
                <div
                  className="overflow-x-auto p-4 border rounded-lg bg-background"
                  dangerouslySetInnerHTML={{ __html: tablePreview }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions" className="font-semibold">
              Additional Instructions (Optional)
            </Label>
            <Textarea
              id="instructions"
              name="instructions"
              placeholder="e.g., 'Combine the two tables provided' or 'Mention that resumes are attached separately'"
              value={formData.instructions}
              onChange={handleInputChange}
              className="min-h-[100px]"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="submit"
              disabled={isDraftDisabled}
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
