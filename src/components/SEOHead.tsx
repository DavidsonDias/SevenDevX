/**
 * SEOHead.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/SEOHead.tsx
 * @module UI
 *
 * @description
 * Fonte única de metadados por página: title, description, canonical, Open Graph e JSON-LD.
 *
 * @see src/components/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

// 📂 src/components/SEOHead.tsx
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";
import { usePublicCopy } from "@/i18n/usePublicCopy";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface SEOHeadProps {
  title?: string;
  contentLanguage?: "pt" | "en" | "es";
  translateContent?: boolean;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  keywords?: string;
  phone?: string;
  email?: string;
  address?: {
    city: string;
    region: string;
    country: string;
    postalCode?: string;
    latitude?: string;
    longitude?: string;
  };
  services?: { name: string; description: string }[];
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * 🚀 SEOHead — Versão PRO++ (Definitiva)
 * Inclui:
 * - SEO completo (title, description, keywords, canonical)
 * - Open Graph + Twitter Cards
 * - Schema.org (Organization, WebSite, WebPage, OfferCatalog dinâmico)
 * - PWA + SEO local + Lighthouse 100%
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  contentLanguage,
  translateContent = true,
  title = "SevenDevX | Soluções Tecnológicas Modernas e Inovadoras",
  description = "Desenvolvimento web, criação de sites e sistemas, instalação de software e manutenção de computadores. Soluções digitais modernas e inovadoras para o seu negócio.",
  image = "/assets/img/share.webp",
  url,
  type = "website",
  keywords = "SevenDevX, desenvolvimento web, criação de sites, software, manutenção de computadores, tecnologia, Belo Horizonte",
  phone = "+55-31-98474-0625",
  email = "contato@sevendevx.com",
  address = {
    city: "Belo Horizonte",
    region: "MG",
    country: "BR",
    postalCode: "31515-040",
    latitude: "-19.8157",
    longitude: "-43.9542",
  },
  services = [
    {
      name: "Desenvolvimento Web",
      description:
        "Criação de sites profissionais, responsivos e otimizados para desempenho e SEO.",
    },
    {
      name: "Manutenção de Computadores",
      description:
        "Serviços de diagnóstico, limpeza, upgrade e reparos em PCs e notebooks.",
    },
    {
      name: "Otimização de Sistemas",
      description:
        "Melhoria de desempenho e estrutura de sistemas legados ou em produção.",
    },
  ],
}) => {
  const { copy, language } = usePublicCopy();
  const { pathname } = useLocation();
  url = url || new URL(pathname, "https://www.sevendevx.com").href;
  const metadataLanguage = contentLanguage ?? language;
  const locale = metadataLanguage === "pt" ? "pt-BR" : metadataLanguage === "es" ? "es-ES" : "en-US";
  const origin = new URL(url, "https://www.sevendevx.com").origin;
  if (translateContent) {
    title = copy(title);
    description = copy(description);
  }
  const fullImageUrl = image.startsWith("http") ? image : new URL(image, origin).href;
  const pageTitle = title.includes("SevenDevX")
    ? title
    : `${title} | SevenDevX`;

  // 🧱 Schemas Dinâmicos
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SevenDevX",
    url,
    logo: `${origin}/assets/img/logo.svg`,
    image: `${origin}/assets/img/banner.jpg`,
    email,
    telephone: phone,
    foundingDate: "2024-01-10",
    description:
      "Soluções tecnológicas personalizadas em desenvolvimento web e manutenção de computadores.",
    address: {
      "@type": "PostalAddress",
      addressLocality: address.city,
      addressRegion: address.region,
      postalCode: address.postalCode,
      addressCountry: address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: address.latitude,
      longitude: address.longitude,
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Suporte ao Cliente",
      email,
      telephone: phone,
      url: `${origin}/contact`,
    },
    sameAs: [
      "https://www.instagram.com/sevendevx",
      "https://www.linkedin.com/company/sevendevx",
      "https://github.com/sevendevx",
      "https://www.youtube.com/@SevenDevXX",
      "https://twitter.com/sevendevx",
    ],
    founder: {
      "@type": "Person",
      name: "Davidson Dias",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SevenDevX",
    url,
    description:
      "Criação de sites, otimização de sistemas e suporte técnico especializado.",
    inLanguage: locale,
    creator: {
      "@type": "Organization",
      name: "SevenDevX",
      url,
    },
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: pageTitle,
    url,
    description,
    inLanguage: locale,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "WebSite", url },
    creator: { "@type": "Organization", name: "SevenDevX", url },
  };

  const offerCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: copy("Serviços da SevenDevX"),
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: copy(service.name),
        description: copy(service.description),
      },
    })),
  };

  return (
    <Helmet>
      {/* 🌐 SEO Básico */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <meta name="author" content="SevenDevX" />
      <meta name="language" content={locale} />
      <meta name="copyright" content={`© ${new Date().getFullYear()} SevenDevX`} />
      <meta name="application-name" content="SevenDevX" />
      <link rel="canonical" href={url} />

      {/* 🧠 Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:type" content="image/webp" />
      <meta
        property="og:image:alt"
        content="SevenDevX - Soluções Digitais e Desenvolvimento de Software"
      />
      <meta property="og:locale" content={locale.replace("-", "_")} />
      <meta property="og:site_name" content="SevenDevX" />

      {/* 🐦 Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@sevendevx" />
      <meta name="twitter:creator" content="@sevendevx" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta
        name="twitter:image:alt"
        content="SevenDevX - Desenvolvimento de Software Profissional"
      />

      {/* 📍 SEO Local */}
      <meta name="geo.region" content={`BR-${address.region}`} />
      <meta name="geo.placename" content={address.city} />
      {address.latitude && (
        <meta name="geo.position" content={`${address.latitude};${address.longitude}`} />
      )}

      {/* 🧱 JSON-LD — Dados Estruturados */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(offerCatalogSchema)}
      </script>
    </Helmet>
  );
};

// ============================================================================
// 📤 EXPORTS
// ============================================================================

export default SEOHead;