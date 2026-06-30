// src/components/pos/OrderTotals.tsx
import * as React from 'react';
import { formatCurrency } from '@/src/lib/constants';
import { TAX_RATE } from '@/src/lib/constants';

interface OrderTotalsProps {
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;
}

export function OrderTotals({
  subtotal,
  discount,
  discountAmount,
  tax,
  total,
}: OrderTotalsProps) {
  return (
    <div
      className="px-4 pb-3 space-y-1 text-sm shrink-0"
      aria-label="Order totals"
    >
      <div className="flex justify-between text-muted-foreground">
        <span>Subtotal</span>
        <span className="tabular-nums">{formatCurrency(subtotal)}</span>
      </div>

      {discount > 0 && (
        <div className="flex justify-between text-primary font-medium">
          <span>Discount ({discount}%)</span>
          <span className="tabular-nums">−{formatCurrency(discountAmount)}</span>
        </div>
      )}

      <div className="flex justify-between text-muted-foreground">
        <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
        <span className="tabular-nums">{formatCurrency(tax)}</span>
      </div>

      <div className="flex justify-between text-base font-black text-foreground pt-1.5 border-t border-border">
        <span>Total</span>
        <span
          className="tabular-nums text-primary"
          aria-live="polite"
          aria-label={`Order total: ${formatCurrency(total)}`}
        >
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
