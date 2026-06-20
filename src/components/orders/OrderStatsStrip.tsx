// components/orders/OrderStatsStrip.tsx
import * as React from 'react';
import { formatCurrency } from '@/src/lib/constants';
import { cn } from '@/lib/utils';

interface OrderStatsStripProps {
  totalOrders: number;
  revenue: number;
  refundedCount: number;
  voidedCount: number;
}

export function OrderStatsStrip({
  totalOrders,
  revenue,
  refundedCount,
  voidedCount,
}: OrderStatsStripProps) {
  const stats = [
    {
      label: 'Total Orders',
      value: totalOrders.toString(),
      valueClass: 'text-foreground',
    },
    {
      label: 'Revenue',
      value: formatCurrency(revenue),
      valueClass: 'text-emerald-500',
    },
    {
      label: 'Refunded',
      value: refundedCount.toString(),
      valueClass: refundedCount > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      label: 'Voided',
      value: voidedCount.toString(),
      valueClass: voidedCount > 0 ? 'text-orange-500' : 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 border border-border divide-x divide-y sm:divide-y-0 divide-border">
      {stats.map((stat) => (
        <div key={stat.label} className="px-5 py-4">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {stat.label}
          </p>
          <p className={cn('text-2xl font-black font-mono', stat.valueClass)}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}