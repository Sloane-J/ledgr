// src/components/inventory/InventoryGrid.tsx
import * as React from 'react';
import { AlertTriangle, Edit, Image as ImageIcon, Package, Trash2, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/src/lib/constants';
import { LOW_STOCK_THRESHOLD } from '@/src/lib/constants';
import { Product } from '@/src/types';

interface InventoryGridProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdjustStock: (product: Product) => void;
}

export function InventoryGrid({ products, onEdit, onDelete, onAdjustStock }: InventoryGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {products.map(p => {
        const isOut = p.stock_quantity <= 0;
        const isLow = !isOut && p.stock_quantity < LOW_STOCK_THRESHOLD;
        const stockPct = Math.min((p.stock_quantity / 50) * 100, 100);

        return (
          <div
            key={p.id}
            className={cn(
              'bg-card border flex flex-col transition-all',
              isOut
                ? 'border-destructive/40'
                : isLow
                  ? 'border-orange-500/40'
                  : 'border-border'
            )}
          >
            {/* Product image */}
            <div className="aspect-[4/3] bg-muted relative overflow-hidden">
              {p.image_url ? (
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                  <ImageIcon className="h-10 w-10" />
                </div>
              )}

              {/* Stock status badge */}
              {(isOut || isLow) && (
                <div className={cn(
                  'absolute top-2 left-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest',
                  isOut ? 'bg-destructive text-white' : 'bg-orange-500 text-white'
                )}>
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {isOut ? 'Out' : 'Low'}
                </div>
              )}

              {/* Category chip */}
              {p.category?.name && (
                <div className="absolute top-2 right-2 bg-background/90 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border border-border">
                  {p.category.name}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex-1 flex flex-col gap-3">
              <div>
                <p className="font-bold text-sm leading-tight uppercase tracking-tight line-clamp-2">
                  {p.name}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {p.sku || 'No SKU'}
                </p>
              </div>

              {/* Price + stock row */}
              <div className="flex items-end justify-between">
                <span className="text-xl font-black font-mono text-primary">
                  {formatCurrency(Number(p.price))}
                </span>
                <span className={cn(
                  'text-xs font-black',
                  isOut
                    ? 'text-destructive'
                    : isLow
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                )}>
                  {p.stock_quantity} units
                </span>
              </div>

              {/* Stock bar */}
              <div className="h-1.5 w-full bg-muted">
                <div
                  className={cn(
                    'h-full transition-all',
                    isOut
                      ? 'bg-destructive'
                      : isLow
                        ? 'bg-orange-500'
                        : 'bg-primary'
                  )}
                  style={{ width: `${stockPct}%` }}
                />
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className="h-11 flex items-center justify-center gap-1.5 border border-border text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  title="Edit product"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustStock(p)}
                  className="h-11 flex items-center justify-center gap-1.5 border border-border text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  title="Adjust stock"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Stock
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(p)}
                  className="h-11 flex items-center justify-center gap-1.5 border border-destructive/30 text-destructive text-xs font-black uppercase tracking-widest hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                  title="Delete product"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Del
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}