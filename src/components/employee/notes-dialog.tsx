
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface NotesDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (
    employeeId: string,
    itemType: string,
    notes: string
  ) => Promise<void>;
  employeeId: string;
  employeeName: string;
  itemType: string;
  currentNotes: string;
  updatedBy?: string;
  updatedAt?: any;
}

const formatUpdateDate = (timestamp: any): string => {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatTitle = (itemType: string): string => {
    switch (itemType) {
        case 'hrCheckin12th': return 'HR Check-in (12th)';
        case 'hrCheckin25th': return 'HR Check-in (25th)';
        case 'timesheet': return 'Timesheet';
        case 'invoice': return 'Invoice';
        default: return 'Notes';
    }
}


export function NotesDialog({
  isOpen,
  onOpenChange,
  onSave,
  employeeId,
  employeeName,
  itemType,
  currentNotes,
  updatedBy,
  updatedAt,
}: NotesDialogProps) {
  const [notes, setNotes] = useState(currentNotes);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(employeeId, itemType, notes);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Notes for {formatTitle(itemType)}</DialogTitle>
          <DialogDescription>
            Viewing/editing notes for {employeeName}.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes-textarea">Notes</Label>
            <Textarea
              id="notes-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes here..."
              className="min-h-[200px]"
            />
          </div>
          {updatedBy && updatedAt && (
            <p className="text-xs text-muted-foreground">
              Last status change by <strong>{updatedBy}</strong> on{' '}
              {formatUpdateDate(updatedAt)}.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Notes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
