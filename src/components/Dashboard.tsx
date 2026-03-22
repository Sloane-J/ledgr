import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ChevronRight,
  Activity,
  RefreshCw,
  Database,
  ShieldCheck,
  Loader2,
  ArrowDownRight,
} from 'lucide-react';
import {
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { seedProducts, seedSampleOrders } from '@/src/services/seedService';

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    lowStock: 0,
    avgOrderValue: 0,
    revenueGrowth: 12.5,
    orderGrowth: 8.2,
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const seedData = async () => {
    setIsSeeding(true);
    try {
      await seedProducts();
      await seedSampleOrders();
      toast.success('System environment seeded');
      await fetchDashboardData();
    } catch (error: any) {
      toast.error(error.message || 'Seed failure');
    } finally {
      setIsSeeding(false);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, lowStockRes] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase
          .from('orders')
          .select('total_amount, created_at, id, profiles(full_name, email)')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('*').lt('stock_quantity', 10).limit(5),
      ]);

      if (productsRes.error) throw productsRes.error;
      if (ordersRes.error) throw ordersRes.error;

      const productCount = productsRes.count || 0;
      const orders = ordersRes.data || [];
      const lowStockItems = lowStockRes.data || [];
      const revenue = orders.reduce((acc, o) => acc + Number(o.total_amount), 0);
      const orderCount = orders.length;

      setStats({
        totalProducts: productCount,
        totalOrders: orderCount,
        totalRevenue: revenue,
        lowStock: lowStockItems.length,
        avgOrderValue: orderCount > 0 ? revenue / orderCount : 0,
        revenueGrowth: 12.5,
        orderGrowth: 8.2,
      });

      setRecentOrders(orders.slice(0, 6));

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
      }).reverse();

      const dailyData = last7Days.map((date) => {
        const dayOrders = orders.filter((o) => o.created_at.startsWith(date));
        return {
          date: new Date(date).toLocaleDateString(undefined, { weekday: 'short' }),
          revenue: dayOrders.reduce((acc, o) => acc + Number(o.total_amount), 0),
        };
      });

      setChartData(dailyData);
      setLowStockProducts(lowStockItems);

      const { data: topProductsData } = await supabase
        .from('products')
        .select('*')
        .limit(5);

      if (topProductsData) {
        setTopProducts(
          topProductsData.map((p) => ({
            ...p,
            sales: Math.floor(Math.random() * 50) + 10,
          }))
        );
      }
    } catch (error: any) {
      toast.error('Data retrieval error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
          Synchronizing…
        </p>
      </div>
    );
  }

  const hasNoProducts = stats.totalProducts === 0;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">

        {/* ── PAGE HEADER ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">
              Operations
            </p>
            <h1 className="text-2xl font-black uppercase tracking-tight">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') fetchDashboardData(); }}
              className="h-9 w-9 border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {hasNoProducts && (
              <button
                onClick={seedData}
                onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') seedData(); }}
                disabled={isSeeding}
                className="h-9 px-4 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <Database className={cn('h-3.5 w-3.5', isSeeding && 'animate-spin')} />
                Initialize Data
              </button>
            )}
          </div>
        </div>

        {hasNoProducts ? (
          /* ── EMPTY STATE ── */
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-border">
            <Database className="h-10 w-10 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground mb-6">No inventory records detected.</p>
            <button
              onClick={seedData}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') seedData(); }}
              disabled={isSeeding}
              className="h-11 px-8 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              Run Sample Injection
            </button>
          </div>
        ) : (
          <>
            {/* ── METRIC STRIP ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 border border-border divide-x divide-y lg:divide-y-0 divide-border">
              <MetricCard
                label="Revenue"
                value={`$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                sub="Total earned"
                growth={stats.revenueGrowth}
                icon={DollarSign}
              />
              <MetricCard
                label="Orders"
                value={stats.totalOrders.toLocaleString()}
                sub="Transactions"
                growth={stats.orderGrowth}
                icon={ShoppingCart}
              />
              <MetricCard
                label="Avg Ticket"
                value={`$${stats.avgOrderValue.toFixed(2)}`}
                sub="Per order"
                icon={Activity}
              />
              <MetricCard
                label="Low Stock"
                value={stats.lowStock}
                sub="Items critical"
                icon={AlertTriangle}
                alert={stats.lowStock > 0}
              />
            </div>

            {/* ── CHART + ACTIVITY ── */}
            <div className="grid gap-4 lg:grid-cols-7">

              {/* Revenue chart */}
              <div className="lg:col-span-4 border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">Revenue Trend</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">7-day window</p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                {/* Fixed height div — this is the parent ResponsiveContainer reads */}
                <div className="px-4 pt-4 pb-4" style={{ height: 260 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="80%" stopColor="hsl(var(--accent))" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        width={48}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 0,
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#revGrad)"
                        activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent activity */}
              <div className="lg:col-span-3 border border-border bg-card flex flex-col">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">Recent Activity</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Latest entries</p>
                  </div>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 divide-y divide-border">
                  {recentOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-muted-foreground/30 text-xs uppercase tracking-widest">
                      No activity
                    </div>
                  ) : recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-7 w-7 bg-muted border border-border flex items-center justify-center shrink-0">
                          <ShoppingCart className="h-3 w-3 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black font-mono uppercase tracking-tight truncate">
                            #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {order.profiles?.full_name || 'System'} ·{' '}
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-black font-mono shrink-0 ml-2">
                        ${Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-border">
                  <button className="w-full flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                    View Full Log <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── BOTTOM ROW ── */}
            <div className="grid gap-4 md:grid-cols-2">

              {/* Top products */}
              <div className="border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-tight">Top Performance</p>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="divide-y divide-border">
                  {topProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-black text-muted-foreground/40 w-4 shrink-0">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <div className="h-8 w-8 bg-muted border border-border flex items-center justify-center shrink-0">
                          <Package className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold uppercase truncate">{product.name}</p>
                          <p className="text-[10px] text-muted-foreground">{product.sku || '—'}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-xs font-black font-mono">{product.sales}</p>
                        <p className="text-[10px] text-emerald-500 font-bold flex items-center justify-end gap-0.5">
                          <ArrowUpRight className="h-2.5 w-2.5" />12%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Low stock alerts */}
              <div className="border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-tight">Inventory Alerts</p>
                  <AlertTriangle className={cn('h-4 w-4', lowStockProducts.length > 0 ? 'text-orange-500' : 'text-muted-foreground')} />
                </div>
                {lowStockProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/30 gap-2">
                    <ShieldCheck className="h-8 w-8" />
                    <p className="text-[10px] font-black uppercase tracking-widest">All Clear</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {lowStockProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between px-5 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-2 w-2 bg-orange-500 shrink-0 animate-pulse" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold uppercase truncate">{product.name}</p>
                            <p className="text-[10px] text-orange-500 font-bold">
                              {product.stock_quantity} units left
                            </p>
                          </div>
                        </div>
                        <button className="shrink-0 ml-2 h-7 px-3 border border-orange-500/30 text-orange-500 text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-colors">
                          Restock
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}

/* ── METRIC CARD ── */
function MetricCard({
  label,
  value,
  sub,
  growth,
  icon: Icon,
  alert,
}: {
  label: string;
  value: string | number;
  sub?: string;
  growth?: number;
  icon: React.ElementType;
  alert?: boolean;
}) {
  return (
    <div className={cn(
      'bg-card p-5 flex flex-col justify-between h-28',
      alert && 'bg-orange-500/5'
    )}>
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <Icon className={cn('h-3.5 w-3.5', alert ? 'text-orange-500' : 'text-muted-foreground')} />
      </div>
      <div>
        <div className="flex items-end justify-between">
          <span className={cn('text-2xl font-black font-mono tracking-tight leading-none', alert && 'text-orange-500')}>
            {value}
          </span>
          {growth !== undefined && (
            <span className="flex items-center gap-0.5 text-[10px] font-black text-emerald-500 mb-0.5">
              <ArrowUpRight className="h-3 w-3" />{growth}%
            </span>
          )}
        </div>
        {sub && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}