import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  ReceiptText,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  format,
  subDays,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns';
import { toast } from 'sonner';

const CHART_COLORS = [
  'hsl(var(--primary))',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#06b6d4',
];

type Preset = '7d' | '30d' | '90d' | 'custom';

export function Reports() {
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allOrderItems, setAllOrderItems] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    avgOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    refundedCount: 0,
    refundedAmount: 0,
  });

  const [preset, setPreset] = useState<Preset>('7d');
  const today = format(new Date(), 'yyyy-MM-dd');
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 6), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(today);

  // Apply preset → update fromDate / toDate
  const applyPreset = (p: Preset) => {
    setPreset(p);
    if (p === 'custom') return;
    const days = p === '7d' ? 6 : p === '30d' ? 29 : 89;
    setFromDate(format(subDays(new Date(), days), 'yyyy-MM-dd'));
    setToDate(today);
  };

  useEffect(() => {
    fetchReportData();
  }, [fromDate, toDate]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const start = startOfDay(parseISO(fromDate));
      const end = endOfDay(parseISO(toDate));

      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (ordersError) throw ordersError;

      const completedOrders = (orders || []).filter(o => o.status !== 'refunded');
      const refundedOrders = (orders || []).filter(o => o.status === 'refunded');
      setAllOrders(orders || []);

      const orderIds = completedOrders.map(o => o.id);
      let orderItems: any[] = [];

      if (orderIds.length > 0) {
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('*, product:products(*, category:categories(*))')
          .in('order_id', orderIds);
        if (itemsError) throw itemsError;
        orderItems = items || [];
      }
      setAllOrderItems(orderItems);

      // Sales trend
      const interval = eachDayOfInterval({ start, end });
      const trend = interval.map(day => {
        const dayOrders = completedOrders.filter(o => isSameDay(new Date(o.created_at), day));
        return {
          date: format(day, interval.length > 30 ? 'MMM dd' : 'dd MMM'),
          revenue: dayOrders.reduce((s, o) => s + Number(o.total_amount), 0),
          orders: dayOrders.length,
        };
      });
      setSalesData(trend);

      // Category breakdown
      const cats: Record<string, number> = {};
      orderItems.forEach(item => {
        const name = item.product?.category?.name || 'Uncategorized';
        cats[name] = (cats[name] || 0) + Number(item.unit_price) * item.quantity;
      });
      setCategoryData(Object.entries(cats).map(([name, value]) => ({ name, value })));

      // Top products
      const prods: Record<string, { name: string; sales: number; revenue: number }> = {};
      orderItems.forEach(item => {
        const pid = item.product_id;
        if (!prods[pid]) prods[pid] = { name: item.product?.name || 'Unknown', sales: 0, revenue: 0 };
        prods[pid].sales += item.quantity;
        prods[pid].revenue += Number(item.unit_price) * item.quantity;
      });
      setTopProducts(Object.values(prods).sort((a, b) => b.revenue - a.revenue).slice(0, 8));

      // Stats
      const totalRevenue = completedOrders.reduce((s, o) => s + Number(o.total_amount), 0);
      const totalOrders = completedOrders.length;
      const refundedAmount = refundedOrders.reduce((s, o) => s + Number(o.total_amount), 0);

      // Previous period growth
      const rangeDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const prevStart = startOfDay(subDays(start, rangeDays));
      const prevEnd = endOfDay(subDays(start, 1));
      const { data: prevOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .gte('created_at', prevStart.toISOString())
        .lte('created_at', prevEnd.toISOString())
        .neq('status', 'refunded');

      const prevRevenue = prevOrders?.reduce((s, o) => s + Number(o.total_amount), 0) || 0;
      const prevCount = prevOrders?.length || 0;

      setStats({
        totalRevenue,
        totalOrders,
        avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        revenueGrowth: prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue) * 100 : 0,
        orderGrowth: prevCount > 0 ? ((totalOrders - prevCount) / prevCount) * 100 : 0,
        refundedCount: refundedOrders.length,
        refundedAmount,
      });
    } catch (error: any) {
      toast.error('Failed to load report data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── CSV EXPORT ──────────────────────────────────────────
  const exportCSV = async () => {
    setExporting('csv');
    try {
      const sections: string[] = [];

      // Summary
      sections.push('REPORT SUMMARY');
      sections.push(`Period,${fromDate} to ${toDate}`);
      sections.push(`Total Revenue,$${stats.totalRevenue.toFixed(2)}`);
      sections.push(`Total Orders,${stats.totalOrders}`);
      sections.push(`Avg Order Value,$${stats.avgOrderValue.toFixed(2)}`);
      sections.push(`Refunds,${stats.refundedCount} ($${stats.refundedAmount.toFixed(2)})`);
      sections.push('');

      // Daily sales
      sections.push('DAILY SALES');
      sections.push('Date,Revenue,Orders');
      salesData.forEach(row => sections.push(`${row.date},$${row.revenue.toFixed(2)},${row.orders}`));
      sections.push('');

      // Top products
      sections.push('TOP PRODUCTS');
      sections.push('Product,Units Sold,Revenue');
      topProducts.forEach(p => sections.push(`"${p.name}",${p.sales},$${p.revenue.toFixed(2)}`));
      sections.push('');

      // Category breakdown
      sections.push('CATEGORY BREAKDOWN');
      sections.push('Category,Revenue');
      categoryData.forEach(c => sections.push(`"${c.name}",$${c.value.toFixed(2)}`));
      sections.push('');

      // All orders
      sections.push('ALL ORDERS');
      sections.push('Order ID,Date,Customer,Status,Total');
      allOrders.forEach(o =>
        sections.push(`${o.id.slice(0, 8)},${format(new Date(o.created_at), 'yyyy-MM-dd HH:mm')},"${o.customer_name || 'Guest'}",${o.status},$${Number(o.total_amount).toFixed(2)}`)
      );

      const csv = sections.join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${fromDate}_to_${toDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch {
      toast.error('CSV export failed');
    } finally {
      setExporting(null);
    }
  };

  // ── PDF EXPORT ──────────────────────────────────────────
  const exportPDF = async () => {
    setExporting('pdf');
    try {
      const printWindow = window.open('', '_blank', 'width=900,height=700');
      if (!printWindow) { toast.error('Allow popups to export PDF'); setExporting(null); return; }

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Sales Report ${fromDate} – ${toDate}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; font-size: 11px; color: #111; background: #fff; padding: 32px; }
    h1 { font-size: 22px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; border-bottom: 3px solid #111; padding-bottom: 8px; margin-bottom: 4px; }
    .meta { font-size: 10px; color: #555; margin-bottom: 28px; }
    .section { margin-bottom: 28px; }
    .section-title { font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 12px; color: #444; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 28px; }
    .stat-box { border: 2px solid #111; padding: 14px; }
    .stat-label { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 900; letter-spacing: -0.02em; }
    .stat-sub { font-size: 9px; color: #666; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #111; color: #fff; padding: 6px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; }
    td { padding: 6px 10px; border-bottom: 1px solid #e5e5e5; font-size: 10px; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .bar-label { width: 160px; font-size: 10px; font-weight: 700; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .bar-track { flex: 1; height: 10px; background: #e5e5e5; }
    .bar-fill { height: 100%; background: #111; }
    .bar-value { width: 70px; text-align: right; font-size: 10px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media print { body { padding: 16px; } }
  </style>
</head>
<body>
  <h1>Sales Report</h1>
  <p class="meta">Period: ${fromDate} &mdash; ${toDate} &nbsp;&bull;&nbsp; Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm')}</p>

  <div class="stats-grid">
    <div class="stat-box">
      <div class="stat-label">Total Revenue</div>
      <div class="stat-value">$${stats.totalRevenue.toFixed(2)}</div>
      <div class="stat-sub">${stats.revenueGrowth >= 0 ? '▲' : '▼'} ${Math.abs(stats.revenueGrowth).toFixed(1)}% vs prev period</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Orders</div>
      <div class="stat-value">${stats.totalOrders}</div>
      <div class="stat-sub">${stats.orderGrowth >= 0 ? '▲' : '▼'} ${Math.abs(stats.orderGrowth).toFixed(1)}% vs prev period</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Avg Ticket</div>
      <div class="stat-value">$${stats.avgOrderValue.toFixed(2)}</div>
      <div class="stat-sub">per transaction</div>
    </div>
    <div class="stat-box">
      <div class="stat-label">Refunds</div>
      <div class="stat-value">${stats.refundedCount}</div>
      <div class="stat-sub">$${stats.refundedAmount.toFixed(2)} returned</div>
    </div>
  </div>

  <div class="two-col">
    <div class="section">
      <div class="section-title">Top Products by Revenue</div>
      ${topProducts.map((p, i) => `
        <div class="bar-row">
          <div class="bar-label">${i + 1}. ${p.name}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${topProducts[0] ? (p.revenue / topProducts[0].revenue) * 100 : 0}%"></div></div>
          <div class="bar-value">$${p.revenue.toFixed(2)}</div>
        </div>
      `).join('')}
      ${topProducts.length === 0 ? '<p style="color:#999;font-size:10px">No data</p>' : ''}
    </div>

    <div class="section">
      <div class="section-title">Revenue by Category</div>
      ${categoryData.map((c, i) => `
        <div class="bar-row">
          <div class="bar-label">${c.name}</div>
          <div class="bar-track"><div class="bar-fill" style="width:${categoryData[0] ? (c.value / categoryData[0].value) * 100 : 0}%"></div></div>
          <div class="bar-value">$${c.value.toFixed(2)}</div>
        </div>
      `).join('')}
      ${categoryData.length === 0 ? '<p style="color:#999;font-size:10px">No data</p>' : ''}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Daily Sales Breakdown</div>
    <table>
      <thead><tr><th>Date</th><th>Orders</th><th>Revenue</th></tr></thead>
      <tbody>
        ${salesData.map(row => `
          <tr>
            <td>${row.date}</td>
            <td>${row.orders}</td>
            <td>$${row.revenue.toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Order Log (${allOrders.length} orders)</div>
    <table>
      <thead><tr><th>Order ID</th><th>Date</th><th>Customer</th><th>Status</th><th>Total</th></tr></thead>
      <tbody>
        ${allOrders.slice(0, 100).map(o => `
          <tr>
            <td>#${o.id.slice(0, 8).toUpperCase()}</td>
            <td>${format(new Date(o.created_at), 'yyyy-MM-dd HH:mm')}</td>
            <td>${o.customer_name || 'Guest'}</td>
            <td>${o.status}</td>
            <td>$${Number(o.total_amount).toFixed(2)}</td>
          </tr>
        `).join('')}
        ${allOrders.length > 100 ? `<tr><td colspan="5" style="text-align:center;color:#999">+ ${allOrders.length - 100} more orders — export CSV for full list</td></tr>` : ''}
      </tbody>
    </table>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

      printWindow.document.write(html);
      printWindow.document.close();
      toast.success('PDF ready — use Save as PDF in the print dialog');
    } catch {
      toast.error('PDF export failed');
    } finally {
      setExporting(null);
    }
  };

  const GrowthBadge = ({ value }: { value: number }) => (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5',
      value >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
    )}>
      {value >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-5">

        {/* ── HEADER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">Analytics</p>
            <h1 className="text-2xl font-black uppercase tracking-tight">Reports</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchReportData}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') fetchReportData(); }}
              className="h-11 w-11 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button
              onClick={exportCSV}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') exportCSV(); }}
              disabled={exporting !== null || loading}
              className="h-11 px-4 border border-border text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-muted transition-colors disabled:opacity-40"
            >
              {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              CSV
            </button>
            <button
              onClick={exportPDF}
              onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') exportPDF(); }}
              disabled={exporting !== null || loading}
              className="h-11 px-4 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              PDF
            </button>
          </div>
        </div>

        {/* ── DATE RANGE CONTROLS ── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Preset pills */}
          <div className="flex border border-border">
            {(['7d', '30d', '90d', 'custom'] as Preset[]).map(p => (
              <button
                key={p}
                onClick={() => applyPreset(p)}
                onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') applyPreset(p); }}
                className={cn(
                  'h-10 px-4 text-[10px] font-black uppercase tracking-widest border-r border-border last:border-r-0 transition-colors',
                  preset === p ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'
                )}
              >
                {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : 'Custom'}
              </button>
            ))}
          </div>

          {/* Date inputs */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border border-border bg-card px-3 h-10">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={fromDate}
                max={toDate}
                onChange={e => { setFromDate(e.target.value); setPreset('custom'); }}
                className="bg-transparent text-xs font-bold focus:outline-none text-foreground w-32"
              />
            </div>
            <span className="text-muted-foreground text-xs font-bold">to</span>
            <div className="flex items-center gap-2 border border-border bg-card px-3 h-10">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={toDate}
                min={fromDate}
                max={today}
                onChange={e => { setToDate(e.target.value); setPreset('custom'); }}
                className="bg-transparent text-xs font-bold focus:outline-none text-foreground w-32"
              />
            </div>
          </div>
        </div>

        {/* ── STAT STRIP ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-border divide-x divide-y lg:divide-y-0 divide-border">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Revenue</p>
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-black font-mono">${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <div className="mt-1"><GrowthBadge value={stats.revenueGrowth} /></div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Orders</p>
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-black font-mono">{stats.totalOrders}</p>
            <div className="mt-1"><GrowthBadge value={stats.orderGrowth} /></div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Avg Ticket</p>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-black font-mono">${stats.avgOrderValue.toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground mt-1">per transaction</p>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Refunds</p>
              <ReceiptText className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className={cn('text-2xl font-black font-mono', stats.refundedCount > 0 ? 'text-destructive' : 'text-muted-foreground')}>
              {stats.refundedCount}
            </p>
            <p className="text-[10px] text-muted-foreground mt-1">${stats.refundedAmount.toFixed(2)} returned</p>
          </div>
        </div>

        {/* ── CHARTS ROW ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Loading data…</p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-7 gap-4">
              {/* Revenue trend */}
              <div className="lg:col-span-4 border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">Revenue Trend</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">
                      {fromDate} → {toDate}
                    </p>
                  </div>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div style={{ height: 260 }} className="px-4 pt-4 pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={48} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0, fontSize: 11, fontWeight: 700 }}
                        cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1 }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#revGrad)" activeDot={{ r: 4, strokeWidth: 0, fill: 'hsl(var(--primary))' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order volume */}
              <div className="lg:col-span-3 border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black uppercase tracking-tight">Order Volume</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">Daily transactions</p>
                  </div>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </div>
                <div style={{ height: 260 }} className="px-4 pt-4 pb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))', fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} width={32} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0, fontSize: 11, fontWeight: 700 }}
                        cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                      />
                      <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* ── BOTTOM ROW ── */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Top products */}
              <div className="border border-border bg-card">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <p className="text-sm font-black uppercase tracking-tight">Top Products</p>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
                {topProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 gap-2">
                    <Package className="h-8 w-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No sales in range</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {topProducts.map((product, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors">
                        <span className="text-[10px] font-black text-muted-foreground/40 w-5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1 bg-muted">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${topProducts[0] ? (product.revenue / topProducts[0].revenue) * 100 : 0}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground shrink-0">{product.sales} units</span>
                          </div>
                        </div>
                        <span className="text-sm font-black font-mono shrink-0">${product.revenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Category pie + legend */}
              <div className="border border-border bg-card">
                <div className="px-5 py-4 border-b border-border">
                  <p className="text-sm font-black uppercase tracking-tight">Revenue by Category</p>
                </div>
                {categoryData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 gap-2">
                    <Package className="h-8 w-8" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No data in range</p>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row items-center gap-4 p-4">
                    <div style={{ height: 200, width: 200, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={4} dataKey="value">
                            {categoryData.map((_, idx) => (
                              <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={0} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 0, fontSize: 11, fontWeight: 700 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      {categoryData.map((cat, i) => (
                        <div key={cat.name} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="h-2.5 w-2.5 shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-xs font-bold truncate">{cat.name}</span>
                          </div>
                          <span className="text-xs font-black font-mono shrink-0">${cat.value.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── ORDER LOG TABLE ── */}
            <div className="border border-border bg-card">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-tight">Order Log</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{allOrders.length} orders in selected range</p>
                </div>
                <ReceiptText className="h-4 w-4 text-muted-foreground" />
              </div>

              {allOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 gap-2">
                  <ShoppingCart className="h-8 w-8" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">No orders in this range</p>
                </div>
              ) : (
                <>
                  {/* Table head */}
                  <div className="hidden md:grid grid-cols-12 px-4 py-2 bg-muted/50">
                    {['Order ID', 'Date & Time', 'Customer', 'Items', 'Status', 'Total'].map((h, i) => (
                      <p key={h} className={cn(
                        'text-[10px] font-black uppercase tracking-widest text-muted-foreground',
                        i === 0 ? 'col-span-2' : i === 1 ? 'col-span-3' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-1' : i === 4 ? 'col-span-2' : 'col-span-2 text-right'
                      )}>
                        {h}
                      </p>
                    ))}
                  </div>
                  <div className="divide-y divide-border max-h-80 overflow-y-auto">
                    {allOrders.map(order => (
                      <div key={order.id} className="grid grid-cols-2 md:grid-cols-12 items-center px-4 py-2.5 hover:bg-muted/20 transition-colors">
                        <p className="col-span-1 md:col-span-2 text-xs font-black font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="col-span-1 md:col-span-3 text-xs text-muted-foreground">
                          {format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                        <p className="col-span-1 md:col-span-2 text-xs font-semibold truncate">{order.customer_name || 'Guest'}</p>
                        <p className="col-span-1 md:col-span-1 text-xs text-muted-foreground">
                          {allOrderItems.filter(i => i.order_id === order.id).length}
                        </p>
                        <div className="col-span-1 md:col-span-2">
                          <span className={cn(
                            'text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5',
                            order.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'
                          )}>
                            {order.status}
                          </span>
                        </div>
                        <p className="col-span-2 md:col-span-2 text-xs font-black font-mono text-right">
                          ${Number(order.total_amount).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </ScrollArea>
  );
}