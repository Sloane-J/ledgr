// components/orders/OrderFilters.tsx
import * as React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/lib/utils';

const STATUS_FILTERS = ['all', 'completed', 'refunded', 'voided'] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

interface OrderFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (value: StatusFilter) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
}

export function OrderFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
}: OrderFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by ID or customer…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-9 h-9 text-sm bg-card border-border"
          />
        </div>

        {/* Status filter */}
        <div className="flex border border-border">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onStatusFilterChange(s)}
              className={cn(
                'px-4 h-9 text-[10px] font-black uppercase tracking-widest transition-colors border-r border-border last:border-r-0',
                statusFilter === s
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Date range */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              From
            </p>
            <Input
              type="date"
              value={dateFrom}
              onChange={e => onDateFromChange(e.target.value)}
              className="h-9 text-xs bg-card border-border"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
              To
            </p>
            <Input
              type="date"
              value={dateTo}
              onChange={e => onDateToChange(e.target.value)}
              className="h-9 text-xs bg-card border-border"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => { onDateFromChange(''); onDateToChange(''); }}
              className="self-end h-9 px-3 text-[10px] font-black uppercase tracking-widest border border-border text-muted-foreground hover:text-destructive hover:border-destructive/50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}