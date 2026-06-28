import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { useInView } from "framer-motion";
import {
  ShoppingCart,
  Package,
  BarChart3,
  RefreshCcw,
  ShieldCheck,
  Users,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface StatBadge {
  value: string;
  label: string;
  positive?: boolean;
}

// ---------------------------------------------------------------------------
// Animation helpers
// ---------------------------------------------------------------------------
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
});

// ---------------------------------------------------------------------------
// Small reusable pieces
// ---------------------------------------------------------------------------
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100">
      {children}
    </span>
  );
}

function StatChip({ value, label, positive }: StatBadge) {
  return (
    <div className="flex flex-col items-center justify-center px-3 py-2 rounded-lg bg-white border border-neutral-100 shadow-sm min-w-[72px]">
      <span className="text-[15px] font-bold text-neutral-900">{value}</span>
      <span className="text-[10px] text-neutral-400 mt-0.5">{label}</span>
      {positive !== undefined && (
        <span
          className={`text-[10px] font-semibold mt-0.5 ${
            positive ? "text-emerald-500" : "text-red-400"
          }`}
        >
          {positive ? "▲" : "▼"}
        </span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Bento card wrapper
// ---------------------------------------------------------------------------
function BentoCard({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduceMotion ? {} : { opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay }}
      className={`relative rounded-2xl border border-neutral-200 bg-white overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function Features() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="features"
      className="relative bg-neutral-50 py-24 px-4 sm:px-6"
      aria-labelledby="features-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-14">
          <motion.p
            {...(reduceMotion ? {} : fadeUp(0))}
            className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-400 mb-3"
          >
            Features
          </motion.p>
          <motion.h2
            id="features-heading"
            {...(reduceMotion ? {} : fadeUp(0.08))}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 mb-4"
          >
            Powerful Features, Simple to Use
          </motion.h2>
          <motion.p
            {...(reduceMotion ? {} : fadeUp(0.14))}
            className="max-w-lg mx-auto text-base text-neutral-500"
          >
            Everything you need to manage sales, track stock, and keep your team
            accountable — without the clutter.
          </motion.p>
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">

          {/* ── 1. High-Performance POS (tall, col-span-1) ── */}
          <BentoCard delay={0.05} className="sm:row-span-2 flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=75&auto=format&fit=crop"
                alt="Staff using a POS terminal at a retail counter"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              {/* Live stat overlay */}
              <div className="absolute bottom-3 left-3 flex gap-2">
                <StatChip value="GH₵2,150" label="Today's sales" positive={true} />
                <StatChip value="48" label="Orders" positive={true} />
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <Tag>Register</Tag>
              <h3 className="mt-3 text-lg font-bold text-neutral-900">
                High-Performance POS
              </h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed flex-1">
                Search products instantly, manage your cart, hold orders for busy
                moments, and accept Cash, Card, or Mobile Money — with automatic
                change calculation built in.
              </p>
              <ul className="mt-4 space-y-1.5" aria-label="POS features">
                {["Cart management & discounts", "Hold & resume orders", "Receipt preview & print"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-neutral-500">
                      <ShoppingCart className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </BentoCard>

          {/* ── 2. Goals & Targets — centre top (wide) ── */}
          <BentoCard delay={0.1} className="lg:col-span-1 flex flex-col">
            {/* Mini slider mockup */}
            <div className="px-5 pt-5 pb-4 border-b border-neutral-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-neutral-600">Set monthly sales goal</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-neutral-900 text-white">
                  GH₵12.5k
                </span>
              </div>
              {/* Fake slider */}
              <div className="relative w-full h-1.5 rounded-full bg-neutral-200 mt-2">
                <div className="absolute left-0 top-0 h-full w-[62%] rounded-full bg-neutral-900" />
                <div className="absolute top-1/2 -translate-y-1/2 left-[62%] -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-neutral-900 shadow" />
              </div>
              <div className="flex justify-between mt-1.5 text-[9px] text-neutral-400">
                {["0", "5K", "10K", "15K", "20K", "25K"].map((v) => (
                  <span key={v}>{v}</span>
                ))}
              </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <Tag>Analytics</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Sales &amp; Growth</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                Monitor revenue across the day with live charts. See totals, order
                counts, and trends — all updating in real time.
              </p>
            </div>
          </BentoCard>

          {/* ── 3. Regular Updates / Alerts — top right ── */}
          <BentoCard delay={0.15} className="flex flex-col">
            <div className="p-5 flex flex-col flex-1">
              {/* Stat row */}
              <div className="flex gap-3 mb-4">
                <StatChip value="2,696" label="Items sold" positive={true} />
                <StatChip value="169" label="New customers" positive={true} />
                <StatChip value="18" label="Low stock" positive={false} />
              </div>
              {/* Logo circle */}
              <div className="flex items-center justify-center my-3">
                <div className="w-14 h-14 rounded-full bg-neutral-900 flex items-center justify-center shadow-md">
                  <BarChart3 className="w-7 h-7 text-white" aria-hidden="true" />
                </div>
              </div>
              {/* Product pill */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100 text-xs font-medium text-neutral-700 mt-2">
                <Package className="w-4 h-4 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                <span>Coke 500ml</span>
                <span className="ml-auto text-red-500 font-semibold">3 left</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neutral-50 border border-neutral-100 text-xs font-medium text-neutral-700 mt-1.5">
                <Package className="w-4 h-4 text-neutral-400 flex-shrink-0" aria-hidden="true" />
                <span>Milk 1L</span>
                <span className="ml-auto text-yellow-500 font-semibold">7 left</span>
              </div>
            </div>
            <div className="px-5 pb-5">
              <Tag>Inventory</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Low Stock Alerts</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                Visual indicators flag items running low before they run out, so
                you can restock before a sale slips through.
              </p>
            </div>
          </BentoCard>

          {/* ── 4. Sales chart — centre bottom ── */}
          <BentoCard delay={0.2} className="flex flex-col">
            <div className="relative h-44 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=75&auto=format&fit=crop"
                alt="Sales analytics chart on a laptop screen"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              {/* Inline stat */}
              <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-900 shadow-sm">
                Total sales today &nbsp;<span className="text-emerald-600">+12.6%</span>
              </div>
            </div>
            <div className="p-5">
              <Tag>Dashboard</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Business Intelligence</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                Live metrics, sales trend charts, and an activity feed give you a
                complete picture of your business at a glance.
              </p>
            </div>
          </BentoCard>

          {/* ── 5. Customer Payments — bottom right ── */}
          <BentoCard delay={0.25} className="flex flex-col">
            {/* Payment rows mockup */}
            <div className="p-5 border-b border-neutral-100 space-y-2">
              {[
                { name: "Alex Thomas", amount: "GH₵2,200", time: "10:45", color: "bg-blue-100 text-blue-700" },
                { name: "Casey Reynolds", amount: "GH₵750", time: "13:00", color: "bg-violet-100 text-violet-700" },
                { name: "Riley Park", amount: "GH₵1,500", time: "09:13", color: "bg-emerald-100 text-emerald-700" },
                { name: "Jordan Lee", amount: "GH₵320", time: "09:15", color: "bg-orange-100 text-orange-700" },
              ].map((row) => (
                <div key={row.name} className="flex items-center gap-3">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${row.color}`}>
                    {row.name[0]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-neutral-800 truncate">{row.name}</p>
                    <p className="text-[10px] text-neutral-400">{row.time}</p>
                  </div>
                  <span className="text-xs font-semibold text-neutral-900">{row.amount}</span>
                </div>
              ))}
            </div>
            <div className="p-5">
              <Tag>Orders</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Customer Payments</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                Track who paid, how much, and the payment method — one clear ledger
                for sales, refunds, and reconciliations.
              </p>
            </div>
          </BentoCard>

          {/* ── 6. Product Reach / Targeted Visibility (bottom-left, spans 1) ── */}
          <BentoCard delay={0.3} className="flex flex-col">
            <div className="relative h-40 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=75&auto=format&fit=crop"
                alt="Retail shop inventory shelves"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <Tag>Catalog</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Inventory &amp; Catalog</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed flex-1">
                Organize products by category, bulk-seed sample data, and watch
                stock levels update the moment a sale is made or a refund is
                processed.
              </p>
              <ul className="mt-4 space-y-1.5" aria-label="Inventory features">
                {["Category management", "Bulk product seeding", "Auto stock deduction"].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-2 text-xs text-neutral-500">
                      <Package className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" aria-hidden="true" />
                      {item}
                    </li>
                  )
                )}
              </ul>
            </div>
          </BentoCard>

          {/* ── 7. Smart Refunds ── */}
          <BentoCard delay={0.35} className="flex flex-col">
            <div className="p-5 border-b border-neutral-100">
              {/* Refund receipt mockup */}
              <div className="rounded-xl bg-neutral-50 border border-neutral-100 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-700">Order #1042</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">Refunded</span>
                </div>
                <div className="text-[11px] text-neutral-500 space-y-1 pt-1">
                  <div className="flex justify-between"><span>Coke 500ml × 2</span><span>GH₵10.00</span></div>
                  <div className="flex justify-between"><span>Bread × 1</span><span>GH₵8.00</span></div>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between text-xs font-bold text-neutral-900">
                  <span>Total refunded</span><span>GH₵18.00</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <Tag>Orders</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Smart Refunds</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                One-click refunds mark the order as refunded and automatically
                restore items to inventory — no manual stock corrections needed.
              </p>
            </div>
          </BentoCard>

          {/* ── 8. Security & Audit Logs (wide, bottom) ── */}
          <BentoCard delay={0.4} className="sm:col-span-2 lg:col-span-1 flex flex-col">
            <div className="relative h-40 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=75&auto=format&fit=crop"
                alt="Secure digital lock representing audit and security"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-3 flex gap-2 flex-wrap">
                {["Stock override", "Price change", "Refund"].map((action) => (
                  <span
                    key={action}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-5">
              <Tag>Security</Tag>
              <h3 className="mt-3 text-base font-bold text-neutral-900">Audit Logs &amp; Role-Based Access</h3>
              <p className="mt-2 text-sm text-neutral-500 leading-relaxed">
                Every critical action is timestamped and tied to a staff member.
                Role-based access via Supabase Auth means the right people see the
                right things — and nothing more.
              </p>
              <div className="mt-4 flex gap-3">
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  Admin &amp; staff roles
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Users className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  Full action history
                </div>
                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <RefreshCcw className="w-3.5 h-3.5 text-emerald-500" aria-hidden="true" />
                  Tamper-proof logs
                </div>
              </div>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}