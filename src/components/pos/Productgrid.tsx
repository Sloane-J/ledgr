// src/components/pos/ProductGrid.tsx
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Search, Package, Tag, X } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { Product, Category, CartItem } from '@/src/types';
import { cn } from '@/lib/utils';
import { ProductRow } from './ProductRow';
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
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  // Keep a ref to all products for barcode scanning regardless of filter
  useEffect(() => {
    if (products.length > 0) setAllProducts(products);
  }, [products]);

  // Barcode scanner always active
  useBarcodeScanner({
    products: allProducts,
    onMatch: onAddToCart,
    enabled: true,
  });

  // '/' shortcut focuses search
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

  const isSearching = search.length > 0;
  const isCategorySelected = activeCategory !== 'all' && activeCategory !== '';
  const showProducts = isSearching || isCategorySelected;

  // Products filtered by search or category
  const filteredProducts = products.filter(p => {
    if (isSearching) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }
    if (isCategorySelected) {
      return p.category_id === activeCategory;
    }
    return false;
  });

  const selectedCategory = categories.find(c => c.id === activeCategory);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

      {/* ── Search bar ── */}
      <div className="px-4 py-3 border-b border-border bg-card/50 shrink-0">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <Input
            ref={searchInputRef}
            placeholder="Search by name or SKU… (press / to focus)"
            value={search}
            onChange={e => {
              onSearch(e.target.value);
              // Clear category when searching
              if (e.target.value.length > 0) onCategoryChange('all');
            }}
            aria-label="Search products"
            className="pl-9 pr-9 h-10 bg-background border-border"
          />
          {isSearching && (
            <button
              onClick={() => { onSearch(''); searchInputRef.current?.focus(); }}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category grid — shown when not searching ── */}
      {!isSearching && !isCategorySelected && (
        <ScrollArea className="flex-1 min-h-0">
          {loading ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted animate-pulse" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40">
              <Tag className="h-8 w-8 mb-2" aria-hidden="true" />
              <p className="text-xs font-medium">No categories yet</p>
            </div>
          ) : (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.id)}
                  aria-label={`Browse ${cat.name}`}
                  className={cn(
                    'h-24 flex flex-col items-center justify-center gap-2 border border-border bg-card',
                    'hover:border-primary hover:bg-primary/5 hover:text-primary transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    'group'
                  )}
                >
                  <div className="w-10 h-10 border border-border bg-muted flex items-center justify-center group-hover:border-primary/40 transition-colors">
                    <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest truncate px-2 max-w-full">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      )}

      {/* ── Product list — shown when category selected or searching ── */}
      {showProducts && (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* List header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              {isCategorySelected && !isSearching && (
                <button
                  onClick={() => onCategoryChange('all')}
                  aria-label="Back to categories"
                  className={cn(
                    'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest',
                    'text-muted-foreground hover:text-foreground transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  <X className="h-3 w-3" aria-hidden="true" />
                  {selectedCategory?.name ?? 'Category'}
                </button>
              )}
              {isSearching && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Search results
                </span>
              )}
            </div>
            <span
              className="text-[10px] font-bold text-muted-foreground"
              aria-live="polite"
            >
              {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 px-4 py-1.5 border-b border-border bg-muted/20 shrink-0">
            <div className="w-6 shrink-0" />
            <div className="flex-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Product
            </div>
            <div className="shrink-0 w-16 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Stock
            </div>
            <div className="shrink-0 w-20 text-right text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Price
            </div>
            <div className="shrink-0 w-7" />
          </div>

          <ScrollArea className="flex-1 min-h-0">
            {filteredProducts.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-muted-foreground"
                role="status"
                aria-live="polite"
              >
                <Package className="h-8 w-8 opacity-20 mb-2" aria-hidden="true" />
                <p className="text-sm">
                  {isSearching
                    ? `No products match "${search}"`
                    : 'No products in this category'}
                </p>
                {isSearching && (
                  <button
                    onClick={() => onSearch('')}
                    className="mt-2 text-xs text-primary underline underline-offset-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              <div role="list" aria-label="Products">
                {filteredProducts.map(product => (
                  <div key={product.id} role="listitem">
                    <ProductRow
                      product={product}
                      cartItem={cart.find(i => i.id === product.id)}
                      onAdd={onAddToCart}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
