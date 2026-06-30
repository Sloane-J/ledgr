// src/Landing/sections/Hero.tsx
import { motion } from "framer-motion";
import { ArrowRight, Play, Layers } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 bg-white overflow-hidden select-none">
      {/* Decorative dashed orbit paths */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1200 1100"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <path
          d="M50 250 C 300 50, 700 50, 1000 200"
          stroke="#e5e5e5"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M100 600 C 400 800, 800 850, 1150 550"
          stroke="#e5e5e5"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>

      {/* Floating decorative dots */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-16 left-[12%] w-3 h-3 rounded-full bg-neutral-300 hidden md:block"
      />
      <motion.div
        animate={{ y: [0, 12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute top-28 right-[8%] w-2.5 h-2.5 rounded-full bg-neutral-900 hidden md:block"
      />
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-72 left-[4%] w-20 h-20 rounded-full bg-neutral-100 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 18, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[32rem] right-[3%] w-24 h-24 rounded-full bg-neutral-100 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, -16, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        className="absolute bottom-40 left-[10%] w-16 h-16 rounded-full bg-neutral-100 hidden lg:block"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-24 right-[14%] w-2.5 h-2.5 rounded-full bg-neutral-900 hidden md:block"
      />

      {/* Structural Minimal Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">

        {/* Minimal Sub-Badge Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200/80 px-3 py-1 rounded-full mb-6"
        >
          <Layers className="w-3.5 h-3.5 text-neutral-900" />
          <span className="text-[11px] font-medium tracking-wider uppercase text-neutral-600">
            Next-Gen Retail Management Operating System
          </span>
        </motion.div>

        {/* Premium Massive Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-neutral-900 max-w-4xl block leading-[1.05]"
        >
          Go beyond traditional POS.<br />Manage your entire operation.
        </motion.h1>

        {/* Supporting Context Text */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-base sm:text-lg text-neutral-500 max-w-2xl font-normal leading-relaxed"
        >
          A unified system built for speed, reliability, and scale. Engineered for retailers,
          wholesalers, pharmacies, and supermarkets to track sales, live inventory, and multi-staff accounts from one interface.
        </motion.p>

        {/* Action Controls Group */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4"
        >
          <a
            href="mailto:samueldorkeyjr@gmail.com?subject=Ledgr Demo Request"
            className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-6 h-12 text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 transition-all duration-150 rounded-full shadow-sm shadow-neutral-950/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
          >
            Request Custom Demo
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 h-12 text-sm font-semibold text-neutral-600 border border-neutral-200 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <Play className="w-3.5 h-3.5 fill-current shrink-0" />
            Explore Workflows
          </a>
        </motion.div>

        {/* Big Floating Dashboard Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-6xl mt-20 sm:mt-24 relative px-2 sm:px-0"
        >
          {/* Floating customer avatar cards around the image */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="hidden md:flex absolute -left-6 lg:-left-12 top-14 items-center gap-3 bg-white border border-neutral-200 shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-xl px-3 py-2.5 z-20"
          >
            <img
              src="https://i.pravatar.cc/80?img=12"
              alt="Customer"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900 leading-tight">Akosua Boateng</div>
              <div className="text-[10px] text-neutral-500 leading-tight">Owner, Boateng Mart</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 14, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="hidden md:flex absolute -right-4 lg:-right-10 top-1/3 items-center gap-3 bg-white border border-neutral-200 shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-xl px-3 py-2.5 z-20"
          >
            <img
              src="https://i.pravatar.cc/80?img=33"
              alt="Customer"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900 leading-tight">Kwame Asante</div>
              <div className="text-[10px] text-neutral-500 leading-tight">Manager, Asante Wholesale</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="hidden lg:flex absolute -left-4 bottom-16 items-center gap-3 bg-white border border-neutral-200 shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-xl px-3 py-2.5 z-20"
          >
            <img
              src="https://i.pravatar.cc/80?img=47"
              alt="Customer"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900 leading-tight">Efua Mensah</div>
              <div className="text-[10px] text-neutral-500 leading-tight">Pharmacist, Mensah Pharmacy</div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="hidden lg:flex absolute -right-6 bottom-28 items-center gap-3 bg-white border border-neutral-200 shadow-[0_12px_30px_rgba(0,0,0,0.08)] rounded-xl px-3 py-2.5 z-20"
          >
            <img
              src="https://i.pravatar.cc/80?img=56"
              alt="Customer"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="text-left">
              <div className="text-xs font-bold text-neutral-900 leading-tight">David Owusu</div>
              <div className="text-[10px] text-neutral-500 leading-tight">CEO, Owusu Retail Group</div>
            </div>
          </motion.div>

          {/* Subtle Outer Border Frame Wrap - real product photo, tall showcase */}
          <div className="relative bg-white border border-neutral-300/90 rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.1)] p-2 sm:p-3 overflow-hidden">

            {/* Top Minimal Browser Window Bar Actions */}
            <div className="h-7 w-full flex items-center justify-between px-3 border-b border-neutral-100 mb-2 sm:mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-neutral-200" />
              </div>
              <div className="bg-neutral-50 px-6 py-0.5 border border-neutral-200/60 rounded text-[10px] font-medium tracking-tight text-neutral-400 select-none">
                ledgr-xi.vercel.app/dashboard
              </div>
              <div className="w-10" />
            </div>

            <div className="w-full rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50">
              <img
                src="/images/admin-dashboard.webp"
                alt="Ledgr POS dashboard showing live sales, inventory, and transaction data"
                className="w-full h-[480px] sm:h-[600px] lg:h-[720px] object-cover"
                loading="eager"
              />
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
