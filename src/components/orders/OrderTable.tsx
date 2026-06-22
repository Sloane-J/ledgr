// components/orders/OrderTable.tsx
import * as React from 'react';
import { Calendar, ChevronDown, ChevronUp, Package, User, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Order } from '@/src/types';
import { formatCurrency } from '@/src/lib/constants';
import { OrderRowActions } from './OrderRowActions';


type OrderWithItems = Order & { order_items: any[]; profiles?: any };

interface OrderTableProps {
  orders: OrderWithItems[];
  userRole?: string;
  onRefund: (order: OrderWithItems) => void;
  onVoid: (order: OrderWithItems) => void;
  onReprint: (order: OrderWithItems) => void;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: 'bg-emerald-500/10 text-emerald-500',
    refunded:  'bg-destructive/10 text-destructive',
    voided:    'bg-orange-500/10 text-orange-500',
    pending:   'bg-yellow-500/10 text-yellow-500',
    cancelled: 'bg-muted text-muted-foreground',
  };

  return (
    <span className={cn(
      'inline-flex items-center text-xs font-black uppercase tracking-widest px-3 py-1.5',
      styles[status] ?? 'bg-muted text-muted-foreground'
    )}>
      {status}
    </span>
  );
}

export function OrderTable({ orders, userRole, onRefund, onVoid, onReprint }: OrderTableProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  return (
    <div className="border border-border divide-y divide-border">

      {/* ── TABLE HEAD ── */}
      <div className="hidden md:grid grid-cols-12 px-6 py-4 bg-muted/50">
        {[
          { label: 'Order ID', span: 2 },
          { label: 'Customer', span: 2 },
          { label: 'Date',     span: 2 },
          { label: 'Items',    span: 1 },
          { label: 'Method',   span: 2 },
          { label: 'Status',   span: 1 },
          { label: 'Total',    span: 1 },
          { label: '',         span: 1 },
        ].map((col, i) => (
          <p
            key={i}
            className={cn(
              'text-sm font-black uppercase tracking-widest text-muted-foreground',
              `col-span-${col.span}`,
              col.label === 'Total' && 'text-right'
            )}
          >
            {col.label}
          </p>
        ))}
      </div>

      {/* ── ROWS ── */}
      {orders.map(order => {
        const isExpanded = expandedId === order.id;

        return (
          <div key={order.id} className="bg-card hover:bg-muted/20 transition-colors">

            {/* Row */}
            <div className="grid grid-cols-2 md:grid-cols-12 items-center px-6 py-6 gap-4 md:gap-0">

              {/* Order ID */}
              <div className="col-span-1 md:col-span-2">
                <p className="text-base font-black font-mono uppercase tracking-tight">
                  #{order.id.slice(-6).toUpperCase()}
                </p>
                <div className="md:hidden mt-2">
                  <StatusPill status={order.status} />
                </div>
              </div>

              {/* Customer */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-2.5 min-w-0">
                <User className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-semibold truncate">
                  {order.customer_name || 'Guest'}
                </span>
              </div>

              {/* Date */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="h-5 w-5 shrink-0" />
                <span className="text-sm">
                  {new Date(order.created_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
              </div>

              {/* Item count */}
              <div className="col-span-1 md:col-span-1 flex items-center gap-2.5 text-muted-foreground">
                <Package className="h-5 w-5 shrink-0" />
                <span className="text-sm font-bold">
                  {order.order_items?.length ?? 0}
                </span>
              </div>

              {/* Payment method */}
              <div className="col-span-1 md:col-span-2 flex items-center gap-2.5">
                <CreditCard className="h-5 w-5 text-muted-foreground shrink-0" />
                <span className="text-sm font-black uppercase tracking-widest text-muted-foreground bg-muted px-2.5 py-1.5">
                  {order.payment_method
                    ? order.payment_method.toUpperCase()
                    : '—'
                  }
                </span>
              </div>

              {/* Status — desktop */}
              <div className="hidden md:block col-span-1">
                <StatusPill status={order.status} />
              </div>

              {/* Total */}
              <div className="col-span-1 text-right">
                <span className="text-base font-black font-mono">
                  {formatCurrency(Number(order.total_amount))}
                </span>
              </div>

              {/* Actions + expand */}
              <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-2">
                <OrderRowActions
                  order={order}
                  userRole={userRole}
                  onRefund={onRefund}
                  onVoid={onVoid}
                  onReprint={onReprint}
                />
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                >
                  {isExpanded
                    ? <ChevronUp className="h-5 w-5" />
                    : <ChevronDown className="h-5 w-5" />
                  }
                </button>
              </div>
            </div>

            {/* ── EXPANDED ── */}
            {isExpanded && (
              <div className="border-t border-border bg-muted/20 px-6 py-6 space-y-6">

                {/* Items */}
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                    Items
                  </p>
                  <div className="space-y-4">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="h-16 w-16 bg-card border border-border flex items-center justify-center shrink-0">
                            {item.products?.image_url ? (
                              <img
                                src={item.products.image_url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-muted-foreground/30" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">
                              {item.products?.name ?? 'Unknown product'}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(Number(item.unit_price))} × {item.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="text-base font-black font-mono shrink-0">
                          {formatCurrency(Number(item.unit_price) * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order meta */}
                <div className="border-t border-border pt-5 grid grid-cols-2 sm:grid-cols-4 gap-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">Cashier</p>
                    <p className="text-sm font-semibold">{order.profiles?.full_name ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1.5">Payment</p>
                    <p className="text-sm font-semibold uppercase">
                      {order.payment_method ?? '—'}
                    </p>
                  </div>
                  {order.void_reason && (
                    <div className="col-span-2">
                      <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-1.5">Void Reason</p>
                      <p className="text-sm font-semibold">{order.void_reason}</p>
                    </div>
                  )}
                  {order.refund_amount && (
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-destructive mb-1.5">Refunded</p>
                      <p className="text-sm font-semibold">{formatCurrency(Number(order.refund_amount))}</p>
                    </div>
                  )}
                </div>

                {/* Order total */}
                <div className="border-t border-border pt-5 flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                    Order Total
                  </span>
                  <span className="text-lg font-black font-mono">
                    {formatCurrency(Number(order.total_amount))}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}