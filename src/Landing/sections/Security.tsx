// src/Landing/sections/Security.tsx
import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import {
  ShieldCheck,
  ClipboardList,
  Lock,
  UserCog,
  RefreshCcw,
  Tag,
  PackageOpen,
  CheckCircle2,
} from "lucide-react";

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 14 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut", delay },
  }),
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07 } },
};

type PillVariant = "all" | "elevated" | "limited";
type AuditColor = "danger" | "warning" | "primary";

interface AuditEntry {
  label: string;
  who: string;
  time: string;
  color: AuditColor;
  Icon: React.ElementType;
}

interface RoleEntry {
  name: string;
  desc: string;
  variant: PillVariant;
}

interface FeatureCard {
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
}

const auditEntries: AuditEntry[] = [
  { label: "Refund issued — Order #1042", who: "Alex T.", time: "14:45", color: "danger", Icon: RefreshCcw },
  { label: "Stock override — Cooking oil ×24", who: "Riley A.", time: "13:30", color: "warning", Icon: PackageOpen },
  { label: "Price changed — Malt drink ₵3.50 → ₵4.00", who: "Jordan L.", time: "09:15", color: "primary", Icon: Tag },
  { label: "Refund issued — Order #1038", who: "Alex T.", time: "08:52", color: "danger", Icon: RefreshCcw },
  { label: "Stock override — Sachet water ×50", who: "Casey R.", time: "08:10", color: "warning", Icon: PackageOpen },
];

const auditIconColor: Record<AuditColor, string> = {
  danger: "text-red-600",
  warning: "text-amber-600",
  primary: "text-violet-600",
};

const auditIconBg: Record<AuditColor, string> = {
  danger: "bg-red-50",
  warning: "bg-amber-50",
  primary: "bg-violet-50",
};

const roleEntries: RoleEntry[] = [
  { name: "Admin", desc: "Full access — settings, staff, reports", variant: "all" },
  { name: "Manager", desc: "Refunds, stock edits, order history", variant: "elevated" },
  { name: "Cashier", desc: "Register and held orders only", variant: "limited" },
];

const pillStyles: Record<PillVariant, { bg: string; text: string; label: string }> = {
  all:      { bg: "bg-emerald-50", text: "text-emerald-700", label: "All access" },
  elevated: { bg: "bg-sky-50",     text: "text-sky-700",     label: "Elevated" },
  limited:  { bg: "bg-amber-50",   text: "text-amber-700",   label: "Limited" },
};

const featureCards: FeatureCard[] = [
  {
    Icon: ShieldCheck,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    title: "Supabase Auth",
    desc: "Staff logins backed by Supabase — secure sessions with no shared passwords.",
  },
  {
    Icon: Lock,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    title: "Scoped database access",
    desc: "Row-level security on every table. Cashiers can't touch what they don't own.",
  },
  {
    Icon: ClipboardList,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    title: "Tamper-evident logs",
    desc: "Refunds, price changes, and stock overrides are written once and never deleted.",
  },
];

const trustItems: React.ReactNode[] = [
  "All data encrypted in transit (TLS 1.3) and at rest",
  "No plaintext secrets — environment variables only, never committed to source",
  <>
    External links use{" "}
    <code className="text-[11px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
      rel="noopener noreferrer"
    </code>{" "}
    throughout
  </>,
  <>
    No{" "}
    <code className="text-[11px] bg-neutral-100 text-neutral-700 px-1.5 py-0.5 rounded">
      dangerouslySetInnerHTML
    </code>{" "}
    — all user input sanitized before render
  </>,
  "Session tokens invalidated on staff logout across all devices",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 mb-3">
      {children}
    </p>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border border-neutral-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-neutral-200/50 hover:border-neutral-300 transition-shadow duration-200 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function AuditLog() {
  return (
    <Card>
      <SectionLabel>Live audit log</SectionLabel>
      <ul className="divide-y divide-neutral-100" aria-label="Recent audit events">
        {auditEntries.map((entry) => (
          <li key={`${entry.who}-${entry.time}`} className="flex items-center gap-3 py-2.5">
            <div
              className={`w-7 h-7 rounded-lg ${auditIconBg[entry.color]} flex items-center justify-center shrink-0`}
              aria-hidden="true"
            >
              <entry.Icon size={14} className={auditIconColor[entry.color]} strokeWidth={1.75} />
            </div>
            <span className="flex-1 text-[12px] text-neutral-700 leading-snug truncate">
              {entry.label}
            </span>
            <span className="text-[11px] text-neutral-500 shrink-0">{entry.who}</span>
            <span className="text-[11px] text-neutral-400 shrink-0 w-10 text-right">{entry.time}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function RoleMatrix() {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <UserCog size={14} className="text-neutral-400" strokeWidth={1.75} aria-hidden="true" />
        <SectionLabel>Role-based access</SectionLabel>
      </div>
      <ul className="divide-y divide-neutral-100" aria-label="Staff roles and permissions">
        {roleEntries.map((role) => {
          const pill = pillStyles[role.variant];
          return (
            <li key={role.name} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-[13px] font-semibold text-neutral-900 leading-tight">{role.name}</p>
                <p className="text-[11px] text-neutral-500 mt-0.5">{role.desc}</p>
              </div>
              <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ml-3 ${pill.bg} ${pill.text}`}>
                {pill.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function FeatureCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
      {featureCards.map((card) => (
        <Card key={card.title}>
          <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`} aria-hidden="true">
            <card.Icon size={18} className={card.iconColor} strokeWidth={1.75} />
          </div>
          <p className="text-[13px] font-semibold text-neutral-900 mb-1">{card.title}</p>
          <p className="text-[12px] text-neutral-500 leading-relaxed">{card.desc}</p>
        </Card>
      ))}
    </div>
  );
}

function TrustChecklist() {
  return (
    <Card className="mt-3">
      <SectionLabel>Security checklist</SectionLabel>
      <ul className="divide-y divide-neutral-100" aria-label="Security guarantees">
        {trustItems.map((item, i) => (
          <li key={i} className="flex items-start gap-3 py-2.5">
            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.75} aria-hidden="true" />
            <span className="text-[12px] text-neutral-700 leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function Security() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="security" className="relative py-20 px-4 md:px-6 lg:px-8 bg-white overflow-hidden" aria-labelledby="security-heading">

      {/* Soft glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 w-[500px] h-[500px] rounded-full opacity-[0.06]"
        style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto">

        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          className="mb-10"
        >
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-violet-600 mb-2">
            Built for trust
          </p>
          <h2 id="security-heading" className="text-3xl font-bold text-neutral-900 mb-2 tracking-tight">
            Security and accountability, by design
          </h2>
          <p className="text-neutral-500 text-base max-w-xl leading-relaxed">
            Every action is logged, every role is scoped, and your data never
            moves without a record.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={stagger}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AuditLog />
            <RoleMatrix />
          </div>

          <FeatureCards />
          <TrustChecklist />
        </motion.div>
      </div>
    </section>
  );
}
