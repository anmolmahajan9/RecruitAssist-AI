'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useModel } from '@/context/ModelContext';

export function ModelSelector() {
  const { selectedModel, setSelectedModel } = useModel();

  const handleModelChange = (value: string) => {
    if (value === 'Google Gemini' || value === 'Claude Sonnet') {
      setSelectedModel(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          <span>{selectedModel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup
          value={selectedModel}
          onValueChange={handleModelChange}
        >
          <DropdownMenuRadioItem value="Google Gemini">
            Google Gemini
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="Claude Sonnet">
            Claude Sonnet
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
