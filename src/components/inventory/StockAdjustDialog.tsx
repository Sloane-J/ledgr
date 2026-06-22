// src/components/inventory/StockAdjustDialog.tsx
import * as React from 'react';
import { useState } from 'react';
import { Loader2, Minus, Plus, SlidersHorizontal } from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface StockAdjustDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

type AdjustMode = 'add' | 'remove' | 'set';

const REASONS = [
  'Restock / delivery received',
  'Damaged goods',
  'Theft or shrinkage',
  'Correction / count error',
  'Returned by customer',
  'Other',
];

export function StockAdjustDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: StockAdjustDialogProps) {
  const [mode, setMode] = useState<AdjustMode>('add');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setMode('add');
    setQuantity('');
    setReason('');
    setCustomReason('');
    onOpenChange(false);
  };

  if (!product) return null;

  const qty = parseInt(quantity) || 0;

  const newStock = (() => {
    if (mode === 'add') return product.stock_quantity + qty;
    if (mode === 'remove') return Math.max(0, product.stock_quantity - qty);
    if (mode === 'set') return qty;
    return product.stock_quantity;
  })();

  const stockDelta = newStock - product.stock_quantity;
  const finalReason = reason === 'Other' ? customReason.trim() : reason;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (qty <= 0 && mode !== 'set') {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (mode === 'set' && qty < 0) {
      toast.error('Stock cannot be negative');
      return;
    }
    if (!finalReason) {
      toast.error('Please select or enter a reason');
      return;
    }
    if (reason === 'Other' && customReason.trim().length < 3) {
      toast.error('Please enter a more descriptive reason');
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update stock
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', product.id);
      if (stockError) throw stockError;

      // Write to audit_logs for traceability
      const { error: auditError } = await supabase
        .from('audit_logs')
        .insert([{
          user_id: user.id,
          action: 'stock_adjustment',
          entity_type: 'product',
          entity_id: product.id,
          old_value: { stock_quantity: product.stock_quantity },
          new_value: { stock_quantity: newStock },
          metadata: {
            product_name: product.name,
            sku: product.sku,
            mode,
            delta: stockDelta,
            reason: finalReason,
          },
        }]);

      // Audit log failure is non-blocking — stock was already updated
      if (auditError) {
        console.error('Audit log failed:', auditError.message);
        toast.warning('Stock updated but audit log failed. Check logs.');
      } else {
        toast.success(`Stock updated — ${newStock} units now in stock`);
      }

      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Stock adjustment failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-black uppercase tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-primary" />
            Adjust Stock
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">

          {/* Product summary */}
          <div className="bg-muted border border-border p-4 space-y-1">
            <p className="text-sm font-bold uppercase tracking-tight">{product.name}</p>
            <p className="text-xs text-muted-foreground font-mono">{product.sku || 'No SKU'}</p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">Current stock</span>
              <span className="text-sm font-black font-mono">{product.stock_quantity} units</span>
            </div>
          </div>

          {/* Mode selector */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Adjustment Type
            </Label>
            <div className="grid grid-cols-3 border border-border">
              {([
                { id: 'add', label: 'Add', icon: Plus },
                { id: 'remove', label: 'Remove', icon: Minus },
                { id: 'set', label: 'Set', icon: SlidersHorizontal },
              ] as const).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  className={cn(
                    'h-12 flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest border-r border-border last:border-r-0 transition-colors',
                    mode === m.id
                      ? m.id === 'remove'
                        ? 'bg-destructive text-white'
                        : 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  <m.icon className="h-3.5 w-3.5" />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity input */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {mode === 'set' ? 'New Stock Count' : 'Quantity'}{' '}
              <span className="text-destructive">*</span>
            </Label>
            <Input
              type="number"
              min="0"
              className="h-12 text-lg font-black text-center border-border bg-background font-mono"
              placeholder="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              autoFocus
            />
          </div>

          {/* New stock preview */}
          {quantity && (
            <div className={cn(
              'flex items-center justify-between px-4 py-3 border',
              newStock <= 0
                ? 'bg-destructive/5 border-destructive/30'
                : newStock < 10
                  ? 'bg-orange-500/5 border-orange-500/30'
                  : 'bg-primary/5 border-primary/30'
            )}>
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                New Stock
              </span>
              <div className="flex items-center gap-2">
                {stockDelta !== 0 && (
                  <span className={cn(
                    'text-xs font-black',
                    stockDelta > 0 ? 'text-emerald-500' : 'text-destructive'
                  )}>
                    {stockDelta > 0 ? `+${stockDelta}` : stockDelta}
                  </span>
                )}
                <span className="text-base font-black font-mono">
                  {newStock} units
                </span>
              </div>
            </div>
          )}

          {/* Reason selector */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Reason <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-1.5">
              {REASONS.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    'h-10 px-4 text-left text-xs font-semibold border transition-colors',
                    reason === r
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Custom reason input */}
          {reason === 'Other' && (
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Describe the reason <span className="text-destructive">*</span>
              </Label>
              <Input
                className="h-11 text-sm border-border bg-background"
                placeholder="e.g. Expired products removed from shelf"
                value={customReason}
                onChange={e => setCustomReason(e.target.value)}
                maxLength={120}
              />
            </div>
          )}

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
              disabled={isSaving || !quantity || !finalReason}
              className="flex-1 h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Confirm
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}