import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Supplier, SupplierOrder, SupplierOrderItem, Product } from '@/src/types';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  ArrowRight,
  CheckCircle2,
  Edit,
  Loader2,
  Mail,
  MapPin,
  Package,
  Phone,
  Plus,
  RefreshCw,
  ShoppingCart,
  Trash2,
  Truck,
  User,
  XCircle,
  Eye,
  Clock,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type TabView = 'orders' | 'suppliers';

export function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabView>('orders');

  // Dialog states
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [orderDetails, setOrderDetails] = useState<SupplierOrderItem[]>([]);

  // Form states
  const [newSupplier, setNewSupplier] = useState({
    name: '', contact_person: '', email: '', phone: '', address: ''
  });
  const [newOrder, setNewOrder] = useState({
    supplier_id: '',
    items: [] as { product_id: string; quantity: number; unit_cost: number }[]
  });

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [suppliersRes, ordersRes, productsRes] = await Promise.all([
        supabase.from('suppliers').select('*').order('name'),
        supabase.from('supplier_orders').select('*, supplier:suppliers(name)').order('created_at', { ascending: false }),
        supabase.from('products').select('*').order('name'),
      ]);
      if (suppliersRes.error) throw suppliersRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      setSuppliers(suppliersRes.data || []);
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupplier.name) { toast.error('Supplier name is required'); return; }
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('suppliers').insert(newSupplier);
      if (error) throw error;
      toast.success('Supplier added');
      setIsAddSupplierOpen(false);
      setNewSupplier({ name: '', contact_person: '', email: '', phone: '', address: '' });
      fetchData();
    } catch (error: any) {
      toast.error('Failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateOrder = async () => {
    if (!newOrder.supplier_id || newOrder.items.length === 0) {
      toast.error('Select a supplier and add at least one item');
      return;
    }
    setIsProcessing(true);
    try {
      const total_amount = newOrder.items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);
      const { data: order, error: orderError } = await supabase
        .from('supplier_orders')
        .insert({
          supplier_id: newOrder.supplier_id,
          total_amount,
          status: 'pending',
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();
      if (orderError) throw orderError;
      const { error: itemsError } = await supabase
        .from('supplier_order_items')
        .insert(newOrder.items.map(i => ({ supplier_order_id: order.id, ...i })));
      if (itemsError) throw itemsError;
      toast.success('Order created');
      setIsCreateOrderOpen(false);
      setNewOrder({ supplier_id: '', items: [] });
      fetchData();
    } catch (error: any) {
      toast.error('Failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const viewOrderDetails = async (order: SupplierOrder) => {
    setSelectedOrder(order);
    setIsOrderDetailsOpen(true);
    try {
      const { data, error } = await supabase
        .from('supplier_order_items')
        .select('*, product:products(*)')
        .eq('supplier_order_id', order.id);
      if (error) throw error;
      setOrderDetails(data || []);
    } catch (error: any) {
      toast.error('Failed to load details: ' + error.message);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: 'ordered' | 'received' | 'cancelled') => {
    setIsProcessing(true);
    try {
      const { error } = await supabase.from('supplier_orders').update({ status: newStatus }).eq('id', orderId);
      if (error) throw error;
      if (newStatus === 'received') {
        const { data: items, error: ie } = await supabase
          .from('supplier_order_items').select('product_id, quantity').eq('supplier_order_id', orderId);
        if (ie) throw ie;
        for (const item of items) {
          const { data: product } = await supabase.from('products').select('stock_quantity').eq('id', item.product_id).single();
          if (product) {
            await supabase.from('products').update({ stock_quantity: product.stock_quantity + item.quantity }).eq('id', item.product_id);
          }
        }
      }
      toast.success(`Order marked as ${newStatus}`);
      if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus });
      fetchData();
    } catch (error: any) {
      toast.error('Failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Status config
  const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
    pending:   { label: 'Pending',   cls: 'bg-yellow-500/10 text-yellow-500',  icon: Clock },
    ordered:   { label: 'Ordered',   cls: 'bg-blue-500/10 text-blue-500',       icon: ShoppingCart },
    received:  { label: 'Received',  cls: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
    cancelled: { label: 'Cancelled', cls: 'bg-destructive/10 text-destructive',  icon: XCircle },
  };

  const StatusPill = ({ status }: { status: string }) => {
    const cfg = STATUS_CONFIG[status] ?? { label: status, cls: 'bg-muted text-muted-foreground', icon: Package };
    return (
      <span className={cn('inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5', cfg.cls)}>
        <cfg.icon className="h-2.5 w-2.5" />
        {cfg.label}
      </span>
    );
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const totalSpend = orders.filter(o => o.status === 'received').reduce((s, o) => s + Number(o.total_amount), 0);
  const orderTotal = newOrder.items.reduce((s, i) => s + i.quantity * i.unit_cost, 0);

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">Procurement</p>
            <h1 className="text-2xl font-black uppercase tracking-tight">Suppliers</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') fetchData(); }}
              className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button
              onClick={() => setIsAddSupplierOpen(true)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsAddSupplierOpen(true); }}
              className="h-11 px-4 border border-border text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-colors"
            >
              <Plus className="h-4 w-4" />
              Supplier
            </button>
            <button
              onClick={() => setIsCreateOrderOpen(true)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsCreateOrderOpen(true); }}
              className="h-11 px-4 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              New Order
            </button>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-3 border border-border divide-x divide-border">
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Suppliers</p>
            <p className="text-2xl font-black font-mono">{suppliers.length}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Pending</p>
            <p className={cn('text-2xl font-black font-mono', pendingCount > 0 ? 'text-yellow-500' : 'text-muted-foreground')}>{pendingCount}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Spend</p>
            <p className="text-2xl font-black font-mono text-primary">${totalSpend.toFixed(2)}</p>
          </div>
        </div>

        {/* ── TAB BAR ── */}
        <div className="flex border border-border">
          {(['orders', 'suppliers'] as TabView[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setTab(t); }}
              className={cn(
                'flex-1 h-11 text-xs font-black uppercase tracking-widest transition-colors border-r border-border last:border-r-0',
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
              )}
            >
              {t === 'orders' ? 'Purchase Orders' : 'Supplier List'}
            </button>
          ))}
        </div>

        {/* ── ORDERS TAB ── */}
        {tab === 'orders' && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading…</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
              <ShoppingCart className="h-10 w-10" />
              <p className="text-xs font-bold uppercase tracking-widest">No orders yet</p>
            </div>
          ) : (
            <div className="border border-border divide-y divide-border">
              {/* Table head */}
              <div className="hidden md:grid grid-cols-12 px-4 py-2 bg-muted/50">
                <p className="col-span-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Supplier</p>
                <p className="col-span-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</p>
                <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</p>
                <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Amount</p>
                <p className="col-span-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Action</p>
              </div>

              {orders.map(order => (
                <div key={order.id} className="grid grid-cols-2 md:grid-cols-12 items-center px-4 py-3 gap-2 bg-card hover:bg-muted/20 transition-colors">
                  {/* Supplier */}
                  <div className="col-span-1 md:col-span-3 flex items-center gap-2 min-w-0">
                    <div className="h-7 w-7 bg-muted border border-border flex items-center justify-center shrink-0">
                      <Truck className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-xs font-bold truncate">{order.supplier?.name || 'Unknown'}</span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 md:col-span-3 flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span className="text-xs">{new Date(order.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2">
                    <StatusPill status={order.status} />
                  </div>

                  {/* Amount */}
                  <div className="col-span-1 md:col-span-2 text-right">
                    <span className="text-sm font-black font-mono">${Number(order.total_amount).toFixed(2)}</span>
                  </div>

                  {/* View */}
                  <div className="col-span-2 md:col-span-2 flex justify-end">
                    <button
                      onClick={() => viewOrderDetails(order)}
                      onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') viewOrderDetails(order); }}
                      className="h-9 px-3 border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ── SUPPLIERS TAB ── */}
        {tab === 'suppliers' && (
          loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading…</p>
            </div>
          ) : suppliers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border gap-3 text-muted-foreground/40">
              <Truck className="h-10 w-10" />
              <p className="text-xs font-bold uppercase tracking-widest">No suppliers added</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="bg-card border border-border flex flex-col">
                  {/* Card header */}
                  <div className="p-4 border-b border-border flex items-start gap-3">
                    <div className="h-12 w-12 bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black uppercase tracking-tight truncate">{supplier.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Added {new Date(supplier.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-emerald-500/10 text-emerald-500 shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Contact info */}
                  <div className="p-4 space-y-2 flex-1">
                    {supplier.contact_person && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="h-3 w-3 shrink-0" />
                        <span className="truncate">{supplier.contact_person}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.phone && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3 shrink-0" />
                        <span className="truncate">{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{supplier.address}</span>
                      </div>
                    )}
                    {!supplier.contact_person && !supplier.email && !supplier.phone && (
                      <p className="text-[10px] text-muted-foreground/40 italic">No contact info added</p>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
                    <button className="h-11 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-colors">
                      <Edit className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button className="h-11 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── ADD SUPPLIER DIALOG ── */}
      <Dialog open={isAddSupplierOpen} onOpenChange={(o) => { setIsAddSupplierOpen(o); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black uppercase tracking-tight">Add Supplier</DialogTitle>
            <DialogDescription>Enter the supplier's contact details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {[
              { label: 'Supplier Name *', key: 'name', placeholder: 'e.g. Acme Wholesale', type: 'text' },
              { label: 'Contact Person', key: 'contact_person', placeholder: 'e.g. John Smith', type: 'text' },
              { label: 'Email', key: 'email', placeholder: 'john@acme.com', type: 'email' },
              { label: 'Phone', key: 'phone', placeholder: '+1 234 567 890', type: 'text' },
              { label: 'Address', key: 'address', placeholder: '123 Supply St, City', type: 'text' },
            ].map(field => (
              <div key={field.key} className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{field.label}</label>
                <Input
                  type={field.type}
                  placeholder={field.placeholder}
                  className="h-12 border-border bg-background text-sm"
                  value={(newSupplier as any)[field.key]}
                  onChange={e => setNewSupplier({ ...newSupplier, [field.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={() => setIsAddSupplierOpen(false)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsAddSupplierOpen(false); }}
              className="flex-1 h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddSupplier}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAddSupplier(); }}
              disabled={isProcessing || !newSupplier.name}
              className="flex-1 h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save Supplier
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CREATE ORDER DIALOG ── */}
      <Dialog open={isCreateOrderOpen} onOpenChange={setIsCreateOrderOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="px-5 py-4 border-b border-border shrink-0">
            <DialogTitle className="font-black uppercase tracking-tight">New Purchase Order</DialogTitle>
            <DialogDescription>Select a supplier and add items to order.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Supplier select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Supplier *</label>
              <select
                className="w-full h-12 border border-border bg-background px-3 text-sm focus:outline-none focus:border-primary transition-colors"
                value={newOrder.supplier_id}
                onChange={e => setNewOrder({ ...newOrder, supplier_id: e.target.value })}
              >
                <option value="">Choose supplier…</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Items</label>
                <button
                  onClick={() => setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity: 1, unit_cost: 0 }] })}
                  onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setNewOrder({ ...newOrder, items: [...newOrder.items, { product_id: '', quantity: 1, unit_cost: 0 }] }); }}
                  className="h-9 px-3 border border-border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Item
                </button>
              </div>

              {newOrder.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 border border-dashed border-border text-muted-foreground/40 gap-2">
                  <Package className="h-8 w-8" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No items added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {newOrder.items.map((item, idx) => (
                    <div key={idx} className="bg-muted/30 border border-border p-3 space-y-2">
                      {/* Product */}
                      <select
                        className="w-full h-11 border border-border bg-background px-3 text-xs focus:outline-none focus:border-primary transition-colors"
                        value={item.product_id}
                        onChange={e => {
                          const updated = [...newOrder.items];
                          updated[idx].product_id = e.target.value;
                          const p = products.find(pr => pr.id === e.target.value);
                          if (p) updated[idx].unit_cost = Number(p.price) * 0.7;
                          setNewOrder({ ...newOrder, items: updated });
                        }}
                      >
                        <option value="">Select product…</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock_quantity})</option>)}
                      </select>

                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Qty</label>
                          <Input
                            type="number" min="1"
                            className="h-11 text-sm border-border bg-background"
                            value={item.quantity}
                            onChange={e => {
                              const updated = [...newOrder.items];
                              updated[idx].quantity = Number(e.target.value);
                              setNewOrder({ ...newOrder, items: updated });
                            }}
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Unit Cost ($)</label>
                          <Input
                            type="number" step="0.01" min="0"
                            className="h-11 text-sm border-border bg-background"
                            value={item.unit_cost}
                            onChange={e => {
                              const updated = [...newOrder.items];
                              updated[idx].unit_cost = Number(e.target.value);
                              setNewOrder({ ...newOrder, items: updated });
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            onClick={() => setNewOrder({ ...newOrder, items: newOrder.items.filter((_, i) => i !== idx) })}
                            onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setNewOrder({ ...newOrder, items: newOrder.items.filter((_, i) => i !== idx) }); }}
                            className="h-11 w-11 border border-destructive/30 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border bg-muted/20 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Total</span>
              <span className="text-xl font-black font-mono">${orderTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setIsCreateOrderOpen(false)}
                onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsCreateOrderOpen(false); }}
                className="h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCreateOrder(); }}
                disabled={isProcessing || newOrder.items.length === 0 || !newOrder.supplier_id}
                className="h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Create Order
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── ORDER DETAILS DIALOG ── */}
      <Dialog open={isOrderDetailsOpen} onOpenChange={(o) => { setIsOrderDetailsOpen(o); if (!o) setOrderDetails([]); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <DialogTitle className="font-black uppercase tracking-tight">Order Details</DialogTitle>
                <DialogDescription>
                  {selectedOrder?.supplier?.name} · {selectedOrder && new Date(selectedOrder.created_at).toLocaleDateString()}
                </DialogDescription>
              </div>
              {selectedOrder && <StatusPill status={selectedOrder.status} />}
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Items list */}
            <div className="border border-border divide-y divide-border">
              <div className="grid grid-cols-12 px-3 py-2 bg-muted/50">
                <p className="col-span-5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Product</p>
                <p className="col-span-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-center">Qty</p>
                <p className="col-span-2 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Cost</p>
                <p className="col-span-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Sub</p>
              </div>
              {orderDetails.length === 0 ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground/40">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : orderDetails.map(item => (
                <div key={item.id} className="grid grid-cols-12 items-center px-3 py-2.5">
                  <p className="col-span-5 text-xs font-semibold truncate">{item.product?.name}</p>
                  <p className="col-span-2 text-xs font-mono text-center">{item.quantity}</p>
                  <p className="col-span-2 text-xs font-mono text-right">${item.unit_cost.toFixed(2)}</p>
                  <p className="col-span-3 text-xs font-black font-mono text-right">${(item.quantity * item.unit_cost).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Total</span>
              <span className="text-xl font-black font-mono">${selectedOrder?.total_amount.toFixed(2)}</span>
            </div>

            {/* Status actions */}
            {selectedOrder?.status !== 'received' && selectedOrder?.status !== 'cancelled' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => updateOrderStatus(selectedOrder!.id, 'cancelled')}
                  onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') updateOrderStatus(selectedOrder!.id, 'cancelled'); }}
                  disabled={isProcessing}
                  className="h-12 border border-destructive/30 text-destructive text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-destructive hover:text-white disabled:opacity-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel
                </button>
                {selectedOrder?.status === 'pending' ? (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder!.id, 'ordered')}
                    onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') updateOrderStatus(selectedOrder!.id, 'ordered'); }}
                    disabled={isProcessing}
                    className="h-12 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    Mark Ordered
                  </button>
                ) : (
                  <button
                    onClick={() => updateOrderStatus(selectedOrder!.id, 'received')}
                    onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') updateOrderStatus(selectedOrder!.id, 'received'); }}
                    disabled={isProcessing}
                    className="h-12 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Mark Received
                  </button>
                )}
              </div>
            )}

            {selectedOrder?.status === 'received' && (
              <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                <Package className="h-4 w-4 shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest">Inventory updated with these items.</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setIsOrderDetailsOpen(false)}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOrderDetailsOpen(false); }}
              className="w-full h-12 border border-border text-xs font-black uppercase tracking-widest hover:bg-muted transition-colors"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollArea>
  );
}