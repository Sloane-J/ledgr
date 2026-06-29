// src/components/pos/SuccessDialog.tsx
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog';
import { formatCurrency } from '@/src/lib/constants';
import { PaymentInfo } from './usePOS';

interface SuccessDialogProps {
  open: boolean;
  orderId: string | null;
  paymentInfo: PaymentInfo | null;
  onPrint: () => void;
  onClose: () => void;
}

export function SuccessDialog({
  open,
  orderId,
  paymentInfo,
  onPrint,
  onClose,
}: SuccessDialogProps) {
  const newOrderRef = useRef<HTMLButtonElement>(null);

  // Focus "New Order" on open so cashier can hit Enter immediately
  useEffect(() => {
    if (open) {
      setTimeout(() => newOrderRef.current?.focus(), 80);
    }
  }, [open]);

  if (!paymentInfo) return null;

  const orderRef = orderId?.slice(-6).toUpperCase() ?? '——';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-sm py-8">
        <div className="flex flex-col items-center space-y-5 text-center">

          {/* Icon */}
          <div
            className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary"
            aria-hidden="true"
          >
            <CheckCircle2 className="h-9 w-9" />
          </div>

          {/* Title */}
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Payment Complete
            </DialogTitle>
            <DialogDescription>
              Order #{orderRef} · {paymentInfo.method.toUpperCase()}
            </DialogDescription>
          </DialogHeader>

          {/* Change due — cash only */}
          {paymentInfo.method === 'cash' && paymentInfo.change > 0 && (
            <div className="w-full bg-muted border border-border p-5">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                Change Due
              </p>
              <p
                className="text-4xl font-black text-primary tabular-nums"
                aria-live="assertive"
                aria-label={`Change due: ${formatCurrency(paymentInfo.change)}`}
              >
                {formatCurrency(paymentInfo.change)}
              </p>
            </div>
          )}

          {/* Order summary */}
          <div className="w-full text-left space-y-1 border border-border p-4 bg-muted/30">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Summary
            </p>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {paymentInfo.items.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between text-xs"
                >
                  <span className="truncate pr-2 text-muted-foreground">
                    {item.name} ×{item.quantity}
                  </span>
                  <span className="tabular-nums font-medium shrink-0">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-2 mt-2 space-y-0.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(paymentInfo.subtotal)}</span>
              </div>
              {paymentInfo.discount > 0 && (
                <div className="flex justify-between text-xs text-primary">
                  <span>Discount ({paymentInfo.discount}%)</span>
                  <span className="tabular-nums">−{formatCurrency(paymentInfo.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Tax</span>
                <span className="tabular-nums">{formatCurrency(paymentInfo.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-1 border-t border-border">
                <span>Total</span>
                <span className="tabular-nums text-primary">
                  {formatCurrency(paymentInfo.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer */}
          {paymentInfo.customerName && paymentInfo.customerName !== 'Guest' && (
            <p className="text-xs text-muted-foreground">
              Customer: <span className="font-semibold text-foreground">{paymentInfo.customerName}</span>
            </p>
          )}

          {/* Actions */}
          <div className="w-full space-y-2 pt-1">
            <Button
              variant="outline"
              className="w-full h-10 font-bold"
              onClick={onPrint}
            >
              Print Receipt
            </Button>
            <Button
              ref={newOrderRef}
              className="w-full h-10 font-bold"
              onClick={onClose}
            >
              New Order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
