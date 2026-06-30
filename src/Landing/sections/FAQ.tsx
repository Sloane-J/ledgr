// src/Landing/sections/FAQ.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    q: "Does Ledgr work without a barcode scanner?",
    a: "Yes. Scanners are supported out of the box with zero setup, but the register is fully keyboard and click friendly too — search products with “/”, browse by category, and check out with F2 if you don't have hardware yet.",
  },
  {
    q: "Can I use Ledgr on a phone or tablet, or do I need a dedicated till?",
    a: "Ledgr runs in the browser and adapts to any screen — desktop, tablet, or phone. It's also installable as a PWA, so it sits on your home screen and opens like a native app.",
  },
  {
    q: "How does Mobile Money work at checkout?",
    a: "At payment, choose MoMo and either send an STK prompt straight to the customer's phone or confirm a pay-to-account transfer once funds land. Either way it's recorded against the order automatically.",
  },
  {
    q: "What happens to my stock when an order is refunded or voided?",
    a: "Refunds restore stock automatically and mark the order as refunded. Voids require a reason and are logged. Both actions appear in the audit trail with the staff member responsible.",
  },
  {
    q: "Can my staff see everything I see?",
    a: "No. Staff accounts are restricted to Register, Orders, Customers, Profile, and Settings. Reports, inventory edits, supplier data, and approvals stay with Admin. New staff need Admin approval before they get access at all.",
  },
  {
    q: "Is my data safe if I'm sharing one account across a busy counter?",
    a: "Every critical action — stock overrides, refunds, voids, price changes, approvals — is logged with a timestamp and the staff member who did it, backed by Supabase Row Level Security. You always know who did what.",
  },
  {
    q: "Do I need internet to use the register?",
    a: "Ledgr is built on Supabase and syncs in real time, so a stable connection is recommended for live stock and multi-device accuracy. We're actively expanding offline resilience for unstable connections.",
  },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

function FAQItem({
  q,
  a,
  isOpen,
  onClick,
}: {
  q: string;
  a: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="border border-neutral-200/80 rounded-2xl bg-neutral-50 overflow-hidden"
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:outline-offset-[-2px]"
        aria-expanded={isOpen}
      >
        <span className="text-sm sm:text-base font-semibold text-neutral-900 tracking-tight">
          {q}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0 w-7 h-7 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-900"
        >
          <Plus className="w-3.5 h-3.5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-neutral-500 leading-relaxed max-w-2xl">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-24 bg-white border-t border-neutral-100 relative overflow-hidden select-none"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl mb-16"
        >
          <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 flex items-center gap-2">
            <MessageCircleQuestion className="w-3.5 h-3.5 text-neutral-900" />{" "}
            Questions, answered
          </h2>
          <p className="text-3xl sm:text-5xl font-bold tracking-tighter text-neutral-900">
            Everything before
            <br />
            you go live.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.1 }}
          variants={containerVariants}
          className="space-y-3"
        >
          {faqs.map((item, i) => (
            <FAQItem
              key={item.q}
              q={item.q}
              a={item.a}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>

        {/* Footnote */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10 text-xs text-neutral-400 font-mono"
        >
          Still have a question? Reach the team directly — we reply same day.
        </motion.p>
      </div>
    </section>
  );
}
