import {
  AlertTriangle,
  Database,
  Edit,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import type * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/src/lib/supabase";
import { seedProducts } from "@/src/services/seedService";
import type { Category, Product } from "@/src/types";

export function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: pData } = await supabase
        .from("products")
        .select("*, category:categories(*)")
        .order("created_at", { ascending: false });
      const { data: cData } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (pData) setProducts(pData);
      if (cData) setCategories(cData);
    } catch {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const { category, ...productData } = editingProduct as any;
      if (editingProduct.id) {
        await supabase.from("products").update(productData).eq("id", editingProduct.id);
        toast.success("Product updated");
      } else {
        await supabase.from("products").insert([productData]);
        toast.success("Product added");
      }
      setIsDialogOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch {
      toast.error("Save failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("products").delete().eq("id", deleteTarget.id);
    if (!error) {
      toast.success("Product deleted");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
      fetchData();
    } else {
      toast.error("Delete failed");
    }
  };

  const filteredProducts = products
    .filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
    )
    .filter((p) => {
      const mCat = activeFilter === "all" || p.category_id === activeFilter;
      const mStock =
        stockFilter === "all" ||
        (stockFilter === "low" && p.stock_quantity > 0 && p.stock_quantity < 10) ||
        (stockFilter === "out" && p.stock_quantity <= 0);
      return mCat && mStock;
    });

  const lowCount = products.filter((p) => p.stock_quantity > 0 && p.stock_quantity < 10).length;
  const outCount = products.filter((p) => p.stock_quantity <= 0).length;

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
              onClick={fetchData}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") fetchData(); }}
              className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            </button>
            <button
              onClick={() => {
                setIsSeeding(true);
                seedProducts().then(fetchData).finally(() => setIsSeeding(false));
              }}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { setIsSeeding(true); seedProducts().then(fetchData).finally(() => setIsSeeding(false)); } }}
              disabled={isSeeding}
              className="h-11 px-5 border border-border text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-50"
            >
              <Database className={cn("h-4 w-4", isSeeding && "animate-spin")} />
              Seed
            </button>
            <button
              onClick={() => { setEditingProduct({ name: "", price: 0, stock_quantity: 0 }); setIsDialogOpen(true); }}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { setEditingProduct({ name: "", price: 0, stock_quantity: 0 }); setIsDialogOpen(true); } }}
              className="h-11 px-5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-3 border border-border divide-x divide-border">
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total SKUs</p>
            <p className="text-2xl font-black font-mono">{products.length}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Low Stock</p>
            <p className={cn("text-2xl font-black font-mono", lowCount > 0 ? "text-orange-500" : "text-muted-foreground")}>{lowCount}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Out of Stock</p>
            <p className={cn("text-2xl font-black font-mono", outCount > 0 ? "text-destructive" : "text-muted-foreground")}>{outCount}</p>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 bg-card border-border text-sm"
            />
          </div>

          {/* Category filter */}
          <div className="w-full sm:w-52">
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="h-11 border-border bg-card text-xs font-bold uppercase">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stock filter pills */}
          <div className="flex border border-border h-11">
            {(["all", "low", "out"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStockFilter(s)}
                onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") setStockFilter(s); }}
                className={cn(
                  "flex-1 sm:flex-none sm:px-5 text-[10px] font-black uppercase tracking-widest border-r border-border last:border-r-0 transition-colors",
                  stockFilter === s
                    ? s === "low"
                      ? "bg-orange-500 text-white"
                      : s === "out"
                        ? "bg-destructive text-white"
                        : "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {s === "all" ? "All" : s === "low" ? "Low" : "Out"}
              </button>
            ))}
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading inventory…</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
            <Package className="h-10 w-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map((p) => {
              const isOut = p.stock_quantity <= 0;
              const isLow = !isOut && p.stock_quantity < 10;
              const stockPct = Math.min((p.stock_quantity / 50) * 100, 100);

              return (
                <div
                  key={p.id}
                  className={cn(
                    "bg-card border flex flex-col transition-all",
                    isOut ? "border-destructive/40" : isLow ? "border-orange-500/40" : "border-border"
                  )}
                >
                  {/* Product image */}
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}

                    {/* Status badge */}
                    {(isOut || isLow) && (
                      <div className={cn(
                        "absolute top-2 left-2 flex items-center gap-1 px-2 py-1 text-[9px] font-black uppercase tracking-widest",
                        isOut ? "bg-destructive text-white" : "bg-orange-500 text-white"
                      )}>
                        <AlertTriangle className="h-2.5 w-2.5" />
                        {isOut ? "Out" : "Low"}
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
                      <p className="font-bold text-sm leading-tight uppercase tracking-tight line-clamp-2">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{p.sku || "No SKU"}</p>
                    </div>

                    {/* Price + stock row */}
                    <div className="flex items-end justify-between">
                      <span className="text-xl font-black font-mono text-primary">
                        ${Number(p.price).toFixed(2)}
                      </span>
                      <span className={cn(
                        "text-xs font-black",
                        isOut ? "text-destructive" : isLow ? "text-orange-500" : "text-muted-foreground"
                      )}>
                        {p.stock_quantity} units
                      </span>
                    </div>

                    {/* Stock bar */}
                    <div className="h-1.5 w-full bg-muted">
                      <div
                        className={cn(
                          "h-full transition-all",
                          isOut ? "bg-destructive" : isLow ? "bg-orange-500" : "bg-primary"
                        )}
                        style={{ width: `${stockPct}%` }}
                      />
                    </div>

                    {/* Touch-friendly action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }}
                        onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { setEditingProduct(p); setIsDialogOpen(true); } }}
                        className="h-11 flex items-center justify-center gap-2 border border-border text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteTarget(p); setIsDeleteOpen(true); }}
                        onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { setDeleteTarget(p); setIsDeleteOpen(true); } }}
                        className="h-11 flex items-center justify-center gap-2 border border-destructive/30 text-destructive text-xs font-black uppercase tracking-widest hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT DIALOG ── */}
      <Dialog open={isDialogOpen} onOpenChange={(o) => { setIsDialogOpen(o); if (!o) setEditingProduct(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">
              {editingProduct?.id ? "Edit Product" : "New Product"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Product Name *
              </label>
              <Input
                className="h-12 text-sm border-border bg-background"
                placeholder="e.g. Bottled Water 500ml"
                value={editingProduct?.name || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                required
              />
            </div>

            {/* Price + Stock */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Price ($) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  className="h-12 text-sm border-border bg-background"
                  value={editingProduct?.price ?? ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Stock Count *
                </label>
                <Input
                  type="number"
                  min="0"
                  className="h-12 text-sm border-border bg-background"
                  value={editingProduct?.stock_quantity ?? ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, stock_quantity: parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                SKU / Barcode
              </label>
              <Input
                className="h-12 text-sm border-border bg-background font-mono"
                placeholder="e.g. SKU-001"
                value={editingProduct?.sku || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Category
              </label>
              <Select
                value={editingProduct?.category_id || ""}
                onValueChange={(v) => setEditingProduct({ ...editingProduct, category_id: v })}
              >
                <SelectTrigger className="h-12 border-border bg-background text-sm">
                  <SelectValue placeholder="Select category…" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Image URL
              </label>
              <Input
                className="h-12 text-sm border-border bg-background"
                placeholder="https://…"
                value={editingProduct?.image_url || ""}
                onChange={(e) => setEditingProduct({ ...editingProduct, image_url: e.target.value })}
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsDialogOpen(false); setEditingProduct(null); }}
                onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { setIsDialogOpen(false); setEditingProduct(null); } }}
                className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-colors"
              >
                {editingProduct?.id ? "Save Changes" : "Add Product"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={isDeleteOpen} onOpenChange={(o) => { setIsDeleteOpen(o); if (!o) setDeleteTarget(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Delete Product</DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <div className="bg-destructive/5 border border-destructive/20 p-4">
              <p className="text-sm font-bold">{deleteTarget?.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{deleteTarget?.sku || "No SKU"} · {deleteTarget?.stock_quantity} units</p>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              This will permanently remove the product from your inventory.
            </p>
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => { setIsDeleteOpen(false); setDeleteTarget(null); }}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") { setIsDeleteOpen(false); setDeleteTarget(null); } }}
              className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              onKeyUp={(e) => { if (e.key === "Enter" || e.key === " ") handleDelete(); }}
              className="flex-1 h-12 bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 transition-colors"
            >
              Delete
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}