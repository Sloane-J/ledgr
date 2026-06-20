import * as React from 'react';
import { useEffect, useRef } from 'react';
import { CartItem } from '@/src/types';
import { TAX_RATE, formatCurrency } from '@/src/lib/constants';

interface ReceiptPaymentInfo {
  method: string;
  change: number;
  subtotal: number;
  tax: number;
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
  #receipt-print * {
    visibility: visible !important;
  }
  #receipt-print {
    display: block !important;
    position: fixed !important;
    top: 0;
    left: 0;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    width: 80mm;
    padding: 10px;
    color: #000;
    background: #fff;
  }
}
`;

// Dotted leader line between label and value
function LeaderRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      marginBottom: '3px',
      fontWeight: bold ? 'bold' : 'normal',
      fontSize: bold ? '13px' : '11px',
    }}>
      <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
      <span style={{
        flex: 1,
        borderBottom: '1px dotted #000',
        margin: '0 4px',
        minWidth: '10px',
        height: '1em',
      }} />
      <span style={{ whiteSpace: 'nowrap' }}>{value}</span>
    </div>
  );
}

function Divider({ style = 'dashed' }: { style?: 'dashed' | 'solid' | 'double' }) {
  const char = style === 'double' ? '═' : style === 'solid' ? '─' : '- ';
  return (
    <div style={{
      textAlign: 'center',
      fontSize: '10px',
      letterSpacing: style === 'double' ? '1px' : '0',
      margin: '6px 0',
      overflow: 'hidden',
      color: '#000',
    }}>
      {char.repeat(style === 'double' ? 24 : 20)}
    </div>
  );
}

export function ReceiptPrint({
  lastOrderId,
  paymentInfo,
  shouldPrint,
  onPrintDone,
}: ReceiptPrintProps) {
  const hasPrinted = useRef(false);

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
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div id="receipt-print" style={{ display: 'none' }}>

      {/* ── TEAR EDGE ── */}
      <div style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '2px', marginBottom: '8px', color: '#555' }}>
        ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲ ▲
      </div>

      {/* ── STAMP HEADER ── */}
      <div style={{
        border: '2px solid #000',
        padding: '8px 10px',
        textAlign: 'center',
        marginBottom: '10px',
      }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '4px', textTransform: 'uppercase' }}>
          LEDGR
        </div>
        <div style={{ fontSize: '9px', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '2px', color: '#333' }}>
          Point of Sale System
        </div>
      </div>

      {/* ── META ── */}
      <div style={{ fontSize: '10px', textAlign: 'center', marginBottom: '6px', lineHeight: '1.6' }}>
        <div>{dateStr} · {timeStr}</div>
        <div style={{ fontWeight: 'bold', fontSize: '11px', letterSpacing: '2px' }}>
          # {orderId}
        </div>
        {paymentInfo.customerName && paymentInfo.customerName !== 'Guest' && (
          <div style={{ marginTop: '2px' }}>
            Customer: <strong>{paymentInfo.customerName}</strong>
          </div>
        )}
      </div>

      <Divider style="double" />

      {/* ── ITEMS ── */}
      <div style={{ marginBottom: '4px' }}>
        <div style={{
          fontSize: '9px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginBottom: '5px',
          fontWeight: 'bold',
        }}>
          Items
        </div>
        {paymentInfo.items.map((item, i) => (
          <div key={i} style={{ marginBottom: '5px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '1px' }}>
              {item.name}
            </div>
            <LeaderRow
              label={`  x${item.quantity} @ ${formatCurrency(Number(item.price))}`}
              value={formatCurrency(Number(item.price) * item.quantity)}
            />
          </div>
        ))}
      </div>

      <Divider style="dashed" />

      {/* ── TOTALS ── */}
      <div style={{ marginBottom: '4px' }}>
        <LeaderRow label="Subtotal" value={formatCurrency(paymentInfo.subtotal)} />
        <LeaderRow label={`Tax (${TAX_RATE * 100}%)`} value={formatCurrency(paymentInfo.tax)} />
        <div style={{ margin: '5px 0' }}>
          <LeaderRow label="TOTAL" value={formatCurrency(paymentInfo.total)} bold />
        </div>
      </div>

      <Divider style="dashed" />

      {/* ── PAYMENT ── */}
      <div style={{ fontSize: '11px', marginBottom: '4px' }}>
        <div style={{
          fontSize: '9px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 'bold',
          marginBottom: '4px',
        }}>
          Payment
        </div>
        <LeaderRow label="Method" value={paymentInfo.method.toUpperCase()} />
        {paymentInfo.method === 'cash' && (
          <LeaderRow label="Change" value={formatCurrency(paymentInfo.change)} />
        )}
        {paymentInfo.method === 'momo' && (
          <>
            <LeaderRow label="Network" value={paymentInfo.momoNetwork?.toUpperCase() ?? ''} />
            <LeaderRow label="Number" value={paymentInfo.momoNumber ?? ''} />
          </>
        )}
      </div>

      <Divider style="double" />

      {/* ── FAKE BARCODE ── */}
      <div style={{ textAlign: 'center', margin: '8px 0 4px' }}>
        <div style={{
          display: 'inline-block',
          letterSpacing: '1px',
          fontSize: '28px',
          lineHeight: '1',
          fontFamily: 'monospace',
          color: '#000',
        }}>
          {'|'.repeat(3)}{'█'.repeat(2)}{'|'.repeat(2)}{'█'.repeat(3)}{'|'.repeat(2)}{'█'.repeat(1)}{'|'.repeat(3)}{'█'.repeat(2)}{'|'.repeat(2)}
        </div>
        <div style={{ fontSize: '9px', letterSpacing: '3px', marginTop: '2px' }}>
          {orderId}
        </div>
      </div>

      <Divider style="dashed" />

      {/* ── FOOTER ── */}
      <div style={{ textAlign: 'center', fontSize: '11px', lineHeight: '1.8', marginTop: '6px' }}>
        <div style={{ fontWeight: 'bold', letterSpacing: '2px' }}>★ THANK YOU ★</div>
        <div style={{ fontSize: '10px', color: '#333' }}>Please come again</div>
        <div style={{ fontSize: '9px', color: '#555', marginTop: '4px', letterSpacing: '1px' }}>
          Powered by Ledgr POS
        </div>
      </div>

      {/* ── BOTTOM TEAR ── */}
      <div style={{ textAlign: 'center', fontSize: '10px', letterSpacing: '2px', marginTop: '10px', color: '#555' }}>
        ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼ ▼
      </div>

    </div>
  );
}