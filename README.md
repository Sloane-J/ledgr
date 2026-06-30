# Ledgr — Retail Management System

> An all-in-one retail management system built for small shops and businesses in Ghana. Fast, reliable, and designed for the way Ghanaian retail actually works.

---

## What is Ledgr?

Ledgr is a full-featured retail management system that goes beyond a traditional POS. It handles your entire shop operation — sales, inventory, customers, suppliers, staff, and reporting — from a single interface that works on any screen.

Built with barcode scanners and keyboard-first workflows in mind, Ledgr is fast enough for busy counter environments and detailed enough for end-of-day reconciliation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (PostgreSQL) |
| Routing | React Router v6 |
| Charts | Recharts |
| Notifications | Sonner |
| Icons | Lucide React |
| PWA | Service Worker + Web Manifest |

---

## Features

### Register (POS)
- Barcode scanner support — scan directly into the product list with no extra configuration
- Category-first product browsing — select a category to view its products as a fast compact list
- Keyboard-first design — `/` to search, `F2` to pay, arrow keys for categories, numpad always active
- Cart with quantity controls, direct quantity input, and per-item removal
- Customer name autocomplete — links orders to existing profiles or creates new ones on the fly
- Discount by percentage per order
- Order notes
- Hold and resume orders — saved to your account, not just the device
- Multiple payment methods:
  - **Cash** — numpad entry, change due calculated automatically, quick-amount buttons
  - **Card** — terminal confirmation with optional last-4-digits or reference number
  - **Mobile Money (MoMo)** — send STK prompt to customer or confirm pay-to-account after funds received
- Full-screen payment overlay with order summary, method panel, and numpad
- Receipt modal — preview before printing, consistent with app design
- Thermal receipt printing (80mm) with barcode, itemized totals, and payment details

### Inventory
- Add, edit, and delete products with images, SKU, price, and stock quantity
- Real-time stock tracking — decrements on sale, restores on refund
- Low stock visual indicators with configurable threshold
- Category assignment per product
- Bulk sample catalog seeding for testing

### Orders
- Full transaction history with items, staff member, customer, and payment method
- One-click refund — marks order as refunded and restores stock automatically
- Void orders with reason
- Status badges: Completed, Refunded, Voided, Pending

### Customers
- Customer database with name, email, and phone
- Order history per customer
- Auto-created on first purchase if name is provided at checkout

### Suppliers
- Supplier directory with contact details
- Supplier order tracking with status and line items

### Reports
- Revenue over time
- Top-selling products
- Payment method breakdown
- Staff performance

### Dashboard
- Live metrics: total sales, order count, revenue today
- Low stock alerts
- Recent activity feed

### Staff & Access Control
- Role-based access: Admin and Staff
- Admin approves new staff accounts before access is granted
- First registered user is automatically Admin
- Staff restricted to Register, Orders, Customers, Profile, and Settings
- All sensitive actions protected by Supabase Row Level Security (RLS)

### Audit Logs
- Every critical action logged with timestamp and responsible staff member
- Covers: stock overrides, refunds, voids, price changes, user approvals

### Settings & Profile
- Dark mode toggle, persisted to local storage
- Staff profile management

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── pos/                  # POS sub-components
│   │   │   ├── usePOS.ts         # All register business logic
│   │   │   ├── useCartPersistence.ts
│   │   │   ├── useBarcodeScanner.ts
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductRow.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   ├── CartItem.tsx
│   │   │   ├── OrderTotals.tsx
│   │   │   ├── PaymentOverlay.tsx
│   │   │   ├── CashPanel.tsx
│   │   │   ├── CardPanel.tsx
│   │   │   ├── MomoPanel.tsx
│   │   │   ├── HeldOrdersDrawer.tsx
│   │   │   └── SuccessDialog.tsx
│   │   ├── inventory/            # Inventory sub-components
│   │   ├── orders/               # Orders sub-components
│   │   ├── POS.tsx               # Register page shell
│   │   ├── Inventory.tsx
│   │   ├── Orders.tsx
│   │   ├── Customers.tsx
│   │   ├── Suppliers.tsx
│   │   ├── Categories.tsx
│   │   ├── Reports.tsx
│   │   ├── Dashboard.tsx
│   │   ├── AuditLogs.tsx
│   │   ├── Users.tsx
│   │   ├── Profile.tsx
│   │   ├── Settings.tsx
│   │   ├── Auth.tsx
│   │   └── ReceiptPrint.tsx
│   ├── Landing/
│   │   └── LandingPage.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── constants.ts          # Currency, tax rate, thresholds
│   ├── services/
│   │   └── auditService.ts
│   ├── types.ts
│   ├── App.tsx
│   └── index.css
├── public/
├── vercel.json                   # SPA rewrite rule for Vercel
└── supabase/                     # SQL migrations
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- npm

### Installation

```bash
# Clone the repo
git clone https://github.com/Sloane-J/Sloane-POS.git
cd Sloane-POS

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

Run the migration scripts in `/supabase/` inside your Supabase SQL Editor in order. They set up all tables, RLS policies, indexes, and the `decrement_stock` RPC function used for atomic stock updates.

### Run

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Deploy

The project is configured for Vercel. Push to your connected branch and it deploys automatically. The `vercel.json` file handles SPA routing so all routes resolve correctly.

---

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key |

---

## Access & Roles

| Feature | Admin | Staff |
|---|---|---|
| Register | ✓ | ✓ |
| Orders | ✓ | ✓ |
| Customers | ✓ | ✓ |
| Profile & Settings | ✓ | ✓ |
| Inventory | ✓ | — |
| Categories | ✓ | — |
| Suppliers | ✓ | — |
| Reports | ✓ | — |
| Dashboard | ✓ | — |
| Audit Logs | ✓ | — |
| Staff Management | ✓ | — |

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `/` | Focus product search |
| `F2` | Focus Pay button |
| `Esc` | Close payment overlay |
| `1` / `2` / `3` | Switch payment method (Card / Cash / MoMo) |
| `Enter` | Confirm payment when amount is sufficient |
| `P` | Print receipt (inside receipt modal) |
| Arrow keys | Navigate category tabs |

---

## Design System

Ledgr uses a brutalist-modern aesthetic:

- Heavy font weights (`font-black`) for all key figures and labels
- Uppercase tracking-widest labels throughout
- Sharp corners — no rounded cards
- Minimal color — primary accent only for interactive and active states
- Dark mode first, light mode supported
- Mobile responsive, desktop optimized

---

## Security

- All tables protected by Supabase Row Level Security (RLS)
- Passwords hashed by Supabase Auth (bcrypt)
- Staff accounts require admin approval before access
- Input sanitization before any user string reaches the database
- Card references limited to last 4 digits — no full card numbers stored
- Atomic stock decrements via database RPC to prevent overselling
- Checkout protected by a hard ref-based lock to prevent double-submit race conditions

---

## Roadmap

- [ ] Real MoMo STK push API integration (Hubtel / Paystack)
- [ ] Multi-branch support
- [ ] Offline mode with sync
- [ ] Tauri desktop app (local-first, SQLite per shop)
- [ ] Lecturer / supplier portal
- [ ] Advanced report exports (PDF, CSV)
- [ ] SMS receipts

---

## Built by

**Sloane.dev** — [samuel-dorkey.vercel.app](https://samuel-dorkey.vercel.app)

Live demo: [ledgr-xi.vercel.app](https://ledgr-xi.vercel.app)
