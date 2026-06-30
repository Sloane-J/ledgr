// src/components/pos/PaymentOverlay.tsx
import * as React from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { formatCurrency, CURRENCY_SYMBOL, TAX_RATE } from '@/src/lib/constants';
import { CartItem } from '@/src/types';
import { PaymentMethod, MomoNetwork, MomoStatus } from './usePOS';
import { CashPanel } from './CashPanel';
import { CardPanel } from './CardPanel';
import { MomoPanel } from './MomoPanel';
import { cn } from '@/lib/utils';
import { CheckCircle2, Delete } from 'lucide-react';

interface PaymentOverlayProps {
  // Order summary
  cart: CartItem[];
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;
  customerName: string;

  // Payment
  paymentMethod: PaymentMethod;
  cashReceived: string;
  changeDue: number;
  isCashEnough: boolean;
  isCheckingOut: boolean;
  quickCashAmounts: number[];
  momoNumber: string;
  momoStatus: MomoStatus;
  cardReference: string;
  cashInputRef: React.RefObject<HTMLInputElement>;

  // Handlers
  onClose: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onNumpadInput: (value: string) => void;
  onMomoNumberChange: (number: string) => void;
  onCardReferenceChange: (ref: string) => void;
  onCashConfirm: () => void;
  onCardConfirm: () => void;
  onMomoConfirm: (type: 'prompt' | 'pay_to_account') => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; icon: React.ElementType; label: string }[] = [
  { id: 'card',  icon: CreditCard, label: 'Card' },
  { id: 'cash',  icon: Banknote,   label: 'Cash' },
  { id: 'momo',  icon: Smartphone, label: 'MoMo' },
];

const NUMPAD_KEYS = ['7','8','9','4','5','6','1','2','3','0','.','backspace'];

export function PaymentOverlay({
  cart,
  subtotal,
  discount,
  discountAmount,
  tax,
  total,
  customerName,
  paymentMethod,
  cashReceived,
  changeDue,
  isCashEnough,
  isCheckingOut,
  quickCashAmounts,
  momoNumber,
  momoStatus,
  cardReference,
  cashInputRef,
  onClose,
  onPaymentMethodChange,
  onNumpadInput,
  onMomoNumberChange,
  onCardReferenceChange,
  onCashConfirm,
  onCardConfirm,
  onMomoConfirm,
}: PaymentOverlayProps) {

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') { onClose(); return; }

      // Numpad always active for all methods
      if (/^[0-9]$/.test(e.key)) { onNumpadInput(e.key); return; }
      if (e.key === '.' && !cashReceived.includes('.')) { onNumpadInput('.'); return; }
      if (e.key === 'Backspace') { onNumpadInput('backspace'); return; }

      if (e.key === 'Enter' && isCashEnough && !isCheckingOut) {
        if (paymentMethod === 'cash') onCashConfirm();
        if (paymentMethod === 'card') onCardConfirm();
      }

      // Switch methods
      if (e.key === '1') onPaymentMethodChange('card');
      if (e.key === '2') onPaymentMethodChange('cash');
      if (e.key === '3') onPaymentMethodChange('momo');
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    paymentMethod, cashReceived, isCashEnough, isCheckingOut,
    onClose, onNumpadInput, onCashConfirm, onCardConfirm, onPaymentMethodChange,
  ]);

  useEffect(() => {
    setTimeout(() => cashInputRef.current?.focus(), 50);
  }, [paymentMethod, cashInputRef]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
    >
      {/* Hidden input — captures keyboard for numpad */}
      <input
        ref={cashInputRef}
        type="text"
        inputMode="decimal"
        className="sr-only"
        value={cashReceived}
        readOnly
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* ── TOP BAR ── */}
      <div className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
        <button
          onClick={onClose}
          aria-label="Back to order"
          className={cn(
            'flex items-center gap-2 text-xs font-bold uppercase tracking-widest',
            'text-muted-foreground hover:text-foreground transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
          )}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back
          <span className="text-[9px] opacity-40 ml-0.5">(Esc)</span>
        </button>

        {/* Payment method tabs */}
        <div
          className="flex items-center gap-1"
          role="tablist"
          aria-label="Payment method"
        >
          {PAYMENT_METHODS.map((m, i) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={paymentMethod === m.id}
              onClick={() => onPaymentMethodChange(m.id)}
              className={cn(
                'flex items-center gap-2 h-9 px-5 border text-xs font-bold uppercase tracking-widest transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                paymentMethod === m.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
              )}
            >
              <m.icon className="h-3.5 w-3.5" aria-hidden="true" />
              {m.label}
              <span className="text-[9px] opacity-40">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Amount due */}
        <div className="text-right">
          <p className="text-[9px] uppercase tracking-widest text-muted-foreground">
            Amount Due
          </p>
          <p className="text-xl font-black tabular-nums text-primary">
            {formatCurrency(total)}
          </p>
        </div>
      </div>

      {/* ── THREE COLUMNS ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT — Order summary (narrow) ── */}
        <div className="w-[260px] border-r border-border flex flex-col bg-card/30 shrink-0">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Order Summary
            </p>
            {customerName && customerName !== 'Guest' && (
              <p className="text-xs font-semibold text-foreground mt-1 truncate">
                {customerName}
              </p>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
            {cart.map(item => (
              <div
                key={item.id}
                className="flex justify-between items-baseline gap-2 py-1.5 border-b border-border/50 last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground">
                    ×{item.quantity} @ {formatCurrency(Number(item.price))}
                  </p>
                </div>
                <span className="text-xs font-black tabular-nums shrink-0">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="px-4 py-3 border-t border-border space-y-1 shrink-0">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Subtotal</span>
              <span className="tabular-nums">{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-primary">
                <span>Discount ({discount}%)</span>
                <span className="tabular-nums">−{formatCurrency(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span className="tabular-nums">{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm font-black pt-1.5 border-t border-border">
              <span>Total</span>
              <span className="tabular-nums text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* ── CENTER — Method panel (medium) ── */}
        <div className="w-[320px] border-r border-border flex flex-col overflow-y-auto shrink-0">
          <div className="flex-1 px-6 py-6">
            {paymentMethod === 'cash' && (
              <CashPanel
                total={total}
                cashReceived={cashReceived}
                changeDue={changeDue}
                isCashEnough={isCashEnough}
                isCheckingOut={isCheckingOut}
                onConfirm={onCashConfirm}
              />
            )}
            {paymentMethod === 'card' && (
              <CardPanel
                total={total}
                cashReceived={cashReceived}
                changeDue={changeDue}
                isCashEnough={isCashEnough}
                isCheckingOut={isCheckingOut}
                cardReference={cardReference}
                onCardReferenceChange={onCardReferenceChange}
                onConfirm={onCardConfirm}
              />
            )}
            {paymentMethod === 'momo' && (
              <MomoPanel
                total={total}
                cashReceived={cashReceived}
                changeDue={changeDue}
                isCashEnough={isCashEnough}
                momoStatus={momoStatus}
                momoNumber={momoNumber}
                isCheckingOut={isCheckingOut}
                onMomoNumberChange={onMomoNumberChange}
                onConfirm={onMomoConfirm}
              />
            )}
          </div>
        </div>

        {/* ── RIGHT — Numpad + display (largest) ── */}
        <div className="flex-1 flex flex-col border-l border-border bg-card/20">

          {/* Cash received display */}
          <div className="px-8 py-6 border-b border-border shrink-0">
            <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-3">
              Amount Entered
            </p>
            <p
              className="text-6xl font-black tabular-nums tracking-tight"
              aria-live="polite"
              aria-label={`Amount entered: ${cashReceived || '0.00'}`}
            >
              <span className="text-muted-foreground/20 text-4xl">{CURRENCY_SYMBOL}</span>
              {cashReceived || '0.00'}
            </p>

            {/* Change due — shown for all methods */}
            <div className="flex items-center gap-6 mt-4">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">
                  Change Due
                </p>
                <p className={cn(
                  'text-2xl font-black tabular-nums',
                  changeDue > 0 ? 'text-primary' : 'text-muted-foreground/20'
                )}>
                  {formatCurrency(changeDue)}
                </p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-muted-foreground mb-0.5">
                  Status
                </p>
                {isCashEnough ? (
                  <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Ready
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm">
                    <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" aria-hidden="true" />
                    {cashReceived
                      ? `Short ${formatCurrency(total - (parseFloat(cashReceived) || 0))}`
                      : 'Enter amount'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick amounts */}
          {quickCashAmounts.length > 0 && (
            <div className="px-8 py-3 flex gap-2 border-b border-border shrink-0">
              {quickCashAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => {
                    onNumpadInput('clear');
                    String(amount.toFixed(2)).split('').forEach(ch => onNumpadInput(ch));
                    cashInputRef.current?.focus();
                  }}
                  className={cn(
                    'flex-1 h-9 text-xs font-bold border border-border',
                    'hover:bg-primary/5 hover:border-primary hover:text-primary transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
                  )}
                >
                  {formatCurrency(amount)}
                </button>
              ))}
            </div>
          )}

          {/* Numpad */}
          <div
            className="flex-1 p-8 grid grid-cols-3 gap-3 content-center"
            role="group"
            aria-label="Numpad"
          >
            {NUMPAD_KEYS.map(key => (
              <button
                key={key}
                onClick={() => {
                  onNumpadInput(key);
                  cashInputRef.current?.focus();
                }}
                aria-label={
                  key === 'backspace' ? 'Delete last digit'
                  : key === '.' ? 'Decimal point'
                  : key
                }
                className={cn(
                  'h-16 text-xl font-bold border transition-all active:scale-95 select-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  key === 'backspace'
                    ? 'border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white'
                    : 'border-border bg-card hover:bg-primary/5 hover:border-primary hover:text-primary',
                  key === '0' && 'col-span-2'
                )}
              >
                {key === 'backspace'
                  ? <Delete className="h-5 w-5 mx-auto" aria-hidden="true" />
                  : key
                }
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
