// src/components/ReceiptPrint.tsx
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { CartItem } from '@/src/types';
import { TAX_RATE, CURRENCY_SYMBOL, formatCurrency } from '@/src/lib/constants';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/lib/utils';

interface ReceiptPaymentInfo {
  method: string;
  change: number;
  subtotal: number;
  tax: number;
  discount: number;
  discountAmount: number;
  total: number;
  items: CartItem[];
  customerName?: string;
  momoNumber?: string;
  momoNetwork?: string;
}

interface ReceiptPrintProps {
  lastOrderId: string | null;
  paymentInfo: ReceiptPaymentInfo | null;
  shouldPrint: boolean;
  onPrintDone: () => void;
}

const PRINT_STYLES = `
@media print {
  body * { visibility: hidden !important; }
  #receipt-printout,
  #receipt-printout * { visibility: visible !important; }
  #receipt-printout {
    display: block !important;
    position: fixed !important;
    top: 0;
    left: 0;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    width: 76mm;
    padding: 4mm;
    color: #000 !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page {
    size: 80mm auto;
    margin: 0;
  }
}
`;

function PrintRow({
  label,
  value,
  bold,
  large,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '3px',
      fontWeight: bold ? 'bold' : 'normal',
      fontSize: large ? '13px' : '11px',
      color: muted ? '#666' : '#000',
    }}>
      <span style={{ whiteSpace: 'nowrap', marginRight: '4px' }}>{label}</span>
      <span style={{
        flex: 1,
        borderBottom: '1px dotted #ccc',
        margin: '0 4px',
        minWidth: '12px',
        height: '1em',
      }} />
      <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </span>
    </div>
  );
}

function PrintDivider({ thick }: { thick?: boolean }) {
  return (
    <div style={{
      borderTop: thick ? '2px solid #000' : '1px dashed #bbb',
      margin: '6px 0',
    }} />
  );
}

function PrintSection({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '8px',
      letterSpacing: '2px',
      textTransform: 'uppercase' as const,
      fontWeight: 'bold',
      color: '#555',
      marginBottom: '5px',
      marginTop: '2px',
    }}>
      {children}
    </div>
  );
}

function Barcode({ value }: { value: string }) {
  const pattern = value
    .split('')
    .map(c => c.charCodeAt(0))
    .map(n => n % 4 === 0 ? '██' : n % 3 === 0 ? '█ ' : n % 2 === 0 ? '███' : '█')
    .join('');

  return (
    <div style={{ textAlign: 'center', margin: '8px 0 4px' }}>
      <div style={{
        fontSize: '20px',
        lineHeight: '1',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        {pattern.slice(0, 28)}
      </div>
      <div style={{
        fontSize: '9px',
        letterSpacing: '4px',
        marginTop: '3px',
        fontWeight: 'bold',
      }}>
        {value}
      </div>
    </div>
  );
}

const METHOD_LABELS: Record<string, string> = {
  cash: 'Cash',
  card: 'Card',
  momo: 'Mobile Money',
};

const NETWORK_LABELS: Record<string, string> = {
  mtn: 'MTN MoMo',
  vodafone: 'Telecel Cash',
  airteltigo: 'AirtelTigo Money',
};

export function ReceiptPrint({
  lastOrderId,
  paymentInfo,
  shouldPrint,
  onPrintDone,
}: ReceiptPrintProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasPrinted = useRef(false);
  const printButtonRef = useRef<HTMLButtonElement>(null);

  // Inject thermal print styles
  useEffect(() => {
    const id = 'receipt-print-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = PRINT_STYLES;
      document.head.appendChild(style);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  // Open modal when shouldPrint fires
  useEffect(() => {
    if (shouldPrint && paymentInfo) {
      setIsModalOpen(true);
    }
  }, [shouldPrint, paymentInfo]);

  // Focus print button when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => printButtonRef.current?.focus(), 80);
    }
  }, [isModalOpen]);

  // Close modal and signal done
  const handleClose = () => {
    setIsModalOpen(false);
    onPrintDone();
    hasPrinted.current = false;
  };

  // Trigger thermal print
  const handlePrint = () => {
    if (hasPrinted.current) return;
    hasPrinted.current = true;
    setTimeout(() => {
      window.print();
      hasPrinted.current = false;
    }, 100);
  };

  // Keyboard: Escape closes, P or Enter triggers print
  useEffect(() => {
    if (!isModalOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { handleClose(); return; }
      if ((e.key === 'p' || e.key === 'P') && !e.ctrlKey && !e.metaKey) {
        handlePrint();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isModalOpen]);

  if (!paymentInfo || !isModalOpen) return null;

  const orderId = lastOrderId?.slice(-6).toUpperCase() ?? '------';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <>
      {/* ── MODAL OVERLAY ── */}
      <div
        className="fixed inset-0 z-[300] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-label="Receipt"
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/70"
          onClick={handleClose}
          aria-hidden="true"
        />

        {/* Modal */}
        <div className="relative z-10 w-[90vw] max-w-md max-h-[90vh] flex flex-col bg-card border border-border shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <div>
              <h2 className="font-black text-base uppercase tracking-widest">Receipt</h2>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Order #{orderId} · {paymentInfo.method.toUpperCase()}
              </p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Close receipt"
              className={cn(
                'w-8 h-8 flex items-center justify-center border border-border',
                'text-muted-foreground hover:text-foreground hover:bg-muted transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
              )}
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Receipt body — scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 font-mono text-sm">

            {/* Store + meta */}
            <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-border">
              <p className="text-lg font-black tracking-[0.2em] uppercase">LEDGR</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Point of Sale Receipt
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">
                {dateStr} · {timeStr}
              </p>
              <p className="text-xs font-bold tracking-[0.15em]">#{orderId}</p>
              {paymentInfo.customerName && paymentInfo.customerName !== 'Guest' && (
                <p className="text-[11px] text-muted-foreground">
                  {paymentInfo.customerName}
                </p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Items
              </p>
              {paymentInfo.items.map((item, i) => (
                <div key={i} className="space-y-0.5">
                  <p className="text-xs font-bold truncate">{item.name}</p>
                  <div className="flex justify-between text-[11px] text-muted-foreground pl-2">
                    <span>{item.quantity} × {formatCurrency(Number(item.price))}</span>
                    <span className="tabular-nums font-semibold text-foreground">
                      {formatCurrency(Number(item.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="border-t border-dashed border-border pt-3 space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Summary
              </p>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(paymentInfo.subtotal)}</span>
              </div>
              {paymentInfo.discount > 0 && (
                <div className="flex justify-between text-[11px] text-primary">
                  <span>Discount ({paymentInfo.discount}%)</span>
                  <span className="tabular-nums">−{formatCurrency(paymentInfo.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                <span className="tabular-nums">{formatCurrency(paymentInfo.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-black pt-2 border-t border-border">
                <span>Total</span>
                <span className="tabular-nums text-primary">
                  {formatCurrency(paymentInfo.total)}
                </span>
              </div>
            </div>

            {/* Payment */}
            <div className="border-t border-dashed border-border pt-3 space-y-1">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                Payment
              </p>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Method</span>
                <span className="font-semibold">
                  {METHOD_LABELS[paymentInfo.method] ?? paymentInfo.method.toUpperCase()}
                </span>
              </div>
              {paymentInfo.method === 'cash' && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Change</span>
                  <span className="font-semibold tabular-nums">
                    {formatCurrency(paymentInfo.change)}
                  </span>
                </div>
              )}
              {paymentInfo.method === 'momo' && paymentInfo.momoNetwork && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Network</span>
                  <span className="font-semibold">
                    {NETWORK_LABELS[paymentInfo.momoNetwork] ?? paymentInfo.momoNetwork}
                  </span>
                </div>
              )}
            </div>

            {/* Paid indicator */}
            <div className="flex items-center justify-center gap-2 py-2 border border-primary/20 bg-primary/5 text-primary">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span className="text-xs font-black uppercase tracking-widest">Paid</span>
            </div>

            {/* Footer */}
            <div className="text-center space-y-1 pb-2">
              <p className="text-xs font-bold tracking-widest">Thank you</p>
              <p className="text-[10px] text-muted-foreground">
                Please keep this receipt for your records
              </p>
              <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest pt-1">
                Powered by Ledgr
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-5 py-4 border-t border-border flex gap-3 shrink-0">
            <Button
              variant="outline"
              className="flex-1 font-bold"
              onClick={handleClose}
            >
              Close
            </Button>
            <Button
              ref={printButtonRef}
              className="flex-1 font-bold gap-2"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4" aria-hidden="true" />
              Print
              <span className="text-[10px] opacity-60 font-normal">(P)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── THERMAL PRINTOUT — hidden, only visible during window.print() ── */}
      <div id="receipt-printout" style={{ display: 'none' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '6px' }}>
            LEDGR
          </div>
          <div style={{ fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: '#555', marginTop: '2px' }}>
            Point of Sale Receipt
          </div>
        </div>

        <PrintDivider thick />

        <div style={{ textAlign: 'center', fontSize: '10px', lineHeight: '1.7', marginBottom: '4px' }}>
          <div style={{ color: '#444' }}>{dateStr} · {timeStr}</div>
          <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '3px' }}>
            #{orderId}
          </div>
          {paymentInfo.customerName && paymentInfo.customerName !== 'Guest' && (
            <div style={{ fontSize: '10px', color: '#333' }}>
              {paymentInfo.customerName}
            </div>
          )}
        </div>

        <PrintDivider />
        <PrintSection>Items</PrintSection>
        {paymentInfo.items.map((item, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{item.name}</div>
            <PrintRow
              label={`  ${item.quantity} × ${formatCurrency(Number(item.price))}`}
              value={formatCurrency(Number(item.price) * item.quantity)}
              muted
            />
          </div>
        ))}

        <PrintDivider />
        <PrintSection>Summary</PrintSection>
        <PrintRow label="Subtotal" value={formatCurrency(paymentInfo.subtotal)} muted />
        {paymentInfo.discount > 0 && (
          <PrintRow
            label={`Discount (${paymentInfo.discount}%)`}
            value={`-${formatCurrency(paymentInfo.discountAmount)}`}
            muted
          />
        )}
        <PrintRow
          label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`}
          value={formatCurrency(paymentInfo.tax)}
          muted
        />
        <div style={{ margin: '5px 0' }}>
          <PrintRow label="TOTAL" value={formatCurrency(paymentInfo.total)} bold large />
        </div>

        <PrintDivider />
        <PrintSection>Payment</PrintSection>
        <PrintRow
          label="Method"
          value={METHOD_LABELS[paymentInfo.method] ?? paymentInfo.method.toUpperCase()}
        />
        {paymentInfo.method === 'cash' && (
          <PrintRow label="Change" value={formatCurrency(paymentInfo.change)} />
        )}
        {paymentInfo.method === 'momo' && paymentInfo.momoNetwork && (
          <PrintRow
            label="Network"
            value={NETWORK_LABELS[paymentInfo.momoNetwork] ?? paymentInfo.momoNetwork}
          />
        )}

        <PrintDivider thick />
        <Barcode value={orderId} />
        <PrintDivider />

        <div style={{ textAlign: 'center', fontSize: '10px', lineHeight: '1.9', marginTop: '4px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px' }}>
            Thank you
          </div>
          <div style={{ fontSize: '9px', color: '#555' }}>
            Please keep this receipt for your records
          </div>
          <div style={{ fontSize: '8px', color: '#888', marginTop: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Powered by Ledgr
          </div>
        </div>
      </div>
    </>
  );
}
