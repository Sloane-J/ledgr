// src/components/Inventory.tsx
import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, Package, Plus, RefreshCw, Database } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { Product, Category } from '@/src/types';
import { LOW_STOCK_THRESHOLD } from '@/src/lib/constants';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { seedProducts } from '@/src/services/seedService';

import { InventoryStatsStrip } from '@/src/components/inventory/InventoryStatsStrip';
import { InventoryFilters } from '@/src/components/inventory/InventoryFilters';
import { InventoryGrid } from '@/src/components/inventory/InventoryGrid';
import { InventoryTable } from '@/src/components/inventory/InventoryTable';
import { ProductFormDialog } from '@/src/components/inventory/ProductFormDialog';
import { DeleteProductDialog } from '@/src/components/inventory/DeleteProductDialog';
import { StockAdjustDialog } from '@/src/components/inventory/StockAdjustDialog';

type ViewMode = 'grid' | 'table';
type StockFilter = 'all' | 'low' | 'out';
type SortField = 'name' | 'price' | 'stock_quantity' | 'created_at';
type SortDir = 'asc' | 'desc';

export function Inventory() {
  // ── Data ──
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // ── Filters + view ──
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // ── Dialogs ──
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('categories')
          .select('*')
          .order('name'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
    } catch (error: any) {
      toast.error('Failed to load inventory: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Handlers ──
  const handleAddProduct = () => {
    setEditingProduct({ name: '', price: 0, stock_quantity: 0 });
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteOpen(true);
  };

  const handleAdjustStock = (product: Product) => {
    setSelectedProduct(product);
    setIsAdjustOpen(true);
  };

  // ── Barcode scan: jump to first exact SKU match ──
  const handleBarcodeSearch = (sku: string) => {
    const match = products.find(
      p => p.sku?.toLowerCase() === sku.toLowerCase()
    );
    if (match) {
      setSearch(sku);
      toast.success(`Found: ${match.name}`);
    } else {
      toast.error(`No product found for SKU: ${sku}`);
    }
  };

  // ── Sort toggle ──
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // ── Derived stats ──
  const lowStockCount = products.filter(
    p => p.stock_quantity > 0 && p.stock_quantity < LOW_STOCK_THRESHOLD
  ).length;

  const outOfStockCount = products.filter(
    p => p.stock_quantity <= 0
  ).length;

  // ── Filtered + sorted products ──
  const filteredProducts = products
    .filter(p => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all' || p.category_id === categoryFilter;

      const matchesStock =
        stockFilter === 'all' ||
        (stockFilter === 'low' &&
          p.stock_quantity > 0 &&
          p.stock_quantity < LOW_STOCK_THRESHOLD) ||
        (stockFilter === 'out' && p.stock_quantity <= 0);

      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'name') {
        valA = valA?.toLowerCase() ?? '';
        valB = valB?.toLowerCase() ?? '';
      }

      if (sortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">
              Stock Management
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight">Inventory</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button
              type="button"
              disabled={isSeeding}
              onClick={() => {
                setIsSeeding(true);
                seedProducts()
                  .then(fetchData)
                  .finally(() => setIsSeeding(false));
              }}
              className="h-11 px-5 border border-border text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Database className={cn('h-4 w-4', isSeeding && 'animate-spin')} />
              Seed
            </button>
            <button
              type="button"
              onClick={handleAddProduct}
              className="h-11 px-5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* ── STATS ── */}
        <InventoryStatsStrip
          totalProducts={products.length}
          lowStockCount={lowStockCount}
          outOfStockCount={outOfStockCount}
        />

        {/* ── FILTERS ── */}
        <InventoryFilters
          search={search}
          onSearchChange={setSearch}
          categoryFilter={categoryFilter}
          onCategoryFilterChange={setCategoryFilter}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortField={sortField}
          onSortFieldChange={setSortField}
          sortDir={sortDir}
          onSortDirChange={setSortDir}
          categories={categories}
          onBarcodeSearch={handleBarcodeSearch}
        />

        {/* ── CONTENT ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Loading inventory…
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
            <Package className="h-10 w-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No products found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <InventoryGrid
            products={filteredProducts}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        ) : (
          <InventoryTable
            products={filteredProducts}
            sortField={sortField}
            sortDir={sortDir}
            onSortChange={handleSortChange}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
          />
        )}
      </div>

      {/* ── PRODUCT FORM DIALOG ── */}
      <ProductFormDialog
        open={isFormOpen}
        onOpenChange={open => {
          setIsFormOpen(open);
          if (!open) setEditingProduct(null);
        }}
        product={editingProduct}
        categories={categories}
        onSuccess={fetchData}
      />

      {/* ── DELETE DIALOG ── */}
      <DeleteProductDialog
        open={isDeleteOpen}
        onOpenChange={open => {
          setIsDeleteOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={fetchData}
      />

      {/* ── STOCK ADJUST DIALOG ── */}
      <StockAdjustDialog
        open={isAdjustOpen}
        onOpenChange={open => {
          setIsAdjustOpen(open);
          if (!open) setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={fetchData}
      />
    </ScrollArea>
  );
}