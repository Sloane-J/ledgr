// src/Landing/sections/DashboardPreview.tsx
import { useRef, useEffect, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Zap, RefreshCcw, Monitor } from "lucide-react";

interface Metric {
  value: string;
  label: string;
  delta: string;
  positive: boolean;
}

interface TickerItem {
  type: "sale" | "refund" | "stock";
  text: string;
}

const METRICS: Metric[] = [
  { value: "₵8,240", label: "Sales today", delta: "+14%", positive: true },
  { value: "126", label: "Orders", delta: "+8", positive: true },
  { value: "1,840", label: "Items in stock", delta: "-12", positive: false },
  { value: "4", label: "Staff active", delta: "", positive: true },
];

const TICKER_ITEMS: TickerItem[] = [
  { type: "sale", text: "Sale · ₵42.00 · Malt drink 330ml · 2 mins ago" },
  { type: "sale", text: "Sale · ₵115.00 · Bread × 3, Milk 1L · 4 mins ago" },
  { type: "refund", text: "Refund · ₵18.00 · Order #1042 · 6 mins ago" },
  { type: "stock", text: "Low stock · Milk 1L · 7 remaining" },
  { type: "sale", text: "Sale · ₵260.00 · Rice 5kg, Cooking Oil · 9 mins ago" },
  { type: "stock", text: "Low stock · Malt drink · 3 remaining" },
  { type: "sale", text: "Sale · ₵88.00 · Eggs × 2 trays · 11 mins ago" },
  { type: "refund", text: "Refund · ₵44.00 · Order #1039 · 15 mins ago" },
  { type: "sale", text: "Sale · ₵330.00 · Noodles × 10, Sugar 1kg · 18 mins ago" },
];

const VALUE_PROPS = [
  {
    icon: Zap,
    title: "Sale in under 10 seconds",
    desc: "Search, add to cart, collect payment — done before the next customer steps up.",
  },
  {
    icon: RefreshCcw,
    title: "Stock updates instantly",
    desc: "Every sale and refund adjusts inventory in real time. No manual counts needed.",
  },
  {
    icon: Monitor,
    title: "Works on any device",
    desc: "Tablet, laptop, or desktop — the interface adapts so your team can sell anywhere.",
  },
];

const tickerDot: Record<TickerItem["type"], string> = {
  sale: "bg-emerald-400",
  refund: "bg-red-400",
  stock: "bg-amber-400",
};

const DASHBOARD_IMG =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1400&q=80&auto=format&fit=crop";

const BG_DARK = "#0f0a1f"; // deep violet-black, not pure black

function Ticker({ items }: { items: TickerItem[] }) {
  const reduceMotion = useReducedMotion();
  const doubled = [...items, ...items];

  return (
    <div
      className="relative overflow-hidden border-y border-white/10 py-2.5"
      aria-label="Live activity feed"
      aria-live="off"
    >
      <div
        className="pointer-events-none absolute left-0 inset-y-0 w-16 z-10"
        style={{ background: `linear-gradient(to right, ${BG_DARK}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute right-0 inset-y-0 w-16 z-10"
        style={{ background: `linear-gradient(to left, ${BG_DARK}, transparent)` }}
      />

      <motion.div
        className="flex gap-10 w-max"
        animate={reduceMotion ? {} : { x: ["0%", "-50%"] }}
        transition={reduceMotion ? {} : { duration: 32, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            className="flex items-center gap-2 text-[12px] text-white/50 whitespace-nowrap font-medium"
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${tickerDot[item.type]}`}
              aria-hidden="true"
            />
            {item.text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function AnimatedValue({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView) return;
    if (reduceMotion) { setDisplay(value); return; }

    const numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
    const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
    const suffix = value.match(/[^0-9.]*$/)?.[0] ?? "";
    const isInt = !value.includes(".");

    const duration = 900;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numeric;
      setDisplay(
        `${prefix}${isInt ? Math.round(current).toLocaleString() : current.toFixed(2)}${suffix}`
      );
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, reduceMotion]);

  return <span ref={ref}>{display || value}</span>;
}

export default function DashboardPreview() {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative py-0 overflow-hidden"
      aria-labelledby="preview-heading"
      style={{ background: BG_DARK }}
    >
      {/* Soft violet glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20"
        style={{ background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)" }}
      />

      <Ticker items={TICKER_ITEMS} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20">

        {/* Headline + metrics row */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10 mb-14">

          <div className="max-w-lg">
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.45, delay: 0.05 }}
              className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: "#a78bfa" }}
            >
              Dashboard Preview
            </motion.p>
            <motion.h2
              id="preview-heading"
              initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.1]"
            >
              Your entire business, one screen
            </motion.h2>
            <motion.p
              initial={reduceMotion ? {} : { opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.18 }}
              className="mt-4 text-base text-white/40 leading-relaxed"
            >
              From ringing up a sale to reviewing yesterday's revenue — Ledgr
              puts every tool your team needs in one fast, no-clutter interface.
            </motion.p>
          </div>

          <motion.div
            initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 lg:min-w-[280px]"
          >
            {METRICS.map((m) => (
              <div
                key={m.label}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col gap-0.5 hover:bg-white/[0.07] transition-colors duration-200"
              >
                <span className="text-xl font-bold text-white tracking-tight">
                  <AnimatedValue value={m.value} />
                </span>
                <span className="text-[11px] text-white/40">{m.label}</span>
                {m.delta && (
                  <span className={`text-[11px] font-semibold mt-0.5 ${m.positive ? "text-emerald-400" : "text-red-400"}`}>
                    {m.delta} vs yesterday
                  </span>
                )}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Browser mockup */}
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 32, scale: 0.98 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
        >
          <div className="rounded-t-2xl border border-b-0 border-white/10 bg-white/5 px-5 pt-4 pb-0">
            <div className="flex items-center gap-2 mb-4" aria-hidden="true">
              <span className="w-3 h-3 rounded-full bg-red-500/60 block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60 block" />
              <span className="w-3 h-3 rounded-full bg-green-500/60 block" />
              <div className="flex gap-1 ml-3">
                {["Register", "Dashboard", "Inventory"].map((tab, i) => (
                  <span
                    key={tab}
                    className="text-[11px] px-3 py-1 rounded-t-lg font-medium"
                    style={
                      i === 0
                        ? { background: "rgba(124,58,237,0.25)", color: "#e9d5ff" }
                        : { color: "rgba(255,255,255,0.3)" }
                    }
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <div className="flex-1 ml-2 h-6 rounded-md bg-white/[0.08] border border-white/10 flex items-center px-3">
                <span className="text-[10px] text-white/30 truncate">
                  ledgr-xi.vercel.app/app/register
                </span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-b-2xl border border-white/10">
            <img
              src={DASHBOARD_IMG}
              alt="Ledgr POS register and dashboard interface"
              className="w-full object-cover object-top"
              style={{ maxHeight: "520px" }}
              loading="lazy"
              decoding="async"
            />
            <div
              className="pointer-events-none absolute bottom-0 inset-x-0 h-28"
              aria-hidden="true"
              style={{ background: `linear-gradient(to top, ${BG_DARK} 0%, transparent 100%)` }}
            />
          </div>
        </motion.div>

        {/* Value props */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {VALUE_PROPS.map((vp, i) => {
            const Icon = vp.icon;
            return (
              <motion.div
                key={vp.title}
                initial={reduceMotion ? {} : { opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.38 + i * 0.08 }}
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-4 flex gap-4 items-start hover:bg-white/[0.07] hover:border-white/20 transition-all duration-200"
              >
                <div
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(79,70,229,0.3))" }}
                >
                  <Icon className="w-4 h-4 text-violet-300" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{vp.title}</p>
                  <p className="mt-1 text-xs text-white/40 leading-relaxed">{vp.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <Ticker items={[...TICKER_ITEMS].reverse()} />
    </section>
  );
}
