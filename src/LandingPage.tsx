import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- ANIMATION CONFIGURATIONS ---
const FADE_IN_UP = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const HERO_TEXT_VARIATION = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
};

// --- ICONS (SVG COMPONENT WRAPPERS) ---
const Icons = {
  Logo: () => (
    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Inventory: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  Sales: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  RBAC: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Suppliers: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Customers: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  Moon: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  ),
  Sun: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-6 h-6 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
};

export default function LedgrLandingPage() {
  const [darkMode, setDarkMode] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div className={darkMode ? 'dark bg-[#0b0f19] text-slate-100' : 'bg-slate-50 text-slate-900'}>
      <div className="min-h-screen font-sans dynamic-theme-container transition-colors duration-300 dark:bg-[#0b0f19] bg-slate-50 selection:bg-emerald-500 selection:text-white">
        
        {/* --- NAVBAR --- */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'backdrop-blur-md border-b bg-white/75 dark:bg-[#0b0f19]/75 border-slate-200/80 dark:border-slate-800/80 py-3 shadow-sm' 
            : 'bg-transparent py-5 border-b border-transparent'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              <Icons.Logo />
              <span>Ledgr <span className="text-emerald-500 font-semibold text-base tracking-normal">POS</span></span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
              <a href="#features" className="hover:text-emerald-500 transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-emerald-500 transition-colors">How it works</a>
              <a href="#security" className="hover:text-emerald-500 transition-colors">Security</a>
              <a href="#pricing" className="hover:text-emerald-500 transition-colors">Pricing</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
              <button className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors">
                Login
              </button>
              <button className="text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg shadow-sm transition-colors">
                Start Free Trial
              </button>
            </div>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={toggleTheme} className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
                {mobileMenuOpen ? <Icons.Close /> : <Icons.Menu />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 border-b bg-white dark:bg-[#0c1222] border-slate-200 dark:border-slate-800 px-4 py-6 flex flex-col gap-4 shadow-xl"
              >
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium">Features</a>
                <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium">How it works</a>
                <a href="#security" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium">Security</a>
                <hr className="border-slate-200 dark:border-slate-800" />
                <div className="flex flex-col gap-3">
                  <button className="w-full text-center py-2.5 font-medium border border-slate-200 dark:border-slate-800 rounded-lg">Login</button>
                  <button className="w-full text-center py-2.5 font-medium bg-emerald-600 text-white rounded-lg">Start Free Trial</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* --- HERO SECTION --- */}
        <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 overflow-hidden border-b border-slate-200/60 dark:border-slate-900/60">
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-25 mix-blend-overlay">
            <img 
              src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1920&q=80" 
              alt="Retail checkout workspace environment" 
              className="w-full h-full object-cover filter grayscale contrast-125"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/70 to-slate-50 dark:via-[#0b0f19]/80 dark:to-[#0b0f19] z-0" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <motion.div initial="hidden" animate="visible" variants={STAGGER_CONTAINER}>
              <motion.h1 variants={HERO_TEXT_VARIATION} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
                Run your entire business from one <span className="text-emerald-500">POS system</span>
              </motion.h1>
              
              <motion.p variants={FADE_IN_UP} className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Inventory, sales, and multi-branch management in real time. Replace fragmented paper logs and slow spreadsheets today.
              </motion.p>

              <motion.div variants={FADE_IN_UP} className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-xl shadow-md transition-all">
                  Start Free Trial
                </button>
                <button className="w-full sm:w-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium px-8 py-3.5 rounded-xl shadow-sm transition-all">
                  View Dashboard
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* --- STATS / TRUST STRIP --- */}
        <section className="py-8 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-sm font-semibold tracking-wide uppercase text-slate-500 dark:text-slate-400">
              Trusted by retail and service businesses
            </p>
            <div className="grid grid-cols-3 gap-6 lg:gap-12 w-full md:w-auto">
              <div className="text-center md:text-left">
                <div className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">45%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Faster checkout</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">99%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Reduced stock loss</div>
              </div>
              <div className="text-center md:text-left">
                <div className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white">Ready</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Multi-branch scale</div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FEATURES SECTION --- */}
        <section id="features" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Engineered for strict operational precision
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Comprehensive toolkits explicitly built to maximize efficiency, eliminate balance discrepancies, and support structural scale.
              </p>
            </div>

            <motion.div 
              variants={STAGGER_CONTAINER}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {[
                { icon: <Icons.Inventory />, title: "Inventory Tracking", desc: "Automated real-time valuation updates. Monitor current stock states without loss vectors or gaps." },
                { icon: <Icons.Sales />, title: "Sales & Payments", desc: "Direct handling for cash, credit cards, and instant mobile money network payments transparently." },
                { icon: <Icons.RBAC />, title: "Multi-User Roles (RBAC)", desc: "Enforce explicit access constraints separating permissions for system admins, branch managers, and cashiers." },
                { icon: <Icons.Reports />, title: "Real-Time Reporting", desc: "Instantly process multi-layered balance reports, store sales trends, profit statements, and gross metrics." },
                { icon: <Icons.Suppliers />, title: "Supplier Management", desc: "Log purchase orders, manage continuous restock tracking windows, and trace supplier profiles accurately." },
                { icon: <Icons.Customers />, title: "Customer Management", desc: "Track customer acquisition variables, historical purchase balances, logs, and integrated structural profiles." }
              ].map((feat, idx) => (
                <motion.div 
                  key={idx}
                  variants={FADE_IN_UP}
                  whileHover={{ y: -4, borderColor: 'rgba(16, 185, 129, 0.4)' }}
                  className="p-6 rounded-xl border bg-white dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800 transition-all shadow-sm"
                >
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/70 text-emerald-600 dark:text-emerald-500 rounded-lg w-fit mb-5">
                    {feat.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feat.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* --- LIVE DASHBOARD PREVIEW SECTION --- */}
        <section className="py-20 bg-slate-100/60 dark:bg-slate-900/30 border-y border-slate-200/80 dark:border-slate-800/80 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
              <div className="lg:col-span-5 mb-12 lg:mb-0">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                  Real-time Control
                </span>
                <h2 className="mt-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl tracking-tight">
                  Unified terminal command center
                </h2>
                <p className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed">
                  Consolidate separate geographical locations into a single pane of glass. Watch multi-branch sales records, live catalog deductions, and clerk audits happen in real time.
                </p>
                <div className="mt-6 space-y-3 text-sm font-medium text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Live transactional streaming
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    Synchronized inventory reconciliation
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-slate-950 rounded-xl p-3 sm:p-4 shadow-2xl border border-slate-800/80 relative">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="ml-2 font-mono bg-slate-900 px-2 py-0.5 rounded text-slate-400">ledgr-pos // production-panel</span>
                    </div>
                    <span className="font-mono text-[10px]">v2.4-active</span>
                  </div>
                  
                  {/* Mock Dashboard Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/40">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Gross Sales Today</div>
                      <div className="text-lg font-bold text-white mt-1">$4,812.50</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">+14.2% over avg</div>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/40">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Active Register Checkouts</div>
                      <div className="text-lg font-bold text-white mt-1">18 Terminals</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">3 branches connected</div>
                    </div>
                    <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800/40">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Alerts Raised</div>
                      <div className="text-lg font-bold text-amber-500 mt-1">2 Low-Stock</div>
                      <div className="text-[10px] text-amber-500/80 mt-0.5">Requires fast reorder</div>
                    </div>
                  </div>

                  {/* Mock Table */}
                  <div className="bg-slate-900/80 rounded-lg border border-slate-800/40 overflow-hidden text-xs">
                    <div className="bg-slate-800/30 p-2.5 border-b border-slate-800/60 font-semibold text-slate-400 flex justify-between">
                      <span>Inventory Pipeline Log</span>
                      <span className="text-emerald-400">Live Updating</span>
                    </div>
                    <div className="divide-y divide-slate-800/50 font-mono text-[11px]">
                      {[
                        { id: "SKU-4912", name: "Alpha Premium Pack", qty: "842 units", status: "In Stock", color: "text-emerald-400" },
                        { id: "SKU-0241", name: "Beta System Bracket", qty: "14 units", status: "Critical Alert", color: "text-rose-400" },
                        { id: "SKU-8819", name: "Omega Base Module", qty: "119 units", status: "In Stock", color: "text-emerald-400" }
                      ].map((row, rIdx) => (
                        <div key={rIdx} className="p-2.5 flex justify-between items-center text-slate-300">
                          <span className="text-slate-500">{row.id}</span>
                          <span className="font-sans font-medium text-slate-200">{row.name}</span>
                          <span>{row.qty}</span>
                          <span className={`${row.color} bg-slate-950 px-2 py-0.5 rounded text-[10px]`}>{row.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- HOW IT WORKS --- */}
        <section id="how-it-works" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
                Immediate deployment framework
              </h2>
              <p className="mt-4 text-slate-600 dark:text-slate-400">
                Go live in minutes. No complex external server setups, zero expensive architecture overhead.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              {[
                { step: "01", title: "Register Business", desc: "Create your core organizational profile, assign global localized currency settings, and list operational branch layouts easily." },
                { step: "02", title: "Add Inventory & Users", desc: "Batch upload items via structural CSV sheets. Configure targeted security roles for managers and cashiers cleanly." },
                { step: "03", title: "Start Selling Instantly", desc: "Open the terminal layout on any connected device monitor and process sales transactions immediately." }
              ].map((phase, pIdx) => (
                <div key={pIdx} className="relative flex flex-col items-start bg-transparent p-2">
                  <div className="text-5xl font-black font-mono text-slate-200 dark:text-slate-800/70 mb-4 select-none">
                    {phase.step}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{phase.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- SECURITY SECTION --- */}
        <section id="security" className="py-20 bg-slate-900 text-slate-100 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_50%)]" />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4">
                <Icons.Lock />
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Enterprise infrastructure safety
              </h2>
              <p className="mt-4 text-slate-400 text-sm sm:text-base">
                Protect store assets, prevent malicious voiding patterns, and retain absolute audit trails safely.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80">
                <h3 className="font-bold text-white mb-2 text-base">Role-Based Restrictions</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Locks settings down completely. Cashiers execute sales processing but cannot wipe logs, modify core prices, or trigger unauthorized voids.
                </p>
              </div>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80">
                <h3 className="font-bold text-white mb-2 text-base">Immutable Audit Trails</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Every structural configuration change, cashier logoff, modified inventory balance, and manual entry generates an unalterable permanent record track.
                </p>
              </div>
              <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80">
                <h3 className="font-bold text-white mb-2 text-base">Transaction Discrepancy Safe</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Continuous mathematical verification loops validate expected physical registers balances against logged bank data, reducing drift to zero.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* --- HIGH CONVERSION CTA SECTION --- */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.04),transparent_60%)]" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Start managing your business better today
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Get access to the full platform features list free for 14 days. No deployment strings attached, cancel anytime.
            </p>
            <div className="mt-8">
              <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all">
                Start Free Trial
              </button>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-[#080b12] text-slate-500 dark:text-slate-400 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                <Icons.Logo />
                <span>Ledgr POS</span>
              </div>
              <p className="leading-relaxed">
                General purpose point of sale, cataloging, and structural inventory scaling tracking software designed for retailers.
              </p>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 text-[11px] mb-3">Product Matrix</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="hover:text-emerald-500">Core Features</a></li>
                <li><a href="#security" className="hover:text-emerald-500">Security Architecture</a></li>
                <li><span className="text-slate-400 dark:text-slate-600 cursor-not-allowed">Desktop Client (Tauri App WIP)</span></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 text-[11px] mb-3">Compliance & Trust</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-emerald-500">Data Architecture Policy</a></li>
                <li><a href="#" className="hover:text-emerald-500">Terms of Deployment</a></li>
                <li><a href="#" className="hover:text-emerald-500">Privacy Protocols</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 dark:text-slate-300 text-[11px] mb-3">Company Workspace</h4>
              <p className="leading-relaxed mb-2">Ledgr Technologies Inc.</p>
              <p className="text-slate-400 dark:text-slate-500">Continuous global tracking status active.</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 border-t border-slate-100 dark:border-slate-900/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400">
            <div>&copy; {new Date().getFullYear()} Ledgr POS. All infrastructure rights reserved worldwide.</div>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-300">System Status</a>
              <a href="#" className="hover:text-slate-300">Contact Desk</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}