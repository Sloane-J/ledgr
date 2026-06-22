import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const STEPS = [
  {
    number: '01',
    title: 'Register your business',
    desc: 'Create your account, enter your shop name, and set up your first branch. Takes under two minutes — no credit card needed to start.',
    detail: ['Business profile', 'Branch setup', 'Admin account created'],
    accent: '#2ECC8F',
  },
  {
    number: '02',
    title: 'Add inventory & staff',
    desc: 'Import your product list or add items manually. Create cashier and manager accounts with the exact permissions they need.',
    detail: ['Bulk product import', 'Staff accounts & roles', 'Category & pricing setup'],
    accent: '#60A5FA',
  },
  {
    number: '03',
    title: 'Start selling immediately',
    desc: 'Your POS is ready from day one. Ring up sales, accept payments, and watch your stock update in real time — no training required.',
    detail: ['POS checkout live', 'Payment processing', 'Stock auto-deducted'],
    accent: '#A78BFA',
  },
]

export default function HowItWorks() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="how-it-works" ref={ref} className="bg-[#0B0F14] py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#2ECC8F] mb-4">Simple onboarding</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Up and running in a day
          </h2>
          <p className="text-[#B8C7D9] max-w-lg mx-auto">
            No consultants, no complex setup. Your staff can be selling by tomorrow.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-8 left-[calc(16.66%+1rem)] right-[calc(16.66%+1rem)] h-px bg-gradient-to-r from-[#2ECC8F]/20 via-[#60A5FA]/30 to-[#A78BFA]/20" />

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.12 * i, duration: 0.5 }}
                className="relative"
              >
                {/* Step number circle */}
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-10 h-10 rounded-full border flex items-center justify-center flex-shrink-0 relative z-10 bg-[#0B0F14]"
                    style={{ borderColor: step.accent, boxShadow: `0 0 0 4px ${step.accent}12` }}
                  >
                    <span className="text-xs font-bold font-mono" style={{ color: step.accent }}>
                      {step.number}
                    </span>
                  </div>
                  <div className="h-px flex-1 md:hidden" style={{ background: step.accent + '30' }} />
                </div>

                <h3 className="text-white font-semibold text-base mb-3">{step.title}</h3>
                <p className="text-[#B8C7D9] text-sm leading-relaxed mb-5">{step.desc}</p>

                {/* Checklist */}
                <ul className="space-y-2">
                  {step.detail.map(item => (
                    <li key={item} className="flex items-center gap-2.5 text-sm text-[#B8C7D9]/70">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <circle cx="7" cy="7" r="6" stroke={step.accent} strokeWidth="1" opacity="0.4" />
                        <path d="M4.5 7l2 2 3-3" stroke={step.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA inline */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="text-center mt-16"
        >
          <a
            href="#"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#2ECC8F] text-[#0B0F14] font-semibold text-sm hover:bg-[#25b87e] transition-colors"
          >
            Get started today
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  )
}