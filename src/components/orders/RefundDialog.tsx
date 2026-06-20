// components/orders/RefundDialog.tsx
import * as React from 'react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';
import { formatCurrency } from '@/src/lib/constants';
import { Order } from '@/src/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface RefundDialogProps {
  order: Order & { order_items: any[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function RefundDialog({ order, open, onOpenChange, onSuccess }: RefundDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRefund = async () => {
    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          refund_amount: order.total_amount,
          refunded_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      if (error) throw error;

      // Restore stock for each item
      for (const item of order.order_items) {
        if (item.products) {
          await supabase
            .from('products')
            .update({ stock_quantity: item.products.stock_quantity + item.quantity })
            .eq('id', item.product_id);
        }
      }

      toast.success('Refund processed — stock restored');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Refund failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Confirm Refund</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-muted border border-border p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Order</span>
              <span className="font-black font-mono">#{order.id.slice(-6).toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Customer</span>
              <span className="font-bold">{order.customer_name || 'Guest'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Items</span>
              <span className="font-bold">{order.order_items.length}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-border pt-2 mt-2">
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Refund Amount</span>
              <span className="font-black font-mono text-destructive">
                {formatCurrency(Number(order.total_amount))}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            Stock will be restored automatically. This cannot be undone.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-10 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRefund}
            disabled={isProcessing}
            className="flex-1 h-10 bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Process Refund
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}