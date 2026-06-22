// src/components/inventory/InventoryStatsStrip.tsx
import * as React from 'react';
import { cn } from '@/lib/utils';

interface InventoryStatsStripProps {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export function InventoryStatsStrip({
  totalProducts,
  lowStockCount,
  outOfStockCount,
}: InventoryStatsStripProps) {
  const stats = [
    {
      label: 'Total SKUs',
      value: totalProducts.toString(),
      valueClass: 'text-foreground',
    },
    {
      label: 'Low Stock',
      value: lowStockCount.toString(),
      valueClass: lowStockCount > 0 ? 'text-orange-500' : 'text-muted-foreground',
    },
    {
      label: 'Out of Stock',
      value: outOfStockCount.toString(),
      valueClass: outOfStockCount > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-3 border border-border divide-x divide-border">
      {stats.map(stat => (
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