// Orders.tsx
import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { Loader2, RefreshCw, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/src/lib/supabase';
import { Order } from '@/src/types';
import { formatCurrency } from '@/src/lib/constants';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OrderStatsStrip } from '@/src/components/orders/OrderStatsStrip';
import { OrderFilters } from '@/src/components/orders/OrderFilters';
import { OrderTable } from '@/src/components/orders/OrderTable';
import { RefundDialog } from '@/src/components/orders/RefundDialog';
import { VoidDialog } from '@/src/components/orders/VoidDialog';
import { ReceiptPrint } from '@/src/components/ReceiptPrint';

type OrderWithItems = Order & { order_items: any[]; profiles?: any };

interface OrdersProps {
  userRole?: string;
}

export function Orders({ userRole }: OrdersProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialogs
  const [selectedOrder, setSelectedOrder] = useState<OrderWithItems | null>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false);

  // Receipt reprint
  const [reprintPaymentInfo, setReprintPaymentInfo] = useState<any>(null);
  const [reprintOrderId, setReprintOrderId] = useState<string | null>(null);
  const [shouldPrint, setShouldPrint] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id (full_name),
          order_items (
            *,
            products (*)
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ── Reprint receipt ──
  const handleReprint = (order: OrderWithItems) => {
    setReprintOrderId(order.id);
    setReprintPaymentInfo({
      method: order.payment_method ?? 'unknown',
      change: 0,
      subtotal: Number(order.total_amount),
      tax: 0,
      total: Number(order.total_amount),
      items: order.order_items.map((item: any) => ({
        id: item.product_id,
        name: item.products?.name ?? 'Unknown',
        price: item.unit_price,
        quantity: item.quantity,
        stock_quantity: item.products?.stock_quantity ?? 0,
      })),
      customerName: order.customer_name ?? 'Guest',
    });
    setShouldPrint(true);
  };

  // ── Derived stats ──
  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    const orderDate = new Date(o.created_at);
    const matchesFrom = dateFrom ? orderDate >= new Date(dateFrom) : true;
    const matchesTo = dateTo ? orderDate <= new Date(dateTo + 'T23:59:59') : true;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  const revenue = filteredOrders
    .filter(o => o.status === 'completed')
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const refundedCount = filteredOrders.filter(o => o.status === 'refunded').length;
  const voidedCount = filteredOrders.filter(o => o.status === 'voided').length;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">
              Transactions
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight">Orders</h1>
          </div>
          <button
            type="button"
            onClick={fetchOrders}
            className="h-9 w-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
          </button>
        </div>

        {/* ── STATS ── */}
        <OrderStatsStrip
          totalOrders={filteredOrders.length}
          revenue={revenue}
          refundedCount={refundedCount}
          voidedCount={voidedCount}
        />

        {/* ── FILTERS ── */}
        <OrderFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter as any}
          onStatusFilterChange={setStatusFilter as any}
          dateFrom={dateFrom}
          onDateFromChange={setDateFrom}
          dateTo={dateTo}
          onDateToChange={setDateTo}
        />

        {/* ── TABLE ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Loading…
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
            <ShoppingBag className="h-10 w-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No orders found</p>
          </div>
        ) : (
          <OrderTable
  orders={filteredOrders}
  userRole={userRole}
  onRefund={order => { setSelectedOrder(order); setIsRefundDialogOpen(true); }}
  onVoid={order => { setSelectedOrder(order); setIsVoidDialogOpen(true); }}
  onReprint={handleReprint}
/>
        )}
      </div>

      {/* ── REFUND DIALOG ── */}
      {selectedOrder && (
        <RefundDialog
          order={selectedOrder}
          open={isRefundDialogOpen}
          onOpenChange={open => { setIsRefundDialogOpen(open); if (!open) setSelectedOrder(null); }}
          onSuccess={fetchOrders}
        />
      )}

      {/* ── VOID DIALOG ── */}
      {selectedOrder && (
        <VoidDialog
          order={selectedOrder}
          open={isVoidDialogOpen}
          onOpenChange={open => { setIsVoidDialogOpen(open); if (!open) setSelectedOrder(null); }}
          onSuccess={fetchOrders}
        />
      )}

      {/* ── RECEIPT REPRINT ── */}
      <ReceiptPrint
        lastOrderId={reprintOrderId}
        paymentInfo={reprintPaymentInfo}
        shouldPrint={shouldPrint}
        onPrintDone={() => {
          setShouldPrint(false);
          setReprintPaymentInfo(null);
          setReprintOrderId(null);
        }}
      />
    </ScrollArea>
  );
}