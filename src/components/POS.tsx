import * as React from 'react';
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Product, Category, CartItem, HeldOrder } from '@/src/types';
import { CURRENCY_SYMBOL, TAX_RATE, LOW_STOCK_THRESHOLD, formatCurrency } from '@/src/lib/constants';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  CreditCard,
  Delete,
  FileText,
  History,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Smartphone,
  Trash2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/src/components/ui/dialog';

import { Label } from '@/src/components/ui/label';
import { ReceiptPrint } from './ReceiptPrint';



export function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'momo'>('card');
  const [cashReceived, setCashReceived] = useState('');
  const [momoNetwork, setMomoNetwork] = useState<'mtn' | 'vodafone' | 'airteltigo'>('mtn');
  const [momoNumber, setMomoNumber] = useState('');
  const [momoStatus, setMomoStatus] = useState<'idle' | 'sending' | 'waiting' | 'confirmed'>('idle');
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [isHoldListOpen, setIsHoldListOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [heldOrdersLoading, setHeldOrdersLoading] = useState(false);
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [orderNote, setOrderNote] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [lastPaymentInfo, setLastPaymentInfo] = useState<{
    method: string;
    change: number;
    subtotal: number;
    tax: number;
    total: number;
    items: CartItem[];
    momoNumber?: string;
    momoNetwork?: string;
    customerName?: string;
  } | null>(null);

  const cashInputRef = useRef<HTMLInputElement>(null);
  const customerDropdownRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    fetchInitialData();
    fetchHeldOrders();
  }, []);

  useEffect(() => {
    if (isPaymentOpen) {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    } else {
      setMomoStatus('idle');
      setCashReceived('');
    }
  }, [isPaymentOpen]);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNumpadClick = (value: string) => {
    if (value === 'clear') { setCashReceived(''); return; }
    if (value === '.' && cashReceived.includes('.')) return;
    if (cashReceived.length >= 10) return;
    setCashReceived(prev => prev + value);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        supabase.from('products').select('*, category:categories(*)').gt('stock_quantity', 0),
        supabase.from('categories').select('*').order('name'),
        supabase.from('customers').select('*').order('name'),
      ]);
      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (customersRes.error) throw customersRes.error;
      if (productsRes.data) setProducts(productsRes.data);
      if (categoriesRes.data) setCategories(categoriesRes.data);
      if (customersRes.data) setCustomers(customersRes.data);
    } catch (error: any) {
      toast.error('Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchHeldOrders = async () => {
    setHeldOrdersLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('held_orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setHeldOrders(data || []);
    } catch (error: any) {
      toast.error('Failed to load held orders');
    } finally {
      setHeldOrdersLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity >= product.stock_quantity) {
        toast.error('Not enough stock available');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
      if (window.innerWidth < 1024 && cart.length === 0) setMobileView('cart');
    }
    toast.success(`${product.name} added`, { duration: 900, position: 'bottom-center' });
  };

  const removeFromCart = (productId: string) =>
    setCart(cart.filter(item => item.id !== productId));

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id !== productId) return item;
      const newQty = item.quantity + delta;
      if (newQty <= 0) return item;
      if (newQty > item.stock_quantity) { toast.error('Max stock reached'); return item; }
      return { ...item, quantity: newQty };
    }).filter(item => item.quantity > 0));
  };

  const handleDirectQuantityChange = (productId: string, value: string) => {
    if (value === '') {
      setCart(cart.map(item => item.id === productId ? { ...item, quantity: 0 } : item));
      return;
    }
    const newQty = parseInt(value);
    if (isNaN(newQty)) return;
    setCart(cart.map(item => {
      if (item.id !== productId) return item;
      if (newQty > item.stock_quantity) {
        toast.error(`Only ${item.stock_quantity} available`);
        return { ...item, quantity: item.stock_quantity };
      }
      return { ...item, quantity: Math.max(0, newQty) };
    }));
  };

  const handleQuantityBlur = (productId: string, quantity: number) => {
    if (quantity <= 0) removeFromCart(productId);
  };

  // ── Derived totals ──
  const subtotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;
  const cashAmount = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashAmount - total);
  const isCashEnough = cashAmount >= total;
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  // ── MoMo simulation ──
  // TODO: Replace with real MoMo API integration before production
  const handleMomoCheckout = async () => {
    if (momoNumber.length < 10) { toast.error('Please enter a valid phone number'); return; }
    setMomoStatus('sending');
    await new Promise(r => setTimeout(r, 1500));
    setMomoStatus('waiting');
    await new Promise(r => setTimeout(r, 3000));
    setMomoStatus('confirmed');
    await new Promise(r => setTimeout(r, 1000));
    await handleCheckout();
  };

  // ── Checkout — atomic stock decrement ──
  const handleCheckout = useCallback(async () => {
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Resolve or create customer
      let finalCustomerId = selectedCustomerId;
      let finalCustomerName = customerName.trim();

      if (!finalCustomerId && finalCustomerName) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('name', finalCustomerName)
          .maybeSingle();
        if (existing) {
          finalCustomerId = existing.id;
        } else {
          const { data: newCust, error: custError } = await supabase
            .from('customers')
            .insert([{ name: finalCustomerName }])
            .select()
            .single();
          if (!custError && newCust) finalCustomerId = newCust.id;
        }
      }

      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
  user_id: user.id,
  customer_id: finalCustomerId,
  customer_name: finalCustomerName || 'Guest',
  total_amount: total,
  status: 'completed',
  payment_method: paymentMethod,
  created_at: new Date().toISOString(),
}])
        .select()
        .single();
      if (orderError) throw orderError;

      // 2. Insert order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          cart.map(item => ({
            order_id: order.id,
            product_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
          }))
        );
      if (itemsError) throw itemsError;

      // 3. Batch stock decrement using RPC for atomicity
      // Calls a single DB operation per product to avoid partial failures
      const stockUpdates = cart.map(item =>
        supabase.rpc('decrement_stock', {
          p_product_id: item.id,
          p_quantity: item.quantity,
        })
      );
      const stockResults = await Promise.all(stockUpdates);
      const stockError = stockResults.find(r => r.error);
      if (stockError?.error) {
        // Order was created but stock failed — log for manual review
        console.error('Stock decrement partial failure for order:', order.id, stockError.error);
        toast.warning('Order saved but stock update had an issue. Please check inventory.');
      }

      // 4. Save payment info and show success
      setLastPaymentInfo({
        method: paymentMethod,
        change: changeDue,
        subtotal,
        tax,
        total,
        items: [...cart],
        customerName: finalCustomerName || 'Guest',
        momoNumber: paymentMethod === 'momo' ? momoNumber : undefined,
        momoNetwork: paymentMethod === 'momo' ? momoNetwork : undefined,
      });
      setLastOrderId(order.id);
      setIsPaymentOpen(false);
      setIsSuccessOpen(true);
      resetOrder();

      // Refresh only product stock quantities
      const { data: updatedProducts } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .in('id', cart.map(i => i.id));

      if (updatedProducts) {
        setProducts(prev =>
          prev.map(p => {
            const updated = updatedProducts.find(u => u.id === p.id);
            return updated ? { ...p, stock_quantity: updated.stock_quantity } : p;
          }).filter(p => p.stock_quantity > 0)
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed');
    } finally {
      setIsCheckingOut(false);
    }
  }, [cart, isCheckingOut, selectedCustomerId, customerName, total, paymentMethod, changeDue, subtotal, tax, momoNumber, momoNetwork]);

  const resetOrder = () => {
    setCart([]);
    setDiscount(0);
    setOrderNote('');
    setCustomerName('');
    setSelectedCustomerId(null);
    setCashReceived('');
    setMomoNumber('');
    setMomoStatus('idle');
  };

  const handlePrintReceipt = () => setShouldPrint(true);

  // ── Hold order — save to Supabase ──
  const handleHoldOrder = async () => {
    if (cart.length === 0) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('held_orders').insert([{
        user_id: user.id,
        cart,
        discount,
        order_note: orderNote || null,
        customer_name: customerName || null,
        customer_id: selectedCustomerId || null,
        total,
      }]);
      if (error) throw error;

      await fetchHeldOrders();
      resetOrder();
      setIsHoldDialogOpen(false);
      toast.success('Order placed on hold');
    } catch (error: any) {
      toast.error(error.message || 'Failed to hold order');
    }
  };

  // ── Resume held order ──
  const handleResumeOrder = async (heldOrder: HeldOrder) => {
    try {
      const { error } = await supabase
        .from('held_orders')
        .delete()
        .eq('id', heldOrder.id);
      if (error) throw error;

      setCart(heldOrder.cart);
      setDiscount(heldOrder.discount || 0);
      setOrderNote(heldOrder.order_note || '');
      setCustomerName(heldOrder.customer_name || '');
      setSelectedCustomerId(heldOrder.customer_id || null);
      setHeldOrders(prev => prev.filter(o => o.id !== heldOrder.id));
      setIsHoldListOpen(false);
      toast.success('Order resumed');
    } catch (error: any) {
      toast.error('Failed to resume order');
    }
  };

  // ── Delete held order ──
  const handleDeleteHeldOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('held_orders').delete().eq('id', id);
      if (error) throw error;
      setHeldOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Held order deleted');
    } catch (error: any) {
      toast.error('Failed to delete held order');
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden bg-background">

      {/* ════════════════════════════════════════
          PAYMENT OVERLAY
      ════════════════════════════════════════ */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col lg:flex-row overflow-hidden">
          <input
            ref={cashInputRef}
            type="text"
            inputMode="decimal"
            className="sr-only"
            value={cashReceived}
            onChange={() => {}}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { setIsPaymentOpen(false); }
              else if (e.key === 'Backspace') { setCashReceived(prev => prev.slice(0, -1)); }
              else if (e.key === 'Enter') {
                if (paymentMethod === 'cash' && isCashEnough && !isCheckingOut) handleCheckout();
                if (paymentMethod === 'card' && !isCheckingOut) handleCheckout();
              } else if (/^[0-9]$/.test(e.key)) { handleNumpadClick(e.key); }
              else if (e.key === '.' && !cashReceived.includes('.')) { handleNumpadClick('.'); }
            }}
          />

          {/* LEFT — numpad */}
          <div className="w-full lg:w-[45%] flex flex-col border-r border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Amount Due</p>
                <p className="text-3xl font-black tabular-nums text-primary">{formatCurrency(total)}</p>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 py-6 space-y-6">
              <div className="bg-muted/40 border border-border p-6 text-center">
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Cash Received</p>
                <p className="text-6xl font-black tabular-nums tracking-tight">
                  <span className="text-muted-foreground/30">{CURRENCY_SYMBOL}</span>
                  {cashReceived || '0.00'}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','0','.','clear'].map(btn => (
                  <button
                    key={btn}
                    onClick={() => {
                      handleNumpadClick(btn);
                      cashInputRef.current?.focus();
                    }}
                    className={cn(
                      'h-16 text-xl font-bold border transition-all active:scale-95 select-none',
                      btn === 'clear'
                        ? 'border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive hover:text-white'
                        : 'border-border bg-card hover:bg-primary/5 hover:border-primary hover:text-primary'
                    )}
                  >
                    {btn === 'clear' ? <Delete className="h-5 w-5 mx-auto" /> : btn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — method + action */}
          <div className="flex-1 flex flex-col overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'card', icon: CreditCard, label: 'Card' },
                  { id: 'cash', icon: Banknote, label: 'Cash' },
                  { id: 'momo', icon: Smartphone, label: 'MoMo' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setPaymentMethod(m.id as any); cashInputRef.current?.focus(); }}
                    className={cn(
                      'flex flex-col items-center justify-center gap-2 h-24 border-2 font-bold text-xs uppercase tracking-widest transition-all',
                      paymentMethod === m.id
                        ? 'border-primary bg-primary text-primary-foreground scale-[1.02]'
                        : 'border-border bg-card text-muted-foreground hover:border-primary/40'
                    )}
                  >
                    <m.icon className="h-6 w-6" />
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 px-6 py-6">
              {/* ── CASH ── */}
              {paymentMethod === 'cash' && (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-border p-5 bg-card">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Change Due</p>
                      <p className={cn('text-4xl font-black tabular-nums', changeDue > 0 ? 'text-primary' : 'text-muted-foreground/30')}>
                        {formatCurrency(changeDue)}
                      </p>
                    </div>
                    <div className="border border-border p-5 bg-card">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Status</p>
                      {isCashEnough
                        ? <div className="flex items-center gap-2 text-primary font-bold text-sm"><CheckCircle2 className="h-5 w-5" />Ready</div>
                        : <div className="flex items-center gap-2 text-orange-500 font-bold text-sm"><div className="h-2.5 w-2.5 bg-orange-500 animate-pulse" />Insufficient</div>
                      }
                    </div>
                  </div>
                  <button
                    disabled={!isCashEnough || isCheckingOut}
                    onClick={handleCheckout}
                    className="mt-auto w-full h-16 bg-primary text-primary-foreground font-black text-base uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {isCheckingOut
                      ? <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                      : 'Complete Transaction'
                    }
                  </button>
                </div>
              )}

              {/* ── CARD ── */}
              {paymentMethod === 'card' && (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 py-8">
                  <div className="w-28 h-28 border-2 border-primary/30 bg-primary/5 flex items-center justify-center text-primary">
                    <CreditCard className="h-14 w-14 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-xl font-black uppercase tracking-tight mb-1">Waiting for Terminal</p>
                    <p className="text-sm text-muted-foreground max-w-xs">Ask the customer to insert, swipe, or tap their card.</p>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className="border-2 border-primary/30 px-10 h-12 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isCheckingOut
                      ? <><div className="h-3.5 w-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />Processing…</>
                      : 'Simulate Success'
                    }
                  </button>
                </div>
              )}

              {/* ── MOMO ── */}
              {paymentMethod === 'momo' && (
                <div className="space-y-4">
                  <div className="border border-border p-5 bg-card space-y-4">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Network</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'mtn', name: 'MTN', cls: 'bg-[#FFCC00] text-black border-[#FFCC00]' },
                        { id: 'vodafone', name: 'Telecel', cls: 'bg-[#E60000] text-white border-[#E60000]' },
                        { id: 'airteltigo', name: 'AirtelTigo', cls: 'bg-[#0055A4] text-white border-[#0055A4]' },
                      ].map(net => (
                        <button
                          key={net.id}
                          onClick={() => setMomoNetwork(net.id as any)}
                          className={cn(
                            'h-12 text-[10px] font-black uppercase tracking-widest border-2 transition-all',
                            momoNetwork === net.id
                              ? net.cls
                              : 'border-border bg-background hover:border-primary/40 text-muted-foreground'
                          )}
                        >
                          {net.name}
                        </button>
                      ))}
                    </div>
                    <div>
                      <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Phone Number</Label>
                      <Input
                        placeholder="024 XXX XXXX"
                        value={momoNumber}
                        onChange={e => setMomoNumber(e.target.value)}
                        className="mt-1.5 h-12 text-center text-xl font-black font-mono tracking-widest border-border focus:border-primary"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleMomoCheckout}
                    disabled={momoStatus !== 'idle' || isCheckingOut}
                    className="w-full h-16 bg-primary text-primary-foreground font-black text-sm uppercase tracking-widest disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    {momoStatus === 'idle' && !isCheckingOut && 'Send Payment Prompt'}
                    {(momoStatus === 'sending' || momoStatus === 'waiting') && (
                      <><div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Processing…</>
                    )}
                    {momoStatus === 'confirmed' && 'Confirmed — Saving…'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          MOBILE TAB BAR
      ════════════════════════════════════════ */}
      <div className="lg:hidden flex border-b border-border bg-card sticky top-0 z-10">
        {(['products', 'cart'] as const).map(v => (
          <button
            key={v}
            onClick={() => setMobileView(v)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors relative',
              mobileView === v ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'
            )}
          >
            {v === 'products' ? <Package className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
            {v === 'products' ? 'Products' : 'Cart'}
            {v === 'cart' && totalItems > 0 && (
              <span className="absolute top-2 right-6 bg-primary text-primary-foreground text-[9px] font-black w-4 h-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════
          LEFT — PRODUCT GRID
      ════════════════════════════════════════ */}
      <div className={cn('flex-1 flex flex-col min-w-0 overflow-hidden', mobileView === 'cart' ? 'hidden lg:flex' : 'flex')}>
        <div className="flex flex-col sm:flex-row gap-3 px-4 py-3 border-b border-border bg-card/50 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or SKU…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 bg-background border-border"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {[{ id: 'all', name: 'All' }, ...categories.map(c => ({ id: c.id, name: c.name }))].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'px-3 h-10 text-xs font-bold uppercase tracking-widest border transition-all whitespace-nowrap',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-[3/4] bg-muted animate-pulse" />
                ))
              : filteredProducts.length === 0
              ? (
                <div className="col-span-full flex flex-col items-center justify-center py-24 text-muted-foreground">
                  <Package className="h-10 w-10 opacity-20 mb-2" />
                  <p className="text-sm">No products found</p>
                </div>
              )
              : filteredProducts.map(product => {
                  const inCart = cart.find(i => i.id === product.id);
                  const isLowStock = product.stock_quantity < LOW_STOCK_THRESHOLD;
                  return (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className={cn(
                        'group relative flex flex-col text-left border bg-card transition-all duration-150 hover:border-primary hover:shadow-[0_0_0_1px_hsl(var(--primary))] active:scale-[0.98] overflow-hidden',
                        inCart ? 'border-primary/50' : 'border-border'
                      )}
                    >
                      <div className="aspect-[4/3] bg-muted relative overflow-hidden w-full">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" referrerPolicy="no-referrer" />
                          : <div className="w-full h-full flex items-center justify-center text-muted-foreground/20"><Package className="h-8 w-8" /></div>
                        }
                        <span className={cn(
                          'absolute top-1.5 right-1.5 text-[9px] font-black px-1.5 py-0.5',
                          isLowStock ? 'bg-destructive text-white' : 'bg-background/90 text-muted-foreground'
                        )}>
                          {isLowStock ? `LOW ${product.stock_quantity}` : product.stock_quantity}
                        </span>
                        {inCart && (
                          <span className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5">
                            ×{inCart.quantity}
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-sm font-semibold leading-tight line-clamp-2">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{product.sku || '—'}</p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-black text-primary">{formatCurrency(Number(product.price))}</span>
                          <span className="w-6 h-6 bg-muted group-hover:bg-primary group-hover:text-white flex items-center justify-center transition-colors">
                            <Plus className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
            }
          </div>
        </ScrollArea>
      </div>

      {/* ════════════════════════════════════════
          RIGHT — ORDER PANEL
      ════════════════════════════════════════ */}
      <div className={cn(
        'w-full lg:w-[360px] flex flex-col h-full border-l border-border bg-card',
        mobileView === 'products' ? 'hidden lg:flex' : 'flex'
      )}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-primary" />
            <span className="text-sm font-bold uppercase tracking-widest">Order</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { fetchHeldOrders(); setIsHoldListOpen(true); }}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2 h-7 border border-border hover:border-primary/50"
            >
              <History className="h-3 w-3" />
              Held {heldOrders.length > 0 && `(${heldOrders.length})`}
            </button>
            <span className="text-[10px] font-black text-muted-foreground bg-muted px-2 py-0.5">{totalItems} items</span>
          </div>
        </div>

        <ScrollArea className="flex-1 min-h-0">
          {cart.length === 0
            ? (
              <div className="flex flex-col items-center justify-center h-48 text-muted-foreground/40 px-6 text-center">
                <ShoppingCart className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs font-medium">Cart is empty</p>
              </div>
            )
            : cart.map((item, idx) => (
              <div key={item.id} className={cn('px-4 py-3 group', idx < cart.length - 1 && 'border-b border-border')}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-semibold truncate">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(Number(item.price))} each</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center border border-border">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      value={item.quantity === 0 ? '' : item.quantity}
                      onChange={e => handleDirectQuantityChange(item.id, e.target.value)}
                      onBlur={() => handleQuantityBlur(item.id, item.quantity)}
                      className="w-10 h-8 text-center text-sm font-bold bg-transparent border-x border-border focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center hover:bg-muted transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-black">{formatCurrency(Number(item.price) * item.quantity)}</span>
                </div>
              </div>
            ))
          }
        </ScrollArea>

        {/* Receipt preview */}
        <div className="border-t border-border shrink-0">
          <button
            onClick={() => setIsReceiptPreviewOpen(!isReceiptPreviewOpen)}
            className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Receipt Preview
            </div>
            {isReceiptPreviewOpen
              ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              : <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            }
          </button>
          {isReceiptPreviewOpen && (
            <div className="px-4 pb-4 bg-muted/20 border-t border-dashed border-border">
              <div className="font-mono text-[11px] space-y-1 pt-3">
                <div className="text-center text-muted-foreground text-[9px] uppercase tracking-widest pb-1">
                  {new Date().toLocaleDateString()} · {customerName || 'Guest'}
                </div>
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="truncate pr-2">{item.name} ×{item.quantity}</span>
                    <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-border my-1" />
                <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                {discount > 0 && <div className="flex justify-between text-primary"><span>Disc {discount}%</span><span>-{formatCurrency(discountAmount)}</span></div>}
                <div className="flex justify-between text-muted-foreground"><span>Tax {TAX_RATE * 100}%</span><span>{formatCurrency(tax)}</span></div>
                <div className="flex justify-between font-black text-foreground pt-0.5"><span>Total</span><span>{formatCurrency(total)}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Checkout form */}
        <div className="border-t border-border px-4 py-3 space-y-2 shrink-0">
          <div className="flex gap-2">
            <div className="flex-1 relative" ref={customerDropdownRef}>
              <Input
                placeholder="Customer name"
                value={customerName}
                onChange={e => { setCustomerName(e.target.value); setSelectedCustomerId(null); setIsCustomerDropdownOpen(true); }}
                onFocus={() => setIsCustomerDropdownOpen(true)}
                className="h-9 text-xs bg-background border-border"
              />
              {isCustomerDropdownOpen && customerName.length > 0 && (
                <div className="absolute bottom-full mb-1 left-0 w-full bg-card border border-border shadow-lg z-50 max-h-40 overflow-y-auto">
                  {customers
                    .filter(c => c.name.toLowerCase().includes(customerName.toLowerCase()))
                    .map(c => (
                      <button
                        key={c.id}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-primary hover:text-white transition-colors border-b border-border last:border-0"
                        onClick={() => { setCustomerName(c.name); setSelectedCustomerId(c.id); setIsCustomerDropdownOpen(false); }}
                      >
                        {c.name}
                        {c.phone && <span className="ml-2 opacity-60">({c.phone})</span>}
                      </button>
                    ))
                  }
                  {customers.filter(c => c.name.toLowerCase().includes(customerName.toLowerCase())).length === 0 && (
                    <div className="px-3 py-2 text-[10px] text-muted-foreground uppercase tracking-widest italic">New customer</div>
                  )}
                </div>
              )}
            </div>
            <div className="w-20 relative">
              <Input
                type="number"
                placeholder="Disc %"
                value={discount || ''}
                onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="h-9 text-xs bg-background border-border pr-5"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-bold">%</span>
            </div>
          </div>
          <Input
            placeholder="Order note…"
            value={orderNote}
            onChange={e => setOrderNote(e.target.value)}
            className="h-9 text-xs bg-background border-border"
          />
        </div>

        {/* Totals */}
        <div className="px-4 pb-3 space-y-1 text-sm shrink-0">
          <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-primary font-medium"><span>Discount ({discount}%)</span><span>-{formatCurrency(discountAmount)}</span></div>}
          <div className="flex justify-between text-muted-foreground"><span>Tax ({TAX_RATE * 100}%)</span><span>{formatCurrency(tax)}</span></div>
          <div className="flex justify-between text-base font-black text-foreground pt-1 border-t border-border">
            <span>Total</span><span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-3 border-t border-border shrink-0">
          <button
            disabled={cart.length === 0}
            onClick={() => setIsClearConfirmOpen(true)}
            className="h-14 text-xs font-bold uppercase tracking-widest border-r border-border text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors disabled:opacity-30"
          >
            Clear
          </button>
          <button
            disabled={cart.length === 0}
            onClick={() => setIsHoldDialogOpen(true)}
            className="h-14 text-xs font-bold uppercase tracking-widest border-r border-border text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30"
          >
            Hold
          </button>
          <button
            disabled={cart.length === 0 || isCheckingOut}
            onClick={() => setIsPaymentOpen(true)}
            className="h-14 text-sm font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-30 flex items-center justify-center"
          >
            Pay
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════
          CLEAR CART CONFIRMATION
      ════════════════════════════════════════ */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsClearConfirmOpen(false)} />
          <div className="relative bg-card border border-border w-[90vw] max-w-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <p className="font-black text-base uppercase tracking-tight">Clear Cart?</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This will remove all {totalItems} item{totalItems !== 1 ? 's' : ''} from the cart. This cannot be undone.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setIsClearConfirmOpen(false)}
                className="flex-1 h-10 border border-border text-sm font-bold uppercase tracking-widest hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setCart([]); setIsClearConfirmOpen(false); }}
                className="flex-1 h-10 bg-destructive text-white text-sm font-bold uppercase tracking-widest hover:bg-destructive/90 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════
          SUCCESS DIALOG
      ════════════════════════════════════════ */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="w-[90vw] sm:max-w-sm text-center py-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center text-primary">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-xl font-black">Payment Complete</DialogTitle>
              <DialogDescription>Order #{lastOrderId?.slice(-6).toUpperCase()}</DialogDescription>
            </DialogHeader>
            {lastPaymentInfo?.method === 'cash' && (
              <div className="w-full bg-muted border border-border p-5">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Change</p>
                <p className="text-4xl font-black text-primary">{formatCurrency(lastPaymentInfo.change)}</p>
              </div>
            )}
            <div className="w-full space-y-2 pt-2">
              <Button variant="outline" className="w-full h-10 font-bold" onClick={handlePrintReceipt}>
                Print Receipt
              </Button>
              <Button className="w-full h-10 font-bold" onClick={() => setIsSuccessOpen(false)}>
                New Order
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── RECEIPT PRINT COMPONENT ── */}
      <ReceiptPrint
        lastOrderId={lastOrderId}
        paymentInfo={lastPaymentInfo}
        shouldPrint={shouldPrint}
        onPrintDone={() => setShouldPrint(false)}
      />

      {/* ════════════════════════════════════════
          HOLD ORDER DIALOG
      ════════════════════════════════════════ */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent className="w-[90vw] sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black">Hold Order</DialogTitle>
            <DialogDescription>Add a note to identify this order later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-3">
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Customer / Label</Label>
              <Input
                placeholder="e.g. Table 5, John"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="mt-1 border-border"
              />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Note</Label>
              <Input
                placeholder="e.g. Extra spicy"
                value={orderNote}
                onChange={e => setOrderNote(e.target.value)}
                className="mt-1 border-border"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsHoldDialogOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleHoldOrder}>Hold Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════════
          HELD ORDERS LIST
      ════════════════════════════════════════ */}
      <Dialog open={isHoldListOpen} onOpenChange={setIsHoldListOpen}>
        <DialogContent className="w-[90vw] sm:max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-border">
            <DialogTitle className="flex items-center gap-2 font-black">
              <History className="h-4 w-4 text-primary" />Held Orders
            </DialogTitle>
            <DialogDescription>Select an order to resume or remove it.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="flex-1 p-4">
            {heldOrdersLoading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            ) : heldOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40">
                <History className="h-10 w-10 mb-2" />
                <p className="text-xs">No held orders</p>
              </div>
            ) : (
              [...heldOrders]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .map(order => (
                  <div key={order.id} className="border border-border bg-card p-4 mb-2 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{order.customer_name || 'Unnamed'}</span>
                        <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                        <Clock className="h-3 w-3" />{new Date(order.created_at).toLocaleString()}
                      </div>
                      {order.order_note && (
                        <p className="text-xs italic text-muted-foreground bg-muted px-2 py-1 border border-border mb-1">
                          "{order.order_note}"
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground/60 truncate">
                        {order.cart.map((i: CartItem) => i.name).join(', ')}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <Button size="sm" className="h-8 text-xs font-bold" onClick={() => handleResumeOrder(order)}>
                        Resume
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteHeldOrder(order.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </ScrollArea>
          <div className="px-5 py-3 border-t border-border">
            <Button variant="outline" className="w-full font-bold" onClick={() => setIsHoldListOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}