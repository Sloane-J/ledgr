// components/orders/OrderRowActions.tsx
import * as React from 'react';
import { ArrowDownLeft, Ban, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/src/types';

interface OrderRowActionsProps {
  order: Order & { order_items: any[] };
  onRefund: (order: Order & { order_items: any[] }) => void;
  onVoid: (order: Order & { order_items: any[] }) => void;
  onReprint: (order: Order & { order_items: any[] }) => void;
}

interface ActionButtonProps {
  onClick: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}

function ActionButton({ onClick, title, className, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onKeyUp={e => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      className={cn(
        'h-7 w-7 border flex items-center justify-center transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}

export function OrderRowActions({ order, onRefund, onVoid, onReprint }: OrderRowActionsProps) {
  const isCompleted = order.status === 'completed';
  const isRefunded = order.status === 'refunded';
  const isVoided = order.status === 'voided';
  const isClosed = isRefunded || isVoided;

  return (
    <div className="flex items-center justify-end gap-1">

      {/* Reprint — available on completed and refunded */}
      {!isVoided && (
        <ActionButton
          title="Reprint receipt"
          onClick={() => onReprint(order)}
          className="border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
        >
          <Printer className="h-3.5 w-3.5" />
        </ActionButton>
      )}

      {/* Refund — only on completed */}
      {isCompleted && (
        <ActionButton
          title="Refund order"
          onClick={() => onRefund(order)}
          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
        >
          <ArrowDownLeft className="h-3.5 w-3.5" />
        </ActionButton>
      )}

      {/* Void — only on completed */}
      {isCompleted && (
        <ActionButton
          title="Void order"
          onClick={() => onVoid(order)}
          className="border-orange-400/30 text-orange-500 hover:bg-orange-500 hover:text-white"
        >
          <Ban className="h-3.5 w-3.5" />
        </ActionButton>
      )}

      {/* Closed badge — refunded or voided orders show no actions */}
      {isClosed && (
        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 px-1">
          {isRefunded ? 'Refunded' : 'Voided'}
        </span>
      )}
    </div>
  );
}