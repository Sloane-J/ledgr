-- 1. Create Suppliers Table
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Supplier Orders Table
CREATE TABLE IF NOT EXISTS public.supplier_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_id UUID REFERENCES public.suppliers(id) ON DELETE SET NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Supplier Order Items Table
CREATE TABLE IF NOT EXISTS public.supplier_order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supplier_order_id UUID REFERENCES public.supplier_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_cost DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable RLS
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier_order_items ENABLE ROW LEVEL SECURITY;

-- 5. Create Policies (Admin only for management, staff can view if needed but user requested admin only RBAC)
-- For simplicity and following the request: only admins can manage these.

-- Suppliers
CREATE POLICY "Admins can manage suppliers" ON public.suppliers FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Staff can view suppliers" ON public.suppliers FOR SELECT USING (true);

-- Supplier Orders
CREATE POLICY "Admins can manage supplier orders" ON public.supplier_orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Staff can view supplier orders" ON public.supplier_orders FOR SELECT USING (true);

-- Supplier Order Items
CREATE POLICY "Admins can manage supplier order items" ON public.supplier_order_items FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);
CREATE POLICY "Staff can view supplier order items" ON public.supplier_order_items FOR SELECT USING (true);
