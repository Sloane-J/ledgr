// src/components/pos/CashPanel.tsx
import * as React from 'react';
import { formatCurrency } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface CashPanelProps {
  total: number;
  cashReceived: string;
  changeDue: number;
  isCashEnough: boolean;
  isCheckingOut: boolean;
  onConfirm: () => void;
}

export function CashPanel({
  total,
  isCheckingOut,
  isCashEnough,
  onConfirm,
}: CashPanelProps) {
  return (
    <div className="flex flex-col h-full gap-6">

      <div className="space-y-2">
        <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
          Cash Payment
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Enter the amount received using the numpad. Change due will be calculated automatically.
        </p>
      </div>

      <div className="border border-border bg-muted/20 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Total to collect
        </p>
        <p className="text-3xl font-black tabular-nums text-primary">
          {formatCurrency(total)}
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
        Use numpad → Enter to confirm
      </p>

      <button
        disabled={!isCashEnough || isCheckingOut}
        onClick={onConfirm}
        aria-label="Complete cash transaction"
        className={cn(
          'mt-auto w-full h-14 font-black text-sm uppercase tracking-widest transition-colors',
          'bg-primary text-primary-foreground hover:bg-primary/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'flex items-center justify-center gap-2'
        )}
      >
        {isCheckingOut ? (
          <>
            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
            Processing…
          </>
        ) : 'Complete Transaction'}
      </button>
    </div>
  );
}
