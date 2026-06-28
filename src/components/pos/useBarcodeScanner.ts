// src/components/pos/useBarcodeScanner.ts
import { useEffect, useRef } from 'react';
import { Product } from '@/src/types';
import { toast } from 'sonner';

const SCAN_TIMEOUT_MS = 50;   // max ms between keystrokes for a scan sequence
const MIN_BARCODE_LEN = 3;    // anything shorter is likely accidental

interface UseBarcodeScanner {
  products: Product[];
  onMatch: (product: Product) => void;
  enabled?: boolean;
}

export function useBarcodeScanner({ products, onMatch, enabled = true }: UseBarcodeScanner) {
  const bufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input, textarea, or select
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // Reset buffer if gap is too large — user typed, not scanned
      if (gap > SCAN_TIMEOUT_MS && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      if (e.key === 'Enter') {
        const scanned = bufferRef.current.trim();
        bufferRef.current = '';

        if (scanned.length < MIN_BARCODE_LEN) return;

        const match = products.find(
          p =>
            p.sku?.toLowerCase() === scanned.toLowerCase() ||
            p.id === scanned
        );

        if (match) {
          onMatch(match);
        } else {
          toast.error(`No product found for barcode: ${scanned}`, {
            duration: 2000,
            position: 'bottom-center',
          });
        }
        return;
      }

      // Accumulate printable characters only
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      // Safety: clear buffer if it gets unreasonably long
      if (bufferRef.current.length > 64) {
        bufferRef.current = '';
      }

      // Auto-clear stale buffer after timeout
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        bufferRef.current = '';
      }, SCAN_TIMEOUT_MS * 4);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [products, onMatch, enabled]);
}
