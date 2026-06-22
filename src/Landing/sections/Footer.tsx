export default function Footer() {
  const links = {
    Product: ['Features', 'Dashboard', 'Security', 'Pricing'],
    Company: ['About', 'Contact', 'Blog'],
    Legal: ['Privacy policy', 'Terms of service'],
  }

  return (
    <footer className="bg-[#0B0F14] border-t border-white/5 pt-14 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-[#2ECC8F] rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="7" width="4" height="6" fill="#0B0F14" rx="0.5" />
                  <rect x="5" y="4" width="4" height="9" fill="#0B0F14" rx="0.5" />
                  <rect x="9" y="1" width="4" height="12" fill="#0B0F14" rx="0.5" />
                </svg>
              </div>
              <span className="text-white font-semibold text-sm tracking-tight">Ledgr POS</span>
            </div>
            <p className="text-[#B8C7D9]/60 text-sm leading-relaxed max-w-[200px]">
              Real-time inventory and sales management for retail businesses.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-white/40 text-xs uppercase tracking-widest font-mono mb-4">{group}</p>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item}>
                    <a href="#" className="text-[#B8C7D9]/60 hover:text-white text-sm transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/25 text-xs font-mono">
            © {new Date().getFullYear()} Ledgr POS. All rights reserved.
          </p>
          <p className="text-white/20 text-xs">
            Built for retail businesses in Ghana and beyond.
          </p>
        </div>
      </div>
    </footer>
  )
}