// src/Landing/sections/Features.tsx
import { motion } from "framer-motion";
import {
  Keyboard,
  Layers,
  History,
  Maximize2,
  Zap,
  Printer,
  Barcode,
  AlertTriangle,
} from "lucide-react";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

const headerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

function FeatureCard({
  className,
  icon,
  title,
  description,
  children,
}: {
  className: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={`bg-neutral-50 border border-neutral-200/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between group ${className}`}
    >
      <div>
        <motion.div
          whileHover={{ scale: 1.06, rotate: -2 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 mb-6 shadow-sm"
        >
          {icon}
        </motion.div>
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
          {description}
        </p>
      </div>
      {children}
    </motion.div>
  );
}

export default function Features() {
  return (
    <section
      id="features"
      className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.6 }}
          variants={headerVariants}
          className="max-w-3xl text-left mb-16"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3 text-neutral-900 fill-current" /> System
            Architecture
          </h2>
          <p className="text-3xl sm:text-5xl font-bold tracking-tighter text-neutral-900">
            Built for high-volume retail operations.
            <br />
            Every system, unified.
          </p>
        </motion.div>

        {/* Asymmetric Bento Grid Layout */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={containerVariants}
          className="grid grid-cols-12 gap-4 lg:gap-6"
        >

          {/* Card 1: Keyboard-First Register (Hero Card - 7 Columns) */}
          <FeatureCard
            className="col-span-12 lg:col-span-7"
            icon={<Keyboard className="w-5 h-5" />}
            title="Keyboard-First Register Terminal"
            description="Engineered to handle dense storefront checkouts with zero touch latency. Cashiers can run complete checkout cycles using native hotkeys without touching a mouse."
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-8 border border-neutral-200 bg-white rounded-xl p-3 space-y-2 text-[11px] font-mono"
            >
              <div className="flex justify-between text-neutral-400 border-b border-neutral-100 pb-1.5">
                <span>COMMAND / SKU</span>
                <span>ACTION</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-medium">
                <span>
                  <kbd className="bg-neutral-100 px-1 border rounded text-[10px]">
                    {" "}
                    /{" "}
                  </kbd>{" "}
                  focus search
                </span>
                <span className="text-neutral-400">Instant SKU Lookup</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-medium">
                <span>
                  <kbd className="bg-neutral-100 px-1 border rounded text-[10px]">
                    F2
                  </kbd>{" "}
                  pay split
                </span>
                <span className="text-neutral-400">Route Multi-Payment</span>
              </div>
              <div className="flex justify-between text-neutral-900 font-medium">
                <span>
                  <kbd className="bg-neutral-100 px-1 border rounded text-[10px]">
                    F4
                  </kbd>{" "}
                  suspend
                </span>
                <span className="text-neutral-400">Hold Active Cart</span>
              </div>
            </motion.div>
          </FeatureCard>

          {/* Card 2: Multi-Category Stock Matrix (5 Columns) */}
          <FeatureCard
            className="col-span-12 lg:col-span-5"
            icon={<Layers className="w-5 h-5" />}
            title="Granular Stock Ecosystem"
            description="Track thousands of products across custom retail categories, wholesale batch groups, and multi-location physical inventories with instant sync."
          >
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "100% Live", sub: "Reconciliation" },
                { label: "Cost-Avg", sub: "Profit Metrics" },
              ].map((m) => (
                <motion.div
                  key={m.label}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white border border-neutral-200 rounded-xl p-3 text-center"
                >
                  <div className="text-xs font-bold text-neutral-900">
                    {m.label}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    {m.sub}
                  </div>
                </motion.div>
              ))}
            </div>
          </FeatureCard>

          {/* Card 3: Unalterable Audit Ledger (4 Columns) */}
          <FeatureCard
            className="col-span-12 md:col-span-6 lg:col-span-4"
            icon={<History className="w-5 h-5" />}
            title="Unalterable Audit Trail"
            description="Log every single transaction adjustment, manual price edit, or cart row removal with precise staff identity ties to completely block internal revenue leakages."
          >
            <div className="mt-6 border-t border-neutral-200/60 pt-4 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>System Integrity Status</span>
              <span className="text-neutral-950 font-bold flex items-center gap-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-1.5 h-1.5 rounded-full bg-neutral-900"
                />
                Secure
              </span>
            </div>
          </FeatureCard>

          {/* Card 4: Hardware Compatibility Layer (4 Columns) */}
          <FeatureCard
            className="col-span-12 md:col-span-6 lg:col-span-4"
            icon={<Barcode className="w-5 h-5" />}
            title="Native Hardware Layer"
            description="Plug and play with legacy systems. Built-in routing profiles support standard 80mm thermal receipt dispatchers and barcode triggers straight out of the box."
          >
            <div className="mt-6 flex items-center gap-4 text-neutral-400">
              <Printer className="w-4 h-4 text-neutral-900" />
              <div className="h-px bg-neutral-200 grow" />
              <Maximize2 className="w-4 h-4 text-neutral-900" />
            </div>
          </FeatureCard>

          {/* Card 5: Real-Time Alerts & Multi-Staff Profiles (4 Columns) */}
          <FeatureCard
            className="col-span-12 lg:col-span-4"
            icon={<AlertTriangle className="w-5 h-5" />}
            title="Batch Expiry Tracking"
            description="Ideal for pharmacies and grocery chains. Automated proximity tags alert your management dashboards weeks before stock batches reach expiration points."
          >
            <div className="mt-6 flex gap-2">
              <span className="px-2 py-1 border border-neutral-200 bg-white text-[10px] font-bold text-neutral-700 rounded-md">
                Multi-Staff Accounts
              </span>
              <span className="px-2 py-1 border border-neutral-200 bg-white text-[10px] font-bold text-neutral-700 rounded-md">
                Shift Reports
              </span>
            </div>
          </FeatureCard>
        </motion.div>
      </div>
    </section>
  );
}
