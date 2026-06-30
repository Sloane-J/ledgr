// src/components/pos/CardPanel.tsx
import * as React from 'react';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { formatCurrency } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface CardPanelProps {
  total: number;
  cashReceived: string;
  changeDue: number;
  isCashEnough: boolean;
  isCheckingOut: boolean;
  cardReference: string;
  onCardReferenceChange: (ref: string) => void;
  onConfirm: () => void;
}

export function CardPanel({
  total,
  isCashEnough,
  isCheckingOut,
  cardReference,
  onCardReferenceChange,
  onConfirm,
}: CardPanelProps) {
  return (
    <div className="flex flex-col h-full gap-6">

      {/* Icon + instruction */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 border border-primary/20 bg-primary/5 flex items-center justify-center text-primary shrink-0">
          <CreditCard className="h-6 w-6" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-black uppercase tracking-tight">Card Payment</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ask customer to insert, swipe, or tap on the terminal.
          </p>
        </div>
      </div>

      {/* Total */}
      <div className="border border-border bg-muted/20 px-4 py-3">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          Total to charge
        </p>
        <p className="text-3xl font-black tabular-nums text-primary">
          {formatCurrency(total)}
        </p>
      </div>

      {/* Optional reference */}
      <div>
        <Label
          htmlFor="card-reference"
          className="text-[10px] uppercase tracking-widest text-muted-foreground"
        >
          Last 4 digits / Reference
          <span className="ml-2 normal-case tracking-normal text-muted-foreground/50">
            (optional)
          </span>
        </Label>
        <Input
          id="card-reference"
          placeholder="e.g. 4242 or TXN-001"
          value={cardReference}
          onChange={e => onCardReferenceChange(e.target.value)}
          maxLength={20}
          className="mt-1.5 h-10 bg-background border-border font-mono"
          aria-describedby="card-reference-hint"
        />
        <p
          id="card-reference-hint"
          className="text-[10px] text-muted-foreground mt-1"
        >
          Never enter full card numbers. Last 4 digits or transaction reference only.
        </p>
      </div>

      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
        Confirm only after terminal approves · Enter
      </p>

      <button
        disabled={!isCashEnough || isCheckingOut}
        onClick={onConfirm}
        aria-label="Confirm card payment received"
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
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Payment Received
          </>
        )}
      </button>
    </div>
  );
}
