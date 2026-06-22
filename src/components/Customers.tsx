import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/src/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter,
  DialogDescription
} from '@/src/components/ui/dialog';
import { Badge } from '@/src/components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Users,
  TrendingUp,
  UserPlus,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  total_spent: number;
  orders_count: number;
  created_at: string;
}

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer?.name) return;

    try {
      if (editingCustomer.id) {
        const { error } = await supabase
          .from('customers')
          .update(editingCustomer)
          .eq('id', editingCustomer.id);
        if (error) throw error;
        toast.success('Record Updated');
      } else {
        const { error } = await supabase
          .from('customers')
          .insert([editingCustomer]);
        if (error) throw error;
        toast.success('Customer Registered');
      }
      setIsDialogOpen(false);
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this customer record?')) return;
    try {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) throw error;
      toast.success('Record Purged');
      fetchCustomers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCustomers = useMemo(() => 
    customers.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    ), [customers, search]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Retrieving Client Records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Client Directory</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Customers</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="rounded-md font-bold uppercase tracking-wider h-10 px-6 gap-2 transition-none focus-visible:ring-0 focus-visible:ring-offset-0"
              onClick={() => setEditingCustomer({})}
            >
              <Plus className="h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-md border-border bg-card max-w-md focus-visible:ring-0">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">
                {editingCustomer?.id ? 'Modify Record' : 'New Client Registration'}
              </DialogTitle>
              <DialogDescription className="text-[10px] uppercase font-bold text-muted-foreground">
                Ensure all contact data is accurate for billing.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                <Input 
                  required
                  value={editingCustomer?.name || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, name: e.target.value})}
                  className="h-10 rounded-md border-border bg-background font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                  <Input 
                    type="email"
                    value={editingCustomer?.email || ''} 
                    onChange={e => setEditingCustomer({...editingCustomer, email: e.target.value})}
                    className="h-10 rounded-md border-border bg-background font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</label>
                  <Input 
                    value={editingCustomer?.phone || ''} 
                    onChange={e => setEditingCustomer({...editingCustomer, phone: e.target.value})}
                    className="h-10 rounded-md border-border bg-background font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Address</label>
                <Input 
                  value={editingCustomer?.address || ''} 
                  onChange={e => setEditingCustomer({...editingCustomer, address: e.target.value})}
                  className="h-10 rounded-md border-border bg-background font-mono text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <DialogFooter className="pt-2">
                <Button type="submit" className="w-full h-11 rounded-md font-bold uppercase tracking-widest transition-none">
                  Save Customer Record
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 bg-border border border-border">
        <div className="bg-card p-5">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Total Database</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono">{customers.length}</span>
            <span className="text-[10px] font-bold text-muted-foreground uppercase">Entries</span>
          </div>
        </div>
        <div className="bg-card p-5">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Active Retention</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-primary">
              {customers.filter(c => c.orders_count > 0).length}
            </span>
            <TrendingUp className="h-3 w-3 text-primary" />
          </div>
        </div>
        <div className="bg-card p-5">
          <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Monthly Growth</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-500">
              {customers.filter(c => {
                const created = new Date(c.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </span>
            <UserPlus className="h-3 w-3 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Database View */}
      <div className="border border-border bg-card">
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="SEARCH BY NAME, CONTACT, OR ID..." 
              className="pl-10 h-10 rounded-md border-border bg-background font-mono text-[11px] uppercase focus-visible:ring-0 focus-visible:ring-offset-0"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Client Identity</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Contact Channels</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Engagement</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider">Gross Value</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.map((customer) => (
              <TableRow key={customer.id} className="border-border hover:bg-muted/30 transition-none group">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {customer.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold uppercase tracking-tight">{customer.name}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <MapPin className="h-2.5 w-2.5" />
                        {customer.address || 'NO ADDRESS FILED'}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    {customer.email && (
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> {customer.email}
                      </span>
                    )}
                    {customer.phone && (
                      <span className="text-[11px] font-mono text-muted-foreground flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> {customer.phone}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-md border-border font-mono text-[10px] bg-muted/50">
                    {customer.orders_count || 0} ORDERS
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm font-bold text-primary">
                    ${(customer.total_spent || 0).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md border border-transparent hover:border-border hover:bg-background transition-none focus-visible:ring-0"
                      onClick={() => {
                        setEditingCustomer(customer);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-md border border-transparent hover:border-destructive/20 hover:text-destructive transition-none focus-visible:ring-0"
                      onClick={() => handleDelete(customer.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-card">
            <User className="h-10 w-10 text-muted-foreground/20 mb-3" />
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">No Records Found</h3>
          </div>
        )}
      </div>
    </div>
  );
}