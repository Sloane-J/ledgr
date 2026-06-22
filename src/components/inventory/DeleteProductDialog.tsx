// src/components/inventory/DeleteProductDialog.tsx
import * as React from 'react';
import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';
import { Product } from '@/src/types';
import { formatCurrency } from '@/src/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/src/components/ui/dialog';

interface DeleteProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: DeleteProductDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasOrders, setHasOrders] = useState(false);
  const [checked, setChecked] = useState(false);

  // ── Safety check: does this product have order history? ──
  // Runs when dialog opens to warn before allowing delete
  React.useEffect(() => {
    if (!open || !product) return;
    setChecked(false);
    setHasOrders(false);

    const check = async () => {
      const { count } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', product.id);

      setHasOrders((count ?? 0) > 0);
      setChecked(true);
    };

    check();
  }, [open, product]);

  const handleDelete = async () => {
    if (!product) return;
    setIsDeleting(true);
    try {
      // Delete image from storage if it exists
      if (product.image_url) {
        const path = product.image_url.split('/product-images/')[1];
        if (path) {
          await supabase.storage
            .from('product-images')
            .remove([path]);
        }
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      if (error) throw error;

      toast.success('Product deleted');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Delete Product
          </DialogTitle>
        </DialogHeader>

        <div className="py-3 space-y-3">

          {/* Product summary */}
          <div className="bg-destructive/5 border border-destructive/20 p-4 space-y-1">
            <p className="text-sm font-bold uppercase tracking-tight">
              {product.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              {product.sku || 'No SKU'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                {product.stock_quantity} units in stock
              </span>
              <span className="text-xs font-black text-primary">
                {formatCurrency(Number(product.price))}
              </span>
            </div>
          </div>

          {/* Order history warning */}
          {!checked ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          ) : hasOrders ? (
            <div className="bg-orange-500/10 border border-orange-500/30 p-3 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-black text-orange-500 uppercase tracking-widest mb-0.5">
                  Warning
                </p>
                <p className="text-xs text-muted-foreground">
                  This product appears in past orders. Deleting it will not remove order history but product details will show as unknown in those records.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground text-center">
              This will permanently remove the product and its image. This cannot be undone.
            </p>
          )}
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || !checked}
            className="flex-1 h-12 bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Delete
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}