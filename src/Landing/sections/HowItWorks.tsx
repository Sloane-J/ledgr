import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  UserCircle2,
  ScanBarcode,
  ShoppingCart,
  Banknote,
  ReceiptText,
  BarChart3,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Step {
  number: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  card: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Mini UI card mockups — one per step
// ---------------------------------------------------------------------------

// Step 1: Staff login
const LoginCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-5 pt-5 pb-4 border-b border-neutral-100">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Staff login
      </p>
      <div className="space-y-2">
        <div className="h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center px-3">
          <span className="text-xs text-neutral-400">staff@ledgr.app</span>
        </div>
        <div className="h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center px-3 gap-1">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-400 block" />
          ))}
        </div>
      </div>
    </div>
    <div className="px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-neutral-800">Alex Thomas</p>
        <p className="text-[10px] text-neutral-400">Cashier · Shift started 08:00</p>
      </div>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
        Active
      </span>
    </div>
  </div>
);

// Step 2: Search & add products
const SearchCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <div className="h-8 rounded-lg bg-neutral-100 border border-neutral-200 flex items-center px-3 gap-2">
        <ScanBarcode className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
        <span className="text-xs text-neutral-400">Search products…</span>
      </div>
    </div>
    <div className="px-4 py-3 space-y-2">
      {[
        { name: "Coke 500ml", price: "GH₵5.00", stock: 42 },
        { name: "Milk 1L", price: "GH₵8.00", stock: 7 },
        { name: "Bread (Sliced)", price: "GH₵12.00", stock: 18 },
      ].map((p) => (
        <div key={p.name} className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-neutral-800">{p.name}</p>
            <p className="text-[10px] text-neutral-400">{p.stock} in stock</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-neutral-900">{p.price}</span>
            <button
              aria-label={`Add ${p.name} to cart`}
              className="w-5 h-5 rounded-full bg-neutral-900 text-white text-xs flex items-center justify-center font-bold leading-none"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Step 3: Cart & discounts
const CartCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Cart
      </p>
      <div className="space-y-2">
        {[
          { name: "Coke 500ml", qty: 2, price: "GH₵10.00" },
          { name: "Bread (Sliced)", qty: 1, price: "GH₵12.00" },
          { name: "Milk 1L", qty: 1, price: "GH₵8.00" },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold w-4 h-4 rounded bg-neutral-100 flex items-center justify-center text-neutral-600">
                {item.qty}
              </span>
              <span className="text-xs text-neutral-700">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-neutral-900">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="text-xs font-semibold text-neutral-900">Total</span>
      <span className="text-sm font-bold text-neutral-900">GH₵30.00</span>
    </div>
  </div>
);

// Step 4: Payment
const PaymentCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Payment method
      </p>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Cash", active: true },
          { label: "Card", active: false },
          { label: "MoMo", active: false },
        ].map((m) => (
          <button
            key={m.label}
            aria-pressed={m.active}
            className={`py-2 rounded-lg text-xs font-semibold border transition-colors ${
              m.active
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-500 border-neutral-200"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 space-y-1.5">
      <div className="flex justify-between text-xs text-neutral-600">
        <span>Amount due</span><span className="font-semibold text-neutral-900">GH₵30.00</span>
      </div>
      <div className="flex justify-between text-xs text-neutral-600">
        <span>Cash tendered</span><span className="font-semibold text-neutral-900">GH₵50.00</span>
      </div>
      <div className="flex justify-between text-xs font-bold text-emerald-600 pt-1 border-t border-neutral-100">
        <span>Change</span><span>GH₵20.00</span>
      </div>
    </div>
  </div>
);

// Step 5: Receipt
const ReceiptCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 text-center border-b border-neutral-100">
      <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-2">
        <span className="text-white text-xs font-bold">✓</span>
      </div>
      <p className="text-xs font-bold text-neutral-900">Payment confirmed</p>
      <p className="text-[10px] text-neutral-400 mt-0.5">Order #1048 · 11:32 AM</p>
    </div>
    <div className="px-4 py-3 space-y-1.5">
      {["Coke 500ml × 2", "Bread × 1", "Milk × 1"].map((line) => (
        <p key={line} className="text-[11px] text-neutral-500">{line}</p>
      ))}
      <div className="flex justify-between text-xs font-bold text-neutral-900 pt-2 border-t border-neutral-100">
        <span>Total paid</span><span>GH₵30.00</span>
      </div>
    </div>
    <div className="px-4 pb-4">
      <div className="h-7 rounded-lg bg-neutral-900 flex items-center justify-center">
        <span className="text-[11px] font-semibold text-white">Print receipt</span>
      </div>
    </div>
  </div>
);

// Step 6: Dashboard
const DashboardCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-neutral-400 mb-3">
        Today's performance
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Revenue", value: "GH₵8,240", up: true },
          { label: "Orders", value: "126", up: true },
          { label: "Items sold", value: "348", up: true },
          { label: "Low stock", value: "3 items", up: false },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-neutral-50 border border-neutral-100 px-3 py-2">
            <p className="text-[10px] text-neutral-400">{stat.label}</p>
            <p className="text-sm font-bold text-neutral-900 mt-0.5">{stat.value}</p>
            <p className={`text-[10px] font-semibold mt-0.5 ${stat.up ? "text-emerald-500" : "text-red-400"}`}>
              {stat.up ? "▲" : "▼"}
            </p>
          </div>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 flex items-center gap-2">
      <BarChart3 className="w-4 h-4 text-neutral-400" aria-hidden="true" />
      <span className="text-[11px] text-neutral-500">Sales chart updated in real time</span>
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Steps data
// ---------------------------------------------------------------------------
const STEPS: Step[] = [
  {
    number: "01",
    tag: "Access",
    title: "Staff log in securely",
    description:
      "Each team member signs in with their own credentials. Role-based access means cashiers see the register, managers see everything — and every action is tied to a name.",
    icon: UserCircle2,
    card: <LoginCard />,
  },
  {
    number: "02",
    tag: "Search",
    title: "Find products in seconds",
    description:
      "Type a product name or category and results appear instantly. Stock levels show inline so staff always know what's available before adding to the cart.",
    icon: ScanBarcode,
    card: <SearchCard />,
  },
  {
    number: "03",
    tag: "Cart",
    title: "Build the order",
    description:
      "Add items, adjust quantities, apply discounts, or hold the order if a customer steps away. The cart is always one tap from being resumed or completed.",
    icon: ShoppingCart,
    card: <CartCard />,
  },
  {
    number: "04",
    tag: "Payment",
    title: "Collect payment — any method",
    description:
      "Switch between Cash, Card, or Mobile Money in one tap. Cash mode auto-calculates change. The sale is recorded the moment payment is confirmed.",
    icon: Banknote,
    card: <PaymentCard />,
  },
  {
    number: "05",
    tag: "Receipt",
    title: "Print or dismiss the receipt",
    description:
      "A professional receipt is generated instantly. Print it for the customer or skip it — either way, stock levels update automatically and the order logs to history.",
    icon: ReceiptText,
    card: <ReceiptCard />,
  },
  {
    number: "06",
    tag: "Insights",
    title: "Review performance at a glance",
    description:
      "End of day, check the dashboard for revenue totals, order counts, top-selling items, and low stock alerts. Every number traces back to a real transaction.",
    icon: BarChart3,
    card: <DashboardCard />,
  },
];

// ---------------------------------------------------------------------------
// Single step row
// ---------------------------------------------------------------------------
function StepRow({ step, index }: { step: Step; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();
  const isEven = index % 2 === 0;

  const textMotion = {
    initial: reduceMotion ? {} : { opacity: 0, x: isEven ? -24 : 24 },
    animate: inView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: 0.1 },
  };

  const cardMotion = {
    initial: reduceMotion ? {} : { opacity: 0, x: isEven ? 24 : -24 },
    animate: inView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay: 0.2 },
  };

  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
    >
      {/* Text side */}
      <motion.div {...textMotion} className="flex-1 w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-bold text-neutral-300 tracking-widest">
            {step.number}
          </span>
          <div className="h-px flex-1 bg-neutral-100" aria-hidden="true" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 border border-neutral-200 rounded-full px-2 py-0.5">
            {step.tag}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center mt-0.5">
            <Icon className="w-5 h-5 text-white" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 leading-snug mb-3">
              {step.title}
            </h3>
            <p className="text-sm text-neutral-500 leading-relaxed max-w-sm">
              {step.description}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card side */}
      <motion.div
        {...cardMotion}
        className="flex-1 w-full flex justify-center lg:justify-start"
      >
        {step.card}
      </motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="relative bg-white py-24 px-4 sm:px-6"
      aria-labelledby="how-heading"
    >
      <div className="max-w-5xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-20">
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 mb-3"
          >
            How It Works
          </motion.p>
          <motion.h2
            id="how-heading"
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4"
          >
            From login to receipt in six steps
          </motion.h2>
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="max-w-md mx-auto text-base text-neutral-500"
          >
            No training manual required. Ledgr is designed so any staff member
            can ring up a sale on day one.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative space-y-20 lg:space-y-24">
          {/* Vertical connector line (desktop) */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-neutral-100 -translate-x-1/2 pointer-events-none"
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <StepRow key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
