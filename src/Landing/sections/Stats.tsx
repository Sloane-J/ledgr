import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const STATS = [
  { value: '3×', label: 'Faster checkout', sub: 'vs manual entry' },
  { value: '94%', label: 'Stock accuracy', sub: 'real-time sync' },
  { value: '0', label: 'Lost sales', sub: 'with low-stock alerts' },
  { value: 'Multi', label: 'Branch ready', sub: 'unified dashboard' },
]

export default function Stats() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-[#111820] border-y border-white/5 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-xs text-[#B8C7D9]/50 uppercase tracking-widest mb-10 font-mono">
          Built for retail operations that demand accuracy
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/5 rounded-xl overflow-hidden">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.45 }}
              className="bg-[#111820] px-6 py-8 text-center"
            >
              <p className="text-3xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {stat.value}
              </p>
              <p className="text-sm font-medium text-[#F0F4F8] mb-1">{stat.label}</p>
              <p className="text-xs text-[#B8C7D9]/60">{stat.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}