import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

export default function CTA() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-[#0B0F14] py-24">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55 }}
        >
          {/* Decorative top element */}
          <div className="flex justify-center mb-10">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-[#2ECC8F]/10 border border-[#2ECC8F]/20 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="8" width="7" height="14" rx="1" fill="#2ECC8F" opacity="0.7" />
                  <rect x="9" y="4" width="6" height="18" rx="1" fill="#2ECC8F" />
                  <rect x="15" y="1" width="7" height="21" rx="1" fill="#2ECC8F" opacity="0.5" />
                </svg>
              </div>
              {/* Pulse rings */}
              <div className="absolute inset-0 rounded-2xl border border-[#2ECC8F]/10 animate-ping" style={{ animationDuration: '2s' }} />
            </div>
          </div>

          <h2
            className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Start managing your <br />
            <span className="text-[#2ECC8F]">business better</span> today
          </h2>

          <p className="text-[#B8C7D9] text-lg mb-10 max-w-xl mx-auto">
            No setup fees. No long contracts. Get your POS system running
            before the end of the week.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="#"
              className="px-8 py-3.5 rounded-md bg-[#2ECC8F] text-[#0B0F14] font-bold text-sm hover:bg-[#25b87e] transition-colors"
            >
              Start free trial
            </a>
            <a
              href="#"
              className="px-8 py-3.5 rounded-md border border-white/15 text-white text-sm hover:bg-white/5 transition-colors"
            >
              Talk to us first
            </a>
          </div>

          {/* Micro trust signals */}
          <div className="flex flex-wrap justify-center gap-6 mt-12">
            {[
              'No credit card required',
              'Free setup support',
              'Cancel anytime',
            ].map(signal => (
              <div key={signal} className="flex items-center gap-2 text-xs text-[#B8C7D9]/50">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="#2ECC8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {signal}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}