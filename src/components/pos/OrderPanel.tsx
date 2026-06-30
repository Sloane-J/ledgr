// src/components/pos/OrderPanel.tsx
import * as React from 'react';
import { useRef, useEffect, useState } from 'react';
import {
  ShoppingCart,
  History,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { CartItem as CartItemType } from '@/src/types';
import { formatCurrency, TAX_RATE, CURRENCY_SYMBOL } from '@/src/lib/constants';
import { cn } from '@/lib/utils';
import { CartItem } from './CartItem';
import { OrderTotals } from './OrderTotals';

interface Customer {
  id: string;
  name: string;
  phone?: string;
}

interface OrderPanelProps {
  // Cart
  cart: CartItemType[];
  totalItems: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  tax: number;
  total: number;

  // Customer
  customerName: string;
  selectedCustomerId: string | null;
  customers: Customer[];
  onCustomerChange: (name: string, id: string | null) => void;

  // Order meta
  orderNote: string;
  onOrderNoteChange: (note: string) => void;
  onDiscountChange: (discount: number) => void;

  // Cart actions
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDirectChange: (id: string, value: string) => void;
  onQuantityBlur: (id: string, quantity: number) => void;

  // Panel actions
  heldOrdersCount: number;
  onOpenHeldOrders: () => void;
  onClearCart: () => void;
  onHoldOrder: () => void;
  onPay: () => void;
  isCheckingOut: boolean;
}

export function OrderPanel({
  cart,
  totalItems,
  subtotal,
  discount,
  discountAmount,
  tax,
  total,
  customerName,
  selectedCustomerId,
  customers,
  onCustomerChange,
  orderNote,
  onOrderNoteChange,
  onDiscountChange,
  onRemove,
  onUpdateQuantity,
  onDirectChange,
  onQuantityBlur,
  heldOrdersCount,
  onOpenHeldOrders,
  onClearCart,
  onHoldOrder,
  onPay,
  isCheckingOut,
}: OrderPanelProps) {
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef<HTMLDivElement>(null);
  const payButtonRef = useRef<HTMLButtonElement>(null);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        customerDropdownRef.current &&
        !customerDropdownRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard shortcut: F2 focuses Pay button
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F2' && cart.length > 0) {
        e.preventDefault();
        payButtonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cart.length]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerName.toLowerCase())
  );

  return (
    <div className="w-full lg:w-[360px] flex flex-col h-full border-l border-border bg-card shrink-0">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-primary" aria-hidden="true" />
          <span className="text-sm font-bold uppercase tracking-widest">Order</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenHeldOrders}
            aria-label={`Held orders${heldOrdersCount > 0 ? `, ${heldOrdersCount} active` : ''}`}
            className={cn(
              'flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest',
              'text-muted-foreground hover:text-foreground transition-colors',
              'px-2 h-7 border border-border hover:border-primary/50',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
            )}
          >
            <History className="h-3 w-3" aria-hidden="true" />
            Held {heldOrdersCount > 0 && `(${heldOrdersCount})`}
          </button>
          <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* ── Cart items ── */}
      <ScrollArea className="flex-1 min-h-0">
        {cart.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-48 text-muted-foreground/40 px-6 text-center"
            role="status"
            aria-label="Cart is empty"
          >
            <ShoppingCart className="h-8 w-8 mb-2 opacity-30" aria-hidden="true" />
            <p className="text-xs font-medium">Cart is empty</p>
            <p className="text-[10px] mt-1 opacity-60">Press / to search products</p>
          </div>
        ) : (
          <div role="list" aria-label="Cart items">
            {cart.map((item, idx) => (
              <CartItem
                key={item.id}
                item={item}
                isLast={idx === cart.length - 1}
                onRemove={onRemove}
                onUpdateQuantity={onUpdateQuantity}
                onDirectChange={onDirectChange}
                onQuantityBlur={onQuantityBlur}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* ── Receipt preview (collapsed by default on small panels) ── */}
      <div className="border-t border-border shrink-0">
        <button
          onClick={() => setIsReceiptPreviewOpen(prev => !prev)}
          aria-expanded={isReceiptPreviewOpen}
          aria-controls="receipt-preview"
          className={cn(
            'w-full flex items-center justify-between px-4 py-2.5',
            'hover:bg-muted/50 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset'
          )}
        >
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <FileText className="h-3.5 w-3.5" aria-hidden="true" />
            Receipt Preview
          </div>
          {isReceiptPreviewOpen
            ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          }
        </button>

        {isReceiptPreviewOpen && (
          <div
            id="receipt-preview"
            className="px-4 pb-4 bg-muted/20 border-t border-dashed border-border"
          >
            <div className="font-mono text-[11px] space-y-1 pt-3">
              <div className="text-center text-muted-foreground text-[9px] uppercase tracking-widest pb-1">
                {new Date().toLocaleDateString()} · {customerName || 'Guest'}
              </div>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between">
                  <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                  <span className="tabular-nums">
                    {formatCurrency(Number(item.price) * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="border-t border-dashed border-border my-1" />
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-primary">
                  <span>Disc {discount}%</span>
                  <span className="tabular-nums">−{formatCurrency(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Tax {(TAX_RATE * 100).toFixed(0)}%</span>
                <span className="tabular-nums">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between font-black text-foreground pt-0.5">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Customer + discount + note ── */}
      <div className="border-t border-border px-4 py-3 space-y-2 shrink-0">
        {/* Customer autocomplete */}
        <div className="flex gap-2">
          <div className="flex-1 relative" ref={customerDropdownRef}>
            <Input
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={e => {
                onCustomerChange(e.target.value, null);
                setIsCustomerDropdownOpen(true);
              }}
              onFocus={() => setIsCustomerDropdownOpen(true)}
              onKeyDown={e => {
                if (e.key === 'Escape') setIsCustomerDropdownOpen(false);
              }}
              aria-label="Customer name"
              aria-autocomplete="list"
              aria-expanded={isCustomerDropdownOpen}
              className="h-9 text-xs bg-background border-border"
            />
            {isCustomerDropdownOpen && customerName.length > 0 && (
              <ul
                role="listbox"
                aria-label="Customer suggestions"
                className="absolute bottom-full mb-1 left-0 w-full bg-card border border-border shadow-lg z-50 max-h-40 overflow-y-auto"
              >
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(c => (
                    <li key={c.id} role="option" aria-selected={selectedCustomerId === c.id}>
                      <button
                        className={cn(
                          'w-full text-left px-3 py-2 text-xs font-semibold',
                          'hover:bg-primary hover:text-white transition-colors',
                          'border-b border-border last:border-0',
                          'focus-visible:outline-none focus-visible:bg-primary focus-visible:text-white'
                        )}
                        onClick={() => {
                          onCustomerChange(c.name, c.id);
                          setIsCustomerDropdownOpen(false);
                        }}
                      >
                        {c.name}
                        {c.phone && (
                          <span className="ml-2 opacity-60">({c.phone})</span>
                        )}
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-widest italic">
                    New customer — will be created
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* Discount */}
          <div className="w-20 relative">
            <Input
              type="number"
              placeholder="Disc"
              value={discount || ''}
              onChange={e =>
                onDiscountChange(Math.min(100, Math.max(0, Number(e.target.value))))
              }
              aria-label="Discount percentage"
              min={0}
              max={100}
              className="h-9 text-xs bg-background border-border pr-5"
            />
            <span
              aria-hidden="true"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold"
            >
              %
            </span>
          </div>
        </div>

        {/* Order note */}
        <Input
          placeholder="Order note…"
          value={orderNote}
          onChange={e => onOrderNoteChange(e.target.value)}
          aria-label="Order note"
          maxLength={200}
          className="h-9 text-xs bg-background border-border"
        />
      </div>

      {/* ── Totals ── */}
      <OrderTotals
        subtotal={subtotal}
        discount={discount}
        discountAmount={discountAmount}
        tax={tax}
        total={total}
      />

      {/* ── Action buttons ── */}
      <div
        className="grid grid-cols-3 border-t border-border shrink-0"
        role="group"
        aria-label="Order actions"
      >
        <button
          disabled={cart.length === 0}
          onClick={onClearCart}
          aria-label="Clear cart"
          className={cn(
            'h-14 text-xs font-bold uppercase tracking-widest border-r border-border',
            'text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-inset',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          Clear
        </button>

        <button
          disabled={cart.length === 0}
          onClick={onHoldOrder}
          aria-label="Hold order"
          className={cn(
            'h-14 text-xs font-bold uppercase tracking-widest border-r border-border',
            'text-muted-foreground hover:bg-muted transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          Hold
        </button>

        <button
          ref={payButtonRef}
          disabled={cart.length === 0 || isCheckingOut}
          onClick={onPay}
          aria-label={`Pay ${formatCurrency(total)} — press F2 to focus`}
          className={cn(
            'h-14 text-sm font-black uppercase tracking-widest',
            'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
            'disabled:opacity-30 disabled:cursor-not-allowed',
            'flex items-center justify-center'
          )}
        >
          {isCheckingOut ? (
            <div
              className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-label="Processing"
            />
          ) : (
            <>
              Pay
              <span className="ml-1.5 text-[10px] opacity-60 font-normal hidden sm:inline">
                F2
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
