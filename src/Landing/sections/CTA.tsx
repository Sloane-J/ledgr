import { useRef } from "react";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { ArrowRight, Zap, Check } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const highlights = [
  "No credit card required",
  "Set up in under 5 minutes",
  "Free during beta",
];

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduceMotion = useReducedMotion();

  // Animation variants adapted to the reference code's style
  const containerMotion = {
    initial: reduceMotion ? {} : { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <section
      className="relative bg-white py-24 px-4 sm:px-6"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-5xl mx-auto">
        <motion.div
          ref={ref}
          {...containerMotion}
          className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden px-6 py-16 md:py-20 flex flex-col items-center text-center relative max-w-3xl mx-auto"
        >
          {/* Tag Header layout block from reference code design elements */}
          <div className="flex items-center gap-3 mb-6 w-full max-w-xs justify-center">
            <div className="h-px w-8 bg-neutral-100" aria-hidden="true" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 border border-neutral-200 rounded-full px-2 py-0.5 bg-neutral-50">
              Ready
            </span>
            <div className="h-px w-8 bg-neutral-100" aria-hidden="true" />
          </div>

          {/* Icon mark using full neutral dark block */}
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-neutral-900 flex items-center justify-center mb-6"
            aria-hidden="true"
          >
            <Zap className="w-5 h-5 text-white" fill="white" aria-hidden="true" />
          </div>

          {/* Heading using strict text-neutral family layout */}
          <h2
            id="cta-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-4 max-w-md leading-tight"
          >
            Start managing your store today
          </h2>

          {/* Sub description layout */}
          <p className="max-w-md mx-auto text-sm text-neutral-500 leading-relaxed mb-8">
            A full POS and inventory system ready to go — sales, stock, staff,
            and reporting in one place.
          </p>

          {/* Action buttons following reference layout controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 w-full sm:w-auto">
            <a
              href="/signup"
              className="h-9 inline-flex items-center justify-center gap-2 bg-neutral-900 border border-neutral-900 text-white text-xs font-semibold px-5 rounded-lg hover:bg-neutral-800 transition-colors duration-150 w-full sm:w-auto"
              rel="noopener noreferrer"
            >
              Get started free
              <ArrowRight size={14} strokeWidth={2.25} aria-hidden="true" />
            </a>
            <a
              href="/demo"
              className="h-9 inline-flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500 px-5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors duration-150 w-full sm:w-auto"
              rel="noopener noreferrer"
            >
              View live demo
            </a>
          </div>

          {/* Highlights structured with custom active badges from reference */}
          <ul
            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 pt-6 border-t border-neutral-100 w-full justify-center"
            aria-label="Offer highlights"
          >
            {highlights.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium"
              >
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center gap-1">
                  <Check size={10} strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
