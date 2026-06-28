import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";

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
  up: "bg-[#e6f4ea] text-[#137333] text-xs px-2 py-0.5 rounded-md font-medium",
  down: "bg-[#fce8e6] text-[#c5221f] text-xs px-2 py-0.5 rounded-md font-medium",
  neutral: "bg-[#f1f3f4] text-[#5f6368] text-xs px-2 py-0.5 rounded-md font-medium",
  warning: "bg-[#fef7e0] text-[#b06000] text-xs px-2 py-0.5 rounded-md font-medium",
  danger: "bg-[#fce8e6] text-[#c5221f] text-xs px-2 py-0.5 rounded-md font-medium",
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
    <span className="text-[11px] font-bold uppercase tracking-wider text-[#5f6368]">
      {children}
    </span>
  );
}

function Metric({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  return (
    <p
      className={`text-3xl font-bold tracking-tight text-[#202124] mt-1 mb-2 ${className}`}
    >
      {value}
    </p>
  );
}

function Divider() {
  return <div className="h-px bg-[#dadce0] my-4" />;
}

const barHeights = [20, 35, 25, 40, 38, 70, 85, 45, 50, 75, 40, 60];

function MiniBarChart() {
  return (
    <div
      className="flex items-end gap-[6px] mt-6"
      style={{ height: 48 }}
      aria-hidden="true"
    >
      {barHeights.map((h, i) => {
        const isHighlighted = [5, 6, 9, 11].includes(i);
        return (
          <div
            key={i}
            className="flex-1 rounded-[2px]"
            style={{
              height: `${h}%`,
              background: isHighlighted ? "#1a73e8" : "#dadce0",
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
        className={`w-8 h-8 rounded-lg ${bgColor} ${iconColor} flex items-center justify-center flex-shrink-0`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-[#202124] leading-snug">
          {label}
        </p>
        <p className="text-xs text-[#5f6368]">{sub}</p>
      </div>
    </div>
  );
}

function PaymentRow({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="flex items-center gap-2 text-sm text-[#5f6368]">
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: color }}
          aria-hidden="true"
        />
        {label}
      </span>
      <span className="text-sm font-bold text-[#202124]">
        {value}
      </span>
    </div>
  );
}

const avatars = [
  { initials: "AT", bg: "#e8f0fe", text: "#1a73e8" },
  { initials: "CR", bg: "#f3e8fd", text: "#a142f4" },
  { initials: "JL", bg: "#e6f4ea", text: "#137333" },
  { initials: "RA", bg: "#fef7e0", text: "#b06000" },
];

function AvatarStack() {
  return (
    <div className="flex items-center mt-4" aria-label="Recent new customers">
      {avatars.map(({ initials, bg, text }, i) => (
        <div
          key={initials}
          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold"
          style={{
            background: bg,
            color: text,
            marginLeft: i === 0 ? 0 : -6,
            zIndex: avatars.length - i,
          }}
          aria-hidden="true"
         >
          {initials}
        </div>
      ))}
      <div
        className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[9px] font-bold bg-[#f1f3f4] text-[#5f6368]"
        style={{ marginLeft: -6, zIndex: 0 }}
        aria-hidden="true"
      >
        +20
      </div>
    </div>
  );
}

function StockRow({
  name,
  count,
  variant,
}: {
  name: string;
  count: string;
  variant: "warning" | "danger";
}) {
  const badgeStyle = variant === "danger"
    ? "bg-[#fce8e6] text-[#c5221f]"
    : "bg-[#fef7e0] text-[#b06000]";

  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-[#202124] truncate pr-2">
        {name}
      </span>
      <span
        className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${badgeStyle}`}
      >
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
      className={`bg-[#f8f9fa] border border-[#dadce0] rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between ${className}`}
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
    <section
      className="py-16 px-4 md:px-6 lg:px-8 bg-white"
      aria-labelledby="stats-heading"
    >
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          className="mb-8"
          ref={ref}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-[#1a73e8] mb-1">
            Real-time insights
          </p>
          <h2
            id="stats-heading"
            className="text-2xl md:text-3xl font-bold text-[#202124] mb-2 tracking-tight"
          >
            Everything you need to run your business
          </h2>
          <p className="text-[#5f6368] text-sm md:text-base max-w-2xl font-normal">
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

            {/* 1. Total sales */}
            <BentoCard
              className="sm:col-span-2"
              aria-label="Total sales summary"
            >
              <div className="flex items-start justify-between">
                <CardLabel>Total sales</CardLabel>
                <Badge variant="up">
                  <span className="text-[10px]">↗</span> +12.6%
                </Badge>
              </div>
              <Metric value="$2,150.00" />

              <div className="flex gap-8 mt-2">
                <div>
                  <p className="text-lg font-bold text-[#137333] leading-none">
                    $120k
                  </p>
                  <p className="text-[11px] text-[#5f6368] mt-1 flex items-center gap-1">
                    <span className="text-[10px]">🏢</span> Online store
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#c5221f] leading-none">
                    $20k
                  </p>
                  <p className="text-[11px] text-[#5f6368] mt-1 flex items-center gap-1">
                    <span className="text-[10px]">📍</span> Walk-in / POS
                  </p>
                </div>
              </div>
              <MiniBarChart />
            </BentoCard>

            {/* 3. Low stock */}
            <BentoCard aria-label="Low stock alerts">
              <div className="flex items-start justify-between mb-1">
                <CardLabel>Low stock alerts</CardLabel>
              </div>
              <p className="text-4xl font-bold text-[#b06000] my-1">7</p>
              <div className="flex flex-col gap-2 mt-3">
                <StockRow name="Espresso beans" count="2 left" variant="warning" />
                <StockRow name="Oat milk" count="4 left" variant="warning" />
                <StockRow name="Receipt paper" count="0 left" variant="danger" />
              </div>
            </BentoCard>

            {/* 4. New customers */}
            <BentoCard aria-label="New customer growth">
              <div className="flex items-start justify-between">
                <CardLabel>New customers</CardLabel>
                <Badge variant="up">+24</Badge>
              </div>
              <Metric value="169" />
              <div className="mt-2">
                <div className="h-1.5 rounded-full bg-[#e8f0fe] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-[#1a73e8]"
                    initial={{ width: 0 }}
                    animate={inView ? { width: "68%" } : { width: 0 }}
                    transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    aria-hidden="true"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[11px] text-[#5f6368]">
                    Monthly goal
                  </span>
                  <span className="text-[11px] text-[#202124] font-medium">
                    68%
                  </span>
                </div>
              </div>
              <AvatarStack />
            </BentoCard>
          </div>

          {/* Right Column Context */}
          <div className="md:col-span-1 flex flex-col gap-4">

            {/* 2. Orders today & Refunds container */}
            <BentoCard
              className="h-full justify-between"
              aria-label="Orders today breakdown"
            >
              <div>
                <div className="flex items-start justify-between">
                  <CardLabel>Orders today</CardLabel>
                  <Badge variant="up">+8%</Badge>
                </div>
                <Metric value="248" />

                <div className="flex flex-col gap-1.5 mt-4">
                  <PaymentRow color="#1a73e8" label="Cash" value="104" />
                  <PaymentRow color="#137333" label="Card" value="89" />
                  <PaymentRow color="#b06000" label="MoMo" value="55" />
                </div>
              </div>

              <div>
                <Divider />
                <CardLabel>Refunds</CardLabel>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-2xl font-bold text-[#c5221f]">
                    3
                  </p>
                  <Badge variant="neutral">-1 vs yesterday</Badge>
                </div>
              </div>
            </BentoCard>
          </div>

          {/* 5. Audit log */}
          <BentoCard aria-label="Recent audit events">
            <CardLabel>Recent audit events</CardLabel>
            <div className="flex flex-col gap-4 mt-4">
              <AuditRow
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                  </svg>
                }
                label="Refund issued"
                sub="Alex Thomas · 14:45"
                bgColor="bg-[#fce8e6]"
                iconColor="text-[#c5221f]"
              />
              <AuditRow
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                }
                label="Stock override"
                sub="Riley Adams · 13:30"
                bgColor="bg-[#fef7e0]"
                iconColor="text-[#b06000]"
              />
              <AuditRow
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                label="Price change"
                sub="Jordan Lee · 09:15"
                bgColor="bg-[#e8f0fe]"
                iconColor="text-[#1a73e8]"
              />
            </div>
          </BentoCard>

          {/* 6. Product reach */}
          <BentoCard
            className="md:col-span-2"
            aria-label="Product reach and category breakdown"
          >
            <div className="flex items-start justify-between">
              <CardLabel>Product reach</CardLabel>
              <Badge variant="up">+32% vs last month</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-3xl font-bold text-[#202124] tracking-tight">
                  2,696
                </p>
                <p className="text-xs text-[#5f6368] mt-1 flex items-center gap-1">
                  <span className="text-[11px]">👥</span> Product reach
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-[#202124] tracking-tight">
                  18
                </p>
                <p className="text-xs text-[#5f6368] mt-1 flex items-center gap-1">
                  <span className="text-[11px]">🕒</span> User queries
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-6">
              {[
                { label: "Electronics", bg: "bg-[#e8f0fe]", text: "text-[#1a73e8]" },
                { label: "Beverages", bg: "bg-[#e6f4ea]", text: "text-[#137333]" },
                { label: "Snacks", bg: "bg-[#fef7e0]", text: "text-[#b06000]" },
                { label: "Accessories", bg: "bg-[#f1f3f4]", text: "text-[#5f6368]" },
                { label: "Stationery", bg: "bg-[#f3e8fd]", text: "text-[#a142f4]" },
              ].map(({ label, bg, text }) => (
                <span
                  key={label}
                  className={`text-[11px] font-semibold px-3 py-1 rounded-full ${bg} ${text}`}
                >
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
