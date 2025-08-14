
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ListFilter, X } from 'lucide-react';
import type { Client } from '@/types/client';

export interface Filters {
  clients: string[];
  states: string[];
  poDuration: 'all' | '30' | '60' | '90';
  statuses: string[];
  pendingOnboarding: boolean;
}

interface EmployeeFiltersProps {
  clients: Client[];
  states: string[];
  onFilterChange: (filters: Filters) => void;
}

const initialFilters: Filters = {
  clients: [],
  states: [],
  poDuration: 'all',
  statuses: [],
  pendingOnboarding: false,
};

export function EmployeeFilters({
  clients,
  states,
  onFilterChange,
}: EmployeeFiltersProps) {
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const handleMultiSelectChange = (
    type: 'clients' | 'states' | 'statuses',
    value: string
  ) => {
    const newValues = filters[type].includes(value)
      ? filters[type].filter((item) => item !== value)
      : [...filters[type], value];

    const newFilters = { ...filters, [type]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePoDurationChange = (value: string) => {
    const newFilters = {
      ...filters,
      poDuration: value as Filters['poDuration'],
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handlePendingOnboardingChange = (checked: boolean) => {
    const newFilters = { ...filters, pendingOnboarding: checked };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    onFilterChange(initialFilters);
  };

  const activeFilterCount =
    filters.clients.length +
    filters.states.length +
    filters.statuses.length +
    (filters.poDuration !== 'all' ? 1 : 0) +
    (filters.pendingOnboarding ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-card rounded-2xl shadow-sm border">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <ListFilter className="h-5 w-5 text-primary" />
        Filters
      </h3>

      {/* Client Filter */}
      <MultiSelectFilter
        label="Client"
        options={clients.map((c) => c.name)}
        selected={filters.clients}
        onChange={(value) => handleMultiSelectChange('clients', value)}
      />

      {/* State Filter */}
      <MultiSelectFilter
        label="State"
        options={states}
        selected={filters.states}
        onChange={(value) => handleMultiSelectChange('states', value)}
      />
      
       {/* Status Filter */}
      <MultiSelectFilter
        label="Status"
        options={['Active', 'Pending', 'Ended']}
        selected={filters.statuses}
        onChange={(value) => handleMultiSelectChange('statuses', value)}
      />

      {/* PO Duration Filter */}
      <div>
        <Select value={filters.poDuration} onValueChange={handlePoDurationChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="PO End Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">PO Duration (All)</SelectItem>
            <SelectItem value="30">Ending in 30 days</SelectItem>
            <SelectItem value="60">Ending in 60 days</SelectItem>
            <SelectItem value="90">Ending in 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Pending Onboarding Filter */}
      <div className="flex items-center space-x-2">
        <Switch
          id="pending-onboarding"
          checked={filters.pendingOnboarding}
          onCheckedChange={handlePendingOnboardingChange}
        />
        <Label htmlFor="pending-onboarding">Pending Onboarding</Label>
      </div>
      
       {activeFilterCount > 0 && (
         <Button variant="ghost" onClick={handleReset} className="text-primary hover:text-primary">
            <X className="mr-2 h-4 w-4" />
            Reset ({activeFilterCount})
          </Button>
       )}
    </div>
  );
}

// Reusable MultiSelect Component
interface MultiSelectFilterProps {
  label: string;
  options: string[];
  selected: string[];
  onChange: (value: string) => void;
}

function MultiSelectFilter({
  label,
  options,
  selected,
  onChange,
}: MultiSelectFilterProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto">
          {label}
          {selected.length > 0 && ` (${selected.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 max-h-96 overflow-y-auto">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option}
            checked={selected.includes(option)}
            onCheckedChange={() => onChange(option)}
          >
            {option}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
