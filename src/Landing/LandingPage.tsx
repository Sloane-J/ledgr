// src/Landing/LandingPage.tsx
import { useEffect } from "react";
import Navbar from "./sections/Navbar";
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import HowItWorks from "./sections/HowItWorks";
import Integrations from "./sections/Integrations"
import Security from "./sections/Security";
//import Pricing from "./sections/Pricing";
import FAQ from "./sections/FAQ";
import CTA from "./sections/CTA";
import Footer from "./sections/Footer";

// ─── SEO meta configuration ───────────────────────────────────────────────────
const SEO_TITLE = "Ledgr — Modern Retail Management System & POS for Ghana";
const SEO_DESCRIPTION =
  "An all-in-one retail management system and POS built for small shops and businesses in Ghana. Streamline sales, track stock, handle mobile money conversions, and monitor unalterable audit logs.";
const SEO_URL = "https://ledgr-xi.vercel.app/";
const SEO_IMAGE = "https://ledgr-xi.vercel.app/og-image.png";

function useSEO() {
  useEffect(() => {
    // Title
    document.title = SEO_TITLE;

    const setMeta = (name: string, content: string, property = false) => {
      const attr = property ? "property" : "name";
      let el = document.querySelector<HTMLMetaElement>(
        `meta[${attr}="${name}"]`,
      );
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Core
    setMeta("description", SEO_DESCRIPTION);
    setMeta("robots", "index, follow");
    setMeta("viewport", "width=device-width, initial-scale=1");
    setMeta("theme-color", "#6366f1");

    // Open Graph
    setMeta("og:type", "website", true);
    setMeta("og:title", SEO_TITLE, true);
    setMeta("og:description", SEO_DESCRIPTION, true);
    setMeta("og:url", SEO_URL, true);
    setMeta("og:image", SEO_IMAGE, true);
    setMeta("og:site_name", "Ledgr Retail Management System", true);

    // Twitter card
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", SEO_TITLE);
    setMeta("twitter:description", SEO_DESCRIPTION);
    setMeta("twitter:image", SEO_IMAGE);

    // Canonical
    let canonical = document.querySelector<HTMLLinkElement>(
      "link[rel='canonical']",
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", SEO_URL);

    // Structured data — SoftwareApplication schema
    const schemaId = "ld-json-app";
    let schema = document.getElementById(schemaId);
    if (!schema) {
      schema = document.createElement("script");
      schema.id = schemaId;
      schema.setAttribute("type", "application/ld+json");
      document.head.appendChild(schema);
    }
    schema.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Ledgr Retail Management System & POS",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: SEO_DESCRIPTION,
      url: SEO_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GHS",
      },
      featureList: [
        "Point of Sale register with keyboard shortcuts",
        "Real-time multi-location inventory tracking",
        "Staff role-based access management",
        "Loss prevention unalterable audit logging",
        "Gross profit and sales analytics dashboards",
        "Refund and receipt override management",
        "Split-payment support (Cash, Card, Mobile Money)",
      ],
    });
  }, []);
}

// ─── Font loader ──────────────────────────────────────────────────────────────
function useFontLoader() {
  useEffect(() => {
    const linkId = "inter-font-link";
    if (document.getElementById(linkId)) return;

    // Preconnect for faster DNS resolution
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    document.head.appendChild(preconnect2);

    // Inter — weights used across the landing page:
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

export default function LandingPage() {
  // Execute performance, SEO metadata, and schema injections
  useSEO();
  useFontLoader();

  return (
    <div className="relative min-h-screen bg-white text-neutral-900 antialiased selection:bg-neutral-900 selection:text-white overflow-x-hidden">
      {/* Ambient decorative lighting wrapper background */}
      <div className="absolute inset-0 bg-[radial-gradient(84%_60%_at_50%_10%,rgba(99,102,241,0.03)_0%,rgba(255,255,255,0)_100%)] pointer-events-none" />

      {/* Navigation Layer */}
      <Navbar />

      {/* Main Structuring Engine */}
      <main id="main-content">
        <Hero />
        <Features />
        <HowItWorks />
        <Integrations />
        <Security />
        {/* <Pricing /> */}
        <FAQ />
        <CTA />
      </main>

      {/* Footer Branding Closures */}
      <Footer />
    </div>
  );
}
