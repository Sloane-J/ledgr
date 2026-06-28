import { motion } from "framer-motion";
import { Github, Twitter } from "lucide-react";

// ─── Motion config ────────────────────────────────────────────────────────────

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLink[];
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const columns: FooterColumn[] = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Dashboard preview", href: "#dashboard" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    heading: "Use cases",
    links: [
      { label: "Retail shops", href: "#" },
      { label: "Cafes and restaurants", href: "#" },
      { label: "Pop-up stores", href: "#" },
      { label: "Multi-staff teams", href: "#" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Open source", href: "https://github.com", },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Contact", href: "mailto:hello@example.com" },
    ],
  },
];

const socialLinks = [
  {
    label: "GitHub",
    href: "https://github.com",
    Icon: Github,
  },
  {
    label: "Twitter",
    href: "https://twitter.com",
    Icon: Twitter,
  },
];

// ─── Logo mark ────────────────────────────────────────────────────────────────

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5" aria-label="POS System home">
      <div
        className="w-8 h-8 rounded-lg bg-[var(--clr-primary-a0)] flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <rect x="2" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
          <rect x="9" y="2" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
          <rect x="2" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.6" />
          <rect x="9" y="9" width="5" height="5" rx="1" fill="white" fillOpacity="0.9" />
        </svg>
      </div>
      <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
        Ledgr POS
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-[var(--border)] px-4 md:px-6 lg:px-8"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto">

        {/* Top section */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="py-14 grid grid-cols-2 md:grid-cols-6 gap-10"
        >
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <LogoMark />
            <p className="text-[13px] text-[var(--text-secondary)] leading-relaxed max-w-[220px]">
              A modern POS and inventory system built for retail shops, cafes,
              and small teams.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2 mt-1">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:border-[var(--clr-surface-a30)] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--clr-primary-a0)] focus-visible:ring-offset-2"
                >
                  <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.heading} className="col-span-1 flex flex-col gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-tertiary)]">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => {
                  const isExternal =
                    link.href.startsWith("http") ||
                    link.href.startsWith("mailto");
                  return (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        {...(isExternal
                          ? {
                              target: "_blank",
                              rel: "noopener noreferrer",
                            }
                          : {})}
                        className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
                      >
                        {link.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-[var(--text-tertiary)]">
            © {currentYear} Ledgr POS. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-[12px] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Cookies
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
