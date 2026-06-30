// src/components/pos/ProductRow.tsx
import * as React from 'react';
import { Plus } from 'lucide-react';
import { Product, CartItem } from '@/src/types';
import { formatCurrency, LOW_STOCK_THRESHOLD } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface ProductRowProps {
  product: Product;
  cartItem?: CartItem;
  onAdd: (product: Product) => void;
}

export function ProductRow({ product, cartItem, onAdd }: ProductRowProps) {
  const isLowStock = product.stock_quantity <= LOW_STOCK_THRESHOLD;
  const isOutOfStock = product.stock_quantity === 0;
  const inCartQty = cartItem?.quantity ?? 0;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOutOfStock) onAdd(product);
    }
  };

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      onKeyDown={handleKeyDown}
      disabled={isOutOfStock}
      aria-label={`Add ${product.name} to cart. Price: ${formatCurrency(Number(product.price))}. Stock: ${product.stock_quantity}.`}
      aria-pressed={inCartQty > 0}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-2.5 border-b border-border text-left',
        'transition-colors duration-100 group',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
        isOutOfStock
          ? 'opacity-40 cursor-not-allowed bg-background'
          : 'hover:bg-primary/5 cursor-pointer',
        inCartQty > 0 && !isOutOfStock && 'bg-primary/5'
      )}
    >
      {/* In-cart badge */}
      <div className="w-6 shrink-0 flex justify-center">
        {inCartQty > 0 ? (
          <span className="text-[10px] font-black text-primary bg-primary/10 px-1 py-0.5 leading-none">
            ×{inCartQty}
          </span>
        ) : null}
      </div>

      {/* Name + SKU */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-semibold truncate leading-tight',
          inCartQty > 0 ? 'text-primary' : 'text-foreground'
        )}>
          {product.name}
        </p>
        {product.sku && (
          <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
            {product.sku}
          </p>
        )}
      </div>

      {/* Stock badge */}
      <div className="shrink-0 w-16 text-right">
        <span className={cn(
          'text-[10px] font-bold px-1.5 py-0.5',
          isLowStock
            ? 'bg-destructive/10 text-destructive'
            : 'text-muted-foreground'
        )}>
          {isLowStock ? `LOW · ${product.stock_quantity}` : product.stock_quantity}
        </span>
      </div>

      {/* Price */}
      <div className="shrink-0 w-20 text-right">
        <span className="text-sm font-black text-primary tabular-nums">
          {formatCurrency(Number(product.price))}
        </span>
      </div>

      {/* Add button */}
      <div className={cn(
        'shrink-0 w-7 h-7 flex items-center justify-center border transition-colors',
        isOutOfStock
          ? 'border-border text-muted-foreground/20'
          : 'border-border group-hover:bg-primary group-hover:border-primary group-hover:text-white text-muted-foreground'
      )}>
        <Plus className="h-3.5 w-3.5" aria-hidden="true" />
      </div>
    </button>
  );
}
