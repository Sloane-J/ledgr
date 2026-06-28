// src/components/pos/ProductCard.tsx
import * as React from 'react';
import { Package, Plus } from 'lucide-react';
import { Product, CartItem } from '@/src/types';
import { formatCurrency, LOW_STOCK_THRESHOLD } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  onAdd: (product: Product) => void;
}

export function ProductCard({ product, cartItem, onAdd }: ProductCardProps) {
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
      type="button"
      onClick={() => !isOutOfStock && onAdd(product)}
      onKeyDown={handleKeyDown}
      disabled={isOutOfStock}
      aria-label={`Add ${product.name} to cart. Price: ${formatCurrency(Number(product.price))}. Stock: ${product.stock_quantity}.`}
      aria-pressed={inCartQty > 0}
      className={cn(
        'group relative flex flex-col text-left border bg-card transition-all duration-150 overflow-hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
        'active:scale-[0.98]',
        isOutOfStock
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:border-primary hover:shadow-[0_0_0_1px_hsl(var(--primary))] cursor-pointer',
        inCartQty > 0 ? 'border-primary/60' : 'border-border'
      )}
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-muted relative overflow-hidden w-full">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
            <Package className="h-8 w-8" />
          </div>
        )}

        {/* Stock badge */}
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5 leading-none',
            isLowStock
              ? 'bg-destructive text-white'
              : 'bg-background/90 text-muted-foreground'
          )}
        >
          {isLowStock ? `LOW · ${product.stock_quantity}` : product.stock_quantity}
        </span>

        {/* In-cart quantity badge */}
        {inCartQty > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 leading-none"
          >
            ×{inCartQty}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold leading-tight line-clamp-2">
            {product.name}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
            {product.sku || '—'}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-black text-primary">
            {formatCurrency(Number(product.price))}
          </span>
          <span
            aria-hidden="true"
            className="w-6 h-6 bg-muted group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </button>
  );
}
