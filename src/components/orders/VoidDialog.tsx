// components/orders/VoidDialog.tsx
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VoidDialogProps {
  order: Order & { order_items: any[] };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function VoidDialog({ order, open, onOpenChange, onSuccess }: VoidDialogProps) {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVoid = async () => {
    if (!reason.trim()) {
      toast.error('Please enter a reason for voiding this order');
      return;
    }

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'voided',
          void_reason: reason.trim(),
          voided_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      if (error) throw error;

      // Restore stock
      for (const item of order.order_items) {
        if (item.products) {
          await supabase
            .from('products')
            .update({ stock_quantity: item.products.stock_quantity + item.quantity })
            .eq('id', item.product_id);
        }
      }

      toast.success('Order voided — stock restored');
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to void order');
    } finally {
      setIsProcessing(false);
      setReason('');
    }
  };

  const handleClose = () => {
    setReason('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight">Void Order</DialogTitle>
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
              <span className="text-muted-foreground font-bold uppercase tracking-widest">Order Total</span>
              <span className="font-black font-mono">
                {formatCurrency(Number(order.total_amount))}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Void Reason <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Customer changed mind, duplicate order…"
              value={reason}
              onChange={e => setReason(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && reason.trim()) handleVoid(); }}
              className="h-9 text-xs border-border bg-background"
            />
          </div>

          <p className="text-[10px] text-muted-foreground text-center">
            Stock will be restored automatically. This cannot be undone.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 h-10 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleVoid}
            disabled={isProcessing || !reason.trim()}
            className="flex-1 h-10 bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Void Order
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}