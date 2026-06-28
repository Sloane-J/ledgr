// src/components/pos/ProductGrid.tsx
import * as React from 'react';
import { useRef, useEffect } from 'react';
import { Search, Package } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Product, Category, CartItem } from '@/src/types';
import { cn } from '@/lib/utils';
import { ProductCard } from './ProductCard';
import { useBarcodeScanner } from './useBarcodeScanner';

interface ProductGridProps {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  loading: boolean;
  search: string;
  activeCategory: string;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onSearch: (value: string) => void;
  onCategoryChange: (id: string) => void;
  onAddToCart: (product: Product) => void;
}

export function ProductGrid({
  products,
  categories,
  cart,
  loading,
  search,
  activeCategory,
  searchInputRef,
  onSearch,
  onCategoryChange,
  onAddToCart,
}: ProductGridProps) {
  const categoryRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Barcode scanner — disabled when search input is focused
  useBarcodeScanner({
    products,
    onMatch: onAddToCart,
    enabled: true,
  });

  // Keyboard shortcut: '/' focuses search from anywhere on the page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const tag = (document.activeElement as HTMLElement).tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchInputRef]);

  // Arrow-key navigation across category tabs
  const handleCategoryKeyDown = (e: React.KeyboardEvent, categoryId: string) => {
    const allIds = ['all', ...categories.map(c => c.id)];
    const idx = allIds.indexOf(categoryId);
    if (e.key === 'ArrowRight') {
      const next = allIds[idx + 1];
      if (next) { categoryRefs.current[next]?.focus(); onCategoryChange(next); }
    }
    if (e.key === 'ArrowLeft') {
      const prev = allIds[idx - 1];
      if (prev) { categoryRefs.current[prev]?.focus(); onCategoryChange(prev); }
    }
  };

  const allCategories = [{ id: 'all', name: 'All' }, ...categories];

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
      {/* ── Toolbar ── */}
      <div
        className="flex flex-col sm:flex-row gap-3 px-4 py-3 border-b border-border bg-card/50 shrink-0"
        role="toolbar"
        aria-label="Product filters"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" aria-hidden="true" />
          <Input
            ref={searchInputRef}
            placeholder="Search by name or SKU… (press / to focus)"
            value={search}
            onChange={e => onSearch(e.target.value)}
            aria-label="Search products"
            className="pl-9 h-10 bg-background border-border"
          />
          {search && (
            <button
            type="button"
              onClick={() => { onSearch(''); searchInputRef.current?.focus(); }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category tabs */}
        <div
          className="flex gap-1.5 flex-wrap"
          role="tablist"
          aria-label="Product categories"
        >
          {allCategories.map(cat => (
            <button
              type="button"
              key={cat.id}
              ref={el => { categoryRefs.current[cat.id] = el; }}
              role="tab"
              aria-selected={activeCategory === cat.id}
              tabIndex={activeCategory === cat.id ? 0 : -1}
              onClick={() => onCategoryChange(cat.id)}
              onKeyDown={e => handleCategoryKeyDown(e, cat.id)}
              className={cn(
                'px-3 h-10 text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                activeCategory === cat.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Product grid ── */}
      <ScrollArea className="flex-1 min-h-0">
        <div
          className="p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3"
          role="list"
          aria-label="Products"
          aria-busy={loading}
        >
          {loading ? (
            // Skeletons
            Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                role="listitem"
                aria-hidden="true"
                className="aspect-[3/4] bg-muted animate-pulse rounded-sm"
              />
            ))
          ) : products.length === 0 ? (
            <div
              className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground"
              role="status"
              aria-live="polite"
            >
              <Package className="h-10 w-10 opacity-20 mb-2" aria-hidden="true" />
              <p className="text-sm">
                {search
                  ? `No products match "${search}"`
                  : 'No products available'}
              </p>
              {search && (
                <button
                type="button"
                  onClick={() => onSearch('')}
                  className="mt-2 text-xs text-primary underline underline-offset-2"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} role="listitem">
                <ProductCard
                  product={product}
                  cartItem={cart.find(i => i.id === product.id)}
                  onAdd={onAddToCart}
                />
              </div>
            ))
          )}
        </div>

        {/* Result count — screen reader only */}
        {!loading && products.length > 0 && (
          <p className="sr-only" aria-live="polite">
            {products.length} product{products.length !== 1 ? 's' : ''} shown
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
