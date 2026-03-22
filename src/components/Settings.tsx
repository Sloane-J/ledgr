import * as React from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Save, 
  Trash2, 
  Database, 
  Shield, 
  Bell, 
  Download, 
  RefreshCw, 
  Lock,
  Server,
  ShieldCheck,
  Package,
  ShoppingCart
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/src/lib/supabase';

export function Settings() {
  const [storeInfo, setStoreInfo] = useState({
    name: 'StockMaster POS',
    address: '123 Business Ave, Suite 100',
    phone: '+233 24 000 0000',
    email: 'contact@stockmaster.com',
    website: 'www.stockmaster.com',
    taxRate: '8',
    currency: 'USD'
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('store_settings', JSON.stringify(storeInfo));
    toast.success('Settings saved successfully');
  };

  useEffect(() => {
    const saved = localStorage.getItem('store_settings');
    if (saved) {
      setStoreInfo(JSON.parse(saved));
    }
  }, []);

  const exportToCSV = async (table: 'products' | 'orders') => {
    setIsExporting(true);
    try {
      let exportData: any[] = [];
      
      if (table === 'products') {
        const { data: products, error } = await supabase
          .from('products')
          .select('*, category:categories(name)');
        
        if (error) throw error;
        
        exportData = (products || []).map(p => ({
          'Product ID': p.id,
          'Name': p.name,
          'SKU': p.sku || '',
          'Price': p.price,
          'Stock': p.stock_quantity,
          'Category': (p as any).category?.name || 'Uncategorized',
          'Created At': new Date(p.created_at).toLocaleString()
        }));
      } else {
        // For sales, we export order items to include product names and staff info
        const { data: items, error } = await supabase
          .from('order_items')
          .select(`
            *,
            product:products(name),
            order:orders(
              created_at,
              profiles(full_name, email)
            )
          `);
        
        if (error) throw error;
        
        exportData = (items || []).map(item => ({
          'Order ID': item.order_id,
          'Date': item.order ? new Date((item as any).order.created_at).toLocaleString() : 'N/A',
          'Product Name': (item as any).product?.name || 'Unknown Product',
          'Quantity': item.quantity,
          'Unit Price': item.unit_price,
          'Total': (item.quantity * item.unit_price).toFixed(2),
          'Served By (Name)': (item as any).order?.profiles?.full_name || 'System',
          'Served By (Email)': (item as any).order?.profiles?.email || 'N/A'
        }));
      }

      if (exportData.length === 0) {
        toast.error(`No ${table} data found to export.`);
        return;
      }

      const headers = Object.keys(exportData[0]).join(',');
      const rows = exportData.map(obj => 
        Object.values(obj).map(val => 
          typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
        ).join(',')
      );
      const csvContent = [headers, ...rows].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${table}_backup_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`${table.charAt(0).toUpperCase() + table.slice(1)} exported successfully`);
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Export failed: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="text-3xl font-black tracking-tight uppercase">SYSTEM SETTINGS</h2>
        <p className="text-muted-foreground">Manage your store configuration, data backups, and security protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-10">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border shadow-none rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Store className="h-5 w-5 text-primary" />
                Store Information
              </CardTitle>
              <CardDescription>This information will appear on your receipts and reports.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-xs font-bold uppercase text-muted-foreground">Store Name</Label>
                    <Input 
                      id="name" 
                      value={storeInfo.name} 
                      onChange={e => setStoreInfo({...storeInfo, name: e.target.value})}
                      className="bg-background border-border rounded-sm h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs font-bold uppercase text-muted-foreground">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={storeInfo.email} 
                      onChange={e => setStoreInfo({...storeInfo, email: e.target.value})}
                      className="bg-background border-border rounded-sm h-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs font-bold uppercase text-muted-foreground">Physical Address</Label>
                  <Input 
                    id="address" 
                    value={storeInfo.address} 
                    onChange={e => setStoreInfo({...storeInfo, address: e.target.value})}
                    className="bg-background border-border rounded-sm h-10"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Phone Number</Label>
                    <Input 
                      id="phone" 
                      value={storeInfo.phone} 
                      onChange={e => setStoreInfo({...storeInfo, phone: e.target.value})}
                      className="bg-background border-border rounded-sm h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-xs font-bold uppercase text-muted-foreground">Website</Label>
                    <Input 
                      id="website" 
                      value={storeInfo.website} 
                      onChange={e => setStoreInfo({...storeInfo, website: e.target.value})}
                      className="bg-background border-border rounded-sm h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-xs font-bold uppercase text-muted-foreground">Currency</Label>
                    <Input 
                      id="currency" 
                      value={storeInfo.currency} 
                      onChange={e => setStoreInfo({...storeInfo, currency: e.target.value})}
                      className="bg-background border-border rounded-sm h-10"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="font-bold rounded-sm h-10 px-6">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-none rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Database className="h-5 w-5 text-primary" />
                Data Storage & Backups
              </CardTitle>
              <CardDescription>Regularly export your data to ensure you have local copies of your records.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col justify-between p-4 bg-muted/50 rounded-sm border border-border space-y-4">
                  <div className="space-y-1">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <Package className="h-4 w-4 text-primary" />
                      Inventory Backup
                    </p>
                    <p className="text-xs text-muted-foreground">Download all products, stock levels, and categories.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full font-bold h-9 rounded-sm"
                    onClick={() => exportToCSV('products')}
                    disabled={isExporting}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Export CSV
                  </Button>
                </div>
                
                <div className="flex flex-col justify-between p-4 bg-muted/50 rounded-sm border border-border space-y-4">
                  <div className="space-y-1">
                    <p className="font-bold text-sm flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      Sales History Backup
                    </p>
                    <p className="text-xs text-muted-foreground">Download all transaction records and order details.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full font-bold h-9 rounded-sm"
                    onClick={() => exportToCSV('orders')}
                    disabled={isExporting}
                  >
                    <Download className="h-3.5 w-3.5 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </div>

              <div className="bg-primary/5 p-4 rounded-sm border border-primary/10 space-y-2">
                <div className="flex items-center gap-2 text-primary">
                  <RefreshCw className="h-4 w-4" />
                  <p className="text-xs font-bold uppercase tracking-wider">Automated Cloud Backups</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The system database is automatically backed up every 24 hours to our secure cloud infrastructure. 
                  In the event of a system failure, data can be restored to the last backup point.
                </p>
              </div>

              <Separator />
              
              <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-sm border border-destructive/10">
                <div className="space-y-0.5">
                  <p className="font-bold text-sm text-destructive">Clear Local Cache</p>
                  <p className="text-xs text-destructive/70">Remove held orders and local settings from this browser.</p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="font-bold h-9 rounded-sm"
                  onClick={() => {
                    if (confirm('Are you sure? This will clear all local data.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-card border-border shadow-none rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Security Protocols
              </CardTitle>
              <CardDescription>Advanced measures protecting your sensitive data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="mt-1">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Data Encryption</p>
                    <p className="text-xs text-muted-foreground">All data is encrypted both in transit (SSL/TLS) and at rest using industry-standard AES-256 encryption.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Antivirus & Firewalls</p>
                    <p className="text-xs text-muted-foreground">Our cloud infrastructure is protected by enterprise-grade firewalls and real-time threat detection systems.</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="mt-1">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold">Access Control (RBAC)</p>
                    <p className="text-xs text-muted-foreground">Strict Role-Based Access Control ensures users only see the data they are authorized to access.</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="flex flex-col gap-1">
                    <span className="text-sm font-bold">Multi-Factor Auth (MFA)</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Recommended</span>
                  </Label>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Available</Badge>
                </div>
                <p className="text-xs text-muted-foreground">MFA can be enabled via your account security settings to add an extra layer of protection.</p>
                <Button variant="outline" size="sm" className="w-full font-bold h-9 rounded-sm" disabled>
                  Manage MFA
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-none rounded-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Bell className="h-5 w-5 text-primary" />
                Alerts & Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex flex-col gap-1">
                  <span className="text-sm font-bold">Low Stock Alerts</span>
                  <span className="text-xs text-muted-foreground">Notify when items are low.</span>
                </Label>
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Active</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <Label className="flex flex-col gap-1">
                  <span className="text-sm font-bold">Security Logs</span>
                  <span className="text-xs text-muted-foreground">Track all login attempts.</span>
                </Label>
                <Badge variant="outline" className="text-[10px]">Enabled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

