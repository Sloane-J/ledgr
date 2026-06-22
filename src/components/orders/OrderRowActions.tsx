// components/orders/OrderRowActions.tsx
import * as React from 'react';
import { ArrowDownLeft, Ban, Printer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/src/types';

interface OrderRowActionsProps {
  order: Order & { order_items: any[] };
  userRole?: string;
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
        'h-11 w-11 border flex items-center justify-center transition-colors',
        className
      )}
    >
      {children}
    </button>
  );
}

export function OrderRowActions({ order, userRole, onRefund, onVoid, onReprint }: OrderRowActionsProps) {
  const isCompleted = order.status === 'completed';
  const isAdmin = userRole === 'admin';
  const isRefunded = order.status === 'refunded';
  const isVoided = order.status === 'voided';
  const isClosed = isRefunded || isVoided;

  return (
    <div className="flex items-center justify-end gap-1.5">

      {/* Reprint — available on completed and refunded */}
      {!isVoided && (
        <ActionButton
          title="Reprint receipt"
          onClick={() => onReprint(order)}
          className="border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
        >
          <Printer className="h-5 w-5" />
        </ActionButton>
      )}

      {/* Refund — only on completed, only for admins */}
      {isCompleted && isAdmin && (
        <ActionButton
          title="Refund order"
          onClick={() => onRefund(order)}
          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-white"
        >
          <ArrowDownLeft className="h-5 w-5" />
        </ActionButton>
      )}

      {/* Void — only on completed, only for admins */}
      {isCompleted && isAdmin && (
        <ActionButton
          title="Void order"
          onClick={() => onVoid(order)}
          className="border-orange-400/30 text-orange-500 hover:bg-orange-500 hover:text-white"
        >
          <Ban className="h-5 w-5" />
        </ActionButton>
      )}

      {/* Closed badge */}
      {isClosed && (
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/50 px-2">
          {isRefunded ? 'Refunded' : 'Voided'}
        </span>
      )}
    </div>
  );
}