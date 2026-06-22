// src/components/inventory/ProductFormDialog.tsx
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';
import { Category, Product } from '@/src/types';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select';
import { formatCurrency } from '@/src/lib/constants';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Partial<Product> | null;
  categories: Category[];
  onSuccess: () => void;
}

const EMPTY_FORM: Partial<Product> = {
  name: '',
  price: 0,
  stock_quantity: 0,
  sku: '',
  category_id: undefined,
  image_url: '',
};

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSuccess,
}: ProductFormDialogProps) {
  const [form, setForm] = useState<Partial<Product>>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const isEditing = !!product?.id;

  // Populate form when editing
  useEffect(() => {
    if (product) {
      setForm(product);
      setImagePreview(product.image_url || null);
    } else {
      setForm(EMPTY_FORM);
      setImagePreview(null);
    }
  }, [product]);

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setImagePreview(null);
    onOpenChange(false);
  };

  // ── Image upload to Supabase Storage ──
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Security: only allow images, max 2MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only JPEG, PNG, and WebP images are allowed');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setIsUploading(true);
    try {
      // Sanitize filename — remove special chars, use timestamp to avoid collisions
      const ext = file.name.split('.').pop();
      const safeName = `product-${Date.now()}.${ext}`;

      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(safeName, file, { upsert: false });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);

      setForm(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
      toast.success('Image uploaded');
    } catch (error: any) {
      toast.error(error.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setForm(prev => ({ ...prev, image_url: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!form.name?.trim()) { toast.error('Product name is required'); return; }
    if (!form.price || form.price <= 0) { toast.error('Price must be greater than 0'); return; }
    if (form.stock_quantity === undefined || form.stock_quantity < 0) {
      toast.error('Stock quantity cannot be negative');
      return;
    }

    setIsSaving(true);
    try {
      // Strip joined category object before saving
      const { category, ...productData } = form as any;

      if (isEditing) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', form.id!);
        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
        toast.success('Product added');
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">
            {isEditing ? 'Edit Product' : 'New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">

          {/* ── IMAGE UPLOAD ── */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Product Image
            </Label>
            {imagePreview ? (
              <div className="relative w-full aspect-[4/3] bg-muted border border-border overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 h-7 w-7 bg-destructive text-white flex items-center justify-center hover:bg-destructive/90 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border bg-muted/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors">
                {isUploading ? (
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Upload className="h-6 w-6 text-muted-foreground mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Click to upload
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 mt-1">
                      JPEG, PNG, WebP · Max 2MB
                    </span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          {/* ── NAME ── */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              className="h-12 text-sm border-border bg-background"
              placeholder="e.g. Bottled Water 500ml"
              value={form.name || ''}
              onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* ── PRICE + STOCK ── */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                className="h-12 text-sm border-border bg-background"
                value={form.price ?? ''}
                onChange={e => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Stock Count <span className="text-destructive">*</span>
              </Label>
              <Input
                type="number"
                min="0"
                className="h-12 text-sm border-border bg-background"
                value={form.stock_quantity ?? ''}
                onChange={e => setForm(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* ── SKU ── */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              SKU / Barcode
            </Label>
            <Input
              className="h-12 text-sm border-border bg-background font-mono"
              placeholder="e.g. SKU-001 or scan barcode…"
              value={form.sku || ''}
              onChange={e => setForm(prev => ({ ...prev, sku: e.target.value }))}
              onKeyDown={e => {
                // Barcode scanner fires Enter after scan
                if (e.key === 'Enter') {
                  e.preventDefault();
                  // Move focus to next field
                  const next = e.currentTarget.closest('form')
                    ?.querySelector<HTMLElement>('[data-next-focus]');
                  next?.focus();
                }
              }}
            />
            <p className="text-[9px] text-muted-foreground">
              You can scan a barcode directly into this field
            </p>
          </div>

          {/* ── CATEGORY ── */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Category
            </Label>
            <Select
              value={form.category_id || ''}
              onValueChange={v => setForm(prev => ({ ...prev, category_id: v }))}
            >
              <SelectTrigger className="h-12 border-border bg-background text-sm" data-next-focus>
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="flex-1 h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isEditing ? 'Save Changes' : 'Add Product'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}