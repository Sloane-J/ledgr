// src/components/ReceiptPrint.tsx
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CartItem } from '@/src/types';
import { TAX_RATE, CURRENCY_SYMBOL, formatCurrency } from '@/src/lib/constants';

// Matches PaymentInfo from usePOS.ts exactly
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
  #receipt-print,
  #receipt-print * { visibility: visible !important; }
  #receipt-print {
    display: block !important;
    position: fixed !important;
    top: 0;
    left: 0;
    font-family: 'Courier New', Courier, monospace;
    font-size: 11px;
    width: 76mm;
    padding: 4mm 4mm;
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

// ── Sub-components ────────────────────────────────────────

function Row({
  label,
  value,
  bold,
  large,
  indent,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  large?: boolean;
  indent?: boolean;
  muted?: boolean;
}) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '2px',
      fontWeight: bold ? 'bold' : 'normal',
      fontSize: large ? '13px' : '11px',
      color: muted ? '#555' : '#000',
      paddingLeft: indent ? '8px' : '0',
    }}>
      <span style={{ whiteSpace: 'nowrap', marginRight: '4px' }}>{label}</span>
      <span style={{
        flex: 1,
        borderBottom: '1px dotted #bbb',
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

function Divider({ type = 'dashed' }: { type?: 'solid' | 'dashed' | 'thick' }) {
  return (
    <div style={{
      borderTop: type === 'thick'
        ? '2px solid #000'
        : type === 'solid'
        ? '1px solid #000'
        : '1px dashed #aaa',
      margin: '6px 0',
    }} />
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize: '8px',
      letterSpacing: '2px',
      textTransform: 'uppercase',
      fontWeight: 'bold',
      color: '#444',
      marginBottom: '4px',
      marginTop: '2px',
    }}>
      {children}
    </div>
  );
}

// Simple barcode-style graphic using unicode blocks
function Barcode({ value }: { value: string }) {
  // Deterministic bar pattern derived from order ID characters
  const pattern = value
    .split('')
    .map(c => c.charCodeAt(0))
    .map(n => (n % 4 === 0 ? '██' : n % 3 === 0 ? '█ ' : n % 2 === 0 ? '███' : '█'))
    .join('');

  return (
    <div style={{ textAlign: 'center', margin: '8px 0 4px' }}>
      <div style={{
        fontSize: '22px',
        lineHeight: '1',
        fontFamily: 'monospace',
        letterSpacing: '1px',
        color: '#000',
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
        color: '#000',
      }}>
        {value}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────

export function ReceiptPrint({
  lastOrderId,
  paymentInfo,
  shouldPrint,
  onPrintDone,
}: ReceiptPrintProps) {
  const hasPrinted = useRef(false);

  // Inject print styles once
  useEffect(() => {
    const id = 'receipt-print-styles';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = PRINT_STYLES;
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById('receipt-print-styles')?.remove();
    };
  }, []);

  // Trigger print
  useEffect(() => {
    if (shouldPrint && paymentInfo && !hasPrinted.current) {
      hasPrinted.current = true;
      const timer = setTimeout(() => {
        window.print();
        onPrintDone();
        hasPrinted.current = false;
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [shouldPrint, paymentInfo, onPrintDone]);

  if (!paymentInfo) return null;

  const orderId = lastOrderId?.slice(-6).toUpperCase() ?? '------';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  });

  const methodLabel: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    momo: 'Mobile Money',
  };

  const networkLabel: Record<string, string> = {
    mtn: 'MTN MoMo',
    vodafone: 'Telecel Cash',
    airteltigo: 'AirtelTigo Money',
  };

  return (
    <div id="receipt-print" style={{ display: 'none' }}>

      {/* ── HEADER ── */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{
          fontSize: '22px',
          fontWeight: 'bold',
          letterSpacing: '6px',
          textTransform: 'uppercase',
          lineHeight: '1',
        }}>
          LEDGR
        </div>
        <div style={{
          fontSize: '8px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: '#555',
          marginTop: '3px',
        }}>
          Point of Sale Receipt
        </div>
      </div>

      <Divider type="thick" />

      {/* ── ORDER META ── */}
      <div style={{ textAlign: 'center', fontSize: '10px', lineHeight: '1.7', marginBottom: '2px' }}>
        <div style={{ color: '#444' }}>{dateStr} · {timeStr}</div>
        <div style={{
          fontWeight: 'bold',
          fontSize: '12px',
          letterSpacing: '3px',
          marginTop: '1px',
        }}>
          #{orderId}
        </div>
        {paymentInfo.customerName && paymentInfo.customerName !== 'Guest' && (
          <div style={{ marginTop: '2px', fontSize: '10px', color: '#333' }}>
            {paymentInfo.customerName}
          </div>
        )}
      </div>

      <Divider type="dashed" />

      {/* ── ITEMS ── */}
      <SectionLabel>Items</SectionLabel>
      {paymentInfo.items.map((item, i) => (
        <div key={i} style={{ marginBottom: '6px' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: '1px',
          }}>
            {item.name}
          </div>
          <Row
            label={`  ${item.quantity} × ${formatCurrency(Number(item.price))}`}
            value={formatCurrency(Number(item.price) * item.quantity)}
            indent
            muted
          />
        </div>
      ))}

      <Divider type="dashed" />

      {/* ── TOTALS ── */}
      <SectionLabel>Summary</SectionLabel>
      <Row label="Subtotal" value={formatCurrency(paymentInfo.subtotal)} muted />

      {paymentInfo.discount > 0 && (
        <Row
          label={`Discount (${paymentInfo.discount}%)`}
          value={`−${formatCurrency(paymentInfo.discountAmount)}`}
          muted
        />
      )}

      <Row
        label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`}
        value={formatCurrency(paymentInfo.tax)}
        muted
      />

      <div style={{ margin: '5px 0 2px' }}>
        <Row
          label="TOTAL"
          value={formatCurrency(paymentInfo.total)}
          bold
          large
        />
      </div>

      <Divider type="dashed" />

      {/* ── PAYMENT ── */}
      <SectionLabel>Payment</SectionLabel>
      <Row
        label="Method"
        value={methodLabel[paymentInfo.method] ?? paymentInfo.method.toUpperCase()}
      />
      {paymentInfo.method === 'cash' && (
        <Row label="Change" value={formatCurrency(paymentInfo.change)} />
      )}
      {paymentInfo.method === 'momo' && paymentInfo.momoNetwork && (
        <Row
          label="Network"
          value={networkLabel[paymentInfo.momoNetwork] ?? paymentInfo.momoNetwork.toUpperCase()}
        />
      )}
      {paymentInfo.method === 'momo' && paymentInfo.momoNumber && (
        <Row label="Number" value={paymentInfo.momoNumber} />
      )}

      <Divider type="thick" />

      {/* ── BARCODE ── */}
      <Barcode value={orderId} />

      <Divider type="dashed" />

      {/* ── FOOTER ── */}
      <div style={{
        textAlign: 'center',
        fontSize: '10px',
        lineHeight: '1.9',
        marginTop: '4px',
        color: '#333',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '12px', letterSpacing: '2px' }}>
          Thank you
        </div>
        <div style={{ fontSize: '9px', color: '#555' }}>
          Please keep this receipt for your records
        </div>
        <div style={{
          fontSize: '8px',
          letterSpacing: '1px',
          color: '#888',
          marginTop: '6px',
          textTransform: 'uppercase',
        }}>
          Powered by Ledgr · ledgr-xi.vercel.app
        </div>
      </div>

    </div>
  );
}
