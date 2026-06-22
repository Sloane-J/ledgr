// src/components/inventory/InventoryFilters.tsx
import * as React from 'react';
import { Search, LayoutGrid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { Category } from '@/src/types';

type StockFilter = 'all' | 'low' | 'out';
type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'price' | 'stock_quantity' | 'created_at';
type SortDir = 'asc' | 'desc';

interface InventoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  stockFilter: StockFilter;
  onStockFilterChange: (value: StockFilter) => void;
  viewMode: ViewMode;
  onViewModeChange: (value: ViewMode) => void;
  sortField: SortField;
  onSortFieldChange: (value: SortField) => void;
  sortDir: SortDir;
  onSortDirChange: (value: SortDir) => void;
  categories: Category[];
  // Barcode scan support — focuses SKU search on scanner input
  onBarcodeSearch?: (sku: string) => void;
}

export function InventoryFilters({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  stockFilter,
  onStockFilterChange,
  viewMode,
  onViewModeChange,
  sortField,
  onSortFieldChange,
  sortDir,
  onSortDirChange,
  categories,
  onBarcodeSearch,
}: InventoryFiltersProps) {
  // Barcode scanner support
  // USB/BT scanners act as keyboards — they type fast and hit Enter
  // We detect rapid input (>3 chars within 100ms) as a scan event
  const barcodeBufferRef = React.useRef('');
  const barcodeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onBarcodeSearch && search.trim()) {
      onBarcodeSearch(search.trim());
      return;
    }

    // Buffer rapid keystrokes for scanner detection
    barcodeBufferRef.current += e.key;
    if (barcodeTimerRef.current) clearTimeout(barcodeTimerRef.current);
    barcodeTimerRef.current = setTimeout(() => {
      barcodeBufferRef.current = '';
    }, 100);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search / Barcode scan input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU — or scan barcode…"
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pl-10 h-11 bg-card border-border text-sm"
          />
        </div>

        {/* Category filter */}
        <div className="w-full sm:w-52">
          <Select value={categoryFilter} onValueChange={onCategoryFilterChange}>
            <SelectTrigger className="h-11 border-border bg-card text-xs font-bold uppercase">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View mode toggle */}
        <div className="flex border border-border h-11">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'w-11 flex items-center justify-center border-r border-border transition-colors',
              viewMode === 'grid'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground'
            )}
            title="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={cn(
              'w-11 flex items-center justify-center transition-colors',
              viewMode === 'table'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:text-foreground'
            )}
            title="Table view"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">

        {/* Stock filter pills */}
        <div className="flex border border-border h-11">
          {(['all', 'low', 'out'] as const).map(s => (
            <button
              key={s}
              type="button"
              onClick={() => onStockFilterChange(s)}
              className={cn(
                'flex-1 sm:flex-none sm:px-5 text-[10px] font-black uppercase tracking-widest border-r border-border last:border-r-0 transition-colors',
                stockFilter === s
                  ? s === 'low'
                    ? 'bg-orange-500 text-white'
                    : s === 'out'
                      ? 'bg-destructive text-white'
                      : 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {s === 'all' ? 'All' : s === 'low' ? 'Low Stock' : 'Out of Stock'}
            </button>
          ))}
        </div>

        {/* Sort controls — shown in table view only */}
        <div className="flex gap-2">
          <Select value={sortField} onValueChange={v => onSortFieldChange(v as SortField)}>
            <SelectTrigger className="h-11 border-border bg-card text-xs font-bold uppercase w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price">Price</SelectItem>
              <SelectItem value="stock_quantity">Stock</SelectItem>
              <SelectItem value="created_at">Date Added</SelectItem>
            </SelectContent>
          </Select>
          <button
            type="button"
            onClick={() => onSortDirChange(sortDir === 'asc' ? 'desc' : 'asc')}
            className="h-11 px-4 border border-border bg-card text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortDir === 'asc' ? '↑ ASC' : '↓ DESC'}
          </button>
        </div>
      </div>
    </div>
  );
}