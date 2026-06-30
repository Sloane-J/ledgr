// src/Landing/sections/CTA.tsx
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";

const receiptLines = [
  { label: "REGISTER", value: "READY" },
  { label: "INVENTORY", value: "SYNCED" },
  { label: "STAFF", value: "2 ACTIVE" },
  { label: "MOMO / CARD / CASH", value: "ONLINE" },
];

export default function CTA() {
  return (
    <section
      className="relative min-h-screen flex items-center py-24 overflow-hidden select-none"
      style={{ backgroundColor: "#171717" }}
    >
      {/* Signature backdrop: radial spotlight + faint diagonal rules */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.06), transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, white 0px, white 1px, transparent 1px, transparent 90px)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(25deg, white 0px, white 1px, transparent 1px, transparent 90px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-7"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 mb-4 flex items-center gap-2">
              <Zap className="w-3 h-3 text-white fill-current" /> Ready when
              you are
            </h2>
            <p className="text-4xl sm:text-6xl font-bold tracking-tighter text-white leading-[1.05]">
              Run your shop on
              <br />
              one screen, not five.
            </p>
            <p className="text-base sm:text-lg text-neutral-400 mt-6 max-w-lg leading-relaxed">
              Set up your first register in minutes. No hardware required to
              start, no contracts, no surprises at month end.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <motion.a
                href="#get-started"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="group inline-flex items-center gap-2 bg-white text-neutral-950 text-sm font-bold px-7 py-4 rounded-xl"
              >
                Start free
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </motion.a>
              <a
                href="#contact"
                className="text-sm font-semibold text-neutral-300 hover:text-white transition-colors px-2 py-4"
              >
                Talk to the team
              </a>
            </div>

            <p className="mt-7 text-[11px] text-neutral-500 font-mono">
              No card required &middot; Works on any device &middot; Ghana-based
              support
            </p>
          </motion.div>

          {/* Right: Receipt-styled signature element */}
          <motion.div
            initial={{ opacity: 0, y: 32, rotate: -2 }}
            whileInView={{ opacity: 1, y: 0, rotate: -2 }}
            whileHover={{ rotate: 0, y: -4 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-12 lg:col-span-5"
          >
            <div className="bg-white rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.5)] p-6 sm:p-7 font-mono text-neutral-900 max-w-sm mx-auto">
              <div className="flex items-center justify-between border-b border-dashed border-neutral-300 pb-3 mb-3">
                <span className="text-xs font-bold tracking-widest">
                  LEDGR
                </span>
                <span className="text-[10px] text-neutral-400">
                  SYSTEM STATUS
                </span>
              </div>

              <div className="space-y-2.5">
                {receiptLines.map((line, i) => (
                  <motion.div
                    key={line.label}
                    initial={{ opacity: 0, x: -8 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.15 + i * 0.08, duration: 0.4 }}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-neutral-500">{line.label}</span>
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-900" />
                      {line.value}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-dashed border-neutral-300 mt-4 pt-3 flex items-center justify-between text-[10px] text-neutral-400">
                <span>TODAY&apos;S REVENUE</span>
                <span className="text-neutral-900 font-bold text-xs">
                  GH&#8373; 4,820.00
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
