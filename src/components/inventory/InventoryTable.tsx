// src/components/inventory/InventoryTable.tsx
import * as React from 'react';
import {
  AlertTriangle,
  ArrowUpDown,
  Edit,
  Package,
  SlidersHorizontal,
  Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency, LOW_STOCK_THRESHOLD } from '@/src/lib/constants';
import { Product } from '@/src/types';

type SortField = 'name' | 'price' | 'stock_quantity' | 'created_at';
type SortDir = 'asc' | 'desc';

interface InventoryTableProps {
  products: Product[];
  sortField: SortField;
  sortDir: SortDir;
  onSortChange: (field: SortField) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}

function SortableHeader({
  label,
  field,
  sortField,
  sortDir,
  onSortChange,
  className,
}: {
  label: string;
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
  onSortChange: (field: SortField) => void;
  className?: string;
}) {
  const isActive = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-black uppercase tracking-widest transition-colors',
        isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
        className
      )}
    >
      {label}
      <ArrowUpDown className={cn('h-3 w-3', isActive && 'text-primary')} />
      {isActive && (
        <span className="text-[9px]">{sortDir === 'asc' ? '↑' : '↓'}</span>
      )}
    </button>
  );
}

export function InventoryTable({
  products,
  sortField,
  sortDir,
  onSortChange,
  onEdit,
  onDelete,
  onAdjustStock,
}: InventoryTableProps) {
  return (
    <div className="border border-border divide-y divide-border">

      {/* ── TABLE HEAD ── */}
      <div className="hidden md:grid grid-cols-12 px-5 py-4 bg-muted/50 gap-4">
        <div className="col-span-4">
          <SortableHeader
            label="Product"
            field="name"
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={onSortChange}
          />
        </div>
        <div className="col-span-2">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            SKU
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Category
          </span>
        </div>
        <div className="col-span-1">
          <SortableHeader
            label="Price"
            field="price"
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={onSortChange}
          />
        </div>
        <div className="col-span-1">
          <SortableHeader
            label="Stock"
            field="stock_quantity"
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={onSortChange}
          />
        </div>
        <div className="col-span-2 text-right">
          <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Actions
          </span>
        </div>
      </div>

      {/* ── ROWS ── */}
      {products.map(p => {
        const isOut = p.stock_quantity <= 0;
        const isLow = !isOut && p.stock_quantity < LOW_STOCK_THRESHOLD;

        return (
          <div
            key={p.id}
            className={cn(
              'grid grid-cols-2 md:grid-cols-12 items-center px-5 py-5 gap-4 md:gap-4 bg-card hover:bg-muted/20 transition-colors',
              isOut && 'border-l-2 border-l-destructive',
              isLow && 'border-l-2 border-l-orange-500'
            )}
          >
            {/* Product name */}
            <div className="col-span-2 md:col-span-4 flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 bg-muted border border-border flex items-center justify-center shrink-0 overflow-hidden">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Package className="h-5 w-5 text-muted-foreground/30" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold uppercase tracking-tight truncate">
                  {p.name}
                </p>
                {(isOut || isLow) && (
                  <div className={cn(
                    'flex items-center gap-1 text-[9px] font-black uppercase tracking-widest mt-0.5',
                    isOut ? 'text-destructive' : 'text-orange-500'
                  )}>
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {isOut ? 'Out of stock' : `Low — ${p.stock_quantity} left`}
                  </div>
                )}
              </div>
            </div>

            {/* SKU */}
            <div className="col-span-1 md:col-span-2">
              <span className="text-xs font-mono text-muted-foreground">
                {p.sku || '—'}
              </span>
            </div>

            {/* Category */}
            <div className="col-span-1 md:col-span-2">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1">
                {p.category?.name || '—'}
              </span>
            </div>

            {/* Price */}
            <div className="col-span-1 md:col-span-1">
              <span className="text-sm font-black font-mono text-primary">
                {formatCurrency(Number(p.price))}
              </span>
            </div>

            {/* Stock */}
            <div className="col-span-1 md:col-span-1">
              <span className={cn(
                'text-sm font-black font-mono',
                isOut
                  ? 'text-destructive'
                  : isLow
                    ? 'text-orange-500'
                    : 'text-foreground'
              )}>
                {p.stock_quantity}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 md:col-span-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onAdjustStock(p)}
                className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                title="Adjust stock"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onEdit(p)}
                className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
                title="Edit product"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(p)}
                className="h-11 w-11 border border-destructive/30 flex items-center justify-center text-destructive hover:bg-destructive hover:text-white transition-colors"
                title="Delete product"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}