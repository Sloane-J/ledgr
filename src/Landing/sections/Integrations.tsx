// src/Landing/sections/Integrations.tsx
import { motion } from "framer-motion";
import {
  Smartphone,
  Printer,
  Barcode,
  Database,
  CreditCard,
  Zap,
} from "lucide-react";

const integrations = [
  {
    icon: <Smartphone className="w-5 h-5" />,
    name: "Mobile Money",
    desc: "MTN, Telecel, and AirtelTigo — STK push or pay-to-account confirmation at checkout.",
  },
  {
    icon: <Printer className="w-5 h-5" />,
    name: "80mm Thermal Printers",
    desc: "Standard receipt printers work out of the box, no driver configuration required.",
  },
  {
    icon: <Barcode className="w-5 h-5" />,
    name: "USB &amp; Bluetooth Scanners",
    desc: "Plug in any standard barcode scanner — it types straight into the register search.",
  },
  {
    icon: <CreditCard className="w-5 h-5" />,
    name: "Card Terminals",
    desc: "Confirm card payments against your existing terminal with an optional reference number.",
  },
  {
    icon: <Database className="w-5 h-5" />,
    name: "Supabase",
    desc: "Your data lives in a secure PostgreSQL database with row-level security baked in.",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Integrations() {
  return (
    <section
      id="integrations"
      className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
            <Zap className="w-3 h-3 text-neutral-900 fill-current" /> Works
            with what you already have
          </h2>
          <p className="text-3xl sm:text-5xl font-bold tracking-tighter text-neutral-900">
            No new hardware
            <br />
            required to start.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
        >
          {integrations.map((item) => (
            <motion.div
              key={item.name}
              variants={cardVariants}
              whileHover={{ y: -3 }}
              transition={{ type: "spring", stiffness: 300, damping: 22 }}
              className="bg-neutral-50 border border-neutral-200/80 rounded-3xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200 flex items-center justify-center text-neutral-900 mb-5 shadow-sm">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-neutral-900 tracking-tight">
                {item.name}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
