import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const TRUST_BADGES = [
  "Cash, Card & MoMo payments",
  "Real-time stock tracking",
  "Role-based staff access",
];

// Unsplash POS/retail dashboard image — replace with actual app screenshot
const DASHBOARD_IMG_URL =
  "/images/admin-dashboard.jpg";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
});

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6, delay },
});

export default function Hero() {
  const reduceMotion = useReducedMotion();

  const motionProps = (delay = 0) => (reduceMotion ? {} : fadeUp(delay));

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-start pt-28 pb-0 overflow-hidden bg-white"
      aria-labelledby="hero-heading"
    >
      {/* Subtle grid background */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(to right, #f0f0f0 1px, transparent 1px),
            linear-gradient(to bottom, #f0f0f0 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      {/* Fade grid toward center */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 70%, #fff 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-4xl mx-auto w-full">

        {/* Category pill */}
        <motion.div {...motionProps(0)} className="mb-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-200 bg-white text-[13px] font-medium text-neutral-600 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            POS &amp; Inventory — built for retail, cafes &amp; small shops
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          id="hero-heading"
          {...motionProps(0.1)}
          className="text-4xl sm:text-5xl lg:text-[62px] font-bold tracking-tight text-neutral-900 leading-[1.1] mb-5"
        >
          Supercharge your sales and Inventory with Ledgr POS.{" "}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...motionProps(0.18)}
          className="max-w-xl text-base sm:text-lg text-neutral-500 leading-relaxed mb-8"
        >
          A modern Point of Sale and Inventory Management system that handles sales, tracks stock in real time, and keeps your team accountable — all from one fast, reliable interface.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...motionProps(0.26)}
          className="flex flex-col sm:flex-row items-center gap-3 mb-8"
        >
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Open the register
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </a>
          <a
            href="#features"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            See all features
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.ul
          {...motionProps(0.34)}
          className="flex flex-wrap justify-center gap-x-5 gap-y-2 mb-12"
          role="list"
        >
          {TRUST_BADGES.map((badge) => (
            <li
              key={badge}
              className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium"
            >
              <CheckCircle2
                className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
                aria-hidden="true"
              />
              {badge}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Dashboard mockup */}
      <motion.div
        {...(reduceMotion ? {} : fadeIn(0.45))}
        className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6"
      >
        {/* Browser chrome */}
        <div className="rounded-t-xl border border-b-0 border-neutral-200 bg-neutral-100 px-4 pt-3 pb-0 shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-1.5 mb-3" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-red-400 block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 block" />
            <span className="w-3 h-3 rounded-full bg-green-400 block" />
            <div className="flex-1 ml-3 mr-1 h-5 rounded bg-white border border-neutral-200 flex items-center px-2">
              <span className="text-[10px] text-neutral-400 truncate">
                ledgr.app/register
              </span>
            </div>
          </div>
        </div>

        {/* Screenshot */}
        <div className="relative overflow-hidden rounded-b-xl border border-neutral-200 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.15)]">
          <img
            src={DASHBOARD_IMG_URL}
            alt="Ledgr POS interface showing the sales register and inventory dashboard — replace with actual app screenshot"
            className="w-full object-cover object-top"
            style={{ maxHeight: "480px" }}
            loading="eager"
            decoding="async"
          />
          {/* Bottom fade into white */}
          <div
            className="pointer-events-none absolute bottom-0 inset-x-0 h-24"
            aria-hidden="true"
            style={{
              background: "linear-gradient(to top, #fff 0%, transparent 100%)",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
