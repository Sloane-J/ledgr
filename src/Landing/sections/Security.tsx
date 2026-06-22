import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const PILLARS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M11 2L4 5v6c0 4.418 3.134 8.547 7 9.9C14.866 19.547 18 15.418 18 11V5l-7-3z" />
        <path d="M8 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Role-based access control',
    desc: 'Cashiers can only ring up sales. Managers can view reports. Admins control everything. Access is defined at account creation and enforced on every action — not just at the login screen.',
    tags: ['Admin', 'Manager', 'Cashier'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M3 5h16M3 9h16M3 13h8" strokeLinecap="round" />
        <path d="M14 14l2 2 4-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Immutable audit logs',
    desc: 'Every sale, void, login, and stock adjustment is timestamped and attributed to a specific user. Logs cannot be edited or deleted — even by admins.',
    tags: ['Every action', 'Timestamped', 'Attributed'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <rect x="3" y="8" width="16" height="12" rx="1.5" />
        <path d="M7 8V6a4 4 0 018 0v2" strokeLinecap="round" />
        <circle cx="11" cy="14" r="1.5" />
        <path d="M11 15.5V17" strokeLinecap="round" />
      </svg>
    ),
    title: 'Secure transaction tracking',
    desc: 'Payment records are cryptographically linked to the session that created them. Voided transactions retain their original data. Nothing disappears.',
    tags: ['Linked records', 'Void trail', 'Session-bound'],
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M11 2l2.4 7.4H21l-6.2 4.5 2.4 7.4L11 17l-6.2 4.3 2.4-7.4L1 9.4h7.6L11 2z" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Data integrity by design',
    desc: 'Stock levels are computed from transaction history, not overwritten directly. Your numbers match reality because they are derived from it — not entered over it.',
    tags: ['Computed stock', 'No overrides', 'Consistent'],
  },
]

export default function Security() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="security" ref={ref} className="bg-[#111820] border-y border-white/5 py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#2ECC8F] mb-4">Built for accountability</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Security that works for retail
          </h2>
          <p className="text-[#B8C7D9] max-w-lg mx-auto">
            Retail operations depend on trust between owners, managers, and staff. Ledgr makes that trust verifiable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-5">
          {PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.45 }}
              className="bg-[#0B0F14] border border-white/6 rounded-xl p-6 hover:border-[#2ECC8F]/20 transition-colors duration-300 group"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#2ECC8F]/10 flex items-center justify-center text-[#2ECC8F] flex-shrink-0 group-hover:bg-[#2ECC8F]/15 transition-colors">
                  {pillar.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold mb-2">{pillar.title}</h3>
                  <p className="text-[#B8C7D9] text-sm leading-relaxed mb-4">{pillar.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {pillar.tags.map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-white/10 text-white/40 font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}