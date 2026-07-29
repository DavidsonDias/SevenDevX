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

// 📂 src/components/SEOHead.tsx
import { Helmet } from "react-helmet";

interface SEOHeadProps {
  title?: string;
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

/**
 * 🚀 SEOHead — Versão PRO++ (Definitiva)
 * Inclui:
 * - SEO completo (title, description, keywords, canonical)
 * - Open Graph + Twitter Cards
 * - Schema.org (Organization, WebSite, WebPage, OfferCatalog dinâmico)
 * - PWA + SEO local + Lighthouse 100%
 */
const SEOHead: React.FC<SEOHeadProps> = ({
  title = "SevenDevX | Soluções Tecnológicas Modernas e Inovadoras",
  description = "Desenvolvimento web, criação de sites e sistemas, instalação de software e manutenção de computadores. Soluções digitais modernas e inovadoras para o seu negócio.",
  image = "/assets/img/share.webp",
  url = "https://sevendevx.com",
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
  const fullImageUrl = image.startsWith("http") ? image : `${url}${image}`;
  const pageTitle = title.includes("SevenDevX")
    ? title
    : `${title} | SevenDevX`;

  // 🧱 Schemas Dinâmicos
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SevenDevX",
    url,
    logo: `${url}/assets/img/logo.svg`,
    image: `${url}/assets/img/banner.jpg`,
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
      url: `${url}/contato`,
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
    inLanguage: "pt-BR",
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
    inLanguage: "pt-BR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "WebSite", url },
    creator: { "@type": "Organization", name: "SevenDevX", url },
  };

  const offerCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Serviços da SevenDevX",
    itemListElement: services.map((service) => ({
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: service.name,
        description: service.description,
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
      <meta name="language" content="Portuguese" />
      <meta name="copyright" content="© 2025 SevenDevX" />
      <meta name="application-name" content="SevenDevX" />
      <link rel="canonical" href={url} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />

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
      <meta property="og:locale" content="pt_BR" />
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

      {/* 📱 PWA e Mobile */}
      <meta name="theme-color" content="#000000" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta
        name="apple-mobile-web-app-status-bar-style"
        content="black-translucent"
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

export default SEOHead;