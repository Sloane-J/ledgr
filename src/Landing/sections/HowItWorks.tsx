// src/Landing/sections/HowItWorks.tsx
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  UserCircle2,
  ScanBarcode,
  ShoppingCart,
  Banknote,
  ReceiptText,
  BarChart3,
  Check,
} from "lucide-react";

interface Step {
  number: string;
  tag: string;
  title: string;
  description: string;
  icon: React.ElementType;
  card: React.ReactNode;
}

// Step 1: Staff login
const LoginCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-5 pt-5 pb-4 border-b border-neutral-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
        Staff login
      </p>
      <div className="space-y-2">
        <div className="h-8 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center px-3">
          <span className="text-xs text-neutral-400">staff@ledgr.app</span>
        </div>
        <div className="h-8 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center px-3 gap-1">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-neutral-300 block" />
          ))}
        </div>
      </div>
    </div>
    <div className="px-5 py-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-neutral-900">Alex Thomas</p>
        <p className="text-[10px] text-neutral-400">Cashier · Shift started 08:00</p>
      </div>
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white border border-neutral-900">
        Active
      </span>
    </div>
  </div>
);

// Step 2: Search & add products
const SearchCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <div className="h-8 rounded-lg bg-neutral-50 border border-neutral-200/60 flex items-center px-3 gap-2">
        <ScanBarcode className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span className="text-xs text-neutral-400">Search products…</span>
      </div>
    </div>
    <div className="px-4 py-3 space-y-2">
      {[
        { name: "Malt drink 330ml", price: "₵5.00", stock: 42 },
        { name: "Milk 1L", price: "₵8.00", stock: 7 },
        { name: "Bread (Sliced)", price: "₵12.00", stock: 18 },
      ].map((p) => (
        <div key={p.name} className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-neutral-900">{p.name}</p>
            <p className="text-[10px] text-neutral-400">{p.stock} in stock</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-900">{p.price}</span>
            <button
              type="button"
              aria-label={`Add ${p.name} to cart`}
              className="w-5 h-5 rounded-full text-white bg-neutral-900 hover:bg-neutral-800 text-xs flex items-center justify-center font-bold leading-none transition-colors"
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
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
        Cart
      </p>
      <div className="space-y-2">
        {[
          { name: "Malt drink 330ml", qty: 2, price: "₵10.00" },
          { name: "Bread (Sliced)", qty: 1, price: "₵12.00" },
          { name: "Milk 1L", qty: 1, price: "₵8.00" },
        ].map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold w-4 h-4 rounded bg-neutral-100 text-neutral-900 flex items-center justify-center border border-neutral-200/40">
                {item.qty}
              </span>
              <span className="text-xs font-medium text-neutral-700">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-neutral-900">{item.price}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 flex items-center justify-between">
      <span className="text-xs font-bold text-neutral-900">Total</span>
      <span className="text-sm font-black text-neutral-900">₵30.00</span>
    </div>
  </div>
);

// Step 4: Payment
const PaymentCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
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
            type="button"
            aria-pressed={m.active}
            className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
              m.active
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 space-y-1.5">
      <div className="flex justify-between text-xs text-neutral-500 font-medium">
        <span>Amount due</span><span className="font-bold text-neutral-900">₵30.00</span>
      </div>
      <div className="flex justify-between text-xs text-neutral-500 font-medium">
        <span>Cash tendered</span><span className="font-bold text-neutral-900">₵50.00</span>
      </div>
      <div className="flex justify-between text-xs font-bold text-neutral-900 pt-1.5 border-t border-dashed border-neutral-200">
        <span>Change</span><span>₵20.00</span>
      </div>
    </div>
  </div>
);

// Step 5: Receipt
const ReceiptCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 text-center border-b border-neutral-100">
      <div className="w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-2 bg-neutral-900">
        <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} aria-hidden="true" />
      </div>
      <p className="text-xs font-bold text-neutral-900">Payment confirmed</p>
      <p className="text-[10px] text-neutral-400 mt-0.5">Order #1048 · 11:32 AM</p>
    </div>
    <div className="px-4 py-3 space-y-1.5">
      {["Malt drink × 2", "Bread × 1", "Milk × 1"].map((line) => (
        <p key={line} className="text-[11px] text-neutral-500 font-medium">{line}</p>
      ))}
      <div className="flex justify-between text-xs font-bold text-neutral-900 pt-2 border-t border-dashed border-neutral-200">
        <span>Total paid</span><span>₵30.00</span>
      </div>
    </div>
    <div className="px-4 pb-4">
      <button
        type="button"
        className="w-full h-8 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-xs font-bold text-white transition-colors"
      >
        Print receipt
      </button>
    </div>
  </div>
);

// Step 6: Dashboard
const DashboardCard = () => (
  <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden w-full max-w-[280px]">
    <div className="px-4 pt-4 pb-3 border-b border-neutral-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-3">
        Today's performance
      </p>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: "Revenue", value: "₵8,240", up: true },
          { label: "Orders", value: "126", up: true },
          { label: "Items sold", value: "348", up: true },
          { label: "Low stock", value: "3 items", up: false },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg bg-neutral-50 border border-neutral-200/50 px-3 py-2">
            <p className="text-[10px] text-neutral-400 font-medium">{stat.label}</p>
            <p className="text-xs font-bold text-neutral-900 mt-0.5">{stat.value}</p>
            <p className={`text-[9px] font-bold mt-0.5 ${stat.up ? "text-neutral-950" : "text-neutral-400"}`}>
              {stat.up ? "▲ Growth" : "▼ Review"}
            </p>
          </div>
        ))}
      </div>
    </div>
    <div className="px-4 py-3 flex items-center gap-2">
      <BarChart3 className="w-3.5 h-3.5 text-neutral-900" aria-hidden="true" />
      <span className="text-[10px] font-medium text-neutral-500">Live operational metric sync</span>
    </div>
  </div>
);

const STEPS: Step[] = [
  {
    number: "01",
    tag: "Access",
    title: "Staff log in securely",
    description:
      "Each team member signs in with unique terminal IDs. Role-based configurations ensure operators only interact with active lanes while backend ledger actions lock instantly.",
    icon: UserCircle2,
    card: <LoginCard />,
  },
  {
    number: "02",
    tag: "Search",
    title: "Find products in seconds",
    description:
      "Type descriptions or trigger continuous barcode lines. Real-time product profiles populate metrics natively to avoid checking storage rooms during checkouts.",
    icon: ScanBarcode,
    card: <SearchCard />,
  },
  {
    number: "03",
    tag: "Cart",
    title: "Build the order",
    description:
      "Queue multiple line entries, distribute multi-unit discounts, or suspend open registers immediately when buyers need additional storage items.",
    icon: ShoppingCart,
    card: <CartCard />,
  },
  {
    number: "04",
    tag: "Payment",
    title: "Process fluid tenders",
    description:
      "Route transactions via Cash, local Mobile Money accounts, or legacy cards. The primary ledger balance calculates accurate physical change fields automatically.",
    icon: Banknote,
    card: <PaymentCard />,
  },
  {
    number: "05",
    tag: "Receipt",
    title: "Print or dispatch entries",
    description:
      "Dispatch professional physical records via system 80mm printers immediately. Stock updates roll into cross-location databases to log quantities.",
    icon: ReceiptText,
    card: <ReceiptCard />,
  },
  {
    number: "06",
    tag: "Insights",
    title: "Review operational flow",
    description:
      "Audit terminal counts, gross margins, and low stock warnings immediately from anywhere without running physical end-of-day spreadsheet counts manually.",
    icon: BarChart3,
    card: <DashboardCard />,
  },
];

function StepRow({ step, index }: { step: Step; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const reduceMotion = useReducedMotion();
  const isEven = index % 2 === 0;

  const textMotion = {
    initial: reduceMotion ? {} : { opacity: 0, x: isEven ? -16 : 16 },
    animate: inView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.05 },
  };

  const cardMotion = {
    initial: reduceMotion ? {} : { opacity: 0, x: isEven ? 16 : -16 },
    animate: inView ? { opacity: 1, x: 0 } : {},
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.1 },
  };

  const Icon = step.icon;

  return (
    <div
      ref={ref}
      className={`flex flex-col lg:flex-row items-center gap-10 lg:gap-16 ${
        isEven ? "lg:flex-row" : "lg:flex-row-reverse"
      }`}
    >
      <motion.div {...textMotion} className="flex-1 w-full">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[11px] font-black text-neutral-900 tracking-wider">
            {step.number}
          </span>
          <div className="h-px flex-1 bg-neutral-100" aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-900 bg-neutral-50 border border-neutral-200/60 rounded-md px-2.5 py-0.5">
            {step.tag}
          </span>
        </div>

        <div className="flex items-start gap-4">
          <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5 bg-neutral-900 text-white border border-neutral-900 shadow-sm">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 tracking-tight mb-2">
              {step.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-sm font-normal">
              {step.description}
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        {...cardMotion}
        className={`flex-1 w-full flex justify-center ${
          isEven ? "lg:justify-end" : "lg:justify-start"
        }`}
      >
        <div className="p-4 bg-neutral-50/50 border border-neutral-200/60 rounded-3xl w-full flex justify-center max-w-[340px]">
          {step.card}
        </div>
      </motion.div>
    </div>
  );
}

export default function HowItWorks() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="how-it-works"
      className="relative bg-white py-24 px-4 sm:px-6 lg:px-8 border-t border-neutral-100 overflow-hidden select-none"
      aria-labelledby="how-heading"
    >
      <div className="max-w-5xl mx-auto">

        {/* Title Bar Header Wrap */}
        <div className="text-left md:text-center mb-20">
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-3"
          >
            Workflow Execution
          </motion.p>
          <motion.h2
            id="how-heading"
            initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="text-3xl sm:text-4xl font-bold tracking-tighter text-neutral-900 mb-4"
          >
            From login to ledger entries in six steps
          </motion.h2>
          <motion.p
            initial={reduceMotion ? {} : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="max-w-md mx-auto text-sm text-neutral-500 font-normal leading-relaxed"
          >
            No complex training manuals required. Run checkout items, register inventory stocks,
            and trace audits straight out of the box on day one.
          </motion.p>
        </div>

        {/* Vertical Rows Matrix */}
        <div className="relative space-y-20 lg:space-y-24">
          <div
            className="hidden lg:block absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2 pointer-events-none bg-gradient-to-b from-neutral-100 via-neutral-200 to-neutral-100"
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
