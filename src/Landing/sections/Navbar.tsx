import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const links = ['Features', 'How it works', 'Security']

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0B0F14]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#2ECC8F] rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="7" width="4" height="6" fill="#0B0F14" rx="0.5" />
              <rect x="5" y="4" width="4" height="9" fill="#0B0F14" rx="0.5" />
              <rect x="9" y="1" width="4" height="12" fill="#0B0F14" rx="0.5" />
            </svg>
          </div>
          <span className="text-white font-semibold tracking-tight text-[15px]">Ledgr POS</span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(link => (
            <a
              key={link}
              href={`#${link.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[#B8C7D9] hover:text-white text-sm transition-colors"
            >
              {link}
            </a>
          ))}
          <a href="#" className="text-[#B8C7D9] hover:text-white text-sm transition-colors">Login</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#"
            className="text-sm px-4 py-2 rounded-md bg-[#2ECC8F] text-[#0B0F14] font-semibold hover:bg-[#25b87e] transition-colors"
          >
            Start free trial
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.5">
            {menuOpen ? (
              <>
                <line x1="4" y1="4" x2="18" y2="18" />
                <line x1="18" y1="4" x2="4" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="7" x2="19" y2="7" />
                <line x1="3" y1="11" x2="19" y2="11" />
                <line x1="3" y1="15" x2="19" y2="15" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B0F14] border-t border-white/5 px-6 py-4 flex flex-col gap-4"
          >
            {links.map(link => (
              <a key={link} href={`#${link.toLowerCase().replace(/\s+/g, '-')}`} className="text-[#B8C7D9] text-sm">
                {link}
              </a>
            ))}
            <a href="#" className="text-[#B8C7D9] text-sm">Login</a>
            <a href="#" className="text-sm px-4 py-2 rounded-md bg-[#2ECC8F] text-[#0B0F14] font-semibold text-center mt-1">
              Start free trial
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}