// src/components/pos/CashPanel.tsx
import * as React from 'react';
import { CheckCircle2, Delete } from 'lucide-react';
import { formatCurrency, CURRENCY_SYMBOL } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface CashPanelProps {
  total: number;
  cashReceived: string;
  changeDue: number;
  isCashEnough: boolean;
  isCheckingOut: boolean;
  quickCashAmounts: number[];
  onNumpadInput: (value: string) => void;
  onConfirm: () => void;
  cashInputRef: React.RefObject<HTMLInputElement>;
}

const NUMPAD_KEYS = ['1','2','3','4','5','6','7','8','9','0','.','backspace'];

export function CashPanel({
  total,
  cashReceived,
  changeDue,
  isCashEnough,
  isCheckingOut,
  quickCashAmounts,
  onNumpadInput,
  onConfirm,
  cashInputRef,
}: CashPanelProps) {
  return (
    <div className="flex flex-col h-full">

      {/* Cash received display */}
      <div className="bg-muted/40 border border-border p-5 text-center mb-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
          Cash Received
        </p>
        <p
          className="text-5xl font-black tabular-nums tracking-tight"
          aria-live="polite"
          aria-label={`Cash received: ${CURRENCY_SYMBOL}${cashReceived || '0.00'}`}
        >
          <span className="text-muted-foreground/30">{CURRENCY_SYMBOL}</span>
          {cashReceived || '0.00'}
        </p>
      </div>

      {/* Quick cash buttons */}
      {quickCashAmounts.length > 0 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {quickCashAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => {
                onNumpadInput('clear');
                String(amount.toFixed(2)).split('').forEach(ch => onNumpadInput(ch));
                cashInputRef.current?.focus();
              }}
              aria-label={`Quick cash: ${formatCurrency(amount)}`}
              className={cn(
                'flex-1 min-w-[60px] h-9 text-xs font-bold border border-border',
                'bg-background hover:bg-primary/5 hover:border-primary hover:text-primary',
                'transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
      )}

      {/* Numpad */}
      <div
        className="grid grid-cols-3 gap-2 mb-4"
        role="group"
        aria-label="Cash numpad"
      >
        {NUMPAD_KEYS.map(key => (
          <button
            key={key}
            onClick={() => {
              onNumpadInput(key);
              cashInputRef.current?.focus();
            }}
            aria-label={key === 'backspace' ? 'Delete last digit' : key === '.' ? 'Decimal point' : key}
            className={cn(
              'h-14 text-xl font-bold border transition-all active:scale-95 select-none',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              key === 'backspace'
                ? 'border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white'
                : 'border-border bg-card hover:bg-primary/5 hover:border-primary hover:text-primary'
            )}
          >
            {key === 'backspace'
              ? <Delete className="h-5 w-5 mx-auto" aria-hidden="true" />
              : key
            }
          </button>
        ))}
      </div>

      {/* Change display */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="border border-border p-4 bg-card">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Change Due
          </p>
          <p
            className={cn(
              'text-3xl font-black tabular-nums',
              changeDue > 0 ? 'text-primary' : 'text-muted-foreground/30'
            )}
            aria-live="polite"
            aria-label={`Change due: ${formatCurrency(changeDue)}`}
          >
            {formatCurrency(changeDue)}
          </p>
        </div>
        <div className="border border-border p-4 bg-card flex flex-col justify-between">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            Status
          </p>
          {isCashEnough ? (
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
              Ready
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
              <div
                className="h-2.5 w-2.5 bg-orange-500 animate-pulse rounded-full"
                aria-hidden="true"
              />
              {cashReceived
                ? `Short ${formatCurrency(total - (parseFloat(cashReceived) || 0))}`
                : 'Enter amount'
              }
            </div>
          )}
        </div>
      </div>

      {/* Confirm button */}
      <button
        disabled={!isCashEnough || isCheckingOut}
        onClick={onConfirm}
        aria-label="Complete cash transaction"
        className={cn(
          'w-full h-14 font-black text-sm uppercase tracking-widest transition-colors',
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
          'Complete Transaction'
        )}
      </button>
    </div>
  );
}
