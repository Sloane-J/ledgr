import { useEffect } from "react";
import CTA from "./sections/CTA";
import DashboardPreview from "./sections/DashboardPreview";
import Features from "./sections/Features";
import Footer from "./sections/Footer";
import Hero from "./sections/Hero";
import HowItWorks from "./sections/HowItWorks";
import Navbar from "./sections/Navbar";
import Security from "./sections/Security";
import Stats from "./sections/Stats";

// ─── SEO meta injection ───────────────────────────────────────────────────────

const SEO_TITLE = "Ledgr POS & Inventory Management — Built for Retail";
const SEO_DESCRIPTION =
  "A modern, full-stack Point of Sale and Inventory Management solution built for speed and reliability. Manage sales, track stock, and monitor staff in real time.";
const SEO_URL = "https://ledgr-xi.vercel.app/";
const SEO_IMAGE = "https://ledgr-xi.vercel.app//og-image.png";

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
    setMeta("og:site_name", "Ledgr POS & Inventory Management System", true);

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
      name: "Ledgr POS & Inventory Management System",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: SEO_DESCRIPTION,
      url: SEO_URL,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GHC",
      },
      featureList: [
        "Point of Sale register",
        "Real-time inventory tracking",
        "Staff role management",
        "Audit logging",
        "Sales analytics dashboard",
        "Refund management",
        "Multi-payment method support",
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
      "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap";
    document.head.appendChild(link);
  }, []);
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  useSEO();
  useFontLoader();

  return (
    <div
      className="min-h-screen bg-white"
      style={{
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-9999 focus:px-4 focus:py-2 focus:rounded-lg focus:bg-clr-primary-a0) focus:text-white focus:text-sm focus:font-medium focus:outline-none"
      >
        Skip to main content
      </a>

      <Navbar />

      <main id="main-content">
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
  );
}
