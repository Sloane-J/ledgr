import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { auditService } from '@/src/services/auditService';
import { 
  ShieldCheck, 
  Clock, 
  User, 
  Package, 
  DollarSign, 
  RotateCcw, 
  Trash2, 
  RefreshCw,
  Search,
  ArrowRight,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 12;

export function AuditLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await auditService.getLogs(200);
      setLogs(data || []);
    } catch (error: any) {
      toast.error('Failed to load audit logs: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'PRODUCT_DELETE': return <Trash2 className="h-3.5 w-3.5" />;
      case 'PRICE_CHANGE': return <DollarSign className="h-3.5 w-3.5" />;
      case 'STOCK_OVERRIDE': return <Package className="h-3.5 w-3.5" />;
      case 'ORDER_REFUND': return <RotateCcw className="h-3.5 w-3.5" />;
      default: return <Info className="h-3.5 w-3.5" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'PRODUCT_DELETE': return 'text-red-500 border-red-500/20 bg-red-500/5';
      case 'PRICE_CHANGE': return 'text-blue-500 border-blue-500/20 bg-blue-500/5';
      case 'STOCK_OVERRIDE': return 'text-amber-500 border-amber-500/20 bg-amber-500/5';
      case 'ORDER_REFUND': return 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5';
      default: return 'text-muted-foreground border-muted bg-muted/5';
    }
  };

  const filteredAndSortedLogs = useMemo(() => {
    let result = logs.filter(log => {
      const matchesSearch = 
        log.metadata?.product_name?.toLowerCase().includes(search.toLowerCase()) || 
        log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase());
      const matchesAction = actionFilter === 'all' || log.action === actionFilter;
      return matchesSearch && matchesAction;
    });

    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [logs, search, actionFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedLogs.length / ITEMS_PER_PAGE);
  const paginatedLogs = filteredAndSortedLogs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Synchronizing Logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Security Protocol</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">System Audit</h2>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter by user, action or product..." 
              className="pl-9 h-10 rounded-md border-border bg-card focus-visible:ring-primary"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button 
            variant="outline" 
            className="h-10 rounded-md border-border px-3"
            onClick={fetchLogs}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Filters */}
      <div className="flex flex-wrap gap-2">
        {['all', 'PRODUCT_DELETE', 'PRICE_CHANGE', 'STOCK_OVERRIDE', 'ORDER_REFUND'].map((action) => (
          <Button
            key={action}
            variant={actionFilter === action ? 'default' : 'outline'}
            className={cn(
              "h-8 rounded-md px-4 text-[10px] font-bold uppercase tracking-wider transition-none",
              actionFilter === action ? "bg-primary text-primary-foreground" : "bg-card hover:bg-muted"
            )}
            onClick={() => { setActionFilter(action); setCurrentPage(1); }}
          >
            {action.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Data Table */}
      <div className="border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow className="hover:bg-transparent border-border">
              <TableHead className="w-[180px] font-bold text-[10px] uppercase tracking-wider">
                <button onClick={() => handleSort('created_at')} className="flex items-center gap-1 hover:text-primary transition-colors">
                  Timestamp <ArrowUpDown className="h-3 w-3" />
                </button>
              </TableHead>
              <TableHead className="w-[150px] font-bold text-[10px] uppercase tracking-wider">User</TableHead>
              <TableHead className="w-[150px] font-bold text-[10px] uppercase tracking-wider">Action</TableHead>
              <TableHead className="font-bold text-[10px] uppercase tracking-wider text-center">Value Shift</TableHead>
              <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log) => (
              <TableRow key={log.id} className="border-border hover:bg-muted/30 transition-none">
                <TableCell className="font-mono text-[11px] text-muted-foreground">
                  {new Date(log.created_at).toLocaleString('en-GB', { 
                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary border border-primary/20">
                      {log.profiles?.full_name?.[0] || 'S'}
                    </div>
                    <span className="text-xs font-bold">{log.profiles?.full_name || 'System'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "rounded-md border-none px-0 font-bold text-[10px] uppercase tracking-tight flex items-center gap-1.5",
                    getActionColor(log.action).split(' ')[0]
                  )}>
                    {getActionIcon(log.action)}
                    {log.action.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-3">
                    <span className="font-mono text-[11px] text-muted-foreground line-through decoration-muted-foreground/50">
                      {typeof log.old_value === 'object' ? '...' : log.old_value?.toString() || '0'}
                    </span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-[11px] font-bold text-primary">
                      {typeof log.new_value === 'object' ? '...' : log.new_value?.toString() || '0'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-col items-end gap-1">
                    {log.metadata?.product_name && (
                      <span className="text-[10px] font-bold text-foreground bg-muted px-1.5 py-0.5">
                        {log.metadata.product_name}
                      </span>
                    )}
                    {log.metadata?.reason && (
                      <span className="text-[10px] text-muted-foreground italic">
                        "{log.metadata.reason}"
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {paginatedLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="p-4 bg-muted mb-4 border border-border">
              <ShieldCheck className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">No Audit Records Found</h3>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Page {currentPage} of {totalPages} — Showing {paginatedLogs.length} of {filteredAndSortedLogs.length} logs
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-border"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-border"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}