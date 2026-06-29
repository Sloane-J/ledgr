// src/components/pos/PaymentOverlay.tsx
import * as React from 'react';
import { useEffect } from 'react';
import { ArrowLeft, Banknote, CreditCard, Smartphone } from 'lucide-react';
import { formatCurrency } from '@/src/lib/constants';
import { PaymentMethod, MomoNetwork, MomoStatus } from './usePOS';
import { CashPanel } from './CashPanel';
import { CardPanel } from './CardPanel';
import { MomoPanel } from './MomoPanel';
import { cn } from '@/lib/utils';

interface PaymentOverlayProps {
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived: string;
  changeDue: number;
  isCashEnough: boolean;
  isCheckingOut: boolean;
  quickCashAmounts: number[];
  momoNetwork: MomoNetwork;
  momoNumber: string;
  momoStatus: MomoStatus;
  isValidMomoNumber: (num: string) => boolean;
  cashInputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onNumpadInput: (value: string) => void;
  onMomoNetworkChange: (network: MomoNetwork) => void;
  onMomoNumberChange: (number: string) => void;
  onCashConfirm: () => void;
  onCardConfirm: () => void;
  onMomoConfirm: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; icon: React.ElementType; label: string }[] = [
  { id: 'card',  icon: CreditCard, label: 'Card' },
  { id: 'cash',  icon: Banknote,   label: 'Cash' },
  { id: 'momo',  icon: Smartphone, label: 'MoMo' },
];

export function PaymentOverlay({
  total,
  paymentMethod,
  cashReceived,
  changeDue,
  isCashEnough,
  isCheckingOut,
  quickCashAmounts,
  momoNetwork,
  momoNumber,
  momoStatus,
  isValidMomoNumber,
  cashInputRef,
  onClose,
  onPaymentMethodChange,
  onNumpadInput,
  onMomoNetworkChange,
  onMomoNumberChange,
  onCashConfirm,
  onCardConfirm,
  onMomoConfirm,
}: PaymentOverlayProps) {

  // Trap focus inside overlay and handle keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Never intercept when user is typing in any input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.key === 'Escape') { onClose(); return; }

      // Number keys / decimal only reach numpad when cash is active
      if (paymentMethod === 'cash') {
        if (/^[0-9]$/.test(e.key)) { onNumpadInput(e.key); return; }
        if (e.key === '.' && !cashReceived.includes('.')) { onNumpadInput('.'); return; }
        if (e.key === 'Backspace') { onNumpadInput('backspace'); return; }
        if (e.key === 'Enter' && isCashEnough && !isCheckingOut) { onCashConfirm(); return; }
      }

      if (paymentMethod === 'card' && e.key === 'Enter' && !isCheckingOut) {
        onCardConfirm();
      }

      // Switch payment methods: 1 = card, 2 = cash, 3 = momo
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

  // Focus cash input whenever overlay opens or method changes to cash
  useEffect(() => {
    if (paymentMethod === 'cash') {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    }
  }, [paymentMethod, cashInputRef]);

  return (
    <div
      className="fixed inset-0 z-[100] bg-background flex flex-col lg:flex-row overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Payment"
    >
      {/* Hidden input — captures keyboard on cash panel */}
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

      {/* ── LEFT — method selector + amount ── */}
      <div className="w-full lg:w-[45%] flex flex-col border-r border-border shrink-0">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <button
            onClick={onClose}
            aria-label="Go back to order"
            className={cn(
              'flex items-center gap-2 text-xs font-bold uppercase tracking-widest',
              'text-muted-foreground hover:text-foreground transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
            <span className="text-[9px] opacity-50 ml-1">(Esc)</span>
          </button>
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Amount Due
            </p>
            <p
              className="text-3xl font-black tabular-nums text-primary"
              aria-label={`Amount due: ${formatCurrency(total)}`}
            >
              {formatCurrency(total)}
            </p>
          </div>
        </div>

        {/* Payment method tabs */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
            Payment Method
            <span className="ml-2 opacity-40">(1 / 2 / 3)</span>
          </p>
          <div
            className="grid grid-cols-3 gap-3"
            role="tablist"
            aria-label="Payment method"
          >
            {PAYMENT_METHODS.map((m, i) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={paymentMethod === m.id}
                aria-controls={`payment-panel-${m.id}`}
                onClick={() => onPaymentMethodChange(m.id)}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 h-20 border-2',
                  'font-bold text-xs uppercase tracking-widest transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  paymentMethod === m.id
                    ? 'border-primary bg-primary text-primary-foreground scale-[1.02]'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                )}
              >
                <m.icon className="h-5 w-5" aria-hidden="true" />
                <span>{m.label}</span>
                <span className="text-[9px] opacity-50">{i + 1}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Cash numpad — only visible for cash method */}
        {paymentMethod === 'cash' && (
          <div
            id="payment-panel-cash"
            role="tabpanel"
            aria-label="Cash payment"
            className="flex-1 px-6 py-5 overflow-y-auto"
          >
            <CashPanel
              total={total}
              cashReceived={cashReceived}
              changeDue={changeDue}
              isCashEnough={isCashEnough}
              isCheckingOut={isCheckingOut}
              quickCashAmounts={quickCashAmounts}
              onNumpadInput={onNumpadInput}
              onConfirm={onCashConfirm}
              cashInputRef={cashInputRef}
            />
          </div>
        )}
      </div>

      {/* ── RIGHT — active payment panel ── */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {paymentMethod === 'card' && (
          <div
            id="payment-panel-card"
            role="tabpanel"
            aria-label="Card payment"
            className="flex-1 flex flex-col px-6 py-6"
          >
            <CardPanel
              total={total}
              isCheckingOut={isCheckingOut}
              onConfirm={onCardConfirm}
            />
          </div>
        )}

        {paymentMethod === 'momo' && (
          <div
            id="payment-panel-momo"
            role="tabpanel"
            aria-label="Mobile money payment"
            className="px-6 py-6"
          >
            <MomoPanel
              total={total}
              momoNetwork={momoNetwork}
              momoNumber={momoNumber}
              momoStatus={momoStatus}
              isCheckingOut={isCheckingOut}
              isValidMomoNumber={isValidMomoNumber}
              onNetworkChange={onMomoNetworkChange}
              onNumberChange={onMomoNumberChange}
              onConfirm={onMomoConfirm}
            />
          </div>
        )}

        {/* Cash panel right side — empty on cash since numpad is on the left */}
        {paymentMethod === 'cash' && (
          <div
            className="flex-1 flex items-center justify-center text-muted-foreground/20 px-6"
            aria-hidden="true"
          >
            <p className="text-xs uppercase tracking-widest">
              Use numpad on the left
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
