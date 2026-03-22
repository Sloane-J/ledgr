import {
  ArrowDownLeft,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Package,
  RefreshCw,
  Search,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/src/lib/supabase";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`*, profiles:user_id (full_name), order_items (*, products (*))`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Sync error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = async (order: any) => {
    setIsProcessing(true);
    try {
      await supabase.from("orders").update({ status: "refunded" }).eq("id", order.id);
      for (const item of order.order_items) {
        if (item.products) {
          const newStock = item.products.stock_quantity + item.quantity;
          await supabase
            .from("products")
            .update({ stock_quantity: newStock })
            .eq("id", item.product_id);
        }
      }
      toast.success("Refund processed");
      setIsRefundDialogOpen(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error("Refund failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter === "all" || o.status === statusFilter)
  );

  const totalRevenue = filteredOrders
    .filter((o) => o.status === "completed")
    .reduce((acc, o) => acc + Number(o.total_amount), 0);

  const completedCount = filteredOrders.filter((o) => o.status === "completed").length;
  const refundedCount = filteredOrders.filter((o) => o.status === "refunded").length;

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
            onClick={fetchOrders}
            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') fetchOrders(); }}
            className="h-9 w-9 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
          </button>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-3 border border-border divide-x divide-border">
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Orders</p>
            <p className="text-2xl font-black font-mono">{filteredOrders.length}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Revenue</p>
            <p className="text-2xl font-black font-mono text-emerald-500">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Refunded</p>
            <p className="text-2xl font-black font-mono text-destructive">{refundedCount}</p>
          </div>
        </div>

        {/* ── FILTERS ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by ID or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm bg-card border-border"
            />
          </div>
          <div className="flex border border-border">
            {["all", "completed", "refunded"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setStatusFilter(s); }}
                className={cn(
                  "px-4 h-9 text-[10px] font-black uppercase tracking-widest transition-colors border-r border-border last:border-r-0",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* ── TABLE ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading…</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
            <ShoppingBag className="h-10 w-10" />
            <p className="text-xs font-bold uppercase tracking-widest">No orders found</p>
          </div>
        ) : (
          <div className="border border-border divide-y divide-border">

            {/* Table head */}
            <div className="hidden md:grid grid-cols-12 px-4 py-2 bg-muted/50">
              <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</p>
              <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Customer</p>
              <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
              <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Items</p>
              <p className="col-span-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Total</p>
              <p className="col-span-1" />
            </div>

            {filteredOrders.map((order) => {
              const isExpanded = expandedId === order.id;
              const isCompleted = order.status === "completed";

              return (
                <div key={order.id} className="bg-card hover:bg-muted/20 transition-colors">

                  {/* ── ROW ── */}
                  <div className="grid grid-cols-2 md:grid-cols-12 items-center px-4 py-3 gap-2 md:gap-0">

                    {/* Order ID */}
                    <div className="col-span-1 md:col-span-2">
                      <p className="text-xs font-black font-mono uppercase tracking-tight">
                        #{order.id.slice(0, 8)}
                      </p>
                      {/* Mobile-only status */}
                      <div className="md:hidden mt-1">
                        <StatusPill status={order.status} />
                      </div>
                    </div>

                    {/* Customer */}
                    <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 min-w-0">
                      <User className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span className="text-xs font-semibold truncate">
                        {order.customer_name || "Guest"}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 text-muted-foreground">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="text-xs">
                        {new Date(order.created_at).toLocaleDateString(undefined, {
                          month: "short", day: "numeric", year: "numeric"
                        })}
                      </span>
                    </div>

                    {/* Item count */}
                    <div className="col-span-1 md:col-span-2 flex items-center gap-1.5 text-muted-foreground">
                      <Package className="h-3 w-3 shrink-0" />
                      <span className="text-xs">{order.order_items?.length ?? 0} item{order.order_items?.length !== 1 ? "s" : ""}</span>
                    </div>

                    {/* Status — desktop */}
                    <div className="hidden md:block col-span-1">
                      <StatusPill status={order.status} />
                    </div>

                    {/* Total */}
                    <div className="col-span-1 md:col-span-2 text-right md:text-right">
                      <span className="text-sm font-black font-mono">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 md:col-span-1 flex items-center justify-end gap-1">
                      {isCompleted && (
                        <button
                          onClick={() => { setSelectedOrder(order); setIsRefundDialogOpen(true); }}
                          onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { setSelectedOrder(order); setIsRefundDialogOpen(true); } }}
                          className="h-7 w-7 border border-destructive/30 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                          title="Refund"
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                        onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpandedId(isExpanded ? null : order.id); }}
                        className="h-7 w-7 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                        title="Expand"
                      >
                        {isExpanded
                          ? <ChevronUp className="h-3.5 w-3.5" />
                          : <ChevronDown className="h-3.5 w-3.5" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* ── EXPANDED ITEMS ── */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">
                        Order Items
                      </p>
                      <div className="space-y-2">
                        {order.order_items?.map((item: any) => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="h-9 w-9 bg-card border border-border flex items-center justify-center shrink-0">
                                {item.products?.image_url ? (
                                  <img
                                    src={item.products.image_url}
                                    alt=""
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-3.5 w-3.5 text-muted-foreground/30" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold truncate">
                                  {item.products?.name ?? "Unknown product"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  ${Number(item.unit_price).toFixed(2)} × {item.quantity}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-black font-mono shrink-0 ml-4">
                              ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Row subtotal */}
                      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Order Total
                        </span>
                        <span className="text-sm font-black font-mono">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── REFUND DIALOG ── */}
      <Dialog open={isRefundDialogOpen} onOpenChange={(o) => { setIsRefundDialogOpen(o); if (!o) setSelectedOrder(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Confirm Refund</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3 py-2">
              <div className="bg-muted border border-border p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Order</span>
                  <span className="font-black font-mono">#{selectedOrder.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Customer</span>
                  <span className="font-bold">{selectedOrder.customer_name || "Guest"}</span>
                </div>
                <div className="flex justify-between text-xs border-t border-border pt-2 mt-2">
                  <span className="text-muted-foreground font-bold uppercase tracking-widest">Refund Amount</span>
                  <span className="font-black font-mono text-destructive">
                    ${Number(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground text-center">
                Stock will be restored automatically. This cannot be undone.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <button
               type="button"
              onClick={() => { setIsRefundDialogOpen(false); setSelectedOrder(null); }}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') { setIsRefundDialogOpen(false); setSelectedOrder(null); } }}
              className="flex-1 h-10 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => selectedOrder && handleRefund(selectedOrder)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') selectedOrder && handleRefund(selectedOrder); }}
              disabled={isProcessing}
              className="flex-1 h-10 bg-destructive text-white text-xs font-black uppercase tracking-widest hover:bg-destructive/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Process Refund
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}

/* ── STATUS PILL ── */
function StatusPill({ status }: { status: string }) {
  const isCompleted = status === "completed";
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5",
      isCompleted
        ? "bg-emerald-500/10 text-emerald-500"
        : "bg-destructive/10 text-destructive"
    )}>
      {isCompleted
        ? <CheckCircle2 className="h-2.5 w-2.5" />
        : <XCircle className="h-2.5 w-2.5" />
      }
      {status}
    </span>
  );
}