import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const TICKER_EVENTS = [
  { type: 'sale', text: 'Sale · Coca Cola 1L × 4', value: '+GH₵ 18.00', time: 'just now' },
  { type: 'low', text: 'Low stock · Sunlight Soap', value: '3 units', time: '1m ago' },
  { type: 'sale', text: 'Sale · Milo 400g × 2', value: '+GH₵ 42.00', time: '2m ago' },
  { type: 'restock', text: 'Restock · Evaporated Milk', value: '+48 units', time: '5m ago' },
  { type: 'sale', text: 'Sale · Toilet Paper × 6', value: '+GH₵ 36.00', time: '6m ago' },
  { type: 'low', text: 'Low stock · Indomie Noodles', value: '5 units', time: '9m ago' },
  { type: 'sale', text: 'Sale · Veg Oil 750ml × 3', value: '+GH₵ 90.00', time: '11m ago' },
]

const TYPE_COLORS: Record<string, { dot: string; badge: string; text: string }> = {
  sale: { dot: '#2ECC8F', badge: 'bg-[#2ECC8F]/10 text-[#2ECC8F]', text: 'Sale' },
  low: { dot: '#F59E0B', badge: 'bg-amber-500/10 text-amber-400', text: 'Alert' },
  restock: { dot: '#60A5FA', badge: 'bg-blue-500/10 text-blue-400', text: 'Restock' },
}

function LiveTicker() {
  const [events, setEvents] = useState(TICKER_EVENTS)
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const pool = TICKER_EVENTS
      const next = pool[Math.floor(Math.random() * pool.length)]
      setFlash(true)
      setTimeout(() => setFlash(false), 400)
      setEvents(prev => [{ ...next, time: 'just now' }, ...prev.slice(0, 5)])
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-[#0E1620] border border-white/8 rounded-xl overflow-hidden w-full max-w-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/8">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#2ECC8F] animate-pulse" />
          <span className="text-xs text-[#B8C7D9] font-mono tracking-wide">LIVE ACTIVITY</span>
        </div>
        <span className="text-[10px] text-white/30 font-mono">Today</span>
      </div>

      {/* Events */}
      <div className={`transition-colors duration-200 ${flash ? 'bg-[#2ECC8F]/5' : ''}`}>
        {events.slice(0, 6).map((event, i) => {
          const c = TYPE_COLORS[event.type]
          return (
            <motion.div
              key={`${event.text}-${i}`}
              initial={i === 0 ? { opacity: 0, x: -8 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex items-center gap-3 px-4 py-2.5 ${i !== events.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: c.dot }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#B8C7D9] truncate">{event.text}</p>
              </div>
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className="text-xs font-semibold text-white font-mono">{event.value}</span>
                <span className="text-[10px] text-white/30 font-mono">{event.time}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Mini stats footer */}
      <div className="flex border-t border-white/8">
        {[
          { label: "Today's revenue", value: 'GH₵ 2,847' },
          { label: 'Transactions', value: '134' },
        ].map((stat, i) => (
          <div key={stat.label} className={`flex-1 px-4 py-2.5 ${i === 0 ? 'border-r border-white/8' : ''}`}>
            <p className="text-[10px] text-white/40 mb-0.5">{stat.label}</p>
            <p className="text-sm font-semibold text-[#2ECC8F] font-mono">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0B0F14] flex items-center pt-16 overflow-hidden">
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Accent glow */}
      <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-[#2ECC8F]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-center">
        {/* Left: Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#2ECC8F]/30 bg-[#2ECC8F]/5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#2ECC8F]" />
            <span className="text-xs text-[#2ECC8F] font-medium tracking-wide">Real-time inventory control</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            className="text-4xl md:text-5xl font-bold text-white leading-[1.12] tracking-tight mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Run your entire <br />
            business from <br />
            <span className="text-[#2ECC8F]">one POS system</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="text-[#B8C7D9] text-lg leading-relaxed mb-10 max-w-md"
          >
            Inventory, sales, and customer management in real time.
            Built for retail businesses that can't afford to lose stock.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <a
              href="#"
              className="px-6 py-3 rounded-md bg-[#2ECC8F] text-[#0B0F14] font-semibold text-sm hover:bg-[#25b87e] transition-colors text-center"
            >
              Start free trial
            </a>
            <a
              href="#features"
              className="px-6 py-3 rounded-md border border-white/15 text-white text-sm hover:bg-white/5 transition-colors text-center"
            >
              View features →
            </a>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {['#4A5568', '#2D3748', '#718096', '#1A202C'].map((bg, i) => (
                <div
                  key={i}
                  className="w-7 h-7 rounded-full border-2 border-[#0B0F14] flex items-center justify-center text-[9px] text-white font-bold"
                  style={{ background: bg }}
                >
                  {['KA', 'MB', 'DA', 'EO'][i]}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#B8C7D9]">
              Trusted by retail businesses across Ghana
            </p>
          </motion.div>
        </div>

        {/* Right: Live ticker */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: 'easeOut' }}
          className="flex justify-center md:justify-end"
        >
          <LiveTicker />
        </motion.div>
      </div>
    </section>
  )
}