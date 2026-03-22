# 🚀 POS & Inventory Management System

A modern, full-stack Point of Sale (POS) and Inventory Management solution built for speed, reliability, and ease of use. This application is designed for retail businesses, cafes, and small shops to manage sales, track inventory, and monitor staff activity in real-time.

---

## 🛠 Tech Stack

- **Frontend:** React 18+ with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Mobile-first, responsive design)
- **Database & Auth:** Supabase (PostgreSQL)
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Notifications:** Sonner
- **Charts:** Recharts (Dashboard analytics)

---

## 📂 Project Structure

```text
├── src/
│   ├── components/         # Core UI Modules
│   │   ├── POS.tsx         # Main Register/Checkout interface
│   │   ├── Inventory.tsx   # Product management & stock tracking
│   │   ├── Categories.tsx  # Product categorization
│   │   ├── Orders.tsx      # Transaction history & refunds
│   │   ├── Customers.tsx   # Customer database management
│   │   ├── Dashboard.tsx   # Analytics & business insights
│   │   ├── AuditLogs.tsx   # Security & activity tracking
│   │   └── Auth.tsx        # Login & User registration
│   ├── lib/
│   │   └── supabase.ts     # Supabase client configuration
│   ├── services/
│   │   └── auditService.ts # Centralized logging for critical actions
│   ├── types/
│   │   └── index.ts        # Global TypeScript interfaces
│   ├── App.tsx             # Main layout & navigation routing
│   └── index.css           # Global styles & Tailwind imports
├── public/                 # Static assets
└── supabase/               # SQL migration scripts & schema definitions
```

---

## ✨ Key Features

### 1. High-Performance POS (Register)
- **Search & Filter:** Quickly find products by name or category.
- **Cart Management:** Add/remove items, adjust quantities, and apply discounts.
- **Multiple Payment Methods:** Support for Cash (with change calculation), Card, and Mobile Money (MoMo).
- **Hold Orders:** Save a cart to local storage and resume it later—perfect for busy environments.
- **Customer Integration:** Searchable customer dropdown that automatically links orders to existing profiles or creates new ones.
- **Receipt Preview:** Professional receipt layout ready for printing.

### 2. Inventory & Catalog
- **Real-time Stock Tracking:** Stock levels decrease automatically upon sale and increase upon refund.
- **Low Stock Alerts:** Visual indicators and dashboard widgets for items running low.
- **Category Management:** Organize products into logical groups for faster navigation.
- **Bulk Seeding:** One-click "Seed Sample Catalog" for testing and demonstration.

### 3. Order Management & Refunds
- **Full History:** Detailed view of every transaction, including items, staff member, and customer.
- **Smart Refunds:** One-click refund process that marks the order as refunded and automatically restores items to inventory.
- **Status Tracking:** Visual badges for 'Completed' vs 'Refunded' status.

### 4. Business Intelligence (Dashboard)
- **Live Metrics:** Real-time tracking of Total Sales, Order Count, and Customer Growth.
- **Sales Trends:** Visual charts showing revenue performance over time.
- **Activity Feed:** Recent transactions and stock movements at a glance.

### 5. Security & Auditing
- **Audit Logs:** Every critical action (stock overrides, refunds, price changes) is logged with a timestamp and the responsible staff member's name.
- **Role-Based Access:** Integrated with Supabase Auth for secure staff logins.

---

## ⚙️ Setup & Installation

### 1. Database Schema
Run the following SQL scripts in your Supabase SQL Editor to initialize the required tables and relationships:

```sql
-- Create necessary tables
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    category_id UUID REFERENCES public.categories(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    customer_id UUID REFERENCES public.customers(id),
    customer_name TEXT,
    total_amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL
);

CREATE TABLE public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_id TEXT,
    entity_type TEXT,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2. Environment Variables
Create a `.env` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 💡 Quirks & Pro-Tips

- **Mobile POS:** The POS interface has a dedicated "Mobile View" toggle. On small screens, it switches between the product grid and the cart to maximize usable space.
- **Staff Attribution:** The system automatically links every order and audit log to the currently logged-in user's profile.
- **Local Storage:** "Held Orders" are stored in the browser's local storage. This means they persist even if you refresh the page, but they are specific to the device being used.
- **Stock Validation:** The POS prevents adding items to the cart if the quantity exceeds available stock, ensuring you never oversell.

---

## 🛡 Security Rules (Firestore/Supabase)
Ensure your RLS (Row Level Security) policies are enabled in Supabase to protect your data. By default, all tables should require authentication for write access.

---

## 👨‍💻 Documentation for Developers
- **Adding a new Module:** Create a component in `src/components/`, add a corresponding icon in `App.tsx`, and update the `activeTab` state logic.
- **Audit Logging:** Use the `auditService.logAction()` method whenever you implement a feature that modifies sensitive data (like prices or stock).
- **Styling:** This project uses a "Brutalist-Modern" aesthetic. Use heavy font weights (`font-black`), uppercase labels, and thick borders (`border-2`) to maintain visual consistency.
