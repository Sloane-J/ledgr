import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/src/components/ui/dialog';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Tag, 
  Package, 
  Loader2,
  FolderOpen,
  LayoutGrid,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;

      const { data: products, error: pError } = await supabase
        .from('products')
        .select('category_id');
      
      if (pError) throw pError;

      const counts: Record<string, number> = {};
      products?.forEach(p => {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      });

      setCategories(data || []);
      setCategoryCounts(counts);
    } catch (error: any) {
      toast.error('Failed to load categories: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory?.name) return;

    try {
      if (editingCategory.id) {
        const { error } = await supabase
          .from('categories')
          .update({ name: editingCategory.name })
          .eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated');
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{ name: editingCategory.name }]);
        if (error) throw error;
        toast.success('Category added');
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const count = categoryCounts[id] || 0;
    if (count > 0) {
      toast.error(`Restriction: ${count} products are currently linked to this category.`);
      return;
    }

    if (!confirm('Confirm deletion of this category?')) return;
    
    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category purged');
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCategories = useMemo(() => 
    categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Accessing Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <LayoutGrid className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Inventory Architecture</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight uppercase">Categories</h2>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="rounded-md font-bold uppercase tracking-wider h-10 px-6 gap-2 transition-none"
              onClick={() => setEditingCategory({ name: '' })}
            >
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-md border-border bg-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold uppercase tracking-tight">
                {editingCategory?.id ? 'Modify Category' : 'Register Category'}
              </DialogTitle>
              <DialogDescription className="text-xs uppercase font-medium text-muted-foreground">
                Define a new organizational node for your product catalog.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-5 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Label Name</label>
                <Input 
                  required
                  value={editingCategory?.name || ''} 
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  placeholder="E.G. PERISHABLES"
                  className="h-10 rounded-md border-border bg-background font-mono text-sm focus-visible:ring-primary uppercase"
                />
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full h-10 rounded-md font-bold uppercase tracking-wider">
                  {editingCategory?.id ? 'Save Changes' : 'Confirm Entry'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-border p-4 bg-card flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Total Groups</span>
          <span className="font-mono text-xl font-bold">{categories.length}</span>
        </div>
        <div className="border border-border p-4 bg-card flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase text-muted-foreground">Categorized Items</span>
          <span className="font-mono text-xl font-bold text-primary">
            {Object.values(categoryCounts).reduce((a, b) => a + b, 0)}
          </span>
        </div>
        <div className="relative border border-border p-2 bg-card">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
           <Input 
              placeholder="FILTER LABELS..." 
              className="pl-10 h-full rounded-md bg-transparent font-mono text-xs uppercase focus-visible:ring-0"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 bg-border border border-border">
        {filteredCategories.map((category) => (
          <div 
            key={category.id} 
            className="group bg-card p-5 hover:bg-muted/20 transition-colors flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex justify-between items-start">
              <div className="h-8 w-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex gap-px">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-md hover:bg-primary hover:text-primary-foreground transition-none"
                  onClick={() => {
                    setEditingCategory(category);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-none"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-sm font-bold uppercase tracking-wide truncate">
                {category.name}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                <BarChart3 className="h-3 w-3" />
                <span className="font-mono text-[10px] uppercase font-medium">
                  Count: {categoryCounts[category.id] || 0} units
                </span>
              </div>
            </div>
          </div>
        ))}

        {filteredCategories.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-card text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground/30 mb-4" />
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Empty Dataset</h3>
          </div>
        )}
      </div>
    </div>
  );
}