// src/components/pos/usePOS.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Product, Category, CartItem, HeldOrder } from '@/src/types';
import { TAX_RATE } from '@/src/lib/constants';
import { toast } from 'sonner';
import {
  useCartPersistence,
  loadCartFromSession,
  clearCartSession,
} from './useCartPersistence';

export type PaymentMethod = 'cash' | 'card' | 'momo';
export type MomoNetwork = 'mtn' | 'vodafone' | 'airteltigo';
export type MomoStatus = 'idle' | 'sending' | 'waiting' | 'confirmed' | 'pay_to_account';

export interface PaymentInfo {
  method: PaymentMethod;
  change: number;
  subtotal: number;
  tax: number;
  discount: number;
  discountAmount: number;
  total: number;
  items: CartItem[];
  momoNumber?: string;
  momoNetwork?: MomoNetwork;
  customerName?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
}

// Sanitize user-supplied strings before persisting to DB
function sanitizeText(value: string): string {
  return value.trim().replace(/[<>"'`]/g, '');
}

export function usePOS() {
  // ── Data ──
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Cart — restored from sessionStorage on mount ──
  const persisted = loadCartFromSession();
  const [cart, setCart] = useState<CartItem[]>(persisted.cart);
  const [discount, setDiscount] = useState(persisted.discount);
  const [orderNote, setOrderNote] = useState(persisted.orderNote);
  const [customerName, setCustomerName] = useState(persisted.customerName);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(persisted.customerId);

  // Persist cart to sessionStorage on every change
  useCartPersistence({ cart, discount, orderNote, customerName, customerId: selectedCustomerId });

  // ── Payment ──
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [cashReceived, setCashReceived] = useState('');
  const [momoNetwork, setMomoNetwork] = useState<MomoNetwork>('mtn');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardReference, setCardReference] = useState('');
  const [momoStatus, setMomoStatus] = useState<MomoStatus>('idle');

  // ── UI state ──
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const [isHoldListOpen, setIsHoldListOpen] = useState(false);
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [isReceiptPreviewOpen, setIsReceiptPreviewOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'products' | 'cart'>('products');

  // ── Held orders ──
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [heldOrdersLoading, setHeldOrdersLoading] = useState(false);

  // ── Post-checkout ──
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState<PaymentInfo | null>(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  // ── Search / filter ──
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // ── Refs ──
  const cashInputRef = useRef<HTMLInputElement>(null);
  // Used by useBarcodeScanner to focus search on scan
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ── Checkout dedup ref — prevents double-submit ──
  const checkoutLockRef = useRef(false);

  // ── Initial data fetch ──
  useEffect(() => {
    fetchInitialData();
    fetchHeldOrders();
  }, []);

  // ── Focus cash input when payment opens, reset on close ──
  useEffect(() => {
    if (isPaymentOpen) {
      setTimeout(() => cashInputRef.current?.focus(), 50);
    } else {
      setMomoStatus('idle');
      setCashReceived('');
    }
  }, [isPaymentOpen]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, customersRes] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .gt('stock_quantity', 0)
          .order('name'),
        supabase.from('categories').select('*').order('name'),
        supabase.from('customers').select('id, name, phone').order('name'),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      // Customers failure is non-fatal — POS can work without autocomplete
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
    } catch {
      toast.error('Failed to load held orders');
    } finally {
      setHeldOrdersLoading(false);
    }
  };

  // ── Cart operations ──
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          toast.error(`Only ${product.stock_quantity} in stock`);
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added`, { duration: 800, position: 'bottom-center' });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return { ...item, quantity: 0 };
          if (newQty > item.stock_quantity) {
            toast.error(`Only ${item.stock_quantity} available`);
            return item;
          }
          return { ...item, quantity: newQty };
        })
        .filter(item => item.quantity > 0)
    );
  }, []);

  const setItemQuantityDirect = useCallback((productId: string, value: string) => {
    if (value === '') {
      setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: 0 } : item));
      return;
    }
    const newQty = parseInt(value, 10);
    if (isNaN(newQty)) return;
    setCart(prev =>
      prev.map(item => {
        if (item.id !== productId) return item;
        if (newQty > item.stock_quantity) {
          toast.error(`Only ${item.stock_quantity} available`);
          return { ...item, quantity: item.stock_quantity };
        }
        return { ...item, quantity: Math.max(0, newQty) };
      })
    );
  }, []);

  const handleQuantityBlur = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) removeFromCart(productId);
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
    setDiscount(0);
    setOrderNote('');
    setCustomerName('');
    setSelectedCustomerId(null);
    clearCartSession();
    setCardReference('');
  }, []);

  // ── Numpad ──
  const handleNumpadInput = useCallback((value: string) => {
    if (value === 'backspace') { setCashReceived(prev => prev.slice(0, -1)); return; }
    if (value === 'clear') { setCashReceived(''); return; }
    if (value === '.' && cashReceived.includes('.')) return;
    if (cashReceived.length >= 10) return;
    setCashReceived(prev => prev + value);
  }, [cashReceived]);

  // ── Derived totals ──
  const subtotal = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;
  const cashAmount = parseFloat(cashReceived) || 0;
  const changeDue = Math.max(0, cashAmount - total);
  const isCashEnough = cashAmount >= total;
  const totalItems = cart.reduce((a, b) => a + b.quantity, 0);

  // ── Quick cash amounts ──
  const quickCashAmounts = [
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
  ].filter((v, i, arr) => arr.indexOf(v) === i && v >= total).slice(0, 4);

  // ── MoMo validation ──
  const isValidMomoNumber = (num: string) => /^0[235]\d{8}$/.test(num.replace(/\s/g, ''));

  // ── MoMo simulation — TODO: replace with real API ──
  const handleMomoCheckout = async (type: 'prompt' | 'pay_to_account') => {
  if (type === 'pay_to_account') {
    setMomoStatus('pay_to_account');
    await handleCheckout();
    return;
  }
  // Send prompt simulation — TODO: replace with real STK push API
  setMomoStatus('sending');
  await new Promise(r => setTimeout(r, 1500));
  setMomoStatus('waiting');
  await new Promise(r => setTimeout(r, 3000));
  setMomoStatus('confirmed');
  await new Promise(r => setTimeout(r, 800));
  await handleCheckout();
};

  // ── Resolve or create customer ──
  const resolveCustomer = async (name: string, id: string | null) => {
    const safeName = sanitizeText(name);
    if (id) return { id, name: safeName };
    if (!safeName) return { id: null, name: 'Guest' };

    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .ilike('name', safeName)
      .maybeSingle();

    if (existing) return { id: existing.id, name: safeName };

    const { data: newCust, error } = await supabase
      .from('customers')
      .insert([{ name: safeName }])
      .select('id')
      .single();

    if (error) {
      console.error('Customer create failed:', error.message);
      return { id: null, name: safeName };
    }
    return { id: newCust.id, name: safeName };
  };

  // ── Checkout ──
  const handleCheckout = useCallback(async () => {
    // Hard lock — prevents any double-submit even with concurrent calls
    if (checkoutLockRef.current || cart.length === 0) return;
    checkoutLockRef.current = true;
    setIsCheckingOut(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { id: finalCustomerId, name: finalCustomerName } =
        await resolveCustomer(customerName, selectedCustomerId);

      // 1. Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          customer_id: finalCustomerId,
          customer_name: finalCustomerName,
          total_amount: total,
          discount_amount: discountAmount,
          tax_amount: tax,
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
            unit_price: Number(item.price),
          }))
        );
      if (itemsError) throw itemsError;

      // 3. Atomic stock decrement via RPC
      // Each call is independent — partial failures logged, not thrown,
      // so a receipt is always issued and inventory can be corrected manually
      const stockResults = await Promise.all(
        cart.map(item =>
          supabase.rpc('decrement_stock', {
            p_product_id: item.id,
            p_quantity: item.quantity,
          })
        )
      );
      const stockError = stockResults.find(r => r.error);
      if (stockError?.error) {
        console.error('Stock decrement issue for order:', order.id, stockError.error);
        toast.warning('Order saved but a stock update failed. Check inventory.');
      }

      // 4. Save payment info for receipt
      setLastPaymentInfo({
        method: paymentMethod,
        change: changeDue,
        subtotal,
        tax,
        discount,
        discountAmount,
        total,
        items: [...cart],
        customerName: finalCustomerName,
        momoNumber: paymentMethod === 'momo' ? momoNumber : undefined,
        momoNetwork: paymentMethod === 'momo' ? momoNetwork : undefined,
      });
      setLastOrderId(order.id);
      setIsPaymentOpen(false);
      setIsSuccessOpen(true);
      clearCart();

      // 5. Refresh stock counts for sold products only
      const { data: updatedProducts } = await supabase
        .from('products')
        .select('id, stock_quantity')
        .in('id', cart.map(i => i.id));

      if (updatedProducts) {
        setProducts(prev =>
          prev
            .map(p => {
              const u = updatedProducts.find(up => up.id === p.id);
              return u ? { ...p, stock_quantity: u.stock_quantity } : p;
            })
            .filter(p => p.stock_quantity > 0)
        );
      }
    } catch (error: any) {
      toast.error(error.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(false);
      checkoutLockRef.current = false;
    }
  }, [
    cart, customerName, selectedCustomerId, total, discountAmount, tax,
    discount, paymentMethod, changeDue, subtotal, momoNumber, momoNetwork,
    clearCart,
  ]);

  // ── Hold order ──
  const handleHoldOrder = async () => {
    if (cart.length === 0) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('held_orders').insert([{
        user_id: user.id,
        cart,
        discount,
        order_note: sanitizeText(orderNote) || null,
        customer_name: sanitizeText(customerName) || null,
        customer_id: selectedCustomerId || null,
        total,
      }]);
      if (error) throw error;

      await fetchHeldOrders();
      clearCart();
      setIsHoldDialogOpen(false);
      toast.success('Order placed on hold');
    } catch (error: any) {
      toast.error(error.message || 'Failed to hold order');
    }
  };

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
    } catch {
      toast.error('Failed to resume order');
    }
  };

  const handleDeleteHeldOrder = async (id: string) => {
    try {
      const { error } = await supabase.from('held_orders').delete().eq('id', id);
      if (error) throw error;
      setHeldOrders(prev => prev.filter(o => o.id !== id));
      toast.success('Held order deleted');
    } catch {
      toast.error('Failed to delete held order');
    }
  };

  // ── Filtered products ──
  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase();
    const matchesSearch =
      p.name.toLowerCase().includes(q) ||
      p.sku?.toLowerCase().includes(q);
    const matchesCategory =
      activeCategory === 'all' || p.category_id === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return {
    // Data
    products, categories, customers, loading,
    filteredProducts,

    // Cart
    cart, discount, orderNote, customerName, selectedCustomerId,
    setDiscount, setOrderNote, setCustomerName, setSelectedCustomerId,
    addToCart, removeFromCart, updateQuantity,
    setItemQuantityDirect, handleQuantityBlur, clearCart,

    // Totals
    subtotal, discountAmount, tax, total,
    totalItems, changeDue, isCashEnough,
    quickCashAmounts,

    // Payment
    paymentMethod, setPaymentMethod,
    cashReceived, setCashReceived,
    momoNetwork, setMomoNetwork,
    momoNumber, setMomoNumber,
    cardReference, setCardReference,
    momoStatus,
    isCheckingOut,
    handleNumpadInput,
    handleCheckout,
    handleMomoCheckout,
    isValidMomoNumber,

    // Hold
    heldOrders, heldOrdersLoading,
    handleHoldOrder, handleResumeOrder, handleDeleteHeldOrder,
    fetchHeldOrders,

    // Post-checkout
    lastOrderId, lastPaymentInfo,
    shouldPrint, setShouldPrint,

    // UI toggles
    isPaymentOpen, setIsPaymentOpen,
    isSuccessOpen, setIsSuccessOpen,
    isClearConfirmOpen, setIsClearConfirmOpen,
    isHoldListOpen, setIsHoldListOpen,
    isHoldDialogOpen, setIsHoldDialogOpen,
    isReceiptPreviewOpen, setIsReceiptPreviewOpen,
    mobileView, setMobileView,

    // Search / filter
    search, setSearch,
    activeCategory, setActiveCategory,

    // Refs
    cashInputRef,
    searchInputRef,
  };
}
