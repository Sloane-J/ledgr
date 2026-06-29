// src/components/pos/HeldOrdersDrawer.tsx
import * as React from 'react';
import { Clock, History, Trash2 } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { ScrollArea } from '@/src/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/src/components/ui/dialog';
import { HeldOrder, CartItem } from '@/src/types';
import { formatCurrency } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface HeldOrdersDrawerProps {
  open: boolean;
  heldOrders: HeldOrder[];
  loading: boolean;
  onClose: () => void;
  onResume: (order: HeldOrder) => void;
  onDelete: (id: string) => void;
}

export function HeldOrdersDrawer({
  open,
  heldOrders,
  loading,
  onClose,
  onResume,
  onDelete,
}: HeldOrdersDrawerProps) {
  const sorted = [...heldOrders].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] sm:max-w-lg max-h-[80vh] flex flex-col p-0 overflow-hidden">

        {/* Header */}
        <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2 font-black">
            <History className="h-4 w-4 text-primary" aria-hidden="true" />
            Held Orders
          </DialogTitle>
          <DialogDescription>
            Select an order to resume it, or delete it to remove it permanently.
          </DialogDescription>
        </DialogHeader>

        {/* List */}
        <ScrollArea className="flex-1 p-4">
          {loading ? (
            <div
              className="flex items-center justify-center py-12 text-muted-foreground"
              role="status"
              aria-label="Loading held orders"
            >
              <div
                className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
                aria-hidden="true"
              />
            </div>
          ) : sorted.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12 text-muted-foreground/40"
              role="status"
            >
              <History className="h-10 w-10 mb-2" aria-hidden="true" />
              <p className="text-xs font-medium">No held orders</p>
            </div>
          ) : (
            <ul role="list" aria-label="Held orders" className="space-y-2">
              {sorted.map(order => (
                <li
                  key={order.id}
                  className="border border-border bg-card p-4 flex items-start justify-between gap-3"
                >
                  <div className="flex-1 min-w-0">
                    {/* Name + total */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm">
                        {order.customer_name || 'Unnamed'}
                      </span>
                      <span className="text-[10px] font-black text-primary bg-primary/10 px-1.5 py-0.5">
                        {formatCurrency(order.total)}
                      </span>
                      <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5">
                        {order.cart.length} item{order.cart.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      <time dateTime={order.created_at}>
                        {new Date(order.created_at).toLocaleString()}
                      </time>
                    </div>

                    {/* Note */}
                    {order.order_note && (
                      <p className="text-xs italic text-muted-foreground bg-muted px-2 py-1 border border-border mb-1">
                        "{order.order_note}"
                      </p>
                    )}

                    {/* Item names */}
                    <p className="text-[10px] text-muted-foreground/60 truncate">
                      {order.cart.map((i: CartItem) => i.name).join(', ')}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      size="sm"
                      className={cn(
                        'h-8 text-xs font-bold',
                        'focus-visible:ring-2 focus-visible:ring-primary'
                      )}
                      onClick={() => onResume(order)}
                      aria-label={`Resume order for ${order.customer_name || 'Unnamed'}`}
                    >
                      Resume
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className={cn(
                        'h-8 text-destructive hover:bg-destructive/10',
                        'focus-visible:ring-2 focus-visible:ring-destructive'
                      )}
                      onClick={() => onDelete(order.id)}
                      aria-label={`Delete held order for ${order.customer_name || 'Unnamed'}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border shrink-0">
          <Button
            variant="outline"
            className="w-full font-bold"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
