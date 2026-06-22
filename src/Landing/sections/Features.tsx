import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const FEATURES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="16" height="14" rx="1.5" />
        <path d="M6 7h8M6 10h5M6 13h3" strokeLinecap="round" />
      </svg>
    ),
    title: 'Inventory tracking',
    desc: 'Real-time stock counts across every product category. Low-stock alerts fire before you run out.',
    accent: '#2ECC8F',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 5h14M3 10h14M3 15h7" strokeLinecap="round" />
        <circle cx="15" cy="14.5" r="3" />
        <path d="M14 14.5h2M15 13.5v2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Sales & payments',
    desc: 'Accept cash, mobile money, and card. Every transaction logged, timestamped, and attributed to a cashier.',
    accent: '#60A5FA',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="6" r="3" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
        <circle cx="16" cy="6" r="2" />
        <path d="M18 14c0-2.21-1.79-4-4-4" strokeLinecap="round" />
      </svg>
    ),
    title: 'Multi-user roles (RBAC)',
    desc: 'Admins, cashiers, and managers each see exactly what they need — nothing more.',
    accent: '#A78BFA',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 14l4-5 3 3 3-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="2" width="16" height="16" rx="1.5" />
      </svg>
    ),
    title: 'Real-time reporting',
    desc: 'Daily sales summaries, top products, and revenue trends — available the moment a sale closes.',
    accent: '#F59E0B',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 3v4M10 17v-4" strokeLinecap="round" />
        <path d="M3 10h4M17 10h-4" strokeLinecap="round" />
        <circle cx="10" cy="10" r="3" />
        <path d="M5.5 5.5l2.5 2.5M14.5 14.5l-2.5-2.5M14.5 5.5l-2.5 2.5M5.5 14.5l2.5-2.5" strokeLinecap="round" />
      </svg>
    ),
    title: 'Supplier management',
    desc: 'Track every supplier, purchase order, and delivery. Reconcile what arrived against what was ordered.',
    accent: '#2ECC8F',
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="8" r="3" />
        <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
        <path d="M14 4l2 2-2 2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Customer management',
    desc: 'Customer records, purchase history, and account balances for wholesale buyers and regulars.',
    accent: '#60A5FA',
  },
]

export default function Features() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <section id="features" ref={ref} className="bg-[#0B0F14] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#2ECC8F] mb-4">What Ledgr handles</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Everything your shop runs on
          </h2>
          <p className="text-[#B8C7D9] max-w-xl mx-auto">
            From the first product scan to the end-of-day report. No paper, no spreadsheets.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.08 * i, duration: 0.45 }}
              className="group relative bg-[#111820] border border-white/6 rounded-xl p-6 hover:border-white/12 transition-all duration-300"
            >
              {/* Accent top border */}
              <div
                className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)` }}
              />

              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${feature.accent}15`, color: feature.accent }}
              >
                {feature.icon}
              </div>

              <h3 className="text-white font-semibold mb-2 text-sm">{feature.title}</h3>
              <p className="text-[#B8C7D9] text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}