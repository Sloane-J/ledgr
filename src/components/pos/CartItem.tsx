// src/components/pos/CartItem.tsx
import * as React from 'react';
import { Minus, Plus, X } from 'lucide-react';
import { CartItem as CartItemType } from '@/src/types';
import { formatCurrency } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
  isLast: boolean;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onDirectChange: (id: string, value: string) => void;
  onQuantityBlur: (id: string, quantity: number) => void;
}

export function CartItem({
  item,
  isLast,
  onRemove,
  onUpdateQuantity,
  onDirectChange,
  onQuantityBlur,
}: CartItemProps) {
  const lineTotal = Number(item.price) * item.quantity;

  return (
    <div
      className={cn(
        'px-4 py-3 group',
        !isLast && 'border-b border-border'
      )}
      role="listitem"
    >
      {/* Top row — name + remove */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <p className="text-sm font-semibold truncate" title={item.name}>
            {item.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {formatCurrency(Number(item.price))} each
          </p>
        </div>

        <button
        type="button"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name} from cart`}
          className={cn(
            'shrink-0 p-0.5 rounded-sm text-muted-foreground transition-all',
            'hover:text-destructive hover:bg-destructive/10',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive',
            // Always visible on touch, fade on mouse
            'opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
          )}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom row — quantity controls + line total */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center border border-border"
          role="group"
          aria-label={`Quantity for ${item.name}`}
        >
          <button
          type="button"
            onClick={() => onUpdateQuantity(item.id, -1)}
            aria-label={`Decrease quantity of ${item.name}`}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-colors',
              'hover:bg-muted active:bg-muted/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset'
            )}
          >
            <Minus className="h-3 w-3" />
          </button>

          <input
            type="number"
            inputMode="numeric"
            value={item.quantity === 0 ? '' : item.quantity}
            onChange={e => onDirectChange(item.id, e.target.value)}
            onBlur={() => onQuantityBlur(item.id, item.quantity)}
            onFocus={e => e.target.select()}
            aria-label={`Quantity of ${item.name}`}
            min={1}
            max={item.stock_quantity}
            className={cn(
              'w-10 h-8 text-center text-sm font-bold bg-transparent border-x border-border',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset',
              '[appearance:textfield]',
              '[&::-webkit-outer-spin-button]:appearance-none',
              '[&::-webkit-inner-spin-button]:appearance-none'
            )}
          />

          <button
          type="button"
            onClick={() => onUpdateQuantity(item.id, 1)}
            aria-label={`Increase quantity of ${item.name}`}
            disabled={item.quantity >= item.stock_quantity}
            className={cn(
              'w-8 h-8 flex items-center justify-center transition-colors',
              'hover:bg-muted active:bg-muted/80',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
              'disabled:opacity-30 disabled:cursor-not-allowed'
            )}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <span
          className="text-sm font-black tabular-nums"
          aria-label={`Line total: ${formatCurrency(lineTotal)}`}
        >
          {formatCurrency(lineTotal)}
        </span>
      </div>

      {/* Stock warning — only shows when near limit */}
      {item.quantity >= item.stock_quantity && (
        <p
          role="alert"
          className="text-[10px] text-destructive font-semibold mt-1.5"
        >
          Max stock reached
        </p>
      )}
    </div>
  );
}
