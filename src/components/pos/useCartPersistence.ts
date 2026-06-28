// src/components/pos/useCartPersistence.ts
import { useEffect } from 'react';
import { CartItem } from '@/src/types';

const CART_KEY = 'ledgr_pos_cart';
const DISCOUNT_KEY = 'ledgr_pos_discount';
const NOTE_KEY = 'ledgr_pos_note';
const CUSTOMER_KEY = 'ledgr_pos_customer';

export interface PersistedCart {
  cart: CartItem[];
  discount: number;
  orderNote: string;
  customerName: string;
  customerId: string | null;
}

export function saveCartToSession(data: PersistedCart) {
  try {
    sessionStorage.setItem(CART_KEY, JSON.stringify(data.cart));
    sessionStorage.setItem(DISCOUNT_KEY, String(data.discount));
    sessionStorage.setItem(NOTE_KEY, data.orderNote);
    sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify({
      name: data.customerName,
      id: data.customerId,
    }));
  } catch {
    // sessionStorage unavailable — silent fail, cart just won't persist
  }
}

export function loadCartFromSession(): PersistedCart {
  try {
    const cart = JSON.parse(sessionStorage.getItem(CART_KEY) || '[]');
    const discount = parseFloat(sessionStorage.getItem(DISCOUNT_KEY) || '0') || 0;
    const orderNote = sessionStorage.getItem(NOTE_KEY) || '';
    const customer = JSON.parse(sessionStorage.getItem(CUSTOMER_KEY) || '{}');
    return {
      cart: Array.isArray(cart) ? cart : [],
      discount: Math.min(100, Math.max(0, discount)),
      orderNote,
      customerName: customer.name || '',
      customerId: customer.id || null,
    };
  } catch {
    return { cart: [], discount: 0, orderNote: '', customerName: '', customerId: null };
  }
}

export function clearCartSession() {
  try {
    sessionStorage.removeItem(CART_KEY);
    sessionStorage.removeItem(DISCOUNT_KEY);
    sessionStorage.removeItem(NOTE_KEY);
    sessionStorage.removeItem(CUSTOMER_KEY);
  } catch {
    // silent
  }
}

export function useCartPersistence(data: PersistedCart) {
  useEffect(() => {
    saveCartToSession(data);
  }, [data.cart, data.discount, data.orderNote, data.customerName, data.customerId]);
}
