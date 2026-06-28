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

// ─── Motion config ────────────────────────────────────────────────────────────

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
  visible: {
    transition: { staggerChildren: prefersReducedMotion ? 0 : 0.07 },
  },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type PillVariant = "all" | "elevated" | "limited" | "readonly";
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

interface TrustItem {
  label: React.ReactNode;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const auditEntries: AuditEntry[] = [
  {
    label: "Refund issued — Order #1042",
    who: "Alex T.",
    time: "14:45",
    color: "danger",
    Icon: RefreshCcw,
  },
  {
    label: "Stock override — Oat milk ×24",
    who: "Riley A.",
    time: "13:30",
    color: "warning",
    Icon: PackageOpen,
  },
  {
    label: "Price changed — Espresso $3.50 → $4.00",
    who: "Jordan L.",
    time: "09:15",
    color: "primary",
    Icon: Tag,
  },
  {
    label: "Refund issued — Order #1038",
    who: "Alex T.",
    time: "08:52",
    color: "danger",
    Icon: RefreshCcw,
  },
  {
    label: "Stock override — Cups (M) ×50",
    who: "Casey R.",
    time: "08:10",
    color: "warning",
    Icon: PackageOpen,
  },
];

const auditDotColor: Record<AuditColor, string> = {
  danger: "bg-[var(--clr-danger-a10)]",
  warning: "bg-[var(--clr-warning-a10)]",
  primary: "bg-[var(--clr-primary-a0)]",
};

const auditIconColor: Record<AuditColor, string> = {
  danger: "text-[var(--clr-danger-a10)]",
  warning: "text-[var(--clr-warning-a10)]",
  primary: "text-[var(--clr-primary-a0)]",
};

const auditIconBg: Record<AuditColor, string> = {
  danger: "bg-[var(--clr-danger-a20)]",
  warning: "bg-[var(--clr-warning-a20)]",
  primary: "bg-[var(--clr-surface-tonal-a10)]",
};

const roleEntries: RoleEntry[] = [
  { name: "Owner", desc: "Full access — settings, staff, reports", variant: "all" },
  { name: "Manager", desc: "Refunds, stock edits, order history", variant: "elevated" },
  { name: "Cashier", desc: "POS register and held orders only", variant: "limited" },
  { name: "Viewer", desc: "Read-only dashboard access", variant: "readonly" },
];

const pillStyles: Record<PillVariant, { bg: string; text: string; label: string }> = {
  all:      { bg: "bg-[var(--clr-success-a20)]", text: "text-[var(--clr-success-a0)]", label: "All access" },
  elevated: { bg: "bg-[var(--clr-info-a20)]",    text: "text-[var(--clr-info-a0)]",    label: "Elevated" },
  limited:  { bg: "bg-[var(--clr-warning-a20)]", text: "text-[var(--clr-warning-a0)]", label: "Limited" },
  readonly: { bg: "bg-[var(--clr-surface-a20)]", text: "text-[var(--text-secondary)]", label: "No writes" },
};

const featureCards: FeatureCard[] = [
  {
    Icon: ShieldCheck,
    iconBg: "bg-[var(--clr-success-a20)]",
    iconColor: "text-[var(--clr-success-a0)]",
    title: "Supabase Auth",
    desc: "Staff logins backed by Supabase — secure sessions with no shared passwords.",
  },
  {
    Icon: Lock,
    iconBg: "bg-[var(--clr-info-a20)]",
    iconColor: "text-[var(--clr-info-a0)]",
    title: "Scoped API access",
    desc: "Row-level security on every table. Cashiers can't touch what they don't own.",
  },
  {
    Icon: ClipboardList,
    iconBg: "bg-[var(--clr-warning-a20)]",
    iconColor: "text-[var(--clr-warning-a0)]",
    title: "Tamper-evident logs",
    desc: "Refunds, price changes, and stock overrides are written once and never deleted.",
  },
];

const trustItems: TrustItem[] = [
  { label: "All data encrypted in transit (TLS 1.3) and at rest" },
  { label: "No plaintext secrets — env vars only, never committed to source" },
  {
    label: (
      <>
        External links use{" "}
        <code className="text-[11px] bg-[var(--clr-surface-tonal-a10)] px-1.5 py-0.5 rounded">
          rel="noopener noreferrer"
        </code>{" "}
        throughout
      </>
    ),
  },
  {
    label: (
      <>
        No{" "}
        <code className="text-[11px] bg-[var(--clr-surface-tonal-a10)] px-1.5 py-0.5 rounded">
          dangerouslySetInnerHTML
        </code>{" "}
        — all user input sanitized before render
      </>
    ),
  },
  { label: "Session tokens invalidated on staff logout across all devices" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)] mb-3">
      {children}
    </p>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={`bg-white border border-[var(--border)] rounded-xl p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function AuditLog() {
  return (
    <Card>
      <SectionLabel>Live audit log</SectionLabel>
      <ul className="divide-y divide-[var(--border)]" aria-label="Recent audit events">
        {auditEntries.map((entry) => (
          <li key={`${entry.who}-${entry.time}`} className="flex items-center gap-3 py-2.5">
            <div
              className={`w-7 h-7 rounded-lg ${auditIconBg[entry.color]} flex items-center justify-center flex-shrink-0`}
              aria-hidden="true"
            >
              <entry.Icon
                size={14}
                className={auditIconColor[entry.color]}
                strokeWidth={1.75}
              />
            </div>
            <span className="flex-1 text-[12px] text-[var(--text-primary)] leading-snug truncate">
              {entry.label}
            </span>
            <span className="text-[11px] text-[var(--text-secondary)] flex-shrink-0">
              {entry.who}
            </span>
            <span className="text-[11px] text-[var(--text-tertiary)] flex-shrink-0 w-10 text-right">
              {entry.time}
            </span>
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
        <UserCog size={14} className="text-[var(--text-tertiary)]" strokeWidth={1.75} aria-hidden="true" />
        <SectionLabel>Role-based access</SectionLabel>
      </div>
      <ul className="divide-y divide-[var(--border)]" aria-label="Staff roles and permissions">
        {roleEntries.map((role) => {
          const pill = pillStyles[role.variant];
          return (
            <li
              key={role.name}
              className="flex items-center justify-between py-2.5"
            >
              <div>
                <p className="text-[13px] font-medium text-[var(--text-primary)] leading-tight">
                  {role.name}
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                  {role.desc}
                </p>
              </div>
              <span
                className={`text-[10px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ml-3 ${pill.bg} ${pill.text}`}
              >
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
          <div
            className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}
            aria-hidden="true"
          >
            <card.Icon size={18} className={card.iconColor} strokeWidth={1.75} />
          </div>
          <p className="text-[13px] font-medium text-[var(--text-primary)] mb-1">
            {card.title}
          </p>
          <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
            {card.desc}
          </p>
        </Card>
      ))}
    </div>
  );
}

function TrustChecklist() {
  return (
    <Card className="mt-3">
      <SectionLabel>Security checklist</SectionLabel>
      <ul className="divide-y divide-[var(--border)]" aria-label="Security guarantees">
        {trustItems.map((item, i) => (
          <li key={i} className="flex items-start gap-3 py-2.5">
            <CheckCircle2
              size={16}
              className="text-[var(--clr-success-a0)] flex-shrink-0 mt-0.5"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="text-[12px] text-[var(--text-primary)] leading-relaxed">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Security() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      className="py-20 px-4 md:px-6 lg:px-8 bg-white"
      aria-labelledby="security-heading"
    >
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={fadeUp}
          className="mb-10"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[var(--clr-primary-a0)] mb-2">
            Built for trust
          </p>
          <h2
            id="security-heading"
            className="text-3xl font-semibold text-[var(--text-primary)] mb-2"
          >
            Security and accountability, by design
          </h2>
          <p className="text-[var(--text-secondary)] text-base max-w-xl leading-relaxed">
            Every action is logged, every role is scoped, and your data never
            moves without a record.
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={stagger}
        >
          {/* Top row: audit log + role matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <AuditLog />
            <RoleMatrix />
          </div>

          {/* Feature cards */}
          <FeatureCards />

          {/* Trust checklist */}
          <TrustChecklist />
        </motion.div>

      </div>
    </section>
  );
}
