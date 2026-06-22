import * as React from 'react';
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Order } from '@/src/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Badge } from '@/src/components/ui/badge';
import { format } from 'date-fns';
import { ShoppingBag, Search } from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { toast } from 'sonner';

import { ScrollArea } from '@/src/components/ui/scroll-area';

export function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Fetch orders first
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        toast.error('Failed to load transactions');
        return;
      }

      if (ordersData && ordersData.length > 0) {
        // Fetch profiles for these orders to get emails
        const userIds = [...new Set(ordersData.map(o => o.user_id))];
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const profilesMap = (profilesData || []).reduce((acc: any, p) => {
          acc[p.id] = p;
          return acc;
        }, {});

        const ordersWithProfiles = ordersData.map(o => ({
          ...o,
          profiles: profilesMap[o.user_id] || null
        }));

        setOrders(ordersWithProfiles);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Unexpected error fetching orders:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const searchLower = search.toLowerCase();
    const orderIdMatches = o.id.toLowerCase().includes(searchLower);
    const emailMatches = o.profiles?.email?.toLowerCase().includes(searchLower) ?? false;
    return orderIdMatches || emailMatches;
  });

  return (
    <ScrollArea className="h-full pr-4">
      <div className="space-y-6 pb-6">
        <h2 className="text-3xl font-bold tracking-tight">Transactions</h2>
      
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID or User..."
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-sm border border-border bg-card shadow-none">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">Loading transactions...</TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">No transactions found</TableCell>
              </TableRow>
            ) : filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-mono text-xs">{order.id}</TableCell>
                <TableCell>{format(new Date(order.created_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>{order.profiles?.email || 'System'}</TableCell>
                <TableCell className="font-bold">${Number(order.total_amount).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={order.status === 'completed' ? 'secondary' : 'outline'}>
                    {order.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </ScrollArea>
);
}
