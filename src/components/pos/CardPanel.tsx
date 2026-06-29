// src/components/pos/CardPanel.tsx
import * as React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface CardPanelProps {
  total: number;
  isCheckingOut: boolean;
  onConfirm: () => void;
}

export function CardPanel({ total, isCheckingOut, onConfirm }: CardPanelProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">

      {/* Terminal icon */}
      <div className="w-24 h-24 border-2 border-primary/30 bg-primary/5 flex items-center justify-center text-primary">
        <CreditCard
          className="h-12 w-12"
          aria-hidden="true"
        />
      </div>

      {/* Instructions */}
      <div>
        <p className="text-xl font-black uppercase tracking-tight mb-1">
          Waiting for Payment
        </p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Ask the customer to insert, swipe, or tap their card on the terminal.
        </p>
        <p className="text-2xl font-black text-primary mt-3 tabular-nums">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Confirm button — cashier presses this once terminal approves */}
      <button
        onClick={onConfirm}
        disabled={isCheckingOut}
        aria-label="Confirm card payment received"
        className={cn(
          'h-12 px-10 text-xs font-black uppercase tracking-widest transition-all',
          'border-2 border-primary/30',
          'hover:bg-primary hover:text-white hover:border-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'flex items-center gap-2'
        )}
      >
        {isCheckingOut ? (
          <>
            <div
              className="h-3.5 w-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin"
              aria-hidden="true"
            />
            Processing…
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Payment Received
          </>
        )}
      </button>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
        Only confirm after terminal approves
      </p>
    </div>
  );
}
