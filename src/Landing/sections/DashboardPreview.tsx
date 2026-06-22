import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

const INVENTORY_ROWS = [
  { name: 'Coca Cola 1L', sku: 'BEV-001', category: 'Beverages', stock: 48, status: 'ok' },
  { name: 'Sunlight Soap 500g', sku: 'HH-014', category: 'Household', stock: 7, status: 'low' },
  { name: 'Indomie Noodles', sku: 'FD-033', category: 'Food', stock: 3, status: 'critical' },
  { name: 'Milo 400g', sku: 'BEV-008', category: 'Beverages', stock: 22, status: 'ok' },
  { name: 'Veg Oil 750ml', sku: 'FD-011', category: 'Food', stock: 14, status: 'ok' },
]

const STATUS_STYLES: Record<string, { dot: string; label: string; text: string }> = {
  ok: { dot: '#2ECC8F', label: 'In stock', text: 'text-[#2ECC8F]' },
  low: { dot: '#F59E0B', label: 'Low stock', text: 'text-amber-400' },
  critical: { dot: '#F87171', label: 'Critical', text: 'text-red-400' },
}

const BAR_DATA = [
  { day: 'Mon', value: 60 },
  { day: 'Tue', value: 85 },
  { day: 'Wed', value: 70 },
  { day: 'Thu', value: 92 },
  { day: 'Fri', value: 78 },
  { day: 'Sat', value: 100 },
  { day: 'Sun', value: 55 },
]

export default function DashboardPreview() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section ref={ref} className="bg-[#0D1117] py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-[#2ECC8F] mb-4">Live control panel</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Your business at a glance
          </h2>
          <p className="text-[#B8C7D9] max-w-lg mx-auto">
            One dashboard. Every sale, every product, every staff member — all visible in real time.
          </p>
        </motion.div>

        {/* Dashboard mock */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
          className="bg-[#0E1620] border border-white/8 rounded-2xl overflow-hidden"
        >
          {/* Window bar */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-white/8 bg-[#0B0F14]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F87171]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#2ECC8F]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/5 rounded px-4 py-0.5 text-[10px] text-white/30 font-mono">
                ledgrpos.app/dashboard
              </div>
            </div>
          </div>

          {/* Dashboard layout */}
          <div className="flex h-[520px] overflow-hidden">
            {/* Sidebar */}
            <div className="w-14 md:w-48 bg-[#0B0F14] border-r border-white/5 flex flex-col py-4 flex-shrink-0">
              <div className="px-3 mb-6 hidden md:block">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#2ECC8F] rounded flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                      <rect x="1" y="7" width="4" height="6" fill="#0B0F14" rx="0.5" />
                      <rect x="5" y="4" width="4" height="9" fill="#0B0F14" rx="0.5" />
                      <rect x="9" y="1" width="4" height="12" fill="#0B0F14" rx="0.5" />
                    </svg>
                  </div>
                  <span className="text-white text-xs font-semibold">Ledgr POS</span>
                </div>
              </div>
              {[
                { icon: '⊞', label: 'Dashboard', active: true },
                { icon: '◫', label: 'Inventory', active: false },
                { icon: '◈', label: 'Sales', active: false },
                { icon: '◻', label: 'Customers', active: false },
                { icon: '◑', label: 'Reports', active: false },
                { icon: '⊙', label: 'Settings', active: false },
              ].map(item => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 px-3 py-2 mx-2 rounded-md mb-0.5 cursor-default ${
                    item.active ? 'bg-[#2ECC8F]/10 text-[#2ECC8F]' : 'text-white/30 hover:text-white/50'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span className="text-xs hidden md:block">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-auto p-4 md:p-5">
              {/* Top metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Today's revenue", value: 'GH₵ 2,847', change: '+12%', up: true },
                  { label: 'Transactions', value: '134', change: '+8', up: true },
                  { label: 'Low stock alerts', value: '3', change: '', up: false },
                  { label: 'Active staff', value: '4', change: '', up: true },
                ].map(metric => (
                  <div key={metric.label} className="bg-[#111820] border border-white/6 rounded-lg p-3">
                    <p className="text-[10px] text-white/40 mb-1.5 leading-none">{metric.label}</p>
                    <p className="text-lg font-bold text-white font-mono leading-none mb-1">{metric.value}</p>
                    {metric.change && (
                      <p className={`text-[10px] font-mono ${metric.up ? 'text-[#2ECC8F]' : 'text-red-400'}`}>
                        {metric.up ? '↑' : '↓'} {metric.change}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Lower: chart + table */}
              <div className="grid lg:grid-cols-5 gap-3">
                {/* Bar chart */}
                <div className="lg:col-span-2 bg-[#111820] border border-white/6 rounded-lg p-4">
                  <p className="text-xs text-white/50 mb-4">Sales this week</p>
                  <div className="flex items-end gap-1.5 h-28">
                    {BAR_DATA.map(bar => (
                      <div key={bar.day} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-sm bg-[#2ECC8F]/20 relative overflow-hidden"
                          style={{ height: `${bar.value}%` }}
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-[#2ECC8F] rounded-sm"
                            style={{ height: `${bar.value}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-white/30 font-mono">{bar.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Inventory table */}
                <div className="lg:col-span-3 bg-[#111820] border border-white/6 rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6">
                    <p className="text-xs text-white/50">Inventory status</p>
                    <span className="text-[10px] text-[#2ECC8F] font-mono">Live</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left px-4 py-2 text-[10px] text-white/30 font-normal">Product</th>
                          <th className="text-left px-3 py-2 text-[10px] text-white/30 font-normal hidden md:table-cell">SKU</th>
                          <th className="text-right px-3 py-2 text-[10px] text-white/30 font-normal">Stock</th>
                          <th className="text-right px-4 py-2 text-[10px] text-white/30 font-normal">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {INVENTORY_ROWS.map((row, i) => {
                          const s = STATUS_STYLES[row.status]
                          return (
                            <tr key={row.sku} className={`${i < INVENTORY_ROWS.length - 1 ? 'border-b border-white/4' : ''}`}>
                              <td className="px-4 py-2.5 text-xs text-white/80 font-medium">{row.name}</td>
                              <td className="px-3 py-2.5 text-[10px] text-white/30 font-mono hidden md:table-cell">{row.sku}</td>
                              <td className="px-3 py-2.5 text-xs text-white/60 font-mono text-right">{row.stock}</td>
                              <td className="px-4 py-2.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
                                  <span className={`text-[10px] ${s.text}`}>{s.label}</span>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Caption */}
        <p className="text-center text-xs text-white/25 mt-6 font-mono">
          Simulated dashboard — actual UI may vary
        </p>
      </div>
    </section>
  )
}