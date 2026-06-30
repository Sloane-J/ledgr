// src/Landing/sections/Stats.tsx
import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Store,
  MapPin,
  Users,
  Clock,
  RotateCcw,
  PackageX,
  CreditCard,
} from "lucide-react";

// ─── Animation helpers ───────────────────────────────────────────────────────

const shouldReduceMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut", delay },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: shouldReduceMotion ? 0 : 0.07 } },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

interface BadgeProps {
  variant: "up" | "down" | "neutral" | "warning" | "danger";
  children: React.ReactNode;
}

const variantStyles: Record<BadgeProps["variant"], string> = {
  up: "bg-emerald-50 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium",
  down: "bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium",
  neutral: "bg-neutral-100 text-neutral-500 text-xs px-2 py-0.5 rounded-full font-medium",
  warning: "bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium",
  danger: "bg-red-50 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium",
};

function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 ${variantStyles[variant]}`}>
      {children}
    </span>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">
      {children}
    </span>
  );
}

function Metric({ value, className = "" }: { value: string; className?: string }) {
  return (
    <p className={`text-3xl font-bold tracking-tight text-neutral-900 mt-1 mb-2 ${className}`}>
      {value}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-neutral-200 my-4" />;
}

const barHeights = [20, 35, 25, 40, 38, 70, 85, 45, 50, 75, 40, 60];

function MiniBarChart() {
  return (
    <div className="flex items-end gap-[6px] mt-6" style={{ height: 48 }} aria-hidden="true">
      {barHeights.map((h, i) => {
        const isHighlighted = [5, 6, 9, 11].includes(i);
        return (
          <div
            key={i}
            className="flex-1 rounded-[2px]"
            style={{
              height: `${h}%`,
              background: isHighlighted ? "#7c3aed" : "#e5e5ea",
            }}
          />
        );
      })}
    </div>
  );
}

interface AuditRowProps {
  icon: React.ReactNode;
  label: string;
  sub: string;
  bgColor: string;
  iconColor: string;
}

function AuditRow({ icon, label, sub, bgColor, iconColor }: AuditRowProps) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-8 h-8 rounded-xl ${bgColor} ${iconColor} flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-900 leading-snug">{label}</p>
        <p className="text-xs text-neutral-400">{sub}</p>
      </div>
    </div>
  );
}

function PaymentRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-sm text-neutral-500">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} aria-hidden="true" />
        {label}
      </span>
      <span className="text-sm font-bold text-neutral-900">{value}</span>
    </div>
  );
}

const avatars = [
  { initials: "AT", bg: "#ede9fe", text: "#7c3aed" },
  { initials: "CR", bg: "#fae8ff", text: "#c026d3" },
  { initials: "JL", bg: "#d1fae5", text: "#059669" },
  { initials: "RA", bg: "#fef3c7", text: "#b45309" },
];

function AvatarStack() {
  return (
    <div className="flex items-center mt-4" aria-label="Recent new customers">
      {avatars.map(({ initials, bg, text }, i) => (
        <div
          key={initials}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: text, marginLeft: i === 0 ? 0 : -6, zIndex: avatars.length - i }}
          aria-hidden="true"
        >
          {initials}
        </div>
      ))}
      <div
        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold bg-neutral-100 text-neutral-500"
        style={{ marginLeft: -6, zIndex: 0 }}
        aria-hidden="true"
      >
        +20
      </div>
    </div>
  );
}

function StockRow({ name, count, variant }: { name: string; count: string; variant: "warning" | "danger" }) {
  const badgeStyle = variant === "danger" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700";
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-neutral-700 truncate pr-2">{name}</span>
      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${badgeStyle}`}>
        {count}
      </span>
    </div>
  );
}

interface BentoCardProps {
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

function BentoCard({ className = "", children, "aria-label": ariaLabel }: BentoCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-neutral-50/80 border border-neutral-200/80 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:shadow-lg hover:shadow-neutral-200/50 hover:border-neutral-300 transition-shadow duration-200 ${className}`}
      aria-label={ariaLabel}
    >
      <div>{children}</div>
    </motion.div>
  );
}

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 px-4 md:px-6 lg:px-8 bg-white" aria-labelledby="stats-heading">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          className="mb-10"
          ref={ref}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-violet-600 mb-2">
            Real-time insights
          </p>
          <h2
            id="stats-heading"
            className="text-2xl md:text-3xl font-bold text-neutral-900 mb-3 tracking-tight"
          >
            Everything you need to run your business
          </h2>
          <p className="text-neutral-500 text-sm md:text-base max-w-2xl">
            Live metrics, trend analysis, and transaction intelligence — all in one view.
          </p>
        </motion.div>

        {/* Bento grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Total sales */}
            <BentoCard className="sm:col-span-2" aria-label="Total sales summary">
              <div className="flex items-start justify-between">
                <CardLabel>Total sales</CardLabel>
                <Badge variant="up">
                  <TrendingUp className="w-3 h-3" aria-hidden="true" /> +12.6%
                </Badge>
              </div>
              <Metric value="₵21,500" />

              <div className="flex gap-8 mt-2">
                <div>
                  <p className="text-lg font-bold text-emerald-600 leading-none">₵12,000</p>
                  <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1.5">
                    <Store className="w-3 h-3" aria-hidden="true" /> Online store
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-violet-600 leading-none">₵9,500</p>
                  <p className="text-[11px] text-neutral-400 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3 h-3" aria-hidden="true" /> Walk-in / POS
                  </p>
                </div>
              </div>
              <MiniBarChart />
            </BentoCard>

            {/* Low stock */}
            <BentoCard aria-label="Low stock alerts">
              <div className="flex items-start justify-between mb-1">
                <CardLabel>Low stock alerts</CardLabel>
                <PackageX className="w-4 h-4 text-amber-500" aria-hidden="true" />
              </div>
              <p className="text-4xl font-bold text-amber-600 my-1">7</p>
              <div className="flex flex-col gap-2 mt-3">
                <StockRow name="Rice bags" count="2 left" variant="warning" />
                <StockRow name="Cooking oil" count="4 left" variant="warning" />
                <StockRow name="Receipt paper" count="0 left" variant="danger" />
              </div>
            </BentoCard>

            {/* New customers */}
            <BentoCard aria-label="New customer growth">
              <div className="flex items-start justify-between">
                <CardLabel>New customers</CardLabel>
                <Badge variant="up">+24</Badge>
              </div>
              <Metric value="169" />
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-violet-100 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }}
                    initial={{ width: 0 }}
                    animate={inView ? { width: "68%" } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-neutral-400">Monthly goal</span>
                  <span className="text-[11px] text-neutral-700 font-medium">68%</span>
                </div>
              </div>
              <AvatarStack />
            </BentoCard>
          </div>

          {/* Orders today */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <BentoCard className="h-full justify-between" aria-label="Orders today breakdown">
              <div>
                <div className="flex items-start justify-between">
                  <CardLabel>Orders today</CardLabel>
                  <Badge variant="up">+8%</Badge>
                </div>
                <Metric value="248" />

                <div className="flex flex-col gap-1.5 mt-4">
                  <PaymentRow color="#7c3aed" label="Cash" value="104" />
                  <PaymentRow color="#059669" label="Card" value="89" />
                  <PaymentRow color="#d97706" label="MoMo" value="55" />
                </div>
              </div>

              <div>
                <Divider />
                <div className="flex items-center gap-1.5 mb-2">
                  <RotateCcw className="w-3 h-3 text-neutral-400" aria-hidden="true" />
                  <CardLabel>Refunds</CardLabel>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold text-red-500">3</p>
                  <Badge variant="neutral">-1 vs yesterday</Badge>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* Audit log */}
          <BentoCard aria-label="Recent audit events">
            <CardLabel>Recent audit events</CardLabel>
            <div className="flex flex-col gap-4 mt-4">
              <AuditRow
                icon={<RotateCcw className="w-4 h-4" aria-hidden="true" />}
                label="Refund issued"
                sub="Alex Thomas · 14:45"
                bgColor="bg-red-50"
                iconColor="text-red-600"
              />
              <AuditRow
                icon={<PackageX className="w-4 h-4" aria-hidden="true" />}
                label="Stock override"
                sub="Riley Adams · 13:30"
                bgColor="bg-amber-50"
                iconColor="text-amber-700"
              />
              <AuditRow
                icon={<CreditCard className="w-4 h-4" aria-hidden="true" />}
                label="Price change"
                sub="Jordan Lee · 09:15"
                bgColor="bg-violet-50"
                iconColor="text-violet-600"
              />
            </div>
          </BentoCard>

          {/* Product reach */}
          <BentoCard className="md:col-span-2" aria-label="Product reach and category breakdown">
            <div className="flex items-start justify-between">
              <CardLabel>Product reach</CardLabel>
              <Badge variant="up">+32% vs last month</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-3xl font-bold text-neutral-900 tracking-tight">2,696</p>
                <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" aria-hidden="true" /> Product reach
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-neutral-900 tracking-tight">18</p>
                <p className="text-xs text-neutral-400 mt-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" aria-hidden="true" /> User queries
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { label: "Provisions", bg: "bg-violet-50", text: "text-violet-700" },
                { label: "Beverages", bg: "bg-emerald-50", text: "text-emerald-700" },
                { label: "Snacks", bg: "bg-amber-50", text: "text-amber-700" },
                { label: "Toiletries", bg: "bg-neutral-100", text: "text-neutral-600" },
                { label: "Stationery", bg: "bg-fuchsia-50", text: "text-fuchsia-700" },
              ].map(({ label, bg, text }) => (
                <span key={label} className={`text-[11px] font-semibold px-3 py-1 rounded-full ${bg} ${text}`}>
                  {label}
                </span>
              ))}
            </div>
          </BentoCard>
        </motion.div>
      </div>
    </section>
  );
}
