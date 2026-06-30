// src/Landing/sections/Footer.tsx
import { motion } from "framer-motion";
import { Github, Twitter, Store } from "lucide-react";

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
      { label: "Open source", href: "https://github.com" },
      { label: "Status", href: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Terms of service", href: "#" },
      { label: "Contact", href: "mailto:samueldorkeyjr@gmail.com" },
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
    <div className="flex items-center gap-2.5" aria-label="Ledgr home">
      <div
        className="w-8 h-8 rounded-full bg-neutral-900 flex items-center justify-center flex-shrink-0"
        aria-hidden="true"
      >
        <Store className="w-4 h-4 text-white" aria-hidden="true" />
      </div>
      <span className="text-[15px] font-bold text-neutral-900 tracking-tight">
        Ledgr
      </span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="bg-white border-t border-neutral-200/80 px-4 md:px-6 lg:px-8"
      aria-label="Site footer"
    >
      <div className="max-w-5xl mx-auto">

        {/* Top section */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="py-16 grid grid-cols-2 md:grid-cols-6 gap-10"
        >
          {/* Brand column */}
          <div className="col-span-2 md:col-span-2 flex flex-col gap-4">
            <LogoMark />
            <p className="text-[13px] text-neutral-500 leading-relaxed max-w-[240px]">
              The all-in-one shop OS built for retail shops, cafes, and small businesses in Ghana.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-1.5 mt-1">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
                >
                  <Icon size={14} strokeWidth={2} aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {columns.map((col) => (
            <div key={col.heading} className="col-span-1 flex flex-col gap-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                {col.heading}
              </p>
              <ul className="flex flex-col gap-3">
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
                        className="text-[13px] text-neutral-500 hover:text-neutral-900 transition-colors duration-150 focus-visible:outline-none focus-visible:underline rounded-sm"
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
        <div className="border-t border-neutral-100 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[12px] text-neutral-400">
            © {currentYear} Ledgr. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-[12px] text-neutral-400 hover:text-neutral-600 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            >
              Cookies
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
