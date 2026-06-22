import Navbar from './sections/Navbar'
import Hero from './sections/Hero'
import Stats from './sections/Stats'
import Features from './sections/Features'
import DashboardPreview from './sections/DashboardPreview'
import HowItWorks from './sections/HowItWorks'
import Security from './sections/Security'
import CTA from './sections/CTA'
import Footer from './sections/Footer'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <DashboardPreview />
        <HowItWorks />
        <Security />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}