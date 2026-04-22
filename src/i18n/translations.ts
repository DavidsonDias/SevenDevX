/**
 * 🌐 Sistema de Internacionalização - SevenDevX
 * Suporte para: PT-BR, EN, ES
 * Arquivo mesclado com estrutura completa
 */

export type Language = "pt" | "en" | "es";

export interface Translations {
  // Header & Navigation
  header: {
    about: string;
    services: string;
    projects: string;
    contact: string;
    store: string;
  };

  // About Page
  aboutPage: {
    heroTitle: string;
    heroSubtitle: string;
    storyTitle: string;
    storyContent: string[];
    timeline: {
      title: string;
      subtitle: string;
      items: Array<{
        year: string;
        title: string;
        description: string;
      }>;
    };
    mission: {
      title: string;
      content: string;
    };
    vision: {
      title: string;
      content: string;
    };
    values: {
      title: string;
      subtitle: string;
      items: Array<{
        title: string;
        description: string;
      }>;
    };
    cta: {
      title: string;
      subtitle: string;
      button: string;
    };
  };
  
  // Hero Section
  hero: {
    title: string;
    subtitle: string;
    cta: string;
    scrollDown: string;
    watchVideo: string;
  };
  
  // Services (Section)
  services: {
    sectionTitle: string;
    sectionSubtitle: string;
    webDev: {
      title: string;
      description: string;
    };
    software: {
      title: string;
      description: string;
    };
    maintenance: {
      title: string;
      description: string;
    };
    landingPages: {
      title: string;
      description: string;
    };
    consulting: {
      title: string;
      description: string;
    };
    viewMore: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    features: {
      webDev: string[];
      software: string[];
      maintenance: string[];
    };
  };

  // Services Page
  servicesPage: {
    heroTitle: string;
    heroSubtitle: string;
    whatWeOffer: string;
    whatWeOfferSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    webDev: {
      title: string;
      description: string;
      features: string[];
    };
    software: {
      title: string;
      description: string;
      features: string[];
    };
    maintenance: {
      title: string;
      description: string;
      features: string[];
    };
    landingPages: {
      title: string;
      description: string;
      features: string[];
    };
    consulting: {
      title: string;
      description: string;
      features: string[];
    };
    process: {
      title: string;
      subtitle: string;
      expandLabel: string;
      collapseLabel: string;
      deliverablesLabel: string;
      durationLabel: string;
      toolsLabel: string;
      ctaLabel: string;
      steps: Array<{
        n: string;
        t: string;
        d: string;
        duration: string;
        deliverables: string[];
        tools: string[];
        cta: string;
      }>;
    };
    faq: {
      title: string;
      subtitle: string;
      searchPlaceholder: string;
      allLabel: string;
      noResults: string;
      ctaTitle: string;
      ctaSubtitle: string;
      ctaButton: string;
      categories: Array<{
        id: string;
        label: string;
        icon: string;
        items: Array<{ q: string; a: string }>;
      }>;
    };
  };
  
  // Tech
  tech: {
    sectionTitle: string;
    sectionSubtitle: string;
    exploreAll: string;
    learnMore: string;
  };
  
  // Tech Modal
  techModal: {
    experience: string;
    yearsExperience: string;
    proficiency: string;
    useCases: string;
    relatedTech: string;
    documentation: string;
    viewDocs: string;
    close: string;
    learnMore: string;
  };
  
  // Testimonials
  testimonials: {
    sectionTitle: string;
    sectionSubtitle: string;
    avgRating: string;
    readMore: string;
    verifiedClient: string;
  };
  
  // Contact
  contact: {
    sectionTitle: string;
    sectionSubtitle: string;
    stepsSubtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    projectTypeLabel: string;
    projectTypePlaceholder: string;
    budgetLabel: string;
    budgetPlaceholder: string;
    confirmData: string;
    acceptPrivacy: string;
    privacyPolicy: string;
    submit: string;
    next: string;
    back: string;
    step1: string;
    step2: string;
    step3: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorMessage: string;
    projectTypes: string[];
    budgetRanges: string[];
    companyLabel: string;
    companyPlaceholder: string;
    deadlineLabel: string;
    deadlinePlaceholder: string;
    urgentLabel: string;
  };
  
  // Footer
  footer: {
    copyright: string;
    privacy: string;
    suppliers: string;
    allRightsReserved: string;
    madeWith: string;
    followUs: string;
    newsletter: string;
    newsletterPlaceholder: string;
    subscribe: string;
  };
  
  // Projects (Section)
  projects: {
    sectionTitle: string;
    sectionSubtitle: string;
    viewProject: string;
    viewCode: string;
    noDemo: string;
    technologies: string;
    swipeHint: string;
    noResults: string;
    heroTitle: string;
    heroSubtitle: string;
    techShowcaseTitle: string;
    portfolioTitle: string;
    filterAll: string;
    filterWeb: string;
    filterMobile: string;
    filterDesign: string;
    details: string;
    challenge: string;
    solution: string;
    results: string;
    duration: string;
    client: string;
    year: string;
  };

  // Projects Page
  projectsPage: {
    heroTitle: string;
    heroSubtitle: string;
    techShowcaseLoading: string;
    portfolioTitle: string;
  };
  
  // Project Modal
  projectModal: {
    overview: string;
    features: string;
    techStack: string;
    gallery: string;
    testimonial: string;
    visitSite: string;
    viewSource: string;
    close: string;
    nextProject: string;
    prevProject: string;
    shareProject: string;
    copied: string;
  };
  
  // Privacy Policy
  privacy: {
    title: string;
    intro: string;
    sections: {
      commitment: { title: string; content: string };
      dataCollected: { title: string; dataLabel: string; purposesLabel: string; dataItems: string[]; purposes: string[] };
      legalBasis: { title: string; content: string; items: string[] };
      collection: { title: string; content: string; items: string[] };
      sharing: { title: string; content: string; items: string[] };
      storage: { title: string; content: string };
      security: { title: string; content: string };
      children: { title: string; content: string };
      rights: { title: string; content: string; contactPrompt: string; items: string[] };
      cookies: { title: string; content: string };
      changes: { title: string; content: string };
      contact: { title: string; content: string; companyName: string; location: string };
    };
    lastUpdate: string;
  };

  // Privacy Page (Alternative structure)
  privacyPage: {
    title: string;
    intro: string;
    sections: {
      commitment: { title: string; content: string };
      dataCollection: { title: string; dataList: string[]; purposes: string[] };
      legalBasis: { title: string; content: string; items: string[] };
      howWeCollect: { title: string; items: string[] };
      sharing: { title: string; content: string; items: string[] };
      storage: { title: string; content: string };
      protection: { title: string; content: string };
      children: { title: string; content: string };
      rights: { title: string; content: string; items: string[] };
      cookies: { title: string; content: string };
      changes: { title: string; content: string };
      contact: { title: string; content: string };
    };
    lastUpdated: string;
  };
  
  // Suppliers
  suppliers: {
    title: string;
    subtitle: string;
    stats: { suppliers: string; areas: string };
    partnerTitle: string;
    partnerContent: string[];
    badges: string[];
    areasTitle: string;
    areas: string[];
    contactTitle: string;
    contactItems: {
      email: string;
      phone: string;
      location: string;
      hours: string;
    };
    ctaText: string;
    ctaPrimary: string;
    ctaSecondary: string;
    disclaimer: string;
    responseTime: string;
    faqTitle: string;
    faq: Array<{ q: string; a: string }>;
  };

  // Suppliers Page (Alternative structure)
  suppliersPage: {
    heroTitle: string;
    heroSubtitle: string;
    statsSuppliers: string;
    statsAreas: string;
    partnerTitle: string;
    partnerContent: string[];
    badges: string[];
    areasTitle: string;
    areas: string[];
    contactTitle: string;
    contactItems: {
      email: string;
      phone: string;
      location: string;
      hours: string;
    };
    ctaContent: string;
    ctaPrimary: string;
    ctaSecondary: string;
    faqTitle: string;
    faq: Array<{ q: string; a: string }>;
  };
  
  // Store
  store: {
    heroTitle: string;
    heroSubtitle: string;
    heroBadge: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    plansTitle: string;
    plansSubtitle: string;
    mostPopular: string;
    requestQuote: string;
    view: string;
    compareTitle: string;
    compareFeatures: string[];
    servicesTitle: string;
    servicesSubtitle: string;
    plans: {
      landing: { name: string; description: string; features: string[] };
      institutional: { name: string; description: string; features: string[] };
      custom: { name: string; description: string; features: string[] };
    };
    services: {
      consulting: { title: string; description: string };
      performance: { title: string; description: string };
      uiux: { title: string; description: string };
      maintenance: { title: string; description: string };
    };
    testimonialsTitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    guarantee: string;
    guaranteeText: string;
  };
  
  // NotFound
  notFound: {
    title: string;
    message: string;
    button: string;
    suggestions: string;
  };
  
  // Modals & Dialogs
  modals: {
    confirm: string;
    cancel: string;
    save: string;
    delete: string;
    edit: string;
    close: string;
    areYouSure: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    exitIntent: {
      title: string;
      subtitle: string;
      description: string;
      cta: string;
      dismiss: string;
      trustBadge: string;
    };
  };
  
  // Cards
  cards: {
    readMore: string;
    showLess: string;
    details: string;
    features: string;
    included: string;
    notIncluded: string;
    popular: string;
    new: string;
    comingSoon: string;
    limited: string;
  };
  
  // Notifications & Toasts
  notifications: {
    success: string;
    error: string;
    warning: string;
    info: string;
    formSubmitted: string;
    formError: string;
    copied: string;
    saved: string;
    deleted: string;
    updated: string;
    networkError: string;
    tryAgain: string;
    dismiss: string;
  };
  
  // Forms
  forms: {
    required: string;
    optional: string;
    invalidEmail: string;
    invalidPhone: string;
    minLength: string;
    maxLength: string;
    passwordMismatch: string;
    fieldRequired: string;
    selectOption: string;
    uploading: string;
    uploadSuccess: string;
    uploadError: string;
    dragDrop: string;
    browse: string;
    maxFileSize: string;
  };
  
  // Buttons & Actions
  actions: {
    submit: string;
    send: string;
    save: string;
    cancel: string;
    continue: string;
    back: string;
    next: string;
    finish: string;
    reset: string;
    clear: string;
    search: string;
    filter: string;
    sort: string;
    download: string;
    upload: string;
    share: string;
    copy: string;
    print: string;
    export: string;
    import: string;
    refresh: string;
    retry: string;
    viewDetails: string;
    seeAll: string;
    loadMore: string;
    showMore: string;
    showLess: string;
    expand: string;
    collapse: string;
    apply: string;
    confirm: string;
  };
  
  // Tooltips
  tooltips: {
    scrollToTop: string;
    openMenu: string;
    closeMenu: string;
    changeLanguage: string;
    toggleTheme: string;
    shareOnWhatsapp: string;
    shareOnLinkedin: string;
    shareOnTwitter: string;
    copyLink: string;
    viewFullscreen: string;
    exitFullscreen: string;
    zoomIn: string;
    zoomOut: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
  };
  
  // Accessibility
  accessibility: {
    skipToContent: string;
    mainNavigation: string;
    openInNewTab: string;
    externalLink: string;
    loading: string;
    imageOf: string;
    slideOf: string;
    currentPage: string;
    goToPage: string;
    previousSlide: string;
    nextSlide: string;
    closeDialog: string;
    expandSection: string;
    collapseSection: string;
    closeModal: string;
    testimonialFrom: string;
  };
  
  // Blog
  blog: {
    heroLabel: string;
    heroTitle: string;
    heroTitleHighlight: string;
    heroSubtitle: string;
    featuredLabel: string;
    readFullArticle: string;
    searchPlaceholder: string;
    allCategories: string;
    noResults: string;
    noResultsFor: string;
    newArticlesSoon: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButton: string;
    // BlogPost
    backToBlog: string;
    readingTime: string;
    views: string;
    share: string;
    authorTeam: string;
    authorDescription: string;
    contactLink: string;
    continuReading: string;
    likedContent: string;
    likedContentSubtitle: string;
  };

  // ProjectsHub
  projectsHub: {
    heroTitle: string;
    heroSubtitle: string;
    backButton: string;
    projects: string;
    highlights: string;
    clearFilters: string;
    featured: string;
    mainFeatured: string;
  };

  // PWA & App
  pwa: {
    installApp: string;
    updateAvailable: string;
    updateNow: string;
    later: string;
    offlineReady: string;
    offlineMessage: string;
    newContent: string;
    reload: string;
  };
  
  // Common
  common: {
    loading: string;
    error: string;
    close: string;
    learnMore: string;
    viewAll: string;
    from: string;
    perMonth: string;
    days: string;
    onConsultation: string;
    yes: string;
    no: string;
    or: string;
    and: string;
    by: string;
    in: string;
    of: string;
    to: string;
    at: string;
    for: string;
    with: string;
    without: string;
    all: string;
    none: string;
    other: string;
    more: string;
    less: string;
    new: string;
    old: string;
    free: string;
    paid: string;
    popular: string;
    recommended: string;
    featured: string;
    trending: string;
    exclusive: string;
    limited: string;
    soon: string;
    now: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    week: string;
    month: string;
    year: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
}

export const translations: Record<Language, Translations> = {
  // 🇧🇷 Português (Brasil)
  pt: {
    header: {
      about: "SOBRE",
      services: "SERVIÇOS",
      projects: "PROJETOS",
      contact: "CONTATO",
      store: "LOJA",
    },
    aboutPage: {
      heroTitle: "Sobre a SevenDevX",
      heroSubtitle: "Conheça nossa história, missão e os valores que guiam cada projeto que desenvolvemos.",
      storyTitle: "Nossa História",
      storyContent: [
        "A SevenDevX nasceu em 2023 com uma visão clara: democratizar o acesso a soluções digitais de alta qualidade. Fundada por desenvolvedores apaixonados por tecnologia, começamos como uma pequena equipe com grandes ambições.",
        "Desde então, evoluímos para uma empresa completa de desenvolvimento web, sempre mantendo nosso compromisso com a excelência técnica e a satisfação do cliente. Cada projeto é uma oportunidade de superar expectativas e criar experiências digitais memoráveis.",
        "Hoje, atendemos clientes de diversos segmentos, desde startups inovadoras até empresas consolidadas, sempre com o mesmo cuidado e dedicação que nos trouxeram até aqui.",
      ],
      timeline: {
        title: "Nossa Jornada",
        subtitle: "Marcos importantes na história da SevenDevX",
        items: [
          {
            year: "2023",
            title: "Fundação",
            description: "Início das operações com foco em desenvolvimento web personalizado e soluções digitais inovadoras.",
          },
          {
            year: "2023",
            title: "Primeiros Clientes",
            description: "Conquistamos nossos primeiros clientes e estabelecemos parcerias estratégicas no mercado.",
          },
          {
            year: "2024",
            title: "Expansão de Serviços",
            description: "Ampliamos nosso portfólio incluindo manutenção, consultoria e instalação de software.",
          },
          {
            year: "2024",
            title: "Consolidação",
            description: "Reconhecimento no mercado pela qualidade e inovação em nossos projetos.",
          },
          {
            year: "2025",
            title: "Novos Horizontes",
            description: "Expansão para novos mercados e investimento em tecnologias emergentes.",
          },
        ],
      },
      mission: {
        title: "Missão",
        content: "Transformar ideias em soluções digitais inovadoras, oferecendo desenvolvimento web de excelência com foco em performance, design e experiência do usuário.",
      },
      vision: {
        title: "Visão",
        content: "Ser referência em desenvolvimento web no Brasil e América Latina, reconhecida pela qualidade técnica, inovação constante e pelo impacto positivo nos negócios de nossos clientes.",
      },
      values: {
        title: "Nossos Valores",
        subtitle: "Os princípios que guiam cada decisão e projeto",
        items: [
          {
            title: "Excelência",
            description: "Buscamos a perfeição em cada linha de código e pixel de design.",
          },
          {
            title: "Integridade",
            description: "Transparência e honestidade em todas as relações com clientes e parceiros.",
          },
          {
            title: "Colaboração",
            description: "Trabalhamos como extensão da equipe do cliente, juntos pelo sucesso.",
          },
          {
            title: "Inovação",
            description: "Utilizamos as tecnologias mais modernas para entregar soluções de ponta.",
          },
          {
            title: "Agilidade",
            description: "Entregas rápidas sem comprometer a qualidade do resultado final.",
          },
          {
            title: "Compromisso",
            description: "Cumprimos prazos e superamos expectativas em cada projeto.",
          },
        ],
      },
      cta: {
        title: "Pronto para transformar sua ideia em realidade?",
        subtitle: "Entre em contato e descubra como podemos ajudar sua empresa a crescer com soluções digitais inovadoras.",
        button: "Fale Conosco",
      },
    },
    hero: {
      title: "Desenvolvimento Web com Inovação, Design e Performance",
      subtitle: "Soluções personalizadas para sua presença digital: sites, landing pages e sistemas otimizados.",
      cta: "Entre em Contato",
      scrollDown: "Role para baixo",
      watchVideo: "Assistir vídeo",
    },
    services: {
      sectionTitle: "Nossos Serviços",
      sectionSubtitle: "Soluções completas para sua presença digital",
      webDev: {
        title: "Desenvolvimento Web Personalizado",
        description: "Sites modernos, responsivos e otimizados construídos com as tecnologias mais avançadas do mercado.",
      },
      software: {
        title: "Instalação de Software",
        description: "Configuração profissional e suporte técnico completo para software empresarial.",
      },
      maintenance: {
        title: "Manutenção de Computadores",
        description: "Limpeza, diagnóstico e reparos técnicos para máximo desempenho e confiabilidade.",
      },
      landingPages: {
        title: "Landing Pages",
        description: "Landing pages de alta conversão otimizadas para campanhas e funis de vendas.",
      },
      consulting: {
        title: "Consultoria Tecnológica",
        description: "Orientação estratégica e expertise técnica para transformar digitalmente seu negócio.",
      },
      viewMore: "Ver Mais Detalhes",
      heroTitle: "Nossos Serviços",
      heroSubtitle: "Soluções tecnológicas completas para sua empresa",
      ctaTitle: "Pronto para começar?",
      ctaSubtitle: "Entre em contato e vamos discutir seu projeto",
      ctaButton: "Fale Conosco",
      features: {
        webDev: [
          "Sites modernos e responsivos",
          "E-commerce e lojas virtuais",
          "Sistemas web personalizados",
          "Otimização SEO avançada",
        ],
        software: [
          "Instalação de sistemas operacionais",
          "Configuração de ambientes",
          "Migração de dados",
          "Treinamento de usuários",
        ],
        maintenance: [
          "Limpeza e manutenção preventiva",
          "Diagnóstico de problemas",
          "Upgrade de hardware",
          "Otimização de performance",
        ],
      },
    },
    servicesPage: {
      heroTitle: "Nossos Serviços",
      heroSubtitle: "Soluções tecnológicas completas com foco em qualidade, inovação e satisfação do cliente.",
      whatWeOffer: "O Que Oferecemos",
      whatWeOfferSubtitle: "Soluções completas para transformar sua presença digital",
      ctaTitle: "Pronto para começar?",
      ctaSubtitle: "Entre em contato e descubra como podemos ajudar sua empresa a crescer.",
      ctaButton: "Fale Conosco",
      webDev: {
        title: "Desenvolvimento Web Personalizado",
        description: "Criamos sites e aplicações web modernas, responsivas e otimizadas para SEO. Utilizamos as mais recentes tecnologias como React, TypeScript e Tailwind CSS para garantir performance e escalabilidade.",
        features: [
          "Sites institucionais e landing pages",
          "E-commerce e plataformas de vendas",
          "Sistemas web personalizados",
          "Otimização para mecanismos de busca (SEO)",
        ],
      },
      software: {
        title: "Instalação de Software",
        description: "Oferecemos serviços profissionais de instalação e configuração de software empresarial, garantindo que tudo funcione perfeitamente desde o primeiro dia.",
        features: [
          "Instalação de sistemas operacionais",
          "Configuração de software empresarial",
          "Migração de dados",
          "Treinamento de usuários",
        ],
      },
      maintenance: {
        title: "Manutenção de Computadores",
        description: "Serviço completo de manutenção preventiva e corretiva para manter seus equipamentos funcionando com máximo desempenho e confiabilidade.",
        features: [
          "Limpeza e manutenção preventiva",
          "Diagnóstico e reparo de hardware",
          "Atualização de componentes",
          "Otimização de desempenho",
        ],
      },
      landingPages: {
        title: "Landing Pages",
        description: "Criamos landing pages de alta conversão, otimizadas para campanhas de marketing digital e funis de vendas. Design focado em resultados.",
        features: [
          "Design focado em conversão",
          "Otimização para campanhas",
          "Testes A/B integrados",
          "SEO e velocidade otimizados",
        ],
      },
      consulting: {
        title: "Consultoria Tecnológica",
        description: "Oferecemos orientação estratégica e expertise técnica para transformar digitalmente seu negócio, identificando as melhores soluções para seus desafios.",
        features: [
          "Análise e diagnóstico tecnológico",
          "Planejamento de infraestrutura",
          "Seleção de tecnologias",
          "Estratégia de transformação digital",
        ],
      },
      process: {
        title: "Como Trabalhamos",
        subtitle: "Um método consultivo de 6 etapas — do diagnóstico estratégico à evolução contínua. Transparência em cada passo.",
        expandLabel: "Ver detalhes",
        collapseLabel: "Recolher",
        deliverablesLabel: "Entregáveis",
        durationLabel: "Duração estimada",
        toolsLabel: "Ferramentas",
        ctaLabel: "Falar com especialista",
        steps: [
          {
            n: "01",
            t: "Descoberta & Diagnóstico",
            d: "Entendemos seu negócio, público, objetivos e analisamos a concorrência para identificar oportunidades reais.",
            duration: "1 a 3 dias",
            deliverables: ["Briefing estratégico", "Análise de concorrência", "Mapa de oportunidades", "KPIs definidos"],
            tools: ["Notion", "Google Meet", "Figma FigJam"],
            cta: "Agendar diagnóstico",
          },
          {
            n: "02",
            t: "Estratégia & Planejamento",
            d: "Definimos a solução ideal, arquitetura, stack tecnológico e roadmap detalhado para alcançar seus objetivos.",
            duration: "2 a 5 dias",
            deliverables: ["Arquitetura técnica", "Roadmap por sprints", "Stack definido", "Fluxos de usuário"],
            tools: ["Miro", "Notion", "Excalidraw"],
            cta: "Receber estratégia",
          },
          {
            n: "03",
            t: "Proposta & Alinhamento",
            d: "Você recebe escopo detalhado, cronograma por fases e investimento estruturado — com aprovação formal antes de iniciar.",
            duration: "1 a 2 dias",
            deliverables: ["Proposta comercial", "Cronograma", "Contrato digital", "Marcos de pagamento"],
            tools: ["DocuSign", "PandaDoc", "PDF interativo"],
            cta: "Solicitar orçamento",
          },
          {
            n: "04",
            t: "Design & Prototipação",
            d: "Criamos wireframes, UI/UX e protótipos navegáveis para validar cada decisão visual antes de codar uma linha.",
            duration: "5 a 15 dias",
            deliverables: ["Wireframes", "UI Kit", "Protótipo navegável", "Design system"],
            tools: ["Figma", "Framer", "Adobe XD"],
            cta: "Ver portfólio",
          },
          {
            n: "05",
            t: "Desenvolvimento & Iteração",
            d: "Sprints semanais com entregas contínuas, ambiente de homologação em tempo real e feedback ativo do cliente.",
            duration: "2 a 12 semanas",
            deliverables: ["Código versionado", "Build em homologação", "Testes automatizados", "Demos semanais"],
            tools: ["React", "TypeScript", "Supabase", "Vercel"],
            cta: "Iniciar projeto",
          },
          {
            n: "06",
            t: "Lançamento & Evolução",
            d: "Deploy em produção, monitoramento, otimizações de performance, treinamento e suporte contínuo pós-entrega.",
            duration: "Contínuo",
            deliverables: ["Deploy produção", "Documentação", "Treinamento", "Plano de evolução"],
            tools: ["Vercel", "Sentry", "Google Analytics", "Lighthouse"],
            cta: "Conhecer planos",
          },
        ],
      },
      faq: {
        title: "Perguntas Frequentes",
        subtitle: "Respostas claras e organizadas por tema. Tudo que você precisa saber antes de começar.",
        searchPlaceholder: "Buscar pergunta...",
        allLabel: "Todas",
        noResults: "Nenhuma pergunta encontrada. Tente outro termo.",
        ctaTitle: "Ainda com dúvidas?",
        ctaSubtitle: "Fale diretamente com nosso time. Resposta em até 1 hora útil.",
        ctaButton: "Falar com especialista",
        categories: [
          {
            id: "investimento",
            label: "Investimento",
            icon: "💰",
            items: [
              { q: "Quanto custa um projeto na SevenDevX?", a: "O investimento varia conforme o escopo. Landing pages premium começam em R$ 2.500, sites institucionais a partir de R$ 6.000 e sistemas web sob orçamento. Após o diagnóstico, você recebe uma proposta fechada — sem cobrança por hora." },
              { q: "Existe parcelamento?", a: "Sim. Trabalhamos com parcelamento por marcos do projeto: entrada (30%), entregas intermediárias e lançamento. Aceitamos PIX, cartão de crédito (até 12x) e transferência." },
              { q: "O preço pode mudar durante o projeto?", a: "Não. Trabalhamos com proposta fechada por escopo. Mudanças solicitadas após aprovação são tratadas como adendos com orçamento separado, sempre com sua aprovação prévia." },
              { q: "Vale a pena investir em um projeto premium?", a: "Sim — quando você precisa de performance, escalabilidade e conversão real. Nossos clientes reportam aumento médio de 3x em leads qualificados nos primeiros 90 dias após o lançamento." },
            ],
          },
          {
            id: "prazo",
            label: "Prazo",
            icon: "⏱",
            items: [
              { q: "Quanto tempo leva o projeto?", a: "Landing pages: 5 a 10 dias úteis. Sites institucionais: 2 a 4 semanas. Sistemas web e plataformas: a partir de 6 semanas. Cada projeto recebe cronograma personalizado após o diagnóstico." },
              { q: "O projeto pode atrasar?", a: "Trabalhamos com sprints semanais e marcos validados pelo cliente. Atrasos só ocorrem por dependência de aprovação ou conteúdo do cliente — sempre comunicados com antecedência." },
              { q: "Posso solicitar prazo urgente?", a: "Sim, oferecemos modalidade fast-track com equipe dedicada. Cobrança adicional de 30% para projetos com prazo reduzido em 50%. Disponibilidade sujeita à agenda." },
            ],
          },
          {
            id: "processo",
            label: "Processo",
            icon: "🧠",
            items: [
              { q: "Como funciona o início do projeto?", a: "Tudo começa com uma reunião de diagnóstico (gratuita, ~45min) onde entendemos seu negócio. Em até 2 dias você recebe a proposta formal. Após aprovação, kickoff em até 5 dias úteis." },
              { q: "Vou acompanhar o projeto em tempo real?", a: "Sim. Você terá acesso a um ambiente de homologação atualizado continuamente, board no Notion com tarefas, reuniões semanais de alinhamento e canal direto via WhatsApp com a equipe." },
              { q: "Posso pedir mudanças durante o desenvolvimento?", a: "Sim, ajustes dentro do escopo são esperados e bem-vindos. Mudanças estruturais ou novas funcionalidades são avaliadas e incluídas como adendos com seu aval." },
              { q: "Vocês ajudam com ideias ou só executam?", a: "Somos parceiros estratégicos. Em cada etapa trazemos recomendações baseadas em dados, benchmarks de mercado e nossa experiência em centenas de projetos digitais." },
            ],
          },
          {
            id: "tecnologia",
            label: "Tecnologia",
            icon: "🛠",
            items: [
              { q: "Quais tecnologias vocês utilizam?", a: "Stack moderna: React, TypeScript, Next.js, Tailwind CSS, Supabase/PostgreSQL, Node.js e infraestrutura na Vercel/AWS. Escolhemos cada tecnologia com base no problema, nunca por modismo." },
              { q: "O sistema é escalável?", a: "Totalmente. Toda nossa arquitetura é cloud-native, com auto-scaling, CDN global, cache inteligente e banco de dados otimizado. Pronto para crescer de 100 a 1 milhão de usuários sem reescrita." },
              { q: "Posso integrar com outras ferramentas?", a: "Sim. Integramos com CRMs (HubSpot, RD, Pipedrive), gateways de pagamento (Stripe, Mercado Pago), ERPs, WhatsApp Business API, Google/Meta Ads e qualquer API REST/GraphQL." },
              { q: "Vocês usam IA nos projetos?", a: "Sim, quando agrega valor real. Implementamos chatbots inteligentes, automações com IA generativa, análise preditiva e copilotos personalizados para o seu negócio." },
            ],
          },
          {
            id: "seguranca",
            label: "Segurança",
            icon: "🔒",
            items: [
              { q: "Meus dados ficam seguros?", a: "Sim. Aplicamos criptografia ponta a ponta, autenticação multifator, HTTPS obrigatório, RLS (Row Level Security) no banco, backups automáticos e conformidade total com LGPD/GDPR." },
              { q: "Vocês assinam NDA (acordo de confidencialidade)?", a: "Sim, sem custo adicional. Assinamos NDA antes mesmo do diagnóstico estratégico, garantindo proteção total das informações sensíveis do seu negócio." },
              { q: "Meu projeto é confidencial?", a: "Absolutamente. Todos os projetos são tratados com sigilo profissional. Só publicamos cases no portfólio com autorização expressa do cliente." },
            ],
          },
          {
            id: "pos-entrega",
            label: "Pós-Entrega",
            icon: "🚀",
            items: [
              { q: "Tem suporte após a entrega?", a: "Sim. Todos os projetos incluem 30 dias de garantia para ajustes e correções. Após esse período, oferecemos planos mensais de suporte com SLA definido." },
              { q: "Tem manutenção contínua?", a: "Oferecemos planos de manutenção a partir de R$ 800/mês incluindo atualizações de segurança, monitoramento, backups, ajustes pequenos e relatórios mensais de performance." },
              { q: "Posso evoluir o sistema depois?", a: "Sim — e recomendamos. Trabalhamos com roadmap evolutivo: a cada 3 meses revisamos métricas e propomos melhorias baseadas no comportamento real dos usuários." },
              { q: "E se eu não gostar do resultado?",  a: "Nosso processo prevê validação em cada etapa (design, protótipo, sprints), evitando surpresas. Caso algo escape do escopo, refazemos sem custo adicional dentro do contrato." },
              { q: "Por que escolher a SevenDevX?", a: "Combinamos estratégia consultiva, design premium, código limpo, performance enterprise e suporte humano. Não vendemos sites — entregamos ativos digitais que geram resultado." },
              { q: "Vocês trabalham com empresas pequenas ou grandes?", a: "Atendemos desde startups validando MVPs até empresas estabelecidas modernizando seu stack. O método se adapta ao porte e maturidade do cliente." },
            ],
          },
        ],
      },
    },
    tech: {
      sectionTitle: "Tecnologias que Usamos",
      sectionSubtitle: "Ferramentas de ponta para soluções inovadoras",
      exploreAll: "Explorar Todas as Tecnologias",
      learnMore: "Clique para saber mais",
    },
    techModal: {
      experience: "Experiência",
      yearsExperience: "anos de experiência",
      proficiency: "Nível de Proficiência",
      useCases: "Casos de Uso",
      relatedTech: "Tecnologias Relacionadas",
      documentation: "Documentação",
      viewDocs: "Ver documentação oficial",
      close: "Fechar",
      learnMore: "Saiba Mais",
    },
    testimonials: {
      sectionTitle: "O Que Nossos Clientes Dizem",
      sectionSubtitle: "Depoimentos reais de quem confia em nosso trabalho",
      avgRating: "Avaliação Média",
      readMore: "Ler mais",
      verifiedClient: "Cliente verificado",
    },
    contact: {
      sectionTitle: "Entre em Contato",
      sectionSubtitle: "Vamos conversar sobre seu projeto ou ideia.",
      stepsSubtitle: "Vamos conversar sobre seu projeto em {step} etapas simples",
      nameLabel: "Nome Completo",
      namePlaceholder: "Digite seu nome completo",
      phoneLabel: "WhatsApp",
      phonePlaceholder: "(31) 91234-5678",
      emailLabel: "E-mail",
      emailPlaceholder: "seu@email.com",
      messageLabel: "Mensagem",
      messagePlaceholder: "Descreva sua necessidade ou projeto",
      projectTypeLabel: "Tipo de Projeto",
      projectTypePlaceholder: "Selecione o tipo",
      budgetLabel: "Orçamento Estimado (Opcional)",
      budgetPlaceholder: "Selecione uma faixa",
      confirmData: "Declaro que as informações fornecidas são verdadeiras.",
      acceptPrivacy: "Li e concordo com a",
      privacyPolicy: "Política de Privacidade",
      submit: "Enviar",
      next: "Próximo",
      back: "Voltar",
      step1: "Dados Pessoais",
      step2: "Projeto",
      step3: "Confirmação",
      successTitle: "Sucesso",
      successMessage: "Você será redirecionado para o WhatsApp.",
      errorTitle: "Erro",
      errorMessage: "Por favor aceite os termos para prosseguir.",
      projectTypes: [
        "Landing Page",
        "Site Institucional",
        "E-commerce",
        "Sistema Web",
        "Aplicativo Mobile",
        "Manutenção",
        "Outro",
      ],
      budgetRanges: [
        "Até R$ 2.000",
        "R$ 2.000 - R$ 5.000",
        "R$ 5.000 - R$ 10.000",
        "Acima de R$ 10.000",
        "Prefiro não informar",
      ],
      companyLabel: "Empresa",
      companyPlaceholder: "Nome da sua empresa (opcional)",
      deadlineLabel: "Prazo Desejado",
      deadlinePlaceholder: "Quando você precisa do projeto?",
      urgentLabel: "Projeto urgente",
    },
    footer: {
      copyright: "SEVENDEVX",
      privacy: "PRIVACIDADE",
      suppliers: "FORNECEDORES",
      allRightsReserved: "Todos os direitos reservados",
      madeWith: "Feito com",
      followUs: "Siga-nos",
      newsletter: "Newsletter",
      newsletterPlaceholder: "Seu melhor e-mail",
      subscribe: "Inscrever-se",
    },
    projects: {
      sectionTitle: "Nossos Projetos",
      sectionSubtitle: "Portfólio de trabalhos desenvolvidos",
      viewProject: "Ver Projeto",
      viewCode: "Código",
      noDemo: "Sem demo pública",
      technologies: "Tecnologias",
      swipeHint: "Deslize para navegar",
      noResults: "Nenhum projeto encontrado",
      heroTitle: "Projetos & Tecnologias",
      heroSubtitle: "Nosso stack tecnológico moderno para criar soluções de alta performance.",
      techShowcaseTitle: "Stack Tecnológico",
      portfolioTitle: "Projetos em Destaque",
      filterAll: "Todos",
      filterWeb: "Web",
      filterMobile: "Mobile",
      filterDesign: "Design",
      details: "Detalhes",
      challenge: "Desafio",
      solution: "Solução",
      results: "Resultados",
      duration: "Duração",
      client: "Cliente",
      year: "Ano",
    },
    projectsPage: {
      heroTitle: "Projetos & Tecnologias",
      heroSubtitle: "Trabalhamos com as tecnologias mais modernas e demandadas do mercado.",
      techShowcaseLoading: "Carregando tecnologias...",
      portfolioTitle: "Projetos em Destaque",
    },
    projectModal: {
      overview: "Visão Geral",
      features: "Funcionalidades",
      techStack: "Stack Tecnológico",
      gallery: "Galeria",
      testimonial: "Depoimento do Cliente",
      visitSite: "Visitar Site",
      viewSource: "Ver Código",
      close: "Fechar",
      nextProject: "Próximo Projeto",
      prevProject: "Projeto Anterior",
      shareProject: "Compartilhar Projeto",
      copied: "Link copiado!",
    },
    privacy: {
      title: "Política de Privacidade",
      intro: "Na SevenDevX, privacidade e segurança são prioridades. Assumimos o compromisso com a transparência no tratamento dos seus dados pessoais, em total conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).",
      sections: {
        commitment: {
          title: "1. Compromisso com sua Privacidade",
          content: "Seu direito à privacidade é fundamental. Tratamos seus dados pessoais de forma ética, segura e transparente, utilizando-os exclusivamente para finalidades legítimas. A SevenDevX coleta apenas as informações necessárias para oferecer nossos serviços, sempre respeitando seus direitos como titular dos dados.",
        },
        dataCollected: {
          title: "2. Quais Dados Coletamos e Para Quais Finalidades",
          dataLabel: "Dados Coletados:",
          purposesLabel: "Finalidades:",
          dataItems: [
            "Nome completo – Identificação e personalização do atendimento",
            "E-mail – Comunicação, envio de informações, propostas e suporte",
            "Telefone/WhatsApp – Contato direto e suporte personalizado",
            "Mensagem – Detalhes da sua solicitação, orçamento ou projeto",
            "Dados de navegação e cookies – Para melhorar sua experiência no site",
          ],
          purposes: [
            "Atender solicitações, dúvidas e pedidos de orçamentos",
            "Fornecer nossos serviços e suporte técnico",
            "Executar contratos e prestar serviços",
            "Melhorar nossos serviços, comunicação e experiência do usuário",
            "Realizar ações de marketing (somente com seu consentimento)",
            "Cumprir obrigações legais e regulatórias",
          ],
        },
        legalBasis: {
          title: "3. Bases Legais para Tratamento dos Dados",
          content: "O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais previstas na LGPD:",
          items: [
            "Consentimento – Quando você autoriza expressamente o uso dos seus dados",
            "Execução de contrato – Para prestação de serviços contratados",
            "Cumprimento de obrigações legais – Quando exigido por lei",
            "Legítimo interesse – Para melhorias e segurança dos serviços",
          ],
        },
        collection: {
          title: "4. Como Coletamos seus Dados",
          content: "Seus dados pessoais são coletados das seguintes formas:",
          items: [
            "Formulários de contato disponíveis no site oficial",
            "Contato direto via WhatsApp, e-mail ou telefone",
            "Navegação no site (dados de cookies e informações técnicas)",
            "Interações em redes sociais e plataformas digitais",
          ],
        },
        sharing: {
          title: "5. Compartilhamento de Dados",
          content: "A SevenDevX não vende, aluga ou compartilha suas informações pessoais com terceiros para fins comerciais. O compartilhamento só ocorre nas seguintes situações:",
          items: [
            "Com parceiros de tecnologia (hospedagem, CRM, e-mail marketing) necessários para operação dos serviços",
            "Com autoridades públicas, quando houver obrigação legal ou ordem judicial",
            "Em operações societárias, como fusão ou aquisição, mantendo sempre a proteção dos dados",
          ],
        },
        storage: {
          title: "6. Armazenamento e Retenção dos Dados",
          content: "Seus dados pessoais são armazenados de forma segura e mantidos apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados, ou enquanto houver obrigação legal de retenção. Dados de navegação são mantidos durante a sessão ou conforme suas preferências de cookies. Após o término da relação ou do prazo legal, os dados são anonimizados ou eliminados de forma segura.",
        },
        security: {
          title: "7. Proteção e Segurança dos Dados",
          content: "Aplicamos medidas técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui criptografia, controles de acesso, auditorias de segurança e treinamento da equipe. Apesar de todos os esforços, nenhum sistema é completamente seguro, e nos comprometemos a notificar imediatamente em caso de qualquer incidente de segurança.",
        },
        children: {
          title: "8. Dados de Crianças e Adolescentes",
          content: "Nossos serviços não são direcionados a menores de 18 anos sem o consentimento dos pais ou responsáveis legais. Caso identifiquemos coleta inadvertida de dados de menores sem autorização, os dados serão removidos imediatamente de nossos sistemas.",
        },
        rights: {
          title: "9. Seus Direitos como Titular dos Dados",
          content: "Conforme a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos garantidos:",
          contactPrompt: "Para exercer qualquer um desses direitos, entre em contato conosco:",
          items: [
            "Confirmação da existência de tratamento dos seus dados",
            "Acesso aos dados pessoais armazenados",
            "Correção de dados incompletos, inexatos ou desatualizados",
            "Anonimização, bloqueio ou eliminação de dados desnecessários ou em desconformidade",
            "Portabilidade dos dados a outro fornecedor de serviço",
            "Eliminação dos dados tratados com consentimento, salvo obrigação legal",
            "Informação sobre compartilhamento dos dados com terceiros",
            "Revogação do consentimento a qualquer momento",
          ],
        },
        cookies: {
          title: "10. Cookies e Dados de Navegação",
          content: "Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar tráfego, entender como você utiliza nosso site e oferecer conteúdos personalizados e relevantes. Os cookies podem ser essenciais (necessários para o funcionamento do site), de desempenho (análise de uso) ou de marketing (personalização). Você pode gerenciar e configurar suas preferências de cookies nas configurações do seu navegador a qualquer momento.",
        },
        changes: {
          title: "11. Alterações na Política de Privacidade",
          content: "Podemos atualizar esta Política de Privacidade a qualquer momento para refletir mudanças em nossas práticas, serviços ou requisitos legais. As alterações estarão sempre disponíveis nesta página, com indicação da data de atualização. Recomendamos que você revise periodicamente esta política para se manter informado sobre como protegemos seus dados.",
        },
        contact: {
          title: "12. Contato e Encarregado de Dados",
          content: "Se você tiver dúvidas, sugestões ou solicitações sobre como tratamos seus dados pessoais, entre em contato com nosso Encarregado de Dados (DPO):",
          companyName: "SevenDevX – Soluções em Tecnologia",
          location: "Belo Horizonte – MG, Brasil",
        },
      },
      lastUpdate: "Última atualização",
    },
    privacyPage: {
      title: "Política de Privacidade",
      intro: "Na SevenDevX, privacidade e segurança são prioridades. Assumimos o compromisso com a transparência no tratamento dos seus dados pessoais, em total conformidade com a Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 - LGPD).",
      sections: {
        commitment: {
          title: "1. Compromisso com sua Privacidade",
          content: "Seu direito à privacidade é fundamental. Tratamos seus dados pessoais de forma ética, segura e transparente, utilizando-os exclusivamente para finalidades legítimas.",
        },
        dataCollection: {
          title: "2. Quais Dados Coletamos e Para Quais Finalidades",
          dataList: [
            "Nome completo – Identificação e personalização do atendimento",
            "E-mail – Comunicação, envio de informações, propostas e suporte",
            "Telefone/WhatsApp – Contato direto e suporte personalizado",
            "Mensagem – Detalhes da sua solicitação, orçamento ou projeto",
            "Dados de navegação e cookies – Para melhorar sua experiência no site",
          ],
          purposes: [
            "Atender solicitações, dúvidas e pedidos de orçamentos",
            "Fornecer nossos serviços e suporte técnico",
            "Executar contratos e prestar serviços",
            "Melhorar nossos serviços, comunicação e experiência do usuário",
            "Realizar ações de marketing (somente com seu consentimento)",
            "Cumprir obrigações legais e regulatórias",
          ],
        },
        legalBasis: {
          title: "3. Bases Legais para Tratamento dos Dados",
          content: "O tratamento dos seus dados pessoais é fundamentado nas seguintes bases legais previstas na LGPD:",
          items: [
            "Consentimento – Quando você autoriza expressamente o uso dos seus dados",
            "Execução de contrato – Para prestação de serviços contratados",
            "Cumprimento de obrigações legais – Quando exigido por lei",
            "Legítimo interesse – Para melhorias e segurança dos serviços",
          ],
        },
        howWeCollect: {
          title: "4. Como Coletamos seus Dados",
          items: [
            "Formulários de contato disponíveis no site oficial",
            "Contato direto via WhatsApp, e-mail ou telefone",
            "Navegação no site (dados de cookies e informações técnicas)",
            "Interações em redes sociais e plataformas digitais",
          ],
        },
        sharing: {
          title: "5. Compartilhamento de Dados",
          content: "A SevenDevX não vende, aluga ou compartilha suas informações pessoais com terceiros para fins comerciais.",
          items: [
            "Com parceiros de tecnologia necessários para operação dos serviços",
            "Com autoridades públicas, quando houver obrigação legal",
            "Em operações societárias, mantendo sempre a proteção dos dados",
          ],
        },
        storage: {
          title: "6. Armazenamento e Retenção dos Dados",
          content: "Seus dados pessoais são armazenados de forma segura e mantidos apenas pelo tempo necessário para cumprir as finalidades para as quais foram coletados.",
        },
        protection: {
          title: "7. Proteção e Segurança dos Dados",
          content: "Aplicamos medidas técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.",
        },
        children: {
          title: "8. Dados de Crianças e Adolescentes",
          content: "Nossos serviços não são direcionados a menores de 18 anos sem o consentimento dos pais ou responsáveis legais.",
        },
        rights: {
          title: "9. Seus Direitos como Titular dos Dados",
          content: "Conforme a LGPD, você tem os seguintes direitos garantidos:",
          items: [
            "Confirmação da existência de tratamento dos seus dados",
            "Acesso aos dados pessoais armazenados",
            "Correção de dados incompletos, inexatos ou desatualizados",
            "Anonimização, bloqueio ou eliminação de dados desnecessários",
            "Portabilidade dos dados a outro fornecedor",
            "Eliminação dos dados tratados com consentimento",
            "Informação sobre compartilhamento dos dados",
            "Revogação do consentimento a qualquer momento",
          ],
        },
        cookies: {
          title: "10. Cookies e Dados de Navegação",
          content: "Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar tráfego e oferecer conteúdos personalizados.",
        },
        changes: {
          title: "11. Alterações na Política de Privacidade",
          content: "Podemos atualizar esta Política a qualquer momento para refletir mudanças em nossas práticas ou requisitos legais.",
        },
        contact: {
          title: "12. Contato e Encarregado de Dados",
          content: "Se você tiver dúvidas sobre como tratamos seus dados pessoais, entre em contato com nosso Encarregado de Dados (DPO).",
        },
      },
      lastUpdated: "Última atualização",
    },
    suppliers: {
      title: "Portal de Fornecedores",
      subtitle: "Parcerias estratégicas com fornecedores que compartilham nosso compromisso com inovação, qualidade e excelência.",
      stats: { suppliers: "Fornecedores", areas: "Áreas de Interesse" },
      partnerTitle: "Seja Nosso Parceiro",
      partnerContent: [
        "Valorizamos relacionamentos duradouros com fornecedores que entregam qualidade, respeito aos prazos e alta capacidade de inovação.",
        "Buscamos parceiros nas áreas de tecnologia, infraestrutura, cloud, design, marketing digital e todos os serviços que complementam o nosso ecossistema de desenvolvimento web.",
      ],
      badges: ["Pagamento em dia", "Relacionamento transparente", "Crescimento mútuo"],
      areasTitle: "Áreas de Interesse",
      areas: [
        "Infraestrutura e Cloud Computing",
        "Serviços de Hospedagem e CDN",
        "Ferramentas de Desenvolvimento",
        "Licenças de Software",
        "Serviços de Design e UI/UX",
        "Marketing Digital e SEO",
        "Hardware e Equipamentos",
        "Consultoria Técnica",
      ],
      contactTitle: "Contato para Fornecedores",
      contactItems: {
        email: "E-mail",
        phone: "Telefone",
        location: "Localização",
        hours: "Horário",
      },
      ctaText: "Pronto para iniciar uma parceria estratégica?",
      ctaPrimary: "Enviar Proposta",
      ctaSecondary: "WhatsApp",
      disclaimer: "A SevenDevX acredita em parcerias duradouras para construir o futuro da tecnologia.",
      responseTime: "Resposta em até 48 horas úteis",
      faqTitle: "Perguntas Frequentes",
      faq: [
        { q: "Como funciona o processo de seleção?", a: "Analisamos cada proposta individualmente, considerando qualidade, preço, prazos e alinhamento com nossos valores." },
        { q: "Quais documentos são necessários?", a: "CNPJ ativo, proposta comercial detalhada e, se aplicável, portfólio de trabalhos anteriores." },
        { q: "Qual o prazo para retorno?", a: "Respondemos todas as propostas em até 48 horas úteis após o recebimento." },
      ],
    },
    suppliersPage: {
      heroTitle: "Portal de Fornecedores",
      heroSubtitle: "Parcerias estratégicas com fornecedores que compartilham nosso compromisso com inovação, qualidade e excelência.",
      statsSuppliers: "Fornecedores",
      statsAreas: "Áreas de Interesse",
      partnerTitle: "Seja Nosso Parceiro",
      partnerContent: [
        "Valorizamos relacionamentos duradouros com fornecedores que entregam qualidade, respeito aos prazos e alta capacidade de inovação.",
        "Buscamos parceiros nas áreas de tecnologia, infraestrutura, cloud, design, marketing digital e todos os serviços que complementam o nosso ecossistema de desenvolvimento web.",
      ],
      badges: ["Pagamento em dia", "Relacionamento transparente", "Crescimento mútuo"],
      areasTitle: "Áreas de Interesse",
      areas: [
        "Infraestrutura e Cloud Computing",
        "Serviços de Hospedagem e CDN",
        "Ferramentas de Desenvolvimento",
        "Licenças de Software",
        "Serviços de Design e UI/UX",
        "Marketing Digital e SEO",
        "Hardware e Equipamentos",
        "Consultoria Técnica",
      ],
      contactTitle: "Contato para Fornecedores",
      contactItems: {
        email: "E-mail",
        phone: "Telefone",
        location: "Localização",
        hours: "Horário",
      },
      ctaContent: "Pronto para iniciar uma parceria estratégica?",
      ctaPrimary: "Enviar Proposta",
      ctaSecondary: "WhatsApp",
      faqTitle: "Perguntas Frequentes",
      faq: [
        {
          q: "Como funciona o processo de seleção?",
          a: "Avaliamos propostas com base em qualidade, preço competitivo e alinhamento com nossos valores.",
        },
        {
          q: "Qual o prazo para resposta?",
          a: "Respondemos todas as propostas em até 48 horas úteis.",
        },
        {
          q: "Vocês trabalham com empresas de outros estados?",
          a: "Sim! Trabalhamos com fornecedores de todo o Brasil e também internacionais.",
        },
      ],
    },
    store: {
      heroTitle: "Transforme sua Visão em Realidade Digital",
      heroSubtitle: "Do conceito ao lançamento — entregamos soluções com design premium, performance otimizada e suporte que garante resultados.",
      heroBadge: "Soluções Premium",
      heroCtaPrimary: "Ver Plano Mais Popular",
      heroCtaSecondary: "Ver Todos os Planos",
      plansTitle: "Planos de Desenvolvimento",
      plansSubtitle: "Escolha a solução ideal para o seu projeto — preços transparentes e entregas objetivas.",
      mostPopular: "Mais Popular",
      requestQuote: "Solicitar Orçamento",
      view: "Ver",
      compareTitle: "Comparativo Rápido",
      compareFeatures: [
        "Design Personalizado",
        "SEO Básico",
        "Painel Administrativo",
        "Integrações API",
        "Suporte Incluso",
        "Entrega Estimada",
      ],
      servicesTitle: "Serviços Premium",
      servicesSubtitle: "Soluções complementares para potencializar sua presença digital",
      plans: {
        landing: {
          name: "Landing Page",
          description: "Página única otimizada para conversão — rápida e com foco em vendas.",
          features: [
            "Design moderno e responsivo",
            "SEO on-page básico",
            "Formulário de contato + integração com WhatsApp",
            "Integração com Google Analytics",
            "Hospedagem + SSL (1 ano) — opcional",
            "Tempo de carregamento otimizado (LCP < 2s)",
          ],
        },
        institutional: {
          name: "Site Institucional",
          description: "Presença digital completa com até 7 páginas e painel administrativo.",
          features: [
            "Design exclusivo premium",
            "SEO avançado + sitemap",
            "Blog/portfólio integrado (opcional)",
            "Painel administrativo (CMS)",
            "3 meses de suporte inclusos",
            "Otimização de performance e PWA (opcional)",
          ],
        },
        custom: {
          name: "Sistema Customizado",
          description: "Soluções sob medida: APIs, painéis, integrações e segurança empresarial.",
          features: [
            "Arquitetura escalável (backend + frontend)",
            "Integração com APIs (ERP, gateways, etc.)",
            "Autenticação, permissões e segurança",
            "Banco de dados robusto e backups",
            "Documentação técnica + deploy automatizado",
            "Suporte contínuo (contrato opcional)",
          ],
        },
      },
      services: {
        consulting: { title: "Consultoria Digital", description: "Análise completa (SEO, performance, UX) com relatório PDF e plano de ação." },
        performance: { title: "Otimização de Performance", description: "Melhorias em Core Web Vitals e redução de TTFB/LCP (relatório antes/depois)." },
        uiux: { title: "UI/UX Design", description: "Redesign + prototipação em Figma e testes de usabilidade." },
        maintenance: { title: "Manutenção Mensal", description: "Atualizações, monitoramento, backups e suporte com SLA." },
      },
      testimonialsTitle: "O Que Dizem Nossos Clientes",
      ctaTitle: "Pronto para Começar?",
      ctaSubtitle: "Solicite um orçamento personalizado e dê o próximo passo.",
      ctaButton: "Solicitar Orçamento",
      guarantee: "Garantia de Satisfação",
      guaranteeText: "30 dias de garantia ou seu dinheiro de volta",
    },
    notFound: {
      title: "404",
      message: "PÁGINA NÃO ENCONTRADA",
      button: "Voltar ao Início",
      suggestions: "Talvez você esteja procurando:",
    },
    modals: {
      confirm: "Confirmar",
      cancel: "Cancelar",
      save: "Salvar",
      delete: "Excluir",
      edit: "Editar",
      close: "Fechar",
      areYouSure: "Tem certeza?",
      success: "Sucesso!",
      error: "Erro!",
      warning: "Atenção!",
      info: "Informação",
      exitIntent: {
        title: "Espere! 🎁",
        subtitle: "Antes de ir, que tal uma consultoria gratuita?",
        description: "Descubra como podemos transformar sua ideia em realidade digital.",
        cta: "Quero Consultoria Grátis",
        dismiss: "Não, obrigado",
        trustBadge: "✅ Sem compromisso • 💬 Resposta em 24h",
      },
    },
    cards: {
      readMore: "Ler mais",
      showLess: "Mostrar menos",
      details: "Detalhes",
      features: "Funcionalidades",
      included: "Incluído",
      notIncluded: "Não incluído",
      popular: "Popular",
      new: "Novo",
      comingSoon: "Em breve",
      limited: "Limitado",
    },
    notifications: {
      success: "Sucesso!",
      error: "Erro!",
      warning: "Atenção!",
      info: "Informação",
      formSubmitted: "Formulário enviado com sucesso!",
      formError: "Erro ao enviar formulário. Tente novamente.",
      copied: "Copiado para a área de transferência!",
      saved: "Alterações salvas com sucesso!",
      deleted: "Item excluído com sucesso!",
      updated: "Atualizado com sucesso!",
      networkError: "Erro de conexão. Verifique sua internet.",
      tryAgain: "Tente novamente",
      dismiss: "Dispensar",
    },
    forms: {
      required: "Obrigatório",
      optional: "Opcional",
      invalidEmail: "E-mail inválido",
      invalidPhone: "Telefone inválido",
      minLength: "Mínimo de {min} caracteres",
      maxLength: "Máximo de {max} caracteres",
      passwordMismatch: "As senhas não coincidem",
      fieldRequired: "Este campo é obrigatório",
      selectOption: "Selecione uma opção",
      uploading: "Enviando...",
      uploadSuccess: "Arquivo enviado com sucesso!",
      uploadError: "Erro ao enviar arquivo",
      dragDrop: "Arraste e solte arquivos aqui",
      browse: "Procurar",
      maxFileSize: "Tamanho máximo: {size}",
    },
    actions: {
      submit: "Enviar",
      send: "Enviar",
      save: "Salvar",
      cancel: "Cancelar",
      continue: "Continuar",
      back: "Voltar",
      next: "Próximo",
      finish: "Finalizar",
      reset: "Resetar",
      clear: "Limpar",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      download: "Baixar",
      upload: "Enviar",
      share: "Compartilhar",
      copy: "Copiar",
      print: "Imprimir",
      export: "Exportar",
      import: "Importar",
      refresh: "Atualizar",
      retry: "Tentar novamente",
      viewDetails: "Ver detalhes",
      seeAll: "Ver todos",
      loadMore: "Carregar mais",
      showMore: "Mostrar mais",
      showLess: "Mostrar menos",
      expand: "Expandir",
      collapse: "Recolher",
      apply: "Aplicar",
      confirm: "Confirmar",
    },
    tooltips: {
      scrollToTop: "Voltar ao topo",
      openMenu: "Abrir menu",
      closeMenu: "Fechar menu",
      changeLanguage: "Alterar idioma",
      toggleTheme: "Alternar tema",
      shareOnWhatsapp: "Compartilhar no WhatsApp",
      shareOnLinkedin: "Compartilhar no LinkedIn",
      shareOnTwitter: "Compartilhar no Twitter",
      copyLink: "Copiar link",
      viewFullscreen: "Ver em tela cheia",
      exitFullscreen: "Sair da tela cheia",
      zoomIn: "Aumentar zoom",
      zoomOut: "Diminuir zoom",
      play: "Reproduzir",
      pause: "Pausar",
      mute: "Silenciar",
      unmute: "Ativar som",
    },
    accessibility: {
      skipToContent: "Pular para o conteúdo",
      mainNavigation: "Navegação principal",
      openInNewTab: "Abre em nova aba",
      externalLink: "Link externo",
      loading: "Carregando",
      imageOf: "Imagem de",
      slideOf: "Slide {current} de {total}",
      currentPage: "Página atual",
      goToPage: "Ir para página",
      previousSlide: "Slide anterior",
      nextSlide: "Próximo slide",
      closeDialog: "Fechar diálogo",
      expandSection: "Expandir seção",
      collapseSection: "Recolher seção",
      closeModal: "Fechar modal",
      testimonialFrom: "Depoimento de",
    },
    blog: {
      heroLabel: "Blog & Insights",
      heroTitle: "Construindo Produtos Digitais",
      heroTitleHighlight: "com Tecnologia, Performance e Design",
      heroSubtitle: "Artigos, tutoriais e insights práticos sobre desenvolvimento moderno, frontend, backend e criação de produtos digitais.",
      featuredLabel: "Artigo em Destaque",
      readFullArticle: "Ler artigo completo",
      searchPlaceholder: "Buscar artigos...",
      allCategories: "Todos",
      noResults: "Nenhum artigo encontrado",
      noResultsFor: "Sem resultados para",
      newArticlesSoon: "Novos artigos em breve.",
      ctaTitle: "Quer conteúdo exclusivo?",
      ctaSubtitle: "Entre em contato e descubra como podemos ajudar seu projeto a crescer.",
      ctaButton: "Fale Conosco",
      backToBlog: "Voltar ao Blog",
      readingTime: "min de leitura",
      views: "visualizações",
      share: "Compartilhar",
      authorTeam: "Time SevenDevX",
      authorDescription: "Desenvolvimento de software, design de interfaces e criação de produtos digitais com foco em performance.",
      contactLink: "Entre em contato",
      continuReading: "Continue lendo",
      likedContent: "Gostou do conteúdo?",
      likedContentSubtitle: "Entre em contato para transformar suas ideias em realidade.",
    },
    projectsHub: {
      heroTitle: "Todos os Projetos",
      heroSubtitle: "Explorando soluções reais com tecnologia e design de alto nível",
      backButton: "Voltar",
      projects: "projetos",
      highlights: "destaques",
      clearFilters: "Limpar filtros",
      featured: "Destaque",
      mainFeatured: "Destaque Principal",
    },
    pwa: {
      installApp: "Instalar aplicativo",
      updateAvailable: "Atualização disponível",
      updateNow: "Atualizar agora",
      later: "Depois",
      offlineReady: "Pronto para uso offline",
      offlineMessage: "O aplicativo está disponível mesmo sem internet.",
      newContent: "Novo conteúdo disponível",
      reload: "Recarregar",
    },
    common: {
      loading: "Carregando...",
      error: "Erro",
      close: "Fechar",
      learnMore: "Saiba mais",
      viewAll: "Ver todos",
      from: "A partir de",
      perMonth: "/mês",
      days: "dias",
      onConsultation: "Sob consulta",
      yes: "Sim",
      no: "Não",
      or: "ou",
      and: "e",
      by: "por",
      in: "em",
      of: "de",
      to: "para",
      at: "às",
      for: "para",
      with: "com",
      without: "sem",
      all: "Todos",
      none: "Nenhum",
      other: "Outro",
      more: "Mais",
      less: "Menos",
      new: "Novo",
      old: "Antigo",
      free: "Grátis",
      paid: "Pago",
      popular: "Popular",
      recommended: "Recomendado",
      featured: "Destaque",
      trending: "Em alta",
      exclusive: "Exclusivo",
      limited: "Limitado",
      soon: "Em breve",
      now: "Agora",
      today: "Hoje",
      yesterday: "Ontem",
      tomorrow: "Amanhã",
      week: "Semana",
      month: "Mês",
      year: "Ano",
      hours: "horas",
      minutes: "minutos",
      seconds: "segundos",
    },
  },

  // 🇺🇸 English
  en: {
    header: {
      about: "ABOUT",
      services: "SERVICES",
      projects: "PROJECTS",
      contact: "CONTACT",
      store: "STORE",
    },
    aboutPage: {
      heroTitle: "About SevenDevX",
      heroSubtitle: "Learn about our history, mission and the values that guide every project we develop.",
      storyTitle: "Our Story",
      storyContent: [
        "SevenDevX was born in 2023 with a clear vision: democratize access to high-quality digital solutions. Founded by developers passionate about technology, we started as a small team with big ambitions.",
        "Since then, we have evolved into a complete web development company, always maintaining our commitment to technical excellence and customer satisfaction. Each project is an opportunity to exceed expectations and create memorable digital experiences.",
        "Today, we serve clients from various segments, from innovative startups to established companies, always with the same care and dedication that brought us here.",
      ],
      timeline: {
        title: "Our Journey",
        subtitle: "Important milestones in SevenDevX's history",
        items: [
          {
            year: "2023",
            title: "Foundation",
            description: "Start of operations focusing on custom web development and innovative digital solutions.",
          },
          {
            year: "2023",
            title: "First Clients",
            description: "We won our first clients and established strategic partnerships in the market.",
          },
          {
            year: "2024",
            title: "Service Expansion",
            description: "We expanded our portfolio including maintenance, consulting and software installation.",
          },
          {
            year: "2024",
            title: "Consolidation",
            description: "Market recognition for quality and innovation in our projects.",
          },
          {
            year: "2025",
            title: "New Horizons",
            description: "Expansion to new markets and investment in emerging technologies.",
          },
        ],
      },
      mission: {
        title: "Mission",
        content: "Transform ideas into innovative digital solutions, offering excellent web development focused on performance, design and user experience.",
      },
      vision: {
        title: "Vision",
        content: "Be a reference in web development in Brazil and Latin America, recognized for technical quality, constant innovation and positive impact on our clients' businesses.",
      },
      values: {
        title: "Our Values",
        subtitle: "The principles that guide every decision and project",
        items: [
          {
            title: "Excellence",
            description: "We strive for perfection in every line of code and pixel of design.",
          },
          {
            title: "Integrity",
            description: "Transparency and honesty in all relationships with clients and partners.",
          },
          {
            title: "Collaboration",
            description: "We work as an extension of the client's team, together for success.",
          },
          {
            title: "Innovation",
            description: "We use the most modern technologies to deliver cutting-edge solutions.",
          },
          {
            title: "Agility",
            description: "Fast deliveries without compromising the quality of the final result.",
          },
          {
            title: "Commitment",
            description: "We meet deadlines and exceed expectations on every project.",
          },
        ],
      },
      cta: {
        title: "Ready to turn your idea into reality?",
        subtitle: "Get in touch and discover how we can help your business grow with innovative digital solutions.",
        button: "Contact Us",
      },
    },
    hero: {
      title: "Web Development with Innovation, Design and Performance",
      subtitle: "Custom solutions for your digital presence: websites, landing pages and optimized systems.",
      cta: "Get in Touch",
      scrollDown: "Scroll down",
      watchVideo: "Watch video",
    },
    services: {
      sectionTitle: "Our Services",
      sectionSubtitle: "Complete solutions for your digital presence",
      webDev: {
        title: "Custom Web Development",
        description: "Modern, responsive and optimized websites built with the most advanced technologies.",
      },
      software: {
        title: "Software Installation",
        description: "Professional configuration and complete technical support for enterprise software.",
      },
      maintenance: {
        title: "Computer Maintenance",
        description: "Cleaning, diagnostics and technical repairs for maximum performance and reliability.",
      },
      landingPages: {
        title: "Landing Pages",
        description: "High-converting landing pages optimized for campaigns and sales funnels.",
      },
      consulting: {
        title: "Technology Consulting",
        description: "Strategic guidance and technical expertise to transform your business digitally.",
      },
      viewMore: "View More Details",
      heroTitle: "Our Services",
      heroSubtitle: "Complete technology solutions for your business",
      ctaTitle: "Ready to get started?",
      ctaSubtitle: "Get in touch and let's discuss your project",
      ctaButton: "Contact Us",
      features: {
        webDev: [
          "Modern and responsive websites",
          "E-commerce and online stores",
          "Custom web systems",
          "Advanced SEO optimization",
        ],
        software: [
          "Operating system installation",
          "Environment configuration",
          "Data migration",
          "User training",
        ],
        maintenance: [
          "Preventive cleaning and maintenance",
          "Problem diagnosis",
          "Hardware upgrade",
          "Performance optimization",
        ],
      },
    },
    servicesPage: {
      heroTitle: "Our Services",
      heroSubtitle: "Complete technology solutions focused on quality, innovation and customer satisfaction.",
      whatWeOffer: "What We Offer",
      whatWeOfferSubtitle: "Complete solutions to transform your digital presence",
      ctaTitle: "Ready to get started?",
      ctaSubtitle: "Get in touch and discover how we can help your business grow.",
      ctaButton: "Contact Us",
      webDev: {
        title: "Custom Web Development",
        description: "We create modern, responsive and SEO-optimized websites and web applications. We use cutting-edge technologies like React, TypeScript and Tailwind CSS to ensure performance and scalability.",
        features: [
          "Corporate websites and landing pages",
          "E-commerce and sales platforms",
          "Custom web systems",
          "Search engine optimization (SEO)",
        ],
      },
      software: {
        title: "Software Installation",
        description: "We offer professional installation and configuration services for enterprise software, ensuring everything works perfectly from day one.",
        features: [
          "Operating system installation",
          "Enterprise software configuration",
          "Data migration",
          "User training",
        ],
      },
      maintenance: {
        title: "Computer Maintenance",
        description: "Complete preventive and corrective maintenance service to keep your equipment running at maximum performance and reliability.",
        features: [
          "Cleaning and preventive maintenance",
          "Hardware diagnostics and repair",
          "Component upgrades",
          "Performance optimization",
        ],
      },
      landingPages: {
        title: "Landing Pages",
        description: "We create high-converting landing pages optimized for digital marketing campaigns and sales funnels. Results-focused design.",
        features: [
          "Conversion-focused design",
          "Campaign optimization",
          "Integrated A/B testing",
          "SEO and speed optimized",
        ],
      },
      consulting: {
        title: "Technology Consulting",
        description: "We offer strategic guidance and technical expertise to digitally transform your business, identifying the best solutions for your challenges.",
        features: [
          "Technology analysis and diagnosis",
          "Infrastructure planning",
          "Technology selection",
          "Digital transformation strategy",
        ],
      },
      process: {
        title: "How We Work",
        subtitle: "A 6-step consultative method — from strategic discovery to continuous evolution. Transparency at every step.",
        expandLabel: "View details",
        collapseLabel: "Collapse",
        deliverablesLabel: "Deliverables",
        durationLabel: "Estimated duration",
        toolsLabel: "Tools",
        ctaLabel: "Talk to a specialist",
        steps: [
          {
            n: "01",
            t: "Discovery & Diagnosis",
            d: "We understand your business, audience, goals and analyze the competition to identify real opportunities.",
            duration: "1 to 3 days",
            deliverables: ["Strategic briefing", "Competitor analysis", "Opportunity map", "Defined KPIs"],
            tools: ["Notion", "Google Meet", "Figma FigJam"],
            cta: "Schedule diagnosis",
          },
          {
            n: "02",
            t: "Strategy & Planning",
            d: "We define the ideal solution, architecture, tech stack and detailed roadmap to achieve your goals.",
            duration: "2 to 5 days",
            deliverables: ["Technical architecture", "Sprint roadmap", "Defined stack", "User flows"],
            tools: ["Miro", "Notion", "Excalidraw"],
            cta: "Receive strategy",
          },
          {
            n: "03",
            t: "Proposal & Alignment",
            d: "You receive detailed scope, phased timeline and structured investment — with formal approval before kickoff.",
            duration: "1 to 2 days",
            deliverables: ["Commercial proposal", "Timeline", "Digital contract", "Payment milestones"],
            tools: ["DocuSign", "PandaDoc", "Interactive PDF"],
            cta: "Request quote",
          },
          {
            n: "04",
            t: "Design & Prototyping",
            d: "We create wireframes, UI/UX and interactive prototypes to validate every visual decision before writing a line of code.",
            duration: "5 to 15 days",
            deliverables: ["Wireframes", "UI Kit", "Interactive prototype", "Design system"],
            tools: ["Figma", "Framer", "Adobe XD"],
            cta: "View portfolio",
          },
          {
            n: "05",
            t: "Development & Iteration",
            d: "Weekly sprints with continuous deliveries, real-time staging environment and active client feedback.",
            duration: "2 to 12 weeks",
            deliverables: ["Versioned code", "Staging build", "Automated tests", "Weekly demos"],
            tools: ["React", "TypeScript", "Supabase", "Vercel"],
            cta: "Start project",
          },
          {
            n: "06",
            t: "Launch & Evolution",
            d: "Production deployment, monitoring, performance optimizations, training and continuous post-delivery support.",
            duration: "Ongoing",
            deliverables: ["Production deploy", "Documentation", "Training", "Evolution plan"],
            tools: ["Vercel", "Sentry", "Google Analytics", "Lighthouse"],
            cta: "View plans",
          },
        ],
      },
      faq: {
        title: "Frequently Asked Questions",
        subtitle: "Clear answers organized by topic. Everything you need to know before getting started.",
        searchPlaceholder: "Search question...",
        allLabel: "All",
        noResults: "No questions found. Try another term.",
        ctaTitle: "Still have questions?",
        ctaSubtitle: "Talk directly to our team. Response within 1 business hour.",
        ctaButton: "Talk to specialist",
        categories: [
          {
            id: "investment",
            label: "Investment",
            icon: "💰",
            items: [
              { q: "How much does a SevenDevX project cost?", a: "Investment varies by scope. Premium landing pages start at $500, corporate websites from $1,200 and web systems by quote. After diagnosis, you receive a fixed proposal — no hourly billing." },
              { q: "Are there installments?", a: "Yes. We work with milestone-based installments: deposit (30%), intermediate deliveries and launch. We accept wire transfer, credit card (up to 12x) and PIX." },
              { q: "Can the price change during the project?", a: "No. We work with fixed scope-based proposals. Changes requested after approval are treated as addendums with separate quotes, always with your prior approval." },
              { q: "Is it worth investing in a premium project?", a: "Yes — when you need performance, scalability and real conversion. Our clients report an average 3x increase in qualified leads in the first 90 days after launch." },
            ],
          },
          {
            id: "timeline",
            label: "Timeline",
            icon: "⏱",
            items: [
              { q: "How long does the project take?", a: "Landing pages: 5 to 10 business days. Corporate websites: 2 to 4 weeks. Web systems and platforms: from 6 weeks. Each project receives a custom timeline after diagnosis." },
              { q: "Can the project be delayed?", a: "We work with weekly sprints and client-validated milestones. Delays only occur due to dependency on client approval or content — always communicated in advance." },
              { q: "Can I request urgent timeline?", a: "Yes, we offer fast-track mode with dedicated team. Additional 30% charge for projects with 50% reduced timeline. Availability subject to schedule." },
            ],
          },
          {
            id: "process",
            label: "Process",
            icon: "🧠",
            items: [
              { q: "How does the project start?", a: "It all begins with a diagnosis meeting (free, ~45min) where we understand your business. Within 2 days you receive the formal proposal. After approval, kickoff within 5 business days." },
              { q: "Will I follow the project in real time?", a: "Yes. You'll have access to a continuously updated staging environment, Notion board with tasks, weekly alignment meetings and direct WhatsApp channel with the team." },
              { q: "Can I request changes during development?", a: "Yes, adjustments within scope are expected and welcome. Structural changes or new features are evaluated and included as addendums with your approval." },
              { q: "Do you help with ideas or just execute?", a: "We are strategic partners. At each stage we bring data-driven recommendations, market benchmarks and our experience from hundreds of digital projects." },
            ],
          },
          {
            id: "technology",
            label: "Technology",
            icon: "🛠",
            items: [
              { q: "What technologies do you use?", a: "Modern stack: React, TypeScript, Next.js, Tailwind CSS, Supabase/PostgreSQL, Node.js and Vercel/AWS infrastructure. We choose each technology based on the problem, never on hype." },
              { q: "Is the system scalable?", a: "Fully. Our entire architecture is cloud-native, with auto-scaling, global CDN, intelligent caching and optimized database. Ready to grow from 100 to 1 million users without rewriting." },
              { q: "Can I integrate with other tools?", a: "Yes. We integrate with CRMs (HubSpot, Salesforce, Pipedrive), payment gateways (Stripe, PayPal), ERPs, WhatsApp Business API, Google/Meta Ads and any REST/GraphQL API." },
              { q: "Do you use AI in projects?", a: "Yes, when it adds real value. We implement intelligent chatbots, generative AI automations, predictive analytics and custom copilots for your business." },
            ],
          },
          {
            id: "security",
            label: "Security",
            icon: "🔒",
            items: [
              { q: "Is my data secure?", a: "Yes. We apply end-to-end encryption, multi-factor authentication, mandatory HTTPS, RLS (Row Level Security) on database, automatic backups and full LGPD/GDPR compliance." },
              { q: "Do you sign NDA (non-disclosure agreement)?", a: "Yes, at no additional cost. We sign NDA even before strategic diagnosis, ensuring full protection of your business sensitive information." },
              { q: "Is my project confidential?", a: "Absolutely. All projects are treated with professional confidentiality. We only publish portfolio cases with the client's express authorization." },
            ],
          },
          {
            id: "post-delivery",
            label: "Post-Delivery",
            icon: "🚀",
            items: [
              { q: "Is there support after delivery?", a: "Yes. All projects include 30 days of warranty for adjustments and corrections. After this period, we offer monthly support plans with defined SLA." },
              { q: "Is there continuous maintenance?", a: "We offer maintenance plans starting at $160/month including security updates, monitoring, backups, small adjustments and monthly performance reports." },
              { q: "Can I evolve the system later?", a: "Yes — and we recommend it. We work with evolutionary roadmap: every 3 months we review metrics and propose improvements based on real user behavior." },
              { q: "What if I don't like the result?", a: "Our process includes validation at each stage (design, prototype, sprints), avoiding surprises. If something escapes scope, we redo it at no additional cost within the contract." },
              { q: "Why choose SevenDevX?", a: "We combine consultative strategy, premium design, clean code, enterprise performance and human support. We don't sell websites — we deliver digital assets that generate results." },
              { q: "Do you work with small or large companies?", a: "We serve everyone from startups validating MVPs to established companies modernizing their stack. The method adapts to client size and maturity." },
            ],
          },
        ],
      },
    },
    tech: {
      sectionTitle: "Technologies We Use",
      sectionSubtitle: "Cutting-edge tools for innovative solutions",
      exploreAll: "Explore All Technologies",
      learnMore: "Click to learn more",
    },
    techModal: {
      experience: "Experience",
      yearsExperience: "years of experience",
      proficiency: "Proficiency Level",
      useCases: "Use Cases",
      relatedTech: "Related Technologies",
      documentation: "Documentation",
      viewDocs: "View official documentation",
      close: "Close",
      learnMore: "Learn More",
    },
    testimonials: {
      sectionTitle: "What Our Clients Say",
      sectionSubtitle: "Real testimonials from those who trust our work",
      avgRating: "Average Rating",
      readMore: "Read more",
      verifiedClient: "Verified client",
    },
    contact: {
      sectionTitle: "Get in Touch",
      sectionSubtitle: "Let's talk about your project or idea.",
      stepsSubtitle: "Let's discuss your project in {step} simple steps",
      nameLabel: "Full Name",
      namePlaceholder: "Enter your full name",
      phoneLabel: "WhatsApp",
      phonePlaceholder: "+1 (555) 123-4567",
      emailLabel: "Email",
      emailPlaceholder: "your@email.com",
      messageLabel: "Message",
      messagePlaceholder: "Describe your needs or project",
      projectTypeLabel: "Project Type",
      projectTypePlaceholder: "Select type",
      budgetLabel: "Estimated Budget (Optional)",
      budgetPlaceholder: "Select a range",
      confirmData: "I declare that the information provided is true.",
      acceptPrivacy: "I have read and agree to the",
      privacyPolicy: "Privacy Policy",
      submit: "Submit",
      next: "Next",
      back: "Back",
      step1: "Personal Data",
      step2: "Project",
      step3: "Confirmation",
      successTitle: "Success",
      successMessage: "You will be redirected to WhatsApp.",
      errorTitle: "Error",
      errorMessage: "Please accept the terms to proceed.",
      projectTypes: [
        "Landing Page",
        "Corporate Website",
        "E-commerce",
        "Web System",
        "Mobile App",
        "Maintenance",
        "Other",
      ],
      budgetRanges: [
        "Up to $500",
        "$500 - $1,500",
        "$1,500 - $3,000",
        "Above $3,000",
        "Prefer not to say",
      ],
      companyLabel: "Company",
      companyPlaceholder: "Your company name (optional)",
      deadlineLabel: "Desired Deadline",
      deadlinePlaceholder: "When do you need the project?",
      urgentLabel: "Urgent project",
    },
    footer: {
      copyright: "SEVENDEVX",
      privacy: "PRIVACY",
      suppliers: "SUPPLIERS",
      allRightsReserved: "All rights reserved",
      madeWith: "Made with",
      followUs: "Follow us",
      newsletter: "Newsletter",
      newsletterPlaceholder: "Your best email",
      subscribe: "Subscribe",
    },
    projects: {
      sectionTitle: "Our Projects",
      sectionSubtitle: "Portfolio of developed works",
      viewProject: "View Project",
      viewCode: "Code",
      noDemo: "No public demo",
      technologies: "Technologies",
      swipeHint: "Swipe to navigate",
      noResults: "No projects found",
      heroTitle: "Projects & Technologies",
      heroSubtitle: "Our modern tech stack to create high-performance solutions.",
      techShowcaseTitle: "Tech Stack",
      portfolioTitle: "Featured Projects",
      filterAll: "All",
      filterWeb: "Web",
      filterMobile: "Mobile",
      filterDesign: "Design",
      details: "Details",
      challenge: "Challenge",
      solution: "Solution",
      results: "Results",
      duration: "Duration",
      client: "Client",
      year: "Year",
    },
    projectsPage: {
      heroTitle: "Projects & Technologies",
      heroSubtitle: "We work with the most modern and in-demand technologies in the market.",
      techShowcaseLoading: "Loading technologies...",
      portfolioTitle: "Featured Projects",
    },
    projectModal: {
      overview: "Overview",
      features: "Features",
      techStack: "Tech Stack",
      gallery: "Gallery",
      testimonial: "Client Testimonial",
      visitSite: "Visit Site",
      viewSource: "View Code",
      close: "Close",
      nextProject: "Next Project",
      prevProject: "Previous Project",
      shareProject: "Share Project",
      copied: "Link copied!",
    },
    privacy: {
      title: "Privacy Policy",
      intro: "At SevenDevX, privacy and security are priorities. We are committed to transparency in the processing of your personal data, in full compliance with the General Data Protection Law (Law nº 13.709/2018 - LGPD).",
      sections: {
        commitment: {
          title: "1. Commitment to Your Privacy",
          content: "Your right to privacy is fundamental. We process your personal data in an ethical, secure and transparent manner, using it exclusively for legitimate purposes. SevenDevX only collects the information necessary to provide our services, always respecting your rights as data subject.",
        },
        dataCollected: {
          title: "2. What Data We Collect and For What Purposes",
          dataLabel: "Data Collected:",
          purposesLabel: "Purposes:",
          dataItems: [
            "Full name – Identification and service personalization",
            "Email – Communication, sending information, proposals and support",
            "Phone/WhatsApp – Direct contact and personalized support",
            "Message – Details of your request, quote or project",
            "Browsing data and cookies – To improve your site experience",
          ],
          purposes: [
            "Respond to requests, questions and quote requests",
            "Provide our services and technical support",
            "Execute contracts and provide services",
            "Improve our services, communication and user experience",
            "Conduct marketing actions (only with your consent)",
            "Comply with legal and regulatory obligations",
          ],
        },
        legalBasis: {
          title: "3. Legal Basis for Data Processing",
          content: "The processing of your personal data is based on the following legal bases provided by LGPD:",
          items: [
            "Consent – When you expressly authorize the use of your data",
            "Contract execution – For providing contracted services",
            "Legal compliance – When required by law",
            "Legitimate interest – For service improvements and security",
          ],
        },
        collection: {
          title: "4. How We Collect Your Data",
          content: "Your personal data is collected in the following ways:",
          items: [
            "Contact forms available on the official website",
            "Direct contact via WhatsApp, email or phone",
            "Website navigation (cookies and technical information)",
            "Interactions on social networks and digital platforms",
          ],
        },
        sharing: {
          title: "5. Data Sharing",
          content: "SevenDevX does not sell, rent or share your personal information with third parties for commercial purposes. Sharing only occurs in the following situations:",
          items: [
            "With technology partners (hosting, CRM, email marketing) necessary for service operation",
            "With public authorities, when there is a legal obligation or court order",
            "In corporate operations, such as merger or acquisition, always maintaining data protection",
          ],
        },
        storage: {
          title: "6. Data Storage and Retention",
          content: "Your personal data is stored securely and kept only for the time necessary to fulfill the purposes for which it was collected, or while there is a legal retention obligation. Navigation data is kept during the session or according to your cookie preferences. After the end of the relationship or legal term, data is anonymized or securely deleted.",
        },
        security: {
          title: "7. Data Protection and Security",
          content: "We apply appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure or destruction. This includes encryption, access controls, security audits and team training. Despite all efforts, no system is completely secure, and we commit to notifying immediately in case of any security incident.",
        },
        children: {
          title: "8. Children's Data",
          content: "Our services are not intended for minors under 18 without parental or legal guardian consent. If we identify inadvertent collection of data from minors without authorization, the data will be immediately removed from our systems.",
        },
        rights: {
          title: "9. Your Rights as Data Subject",
          content: "Under the General Data Protection Law (LGPD), you have the following guaranteed rights:",
          contactPrompt: "To exercise any of these rights, contact us:",
          items: [
            "Confirmation of the existence of data processing",
            "Access to stored personal data",
            "Correction of incomplete, inaccurate or outdated data",
            "Anonymization, blocking or deletion of unnecessary or non-compliant data",
            "Data portability to another service provider",
            "Deletion of data processed with consent, except for legal obligation",
            "Information about data sharing with third parties",
            "Revocation of consent at any time",
          ],
        },
        cookies: {
          title: "10. Cookies and Navigation Data",
          content: "We use cookies and similar technologies to improve your experience, analyze traffic, understand how you use our site and offer personalized and relevant content. Cookies can be essential (necessary for site operation), performance (usage analysis) or marketing (personalization). You can manage and configure your cookie preferences in your browser settings at any time.",
        },
        changes: {
          title: "11. Changes to Privacy Policy",
          content: "We may update this Privacy Policy at any time to reflect changes in our practices, services or legal requirements. Changes will always be available on this page, with indication of the update date. We recommend that you periodically review this policy to stay informed about how we protect your data.",
        },
        contact: {
          title: "12. Contact and Data Protection Officer",
          content: "If you have questions, suggestions or requests about how we handle your personal data, contact our Data Protection Officer (DPO):",
          companyName: "SevenDevX – Technology Solutions",
          location: "Belo Horizonte – MG, Brazil",
        },
      },
      lastUpdate: "Last update",
    },
    privacyPage: {
      title: "Privacy Policy",
      intro: "At SevenDevX, privacy and security are priorities. We are committed to transparency in the processing of your personal data, in full compliance with data protection laws.",
      sections: {
        commitment: {
          title: "1. Commitment to Your Privacy",
          content: "Your right to privacy is fundamental. We process your personal data in an ethical, secure and transparent manner, using it exclusively for legitimate purposes.",
        },
        dataCollection: {
          title: "2. Data We Collect and Purposes",
          dataList: [
            "Full name – Identification and personalized service",
            "Email – Communication, sending information, proposals and support",
            "Phone/WhatsApp – Direct contact and personalized support",
            "Message – Details of your request, quote or project",
            "Browsing data and cookies – To improve your experience on the site",
          ],
          purposes: [
            "Respond to requests, questions and quote requests",
            "Provide our services and technical support",
            "Execute contracts and provide services",
            "Improve our services, communication and user experience",
            "Conduct marketing actions (only with your consent)",
            "Comply with legal and regulatory obligations",
          ],
        },
        legalBasis: {
          title: "3. Legal Bases for Data Processing",
          content: "The processing of your personal data is based on the following legal bases:",
          items: [
            "Consent – When you expressly authorize the use of your data",
            "Contract execution – For providing contracted services",
            "Legal obligations – When required by law",
            "Legitimate interest – For service improvements and security",
          ],
        },
        howWeCollect: {
          title: "4. How We Collect Your Data",
          items: [
            "Contact forms available on the official website",
            "Direct contact via WhatsApp, email or phone",
            "Website browsing (cookie data and technical information)",
            "Interactions on social networks and digital platforms",
          ],
        },
        sharing: {
          title: "5. Data Sharing",
          content: "SevenDevX does not sell, rent or share your personal information with third parties for commercial purposes.",
          items: [
            "With technology partners necessary for service operation",
            "With public authorities, when there is a legal obligation",
            "In corporate operations, always maintaining data protection",
          ],
        },
        storage: {
          title: "6. Data Storage and Retention",
          content: "Your personal data is stored securely and kept only for the time necessary to fulfill the purposes for which it was collected.",
        },
        protection: {
          title: "7. Data Protection and Security",
          content: "We apply appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure or destruction.",
        },
        children: {
          title: "8. Children's Data",
          content: "Our services are not directed to minors under 18 years of age without the consent of parents or legal guardians.",
        },
        rights: {
          title: "9. Your Rights as Data Subject",
          content: "Under data protection laws, you have the following guaranteed rights:",
          items: [
            "Confirmation of the existence of data processing",
            "Access to stored personal data",
            "Correction of incomplete, inaccurate or outdated data",
            "Anonymization, blocking or deletion of unnecessary data",
            "Data portability to another service provider",
            "Deletion of data processed with consent",
            "Information about data sharing",
            "Revocation of consent at any time",
          ],
        },
        cookies: {
          title: "10. Cookies and Browsing Data",
          content: "We use cookies and similar technologies to improve your experience, analyze traffic and offer personalized content.",
        },
        changes: {
          title: "11. Changes to Privacy Policy",
          content: "We may update this Policy at any time to reflect changes in our practices or legal requirements.",
        },
        contact: {
          title: "12. Contact and Data Protection Officer",
          content: "If you have questions about how we process your personal data, please contact our Data Protection Officer (DPO).",
        },
      },
      lastUpdated: "Last updated",
    },
    suppliers: {
      title: "Supplier Portal",
      subtitle: "Strategic partnerships with suppliers who share our commitment to innovation, quality and excellence.",
      stats: { suppliers: "Suppliers", areas: "Areas of Interest" },
      partnerTitle: "Become Our Partner",
      partnerContent: [
        "We value lasting relationships with suppliers who deliver quality, respect deadlines and have high innovation capacity.",
        "We seek partners in technology, infrastructure, cloud, design, digital marketing and all services that complement our web development ecosystem.",
      ],
      badges: ["Timely payment", "Transparent relationship", "Mutual growth"],
      areasTitle: "Areas of Interest",
      areas: [
        "Infrastructure and Cloud Computing",
        "Hosting and CDN Services",
        "Development Tools",
        "Software Licenses",
        "Design and UI/UX Services",
        "Digital Marketing and SEO",
        "Hardware and Equipment",
        "Technical Consulting",
      ],
      contactTitle: "Supplier Contact",
      contactItems: {
        email: "Email",
        phone: "Phone",
        location: "Location",
        hours: "Hours",
      },
      ctaText: "Ready to start a strategic partnership?",
      ctaPrimary: "Send Proposal",
      ctaSecondary: "WhatsApp",
      disclaimer: "SevenDevX believes in lasting partnerships to build the future of technology.",
      responseTime: "Response within 48 business hours",
      faqTitle: "Frequently Asked Questions",
      faq: [
        { q: "How does the selection process work?", a: "We analyze each proposal individually, considering quality, price, deadlines and alignment with our values." },
        { q: "What documents are required?", a: "Active business registration, detailed commercial proposal and, if applicable, portfolio of previous work." },
        { q: "What is the response time?", a: "We respond to all proposals within 48 business hours of receipt." },
      ],
    },
    suppliersPage: {
      heroTitle: "Supplier Portal",
      heroSubtitle: "Strategic partnerships with suppliers who share our commitment to innovation, quality and excellence.",
      statsSuppliers: "Suppliers",
      statsAreas: "Areas of Interest",
      partnerTitle: "Become Our Partner",
      partnerContent: [
        "We value long-lasting relationships with suppliers who deliver quality, respect deadlines and have high innovation capacity.",
        "We seek partners in technology, infrastructure, cloud, design, digital marketing and all services that complement our web development ecosystem.",
      ],
      badges: ["On-time payment", "Transparent relationship", "Mutual growth"],
      areasTitle: "Areas of Interest",
      areas: [
        "Infrastructure and Cloud Computing",
        "Hosting and CDN Services",
        "Development Tools",
        "Software Licenses",
        "Design and UI/UX Services",
        "Digital Marketing and SEO",
        "Hardware and Equipment",
        "Technical Consulting",
      ],
      contactTitle: "Supplier Contact",
      contactItems: {
        email: "Email",
        phone: "Phone",
        location: "Location",
        hours: "Hours",
      },
      ctaContent: "Ready to start a strategic partnership?",
      ctaPrimary: "Send Proposal",
      ctaSecondary: "WhatsApp",
      faqTitle: "Frequently Asked Questions",
      faq: [
        {
          q: "How does the selection process work?",
          a: "We evaluate proposals based on quality, competitive pricing and alignment with our values.",
        },
        {
          q: "What is the response time?",
          a: "We respond to all proposals within 48 business hours.",
        },
        {
          q: "Do you work with companies from other states/countries?",
          a: "Yes! We work with suppliers from all over Brazil and internationally.",
        },
      ],
    },
    store: {
      heroTitle: "Transform Your Vision into Digital Reality",
      heroSubtitle: "From concept to launch — we deliver solutions with premium design, optimized performance and support that guarantees results.",
      heroBadge: "Premium Solutions",
      heroCtaPrimary: "See Most Popular Plan",
      heroCtaSecondary: "See All Plans",
      plansTitle: "Development Plans",
      plansSubtitle: "Choose the ideal solution for your project — transparent pricing and objective deliveries.",
      mostPopular: "Most Popular",
      requestQuote: "Request Quote",
      view: "View",
      compareTitle: "Quick Comparison",
      compareFeatures: [
        "Custom Design",
        "Basic SEO",
        "Admin Panel",
        "API Integrations",
        "Included Support",
        "Estimated Delivery",
      ],
      servicesTitle: "Premium Services",
      servicesSubtitle: "Complementary solutions to enhance your digital presence",
      plans: {
        landing: {
          name: "Landing Page",
          description: "Single page optimized for conversion — fast and sales-focused.",
          features: [
            "Modern and responsive design",
            "Basic on-page SEO",
            "Contact form + WhatsApp integration",
            "Google Analytics integration",
            "Hosting + SSL (1 year) — optional",
            "Optimized loading time (LCP < 2s)",
          ],
        },
        institutional: {
          name: "Institutional Website",
          description: "Complete digital presence with up to 7 pages and admin panel.",
          features: [
            "Exclusive premium design",
            "Advanced SEO + sitemap",
            "Integrated blog/portfolio (optional)",
            "Admin panel (CMS)",
            "3 months of included support",
            "Performance optimization and PWA (optional)",
          ],
        },
        custom: {
          name: "Custom System",
          description: "Tailored solutions: APIs, panels, integrations and enterprise security.",
          features: [
            "Scalable architecture (backend + frontend)",
            "API integration (ERP, gateways, etc.)",
            "Authentication, permissions and security",
            "Robust database and backups",
            "Technical documentation + automated deploy",
            "Ongoing support (optional contract)",
          ],
        },
      },
      services: {
        consulting: { title: "Digital Consulting", description: "Complete analysis (SEO, performance, UX) with PDF report and action plan." },
        performance: { title: "Performance Optimization", description: "Core Web Vitals improvements and TTFB/LCP reduction (before/after report)." },
        uiux: { title: "UI/UX Design", description: "Redesign + Figma prototyping and usability testing." },
        maintenance: { title: "Monthly Maintenance", description: "Updates, monitoring, backups and SLA support." },
      },
      testimonialsTitle: "What Our Clients Say",
      ctaTitle: "Ready to Get Started?",
      ctaSubtitle: "Request a personalized quote and take the next step.",
      ctaButton: "Request Quote",
      guarantee: "Satisfaction Guarantee",
      guaranteeText: "30-day guarantee or your money back",
    },
    notFound: {
      title: "404",
      message: "PAGE NOT FOUND",
      button: "Back to Home",
      suggestions: "Maybe you are looking for:",
    },
    modals: {
      confirm: "Confirm",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      areYouSure: "Are you sure?",
      success: "Success!",
      error: "Error!",
      warning: "Warning!",
      info: "Information",
      exitIntent: {
        title: "Wait! 🎁",
        subtitle: "Before you go, how about a free consultation?",
        description: "Find out how we can turn your idea into digital reality.",
        cta: "I Want Free Consultation",
        dismiss: "No, thanks",
        trustBadge: "✅ No commitment • 💬 Response in 24h",
      },
    },
    cards: {
      readMore: "Read more",
      showLess: "Show less",
      details: "Details",
      features: "Features",
      included: "Included",
      notIncluded: "Not included",
      popular: "Popular",
      new: "New",
      comingSoon: "Coming soon",
      limited: "Limited",
    },
    notifications: {
      success: "Success!",
      error: "Error!",
      warning: "Warning!",
      info: "Information",
      formSubmitted: "Form submitted successfully!",
      formError: "Error submitting form. Please try again.",
      copied: "Copied to clipboard!",
      saved: "Changes saved successfully!",
      deleted: "Item deleted successfully!",
      updated: "Updated successfully!",
      networkError: "Connection error. Check your internet.",
      tryAgain: "Try again",
      dismiss: "Dismiss",
    },
    forms: {
      required: "Required",
      optional: "Optional",
      invalidEmail: "Invalid email",
      invalidPhone: "Invalid phone",
      minLength: "Minimum {min} characters",
      maxLength: "Maximum {max} characters",
      passwordMismatch: "Passwords do not match",
      fieldRequired: "This field is required",
      selectOption: "Select an option",
      uploading: "Uploading...",
      uploadSuccess: "File uploaded successfully!",
      uploadError: "Error uploading file",
      dragDrop: "Drag and drop files here",
      browse: "Browse",
      maxFileSize: "Maximum size: {size}",
    },
    actions: {
      submit: "Submit",
      send: "Send",
      save: "Save",
      cancel: "Cancel",
      continue: "Continue",
      back: "Back",
      next: "Next",
      finish: "Finish",
      reset: "Reset",
      clear: "Clear",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      download: "Download",
      upload: "Upload",
      share: "Share",
      copy: "Copy",
      print: "Print",
      export: "Export",
      import: "Import",
      refresh: "Refresh",
      retry: "Retry",
      viewDetails: "View details",
      seeAll: "See all",
      loadMore: "Load more",
      showMore: "Show more",
      showLess: "Show less",
      expand: "Expand",
      collapse: "Collapse",
      apply: "Apply",
      confirm: "Confirm",
    },
    tooltips: {
      scrollToTop: "Scroll to top",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      changeLanguage: "Change language",
      toggleTheme: "Toggle theme",
      shareOnWhatsapp: "Share on WhatsApp",
      shareOnLinkedin: "Share on LinkedIn",
      shareOnTwitter: "Share on Twitter",
      copyLink: "Copy link",
      viewFullscreen: "View fullscreen",
      exitFullscreen: "Exit fullscreen",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      play: "Play",
      pause: "Pause",
      mute: "Mute",
      unmute: "Unmute",
    },
    accessibility: {
      skipToContent: "Skip to content",
      mainNavigation: "Main navigation",
      openInNewTab: "Opens in new tab",
      externalLink: "External link",
      loading: "Loading",
      imageOf: "Image of",
      slideOf: "Slide {current} of {total}",
      currentPage: "Current page",
      goToPage: "Go to page",
      previousSlide: "Previous slide",
      nextSlide: "Next slide",
      closeDialog: "Close dialog",
      expandSection: "Expand section",
      collapseSection: "Collapse section",
      closeModal: "Close modal",
      testimonialFrom: "Testimonial from",
    },
    blog: {
      heroLabel: "Blog & Insights",
      heroTitle: "Building Digital Products",
      heroTitleHighlight: "with Technology, Performance and Design",
      heroSubtitle: "Articles, tutorials and practical insights on modern development, frontend, backend and digital product creation.",
      featuredLabel: "Featured Article",
      readFullArticle: "Read full article",
      searchPlaceholder: "Search articles...",
      allCategories: "All",
      noResults: "No articles found",
      noResultsFor: "No results for",
      newArticlesSoon: "New articles coming soon.",
      ctaTitle: "Want exclusive content?",
      ctaSubtitle: "Get in touch and discover how we can help your project grow.",
      ctaButton: "Contact Us",
      backToBlog: "Back to Blog",
      readingTime: "min read",
      views: "views",
      share: "Share",
      authorTeam: "SevenDevX Team",
      authorDescription: "Software development, interface design and digital product creation focused on performance.",
      contactLink: "Get in touch",
      continuReading: "Continue reading",
      likedContent: "Enjoyed this content?",
      likedContentSubtitle: "Get in touch to turn your ideas into reality.",
    },
    projectsHub: {
      heroTitle: "All Projects",
      heroSubtitle: "Exploring real solutions with high-level technology and design",
      backButton: "Back",
      projects: "projects",
      highlights: "highlights",
      clearFilters: "Clear filters",
      featured: "Featured",
      mainFeatured: "Main Featured",
    },
    pwa: {
      installApp: "Install app",
      updateAvailable: "Update available",
      updateNow: "Update now",
      later: "Later",
      offlineReady: "Ready for offline use",
      offlineMessage: "The app is available even without internet.",
      newContent: "New content available",
      reload: "Reload",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      close: "Close",
      learnMore: "Learn more",
      viewAll: "View all",
      from: "From",
      perMonth: "/month",
      days: "days",
      onConsultation: "On consultation",
      yes: "Yes",
      no: "No",
      or: "or",
      and: "and",
      by: "by",
      in: "in",
      of: "of",
      to: "to",
      at: "at",
      for: "for",
      with: "with",
      without: "without",
      all: "All",
      none: "None",
      other: "Other",
      more: "More",
      less: "Less",
      new: "New",
      old: "Old",
      free: "Free",
      paid: "Paid",
      popular: "Popular",
      recommended: "Recommended",
      featured: "Featured",
      trending: "Trending",
      exclusive: "Exclusive",
      limited: "Limited",
      soon: "Coming soon",
      now: "Now",
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      week: "Week",
      month: "Month",
      year: "Year",
      hours: "hours",
      minutes: "minutes",
      seconds: "seconds",
    },
  },

  // 🇪🇸 Español
  es: {
    header: {
      about: "SOBRE",
      services: "SERVICIOS",
      projects: "PROYECTOS",
      contact: "CONTACTO",
      store: "TIENDA",
    },
    aboutPage: {
      heroTitle: "Sobre SevenDevX",
      heroSubtitle: "Conoce nuestra historia, misión y los valores que guían cada proyecto que desarrollamos.",
      storyTitle: "Nuestra Historia",
      storyContent: [
        "SevenDevX nació en 2023 con una visión clara: democratizar el acceso a soluciones digitales de alta calidad. Fundada por desarrolladores apasionados por la tecnología, comenzamos como un pequeño equipo con grandes ambiciones.",
        "Desde entonces, hemos evolucionado hacia una empresa completa de desarrollo web, siempre manteniendo nuestro compromiso con la excelencia técnica y la satisfacción del cliente. Cada proyecto es una oportunidad para superar expectativas y crear experiencias digitales memorables.",
        "Hoy, atendemos clientes de diversos segmentos, desde startups innovadoras hasta empresas consolidadas, siempre con el mismo cuidado y dedicación que nos trajeron hasta aquí.",
      ],
      timeline: {
        title: "Nuestro Viaje",
        subtitle: "Hitos importantes en la historia de SevenDevX",
        items: [
          {
            year: "2023",
            title: "Fundación",
            description: "Inicio de operaciones con enfoque en desarrollo web personalizado y soluciones digitales innovadoras.",
          },
          {
            year: "2023",
            title: "Primeros Clientes",
            description: "Conquistamos nuestros primeros clientes y establecimos asociaciones estratégicas en el mercado.",
          },
          {
            year: "2024",
            title: "Expansión de Servicios",
            description: "Ampliamos nuestro portafolio incluyendo mantenimiento, consultoría e instalación de software.",
          },
          {
            year: "2024",
            title: "Consolidación",
            description: "Reconocimiento en el mercado por la calidad e innovación en nuestros proyectos.",
          },
          {
            year: "2025",
            title: "Nuevos Horizontes",
            description: "Expansión a nuevos mercados e inversión en tecnologías emergentes.",
          },
        ],
      },
      mission: {
        title: "Misión",
        content: "Transformar ideas en soluciones digitales innovadoras, ofreciendo desarrollo web de excelencia con enfoque en rendimiento, diseño y experiencia del usuario.",
      },
      vision: {
        title: "Visión",
        content: "Ser referencia en desarrollo web en Brasil y América Latina, reconocida por la calidad técnica, innovación constante y el impacto positivo en los negocios de nuestros clientes.",
      },
      values: {
        title: "Nuestros Valores",
        subtitle: "Los principios que guían cada decisión y proyecto",
        items: [
          {
            title: "Excelencia",
            description: "Buscamos la perfección en cada línea de código y píxel de diseño.",
          },
          {
            title: "Integridad",
            description: "Transparencia y honestidad en todas las relaciones con clientes y socios.",
          },
          {
            title: "Colaboración",
            description: "Trabajamos como extensión del equipo del cliente, juntos por el éxito.",
          },
          {
            title: "Innovación",
            description: "Utilizamos las tecnologías más modernas para entregar soluciones de vanguardia.",
          },
          {
            title: "Agilidad",
            description: "Entregas rápidas sin comprometer la calidad del resultado final.",
          },
          {
            title: "Compromiso",
            description: "Cumplimos plazos y superamos expectativas en cada proyecto.",
          },
        ],
      },
      cta: {
        title: "¿Listo para transformar tu idea en realidad?",
        subtitle: "Ponte en contacto y descubre cómo podemos ayudar a tu empresa a crecer con soluciones digitales innovadoras.",
        button: "Contáctanos",
      },
    },
    hero: {
      title: "Desarrollo Web con Innovación, Diseño y Rendimiento",
      subtitle: "Soluciones personalizadas para tu presencia digital: sitios web, landing pages y sistemas optimizados.",
      cta: "Contáctanos",
      scrollDown: "Desliza hacia abajo",
      watchVideo: "Ver video",
    },
    services: {
      sectionTitle: "Nuestros Servicios",
      sectionSubtitle: "Soluciones completas para tu presencia digital",
      webDev: {
        title: "Desarrollo Web Personalizado",
        description: "Sitios modernos, responsivos y optimizados construidos con las tecnologías más avanzadas.",
      },
      software: {
        title: "Instalación de Software",
        description: "Configuración profesional y soporte técnico completo para software empresarial.",
      },
      maintenance: {
        title: "Mantenimiento de Computadoras",
        description: "Limpieza, diagnóstico y reparaciones técnicas para máximo rendimiento y confiabilidad.",
      },
      landingPages: {
        title: "Landing Pages",
        description: "Landing pages de alta conversión optimizadas para campañas y embudos de ventas.",
      },
      consulting: {
        title: "Consultoría Tecnológica",
        description: "Orientación estratégica y experiencia técnica para transformar digitalmente tu negocio.",
      },
      viewMore: "Ver Más Detalles",
      heroTitle: "Nuestros Servicios",
      heroSubtitle: "Soluciones tecnológicas completas para tu empresa",
      ctaTitle: "¿Listo para empezar?",
      ctaSubtitle: "Contáctanos y discutamos tu proyecto",
      ctaButton: "Contáctanos",
      features: {
        webDev: [
          "Sitios modernos y responsivos",
          "E-commerce y tiendas virtuales",
          "Sistemas web personalizados",
          "Optimización SEO avanzada",
        ],
        software: [
          "Instalación de sistemas operativos",
          "Configuración de ambientes",
          "Migración de datos",
          "Capacitación de usuarios",
        ],
        maintenance: [
          "Limpieza y mantenimiento preventivo",
          "Diagnóstico de problemas",
          "Upgrade de hardware",
          "Optimización de rendimiento",
        ],
      },
    },
    servicesPage: {
      heroTitle: "Nuestros Servicios",
      heroSubtitle: "Soluciones tecnológicas completas enfocadas en calidad, innovación y satisfacción del cliente.",
      whatWeOffer: "Lo Que Ofrecemos",
      whatWeOfferSubtitle: "Soluciones completas para transformar tu presencia digital",
      ctaTitle: "¿Listo para empezar?",
      ctaSubtitle: "Contáctanos y descubre cómo podemos ayudar a tu empresa a crecer.",
      ctaButton: "Contáctanos",
      webDev: {
        title: "Desarrollo Web Personalizado",
        description: "Creamos sitios y aplicaciones web modernas, responsivas y optimizadas para SEO. Utilizamos las últimas tecnologías como React, TypeScript y Tailwind CSS para garantizar rendimiento y escalabilidad.",
        features: [
          "Sitios corporativos y landing pages",
          "E-commerce y plataformas de ventas",
          "Sistemas web personalizados",
          "Optimización para motores de búsqueda (SEO)",
        ],
      },
      software: {
        title: "Instalación de Software",
        description: "Ofrecemos servicios profesionales de instalación y configuración de software empresarial, garantizando que todo funcione perfectamente desde el primer día.",
        features: [
          "Instalación de sistemas operativos",
          "Configuración de software empresarial",
          "Migración de datos",
          "Capacitación de usuarios",
        ],
      },
      maintenance: {
        title: "Mantenimiento de Computadoras",
        description: "Servicio completo de mantenimiento preventivo y correctivo para mantener tus equipos funcionando con máximo rendimiento y confiabilidad.",
        features: [
          "Limpieza y mantenimiento preventivo",
          "Diagnóstico y reparación de hardware",
          "Actualización de componentes",
          "Optimización de rendimiento",
        ],
      },
      landingPages: {
        title: "Landing Pages",
        description: "Creamos landing pages de alta conversión, optimizadas para campañas de marketing digital y embudos de ventas. Diseño enfocado en resultados.",
        features: [
          "Diseño enfocado en conversión",
          "Optimización para campañas",
          "Pruebas A/B integradas",
          "SEO y velocidad optimizados",
        ],
      },
      consulting: {
        title: "Consultoría Tecnológica",
        description: "Ofrecemos orientación estratégica y experiencia técnica para transformar digitalmente tu negocio, identificando las mejores soluciones para tus desafíos.",
        features: [
          "Análisis y diagnóstico tecnológico",
          "Planificación de infraestructura",
          "Selección de tecnologías",
          "Estrategia de transformación digital",
        ],
      },
      process: {
        title: "Cómo Trabajamos",
        subtitle: "Un método consultivo de 6 etapas — del diagnóstico estratégico a la evolución continua. Transparencia en cada paso.",
        expandLabel: "Ver detalles",
        collapseLabel: "Recoger",
        deliverablesLabel: "Entregables",
        durationLabel: "Duración estimada",
        toolsLabel: "Herramientas",
        ctaLabel: "Hablar con especialista",
        steps: [
          {
            n: "01",
            t: "Descubrimiento & Diagnóstico",
            d: "Entendemos tu negocio, audiencia, objetivos y analizamos la competencia para identificar oportunidades reales.",
            duration: "1 a 3 días",
            deliverables: ["Briefing estratégico", "Análisis de competencia", "Mapa de oportunidades", "KPIs definidos"],
            tools: ["Notion", "Google Meet", "Figma FigJam"],
            cta: "Agendar diagnóstico",
          },
          {
            n: "02",
            t: "Estrategia & Planificación",
            d: "Definimos la solución ideal, arquitectura, stack tecnológico y roadmap detallado para alcanzar tus objetivos.",
            duration: "2 a 5 días",
            deliverables: ["Arquitectura técnica", "Roadmap por sprints", "Stack definido", "Flujos de usuario"],
            tools: ["Miro", "Notion", "Excalidraw"],
            cta: "Recibir estrategia",
          },
          {
            n: "03",
            t: "Propuesta & Alineación",
            d: "Recibes alcance detallado, cronograma por fases e inversión estructurada — con aprobación formal antes de iniciar.",
            duration: "1 a 2 días",
            deliverables: ["Propuesta comercial", "Cronograma", "Contrato digital", "Hitos de pago"],
            tools: ["DocuSign", "PandaDoc", "PDF interactivo"],
            cta: "Solicitar presupuesto",
          },
          {
            n: "04",
            t: "Diseño & Prototipado",
            d: "Creamos wireframes, UI/UX y prototipos navegables para validar cada decisión visual antes de programar.",
            duration: "5 a 15 días",
            deliverables: ["Wireframes", "UI Kit", "Prototipo navegable", "Design system"],
            tools: ["Figma", "Framer", "Adobe XD"],
            cta: "Ver portafolio",
          },
          {
            n: "05",
            t: "Desarrollo & Iteración",
            d: "Sprints semanales con entregas continuas, ambiente de homologación en tiempo real y feedback activo del cliente.",
            duration: "2 a 12 semanas",
            deliverables: ["Código versionado", "Build en homologación", "Tests automatizados", "Demos semanales"],
            tools: ["React", "TypeScript", "Supabase", "Vercel"],
            cta: "Iniciar proyecto",
          },
          {
            n: "06",
            t: "Lanzamiento & Evolución",
            d: "Despliegue en producción, monitoreo, optimizaciones de performance, capacitación y soporte continuo.",
            duration: "Continuo",
            deliverables: ["Deploy producción", "Documentación", "Capacitación", "Plan de evolución"],
            tools: ["Vercel", "Sentry", "Google Analytics", "Lighthouse"],
            cta: "Conocer planes",
          },
        ],
      },
      faq: {
        title: "Preguntas Frecuentes",
        subtitle: "Respuestas claras organizadas por tema. Todo lo que necesitas saber antes de comenzar.",
        searchPlaceholder: "Buscar pregunta...",
        allLabel: "Todas",
        noResults: "No se encontraron preguntas. Intenta otro término.",
        ctaTitle: "¿Aún tienes dudas?",
        ctaSubtitle: "Habla directamente con nuestro equipo. Respuesta en hasta 1 hora hábil.",
        ctaButton: "Hablar con especialista",
        categories: [
          {
            id: "inversion",
            label: "Inversión",
            icon: "💰",
            items: [
              { q: "¿Cuánto cuesta un proyecto en SevenDevX?", a: "La inversión varía según el alcance. Landing pages premium desde €450, sitios corporativos desde €1.100 y sistemas web bajo presupuesto. Tras el diagnóstico recibes una propuesta cerrada — sin cobro por hora." },
              { q: "¿Hay financiación?", a: "Sí. Trabajamos con pagos por hitos del proyecto: entrada (30%), entregas intermedias y lanzamiento. Aceptamos transferencia, tarjeta (hasta 12 cuotas) y PIX." },
              { q: "¿El precio puede cambiar durante el proyecto?", a: "No. Trabajamos con propuesta cerrada por alcance. Los cambios solicitados tras la aprobación se tratan como adendas con presupuesto separado, siempre con tu aprobación previa." },
              { q: "¿Vale la pena invertir en un proyecto premium?", a: "Sí — cuando necesitas rendimiento, escalabilidad y conversión real. Nuestros clientes reportan aumento promedio de 3x en leads cualificados en los primeros 90 días tras el lanzamiento." },
            ],
          },
          {
            id: "plazo",
            label: "Plazo",
            icon: "⏱",
            items: [
              { q: "¿Cuánto tiempo lleva el proyecto?", a: "Landing pages: 5 a 10 días hábiles. Sitios corporativos: 2 a 4 semanas. Sistemas web y plataformas: desde 6 semanas. Cada proyecto recibe cronograma personalizado tras el diagnóstico." },
              { q: "¿El proyecto puede atrasarse?", a: "Trabajamos con sprints semanales e hitos validados por el cliente. Los retrasos solo ocurren por dependencia de aprobación o contenido del cliente — siempre comunicados con antelación." },
              { q: "¿Puedo solicitar plazo urgente?", a: "Sí, ofrecemos modalidad fast-track con equipo dedicado. Cargo adicional del 30% para proyectos con plazo reducido en 50%. Disponibilidad sujeta a agenda." },
            ],
          },
          {
            id: "proceso",
            label: "Proceso",
            icon: "🧠",
            items: [
              { q: "¿Cómo empieza el proyecto?", a: "Todo comienza con una reunión de diagnóstico (gratuita, ~45min) donde entendemos tu negocio. En hasta 2 días recibes la propuesta formal. Tras aprobación, kickoff en hasta 5 días hábiles." },
              { q: "¿Seguiré el proyecto en tiempo real?", a: "Sí. Tendrás acceso a un entorno de homologación actualizado continuamente, board en Notion con tareas, reuniones semanales de alineación y canal directo vía WhatsApp con el equipo." },
              { q: "¿Puedo pedir cambios durante el desarrollo?", a: "Sí, los ajustes dentro del alcance son esperados y bienvenidos. Los cambios estructurales o nuevas funcionalidades se evalúan e incluyen como adendas con tu aprobación." },
              { q: "¿Ayudan con ideas o solo ejecutan?", a: "Somos socios estratégicos. En cada etapa traemos recomendaciones basadas en datos, benchmarks de mercado y nuestra experiencia en cientos de proyectos digitales." },
            ],
          },
          {
            id: "tecnologia",
            label: "Tecnología",
            icon: "🛠",
            items: [
              { q: "¿Qué tecnologías utilizan?", a: "Stack moderno: React, TypeScript, Next.js, Tailwind CSS, Supabase/PostgreSQL, Node.js e infraestructura en Vercel/AWS. Elegimos cada tecnología según el problema, nunca por moda." },
              { q: "¿El sistema es escalable?", a: "Totalmente. Toda nuestra arquitectura es cloud-native, con auto-scaling, CDN global, caché inteligente y base de datos optimizada. Lista para crecer de 100 a 1 millón de usuarios sin reescritura." },
              { q: "¿Puedo integrar con otras herramientas?", a: "Sí. Integramos con CRMs (HubSpot, Salesforce, Pipedrive), gateways de pago (Stripe, PayPal), ERPs, WhatsApp Business API, Google/Meta Ads y cualquier API REST/GraphQL." },
              { q: "¿Usan IA en los proyectos?", a: "Sí, cuando agrega valor real. Implementamos chatbots inteligentes, automatizaciones con IA generativa, análisis predictivo y copilotos personalizados para tu negocio." },
            ],
          },
          {
            id: "seguridad",
            label: "Seguridad",
            icon: "🔒",
            items: [
              { q: "¿Mis datos están seguros?", a: "Sí. Aplicamos cifrado punto a punto, autenticación multifactor, HTTPS obligatorio, RLS (Row Level Security) en base de datos, copias de seguridad automáticas y conformidad total con LGPD/GDPR." },
              { q: "¿Firman NDA (acuerdo de confidencialidad)?", a: "Sí, sin costo adicional. Firmamos NDA antes incluso del diagnóstico estratégico, garantizando protección total de la información sensible de tu negocio." },
              { q: "¿Mi proyecto es confidencial?", a: "Absolutamente. Todos los proyectos se tratan con confidencialidad profesional. Solo publicamos casos en el portafolio con autorización expresa del cliente." },
            ],
          },
          {
            id: "post-entrega",
            label: "Post-Entrega",
            icon: "🚀",
            items: [
              { q: "¿Hay soporte tras la entrega?", a: "Sí. Todos los proyectos incluyen 30 días de garantía para ajustes y correcciones. Tras este período, ofrecemos planes mensuales de soporte con SLA definido." },
              { q: "¿Hay mantenimiento continuo?", a: "Ofrecemos planes de mantenimiento desde €140/mes incluyendo actualizaciones de seguridad, monitoreo, copias de seguridad, ajustes pequeños e informes mensuales de rendimiento." },
              { q: "¿Puedo evolucionar el sistema después?", a: "Sí — y lo recomendamos. Trabajamos con roadmap evolutivo: cada 3 meses revisamos métricas y proponemos mejoras basadas en el comportamiento real de los usuarios." },
              { q: "¿Y si no me gusta el resultado?", a: "Nuestro proceso prevé validación en cada etapa (diseño, prototipo, sprints), evitando sorpresas. Si algo escapa del alcance, lo rehacemos sin costo adicional dentro del contrato." },
              { q: "¿Por qué elegir SevenDevX?", a: "Combinamos estrategia consultiva, diseño premium, código limpio, rendimiento enterprise y soporte humano. No vendemos sitios — entregamos activos digitales que generan resultados." },
              { q: "¿Trabajan con empresas pequeñas o grandes?", a: "Atendemos desde startups validando MVPs hasta empresas establecidas modernizando su stack. El método se adapta al tamaño y madurez del cliente." },
            ],
          },
        ],
      },
    },
    tech: {
      sectionTitle: "Tecnologías que Usamos",
      sectionSubtitle: "Herramientas de vanguardia para soluciones innovadoras",
      exploreAll: "Explorar Todas las Tecnologías",
      learnMore: "Haz clic para saber más",
    },
    techModal: {
      experience: "Experiencia",
      yearsExperience: "años de experiencia",
      proficiency: "Nivel de Competencia",
      useCases: "Casos de Uso",
      relatedTech: "Tecnologías Relacionadas",
      documentation: "Documentación",
      viewDocs: "Ver documentación oficial",
      close: "Cerrar",
      learnMore: "Saber Más",
    },
    testimonials: {
      sectionTitle: "Lo Que Dicen Nuestros Clientes",
      sectionSubtitle: "Testimonios reales de quienes confían en nuestro trabajo",
      avgRating: "Calificación Promedio",
      readMore: "Leer más",
      verifiedClient: "Cliente verificado",
    },
    contact: {
      sectionTitle: "Contáctanos",
      sectionSubtitle: "Hablemos sobre tu proyecto o idea.",
      stepsSubtitle: "Hablemos de tu proyecto en {step} pasos simples",
      nameLabel: "Nombre Completo",
      namePlaceholder: "Ingresa tu nombre completo",
      phoneLabel: "WhatsApp",
      phonePlaceholder: "+34 612 345 678",
      emailLabel: "Correo Electrónico",
      emailPlaceholder: "tu@email.com",
      messageLabel: "Mensaje",
      messagePlaceholder: "Describe tu necesidad o proyecto",
      projectTypeLabel: "Tipo de Proyecto",
      projectTypePlaceholder: "Selecciona el tipo",
      budgetLabel: "Presupuesto Estimado (Opcional)",
      budgetPlaceholder: "Selecciona un rango",
      confirmData: "Declaro que la información proporcionada es verdadera.",
      acceptPrivacy: "He leído y acepto la",
      privacyPolicy: "Política de Privacidad",
      submit: "Enviar",
      next: "Siguiente",
      back: "Volver",
      step1: "Datos Personales",
      step2: "Proyecto",
      step3: "Confirmación",
      successTitle: "Éxito",
      successMessage: "Serás redirigido a WhatsApp.",
      errorTitle: "Error",
      errorMessage: "Por favor acepta los términos para continuar.",
      projectTypes: [
        "Landing Page",
        "Sitio Corporativo",
        "E-commerce",
        "Sistema Web",
        "Aplicación Móvil",
        "Mantenimiento",
        "Otro",
      ],
      budgetRanges: [
        "Hasta €500",
        "€500 - €1.500",
        "€1.500 - €3.000",
        "Más de €3.000",
        "Prefiero no decir",
      ],
      companyLabel: "Empresa",
      companyPlaceholder: "Nombre de tu empresa (opcional)",
      deadlineLabel: "Plazo Deseado",
      deadlinePlaceholder: "¿Cuándo necesitas el proyecto?",
      urgentLabel: "Proyecto urgente",
    },
    footer: {
      copyright: "SEVENDEVX",
      privacy: "PRIVACIDAD",
      suppliers: "PROVEEDORES",
      allRightsReserved: "Todos los derechos reservados",
      madeWith: "Hecho con",
      followUs: "Síguenos",
      newsletter: "Newsletter",
      newsletterPlaceholder: "Tu mejor correo",
      subscribe: "Suscribirse",
    },
    projects: {
      sectionTitle: "Nuestros Proyectos",
      sectionSubtitle: "Portafolio de trabajos desarrollados",
      viewProject: "Ver Proyecto",
      viewCode: "Código",
      noDemo: "Sin demo pública",
      technologies: "Tecnologías",
      swipeHint: "Desliza para navegar",
      noResults: "No se encontraron proyectos",
      heroTitle: "Proyectos y Tecnologías",
      heroSubtitle: "Nuestro stack tecnológico moderno para crear soluciones de alto rendimiento.",
      techShowcaseTitle: "Stack Tecnológico",
      portfolioTitle: "Proyectos Destacados",
      filterAll: "Todos",
      filterWeb: "Web",
      filterMobile: "Móvil",
      filterDesign: "Diseño",
      details: "Detalles",
      challenge: "Desafío",
      solution: "Solución",
      results: "Resultados",
      duration: "Duración",
      client: "Cliente",
      year: "Año",
    },
    projectsPage: {
      heroTitle: "Proyectos y Tecnologías",
      heroSubtitle: "Trabajamos con las tecnologías más modernas y demandadas del mercado.",
      techShowcaseLoading: "Cargando tecnologías...",
      portfolioTitle: "Proyectos Destacados",
    },
    projectModal: {
      overview: "Descripción General",
      features: "Funcionalidades",
      techStack: "Stack Tecnológico",
      gallery: "Galería",
      testimonial: "Testimonio del Cliente",
      visitSite: "Visitar Sitio",
      viewSource: "Ver Código",
      close: "Cerrar",
      nextProject: "Siguiente Proyecto",
      prevProject: "Proyecto Anterior",
      shareProject: "Compartir Proyecto",
      copied: "¡Enlace copiado!",
    },
    privacy: {
      title: "Política de Privacidad",
      intro: "En SevenDevX, la privacidad y la seguridad son prioridades. Asumimos el compromiso con la transparencia en el tratamiento de tus datos personales, en total conformidad con la Ley General de Protección de Datos Personales (Ley nº 13.709/2018 - LGPD).",
      sections: {
        commitment: {
          title: "1. Compromiso con tu Privacidad",
          content: "Tu derecho a la privacidad es fundamental. Tratamos tus datos personales de forma ética, segura y transparente, utilizándolos exclusivamente para fines legítimos. SevenDevX solo recopila la información necesaria para ofrecer nuestros servicios, siempre respetando tus derechos como titular de los datos.",
        },
        dataCollected: {
          title: "2. Qué Datos Recopilamos y Para Qué",
          dataLabel: "Datos Recopilados:",
          purposesLabel: "Finalidades:",
          dataItems: [
            "Nombre completo – Identificación y personalización del servicio",
            "Correo electrónico – Comunicación, envío de información, propuestas y soporte",
            "Teléfono/WhatsApp – Contacto directo y soporte personalizado",
            "Mensaje – Detalles de tu solicitud, presupuesto o proyecto",
            "Datos de navegación y cookies – Para mejorar tu experiencia en el sitio",
          ],
          purposes: [
            "Atender solicitudes, preguntas y pedidos de presupuestos",
            "Proporcionar nuestros servicios y soporte técnico",
            "Ejecutar contratos y prestar servicios",
            "Mejorar nuestros servicios, comunicación y experiencia del usuario",
            "Realizar acciones de marketing (solo con tu consentimiento)",
            "Cumplir con obligaciones legales y regulatorias",
          ],
        },
        legalBasis: {
          title: "3. Bases Legales para el Tratamiento de Datos",
          content: "El tratamiento de tus datos personales se fundamenta en las siguientes bases legales previstas en la LGPD:",
          items: [
            "Consentimiento – Cuando autorizas expresamente el uso de tus datos",
            "Ejecución de contrato – Para la prestación de servicios contratados",
            "Cumplimiento legal – Cuando lo exige la ley",
            "Interés legítimo – Para mejoras y seguridad de los servicios",
          ],
        },
        collection: {
          title: "4. Cómo Recopilamos tus Datos",
          content: "Tus datos personales son recopilados de las siguientes formas:",
          items: [
            "Formularios de contacto disponibles en el sitio oficial",
            "Contacto directo vía WhatsApp, correo electrónico o teléfono",
            "Navegación en el sitio (cookies e información técnica)",
            "Interacciones en redes sociales y plataformas digitales",
          ],
        },
        sharing: {
          title: "5. Compartición de Datos",
          content: "SevenDevX no vende, alquila ni comparte tu información personal con terceros con fines comerciales. La compartición solo ocurre en las siguientes situaciones:",
          items: [
            "Con socios tecnológicos (hosting, CRM, email marketing) necesarios para la operación de los servicios",
            "Con autoridades públicas, cuando existe obligación legal u orden judicial",
            "En operaciones corporativas, como fusión o adquisición, manteniendo siempre la protección de datos",
          ],
        },
        storage: {
          title: "6. Almacenamiento y Retención de Datos",
          content: "Tus datos personales se almacenan de forma segura y se mantienen solo durante el tiempo necesario para cumplir los fines para los que fueron recopilados, o mientras exista obligación legal de retención. Los datos de navegación se mantienen durante la sesión o según tus preferencias de cookies. Después del término de la relación o del plazo legal, los datos son anonimizados o eliminados de forma segura.",
        },
        security: {
          title: "7. Protección y Seguridad de Datos",
          content: "Aplicamos medidas técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción. Esto incluye cifrado, controles de acceso, auditorías de seguridad y capacitación del equipo. A pesar de todos los esfuerzos, ningún sistema es completamente seguro, y nos comprometemos a notificar inmediatamente en caso de cualquier incidente de seguridad.",
        },
        children: {
          title: "8. Datos de Menores",
          content: "Nuestros servicios no están destinados a menores de 18 años sin el consentimiento de los padres o tutores legales. Si identificamos recopilación inadvertida de datos de menores sin autorización, los datos serán eliminados inmediatamente de nuestros sistemas.",
        },
        rights: {
          title: "9. Tus Derechos como Titular de los Datos",
          content: "Conforme a la Ley General de Protección de Datos (LGPD), tienes los siguientes derechos garantizados:",
          contactPrompt: "Para ejercer cualquiera de estos derechos, contáctanos:",
          items: [
            "Confirmación de la existencia del tratamiento de datos",
            "Acceso a los datos personales almacenados",
            "Corrección de datos incompletos, inexactos o desactualizados",
            "Anonimización, bloqueo o eliminación de datos innecesarios o en disconformidad",
            "Portabilidad de datos a otro proveedor de servicios",
            "Eliminación de datos tratados con consentimiento, salvo obligación legal",
            "Información sobre la compartición de datos con terceros",
            "Revocación del consentimiento en cualquier momento",
          ],
        },
        cookies: {
          title: "10. Cookies y Datos de Navegación",
          content: "Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el tráfico, entender cómo utilizas nuestro sitio y ofrecer contenido personalizado y relevante. Las cookies pueden ser esenciales (necesarias para el funcionamiento del sitio), de rendimiento (análisis de uso) o de marketing (personalización). Puedes gestionar y configurar tus preferencias de cookies en la configuración de tu navegador en cualquier momento.",
        },
        changes: {
          title: "11. Cambios en la Política de Privacidad",
          content: "Podemos actualizar esta Política de Privacidad en cualquier momento para reflejar cambios en nuestras prácticas, servicios o requisitos legales. Los cambios siempre estarán disponibles en esta página, con indicación de la fecha de actualización. Recomendamos que revises periódicamente esta política para mantenerte informado sobre cómo protegemos tus datos.",
        },
        contact: {
          title: "12. Contacto y Delegado de Protección de Datos",
          content: "Si tienes preguntas, sugerencias o solicitudes sobre cómo tratamos tus datos personales, contacta con nuestro Delegado de Protección de Datos (DPO):",
          companyName: "SevenDevX – Soluciones en Tecnología",
          location: "Belo Horizonte – MG, Brasil",
        },
      },
      lastUpdate: "Última actualización",
    },
    privacyPage: {
      title: "Política de Privacidad",
      intro: "En SevenDevX, la privacidad y la seguridad son prioridades. Nos comprometemos con la transparencia en el tratamiento de tus datos personales, en total conformidad con las leyes de protección de datos.",
      sections: {
        commitment: {
          title: "1. Compromiso con tu Privacidad",
          content: "Tu derecho a la privacidad es fundamental. Tratamos tus datos personales de forma ética, segura y transparente, utilizándolos exclusivamente para fines legítimos.",
        },
        dataCollection: {
          title: "2. Datos que Recopilamos y Finalidades",
          dataList: [
            "Nombre completo – Identificación y atención personalizada",
            "Correo electrónico – Comunicación, envío de información, propuestas y soporte",
            "Teléfono/WhatsApp – Contacto directo y soporte personalizado",
            "Mensaje – Detalles de tu solicitud, presupuesto o proyecto",
            "Datos de navegación y cookies – Para mejorar tu experiencia en el sitio",
          ],
          purposes: [
            "Atender solicitudes, dudas y pedidos de presupuesto",
            "Proporcionar nuestros servicios y soporte técnico",
            "Ejecutar contratos y prestar servicios",
            "Mejorar nuestros servicios, comunicación y experiencia del usuario",
            "Realizar acciones de marketing (solo con tu consentimiento)",
            "Cumplir obligaciones legales y regulatorias",
          ],
        },
        legalBasis: {
          title: "3. Bases Legales para el Tratamiento de Datos",
          content: "El tratamiento de tus datos personales se basa en las siguientes bases legales:",
          items: [
            "Consentimiento – Cuando autorizas expresamente el uso de tus datos",
            "Ejecución de contrato – Para la prestación de servicios contratados",
            "Obligaciones legales – Cuando lo exige la ley",
            "Interés legítimo – Para mejoras y seguridad de los servicios",
          ],
        },
        howWeCollect: {
          title: "4. Cómo Recopilamos tus Datos",
          items: [
            "Formularios de contacto disponibles en el sitio oficial",
            "Contacto directo vía WhatsApp, correo electrónico o teléfono",
            "Navegación en el sitio (datos de cookies e información técnica)",
            "Interacciones en redes sociales y plataformas digitales",
          ],
        },
        sharing: {
          title: "5. Compartición de Datos",
          content: "SevenDevX no vende, alquila ni comparte tu información personal con terceros para fines comerciales.",
          items: [
            "Con socios tecnológicos necesarios para la operación de servicios",
            "Con autoridades públicas, cuando existe obligación legal",
            "En operaciones societarias, siempre manteniendo la protección de datos",
          ],
        },
        storage: {
          title: "6. Almacenamiento y Retención de Datos",
          content: "Tus datos personales se almacenan de forma segura y se mantienen solo por el tiempo necesario para cumplir con los fines para los cuales fueron recopilados.",
        },
        protection: {
          title: "7. Protección y Seguridad de Datos",
          content: "Aplicamos medidas técnicas y organizacionales adecuadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.",
        },
        children: {
          title: "8. Datos de Menores",
          content: "Nuestros servicios no están dirigidos a menores de 18 años sin el consentimiento de padres o tutores legales.",
        },
        rights: {
          title: "9. Tus Derechos como Titular de Datos",
          content: "Según las leyes de protección de datos, tienes los siguientes derechos garantizados:",
          items: [
            "Confirmación de la existencia de tratamiento de tus datos",
            "Acceso a los datos personales almacenados",
            "Corrección de datos incompletos, inexactos o desactualizados",
            "Anonimización, bloqueo o eliminación de datos innecesarios",
            "Portabilidad de datos a otro proveedor",
            "Eliminación de datos tratados con consentimiento",
            "Información sobre compartición de datos",
            "Revocación del consentimiento en cualquier momento",
          ],
        },
        cookies: {
          title: "10. Cookies y Datos de Navegación",
          content: "Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar tráfico y ofrecer contenido personalizado.",
        },
        changes: {
          title: "11. Cambios en la Política de Privacidad",
          content: "Podemos actualizar esta Política en cualquier momento para reflejar cambios en nuestras prácticas o requisitos legales.",
        },
        contact: {
          title: "12. Contacto y Oficial de Protección de Datos",
          content: "Si tienes preguntas sobre cómo tratamos tus datos personales, contacta a nuestro Oficial de Protección de Datos (DPO).",
        },
      },
      lastUpdated: "Última actualización",
    },
    suppliers: {
      title: "Portal de Proveedores",
      subtitle: "Asociaciones estratégicas con proveedores que comparten nuestro compromiso con la innovación, calidad y excelencia.",
      stats: { suppliers: "Proveedores", areas: "Áreas de Interés" },
      partnerTitle: "Sé Nuestro Socio",
      partnerContent: [
        "Valoramos relaciones duraderas con proveedores que entregan calidad, respeto a los plazos y alta capacidad de innovación.",
        "Buscamos socios en tecnología, infraestructura, cloud, diseño, marketing digital y todos los servicios que complementan nuestro ecosistema de desarrollo web.",
      ],
      badges: ["Pago puntual", "Relación transparente", "Crecimiento mutuo"],
      areasTitle: "Áreas de Interés",
      areas: [
        "Infraestructura y Cloud Computing",
        "Servicios de Hosting y CDN",
        "Herramientas de Desarrollo",
        "Licencias de Software",
        "Servicios de Diseño y UI/UX",
        "Marketing Digital y SEO",
        "Hardware y Equipos",
        "Consultoría Técnica",
      ],
      contactTitle: "Contacto para Proveedores",
      contactItems: {
        email: "Correo",
        phone: "Teléfono",
        location: "Ubicación",
        hours: "Horario",
      },
      ctaText: "¿Listo para iniciar una asociación estratégica?",
      ctaPrimary: "Enviar Propuesta",
      ctaSecondary: "WhatsApp",
      disclaimer: "SevenDevX cree en asociaciones duraderas para construir el futuro de la tecnología.",
      responseTime: "Respuesta en hasta 48 horas hábiles",
      faqTitle: "Preguntas Frecuentes",
      faq: [
        { q: "¿Cómo funciona el proceso de selección?", a: "Analizamos cada propuesta individualmente, considerando calidad, precio, plazos y alineación con nuestros valores." },
        { q: "¿Qué documentos se requieren?", a: "Registro comercial activo, propuesta comercial detallada y, si aplica, portafolio de trabajos anteriores." },
        { q: "¿Cuál es el tiempo de respuesta?", a: "Respondemos a todas las propuestas en hasta 48 horas hábiles después de recibirlas." },
      ],
    },
    suppliersPage: {
      heroTitle: "Portal de Proveedores",
      heroSubtitle: "Alianzas estratégicas con proveedores que comparten nuestro compromiso con la innovación, calidad y excelencia.",
      statsSuppliers: "Proveedores",
      statsAreas: "Áreas de Interés",
      partnerTitle: "Sé Nuestro Socio",
      partnerContent: [
        "Valoramos relaciones duraderas con proveedores que entregan calidad, respeto a los plazos y alta capacidad de innovación.",
        "Buscamos socios en áreas de tecnología, infraestructura, cloud, diseño, marketing digital y todos los servicios que complementan nuestro ecosistema de desarrollo web.",
      ],
      badges: ["Pago puntual", "Relación transparente", "Crecimiento mutuo"],
      areasTitle: "Áreas de Interés",
      areas: [
        "Infraestructura y Cloud Computing",
        "Servicios de Hosting y CDN",
        "Herramientas de Desarrollo",
        "Licencias de Software",
        "Servicios de Diseño y UI/UX",
        "Marketing Digital y SEO",
        "Hardware y Equipos",
        "Consultoría Técnica",
      ],
      contactTitle: "Contacto para Proveedores",
      contactItems: {
        email: "Correo",
        phone: "Teléfono",
        location: "Ubicación",
        hours: "Horario",
      },
      ctaContent: "¿Listo para iniciar una alianza estratégica?",
      ctaPrimary: "Enviar Propuesta",
      ctaSecondary: "WhatsApp",
      faqTitle: "Preguntas Frecuentes",
      faq: [
        {
          q: "¿Cómo funciona el proceso de selección?",
          a: "Evaluamos propuestas basándonos en calidad, precio competitivo y alineación con nuestros valores.",
        },
        {
          q: "¿Cuál es el plazo de respuesta?",
          a: "Respondemos todas las propuestas en un máximo de 48 horas hábiles.",
        },
        {
          q: "¿Trabajan con empresas de otros estados/países?",
          a: "¡Sí! Trabajamos con proveedores de todo Brasil e internacionalmente.",
        },
      ],
    },
    store: {
      heroTitle: "Transforma tu Visión en Realidad Digital",
      heroSubtitle: "Del concepto al lanzamiento — entregamos soluciones con diseño premium, rendimiento optimizado y soporte que garantiza resultados.",
      heroBadge: "Soluciones Premium",
      heroCtaPrimary: "Ver Plan Más Popular",
      heroCtaSecondary: "Ver Todos los Planes",
      plansTitle: "Planes de Desarrollo",
      plansSubtitle: "Elige la solución ideal para tu proyecto — precios transparentes y entregas objetivas.",
      mostPopular: "Más Popular",
      requestQuote: "Solicitar Presupuesto",
      view: "Ver",
      compareTitle: "Comparación Rápida",
      compareFeatures: [
        "Diseño Personalizado",
        "SEO Básico",
        "Panel Admin",
        "Integraciones API",
        "Soporte Incluido",
        "Entrega Estimada",
      ],
      servicesTitle: "Servicios Premium",
      servicesSubtitle: "Soluciones complementarias para potenciar tu presencia digital",
      plans: {
        landing: {
          name: "Landing Page",
          description: "Página única optimizada para conversión — rápida y enfocada en ventas.",
          features: [
            "Diseño moderno y responsivo",
            "SEO on-page básico",
            "Formulario de contacto + integración con WhatsApp",
            "Integración con Google Analytics",
            "Hosting + SSL (1 año) — opcional",
            "Tiempo de carga optimizado (LCP < 2s)",
          ],
        },
        institutional: {
          name: "Sitio Institucional",
          description: "Presencia digital completa con hasta 7 páginas y panel administrativo.",
          features: [
            "Diseño exclusivo premium",
            "SEO avanzado + sitemap",
            "Blog/portafolio integrado (opcional)",
            "Panel administrativo (CMS)",
            "3 meses de soporte incluidos",
            "Optimización de rendimiento y PWA (opcional)",
          ],
        },
        custom: {
          name: "Sistema Personalizado",
          description: "Soluciones a medida: APIs, paneles, integraciones y seguridad empresarial.",
          features: [
            "Arquitectura escalable (backend + frontend)",
            "Integración con APIs (ERP, pasarelas, etc.)",
            "Autenticación, permisos y seguridad",
            "Base de datos robusta y backups",
            "Documentación técnica + deploy automatizado",
            "Soporte continuo (contrato opcional)",
          ],
        },
      },
      services: {
        consulting: { title: "Consultoría Digital", description: "Análisis completo (SEO, rendimiento, UX) con informe PDF y plan de acción." },
        performance: { title: "Optimización de Rendimiento", description: "Mejoras en Core Web Vitals y reducción de TTFB/LCP (informe antes/después)." },
        uiux: { title: "Diseño UI/UX", description: "Rediseño + prototipado en Figma y pruebas de usabilidad." },
        maintenance: { title: "Mantenimiento Mensual", description: "Actualizaciones, monitoreo, backups y soporte con SLA." },
      },
      testimonialsTitle: "Lo Que Dicen Nuestros Clientes",
      ctaTitle: "¿Listo para Empezar?",
      ctaSubtitle: "Solicita un presupuesto personalizado y da el siguiente paso.",
      ctaButton: "Solicitar Presupuesto",
      guarantee: "Garantía de Satisfacción",
      guaranteeText: "30 días de garantía o te devolvemos tu dinero",
    },
    notFound: {
      title: "404",
      message: "PÁGINA NO ENCONTRADA",
      button: "Volver al Inicio",
      suggestions: "Tal vez estás buscando:",
    },
    modals: {
      confirm: "Confirmar",
      cancel: "Cancelar",
      save: "Guardar",
      delete: "Eliminar",
      edit: "Editar",
      close: "Cerrar",
      areYouSure: "¿Estás seguro?",
      success: "¡Éxito!",
      error: "¡Error!",
      warning: "¡Atención!",
      info: "Información",
      exitIntent: {
        title: "¡Espera! 🎁",
        subtitle: "Antes de irte, ¿qué tal una consulta gratuita?",
        description: "Descubre cómo podemos convertir tu idea en realidad digital.",
        cta: "Quiero Consulta Gratis",
        dismiss: "No, gracias",
        trustBadge: "✅ Sin compromiso • 💬 Respuesta en 24h",
      },
    },
    cards: {
      readMore: "Leer más",
      showLess: "Mostrar menos",
      details: "Detalles",
      features: "Funcionalidades",
      included: "Incluido",
      notIncluded: "No incluido",
      popular: "Popular",
      new: "Nuevo",
      comingSoon: "Próximamente",
      limited: "Limitado",
    },
    notifications: {
      success: "¡Éxito!",
      error: "¡Error!",
      warning: "¡Atención!",
      info: "Información",
      formSubmitted: "¡Formulario enviado con éxito!",
      formError: "Error al enviar formulario. Intenta de nuevo.",
      copied: "¡Copiado al portapapeles!",
      saved: "¡Cambios guardados con éxito!",
      deleted: "¡Elemento eliminado con éxito!",
      updated: "¡Actualizado con éxito!",
      networkError: "Error de conexión. Verifica tu internet.",
      tryAgain: "Intentar de nuevo",
      dismiss: "Descartar",
    },
    forms: {
      required: "Obligatorio",
      optional: "Opcional",
      invalidEmail: "Correo inválido",
      invalidPhone: "Teléfono inválido",
      minLength: "Mínimo {min} caracteres",
      maxLength: "Máximo {max} caracteres",
      passwordMismatch: "Las contraseñas no coinciden",
      fieldRequired: "Este campo es obligatorio",
      selectOption: "Selecciona una opción",
      uploading: "Subiendo...",
      uploadSuccess: "¡Archivo subido con éxito!",
      uploadError: "Error al subir archivo",
      dragDrop: "Arrastra y suelta archivos aquí",
      browse: "Explorar",
      maxFileSize: "Tamaño máximo: {size}",
    },
    actions: {
      submit: "Enviar",
      send: "Enviar",
      save: "Guardar",
      cancel: "Cancelar",
      continue: "Continuar",
      back: "Volver",
      next: "Siguiente",
      finish: "Finalizar",
      reset: "Resetear",
      clear: "Limpiar",
      search: "Buscar",
      filter: "Filtrar",
      sort: "Ordenar",
      download: "Descargar",
      upload: "Subir",
      share: "Compartir",
      copy: "Copiar",
      print: "Imprimir",
      export: "Exportar",
      import: "Importar",
      refresh: "Actualizar",
      retry: "Reintentar",
      viewDetails: "Ver detalles",
      seeAll: "Ver todos",
      loadMore: "Cargar más",
      showMore: "Mostrar más",
      showLess: "Mostrar menos",
      expand: "Expandir",
      collapse: "Colapsar",
      apply: "Aplicar",
      confirm: "Confirmar",
    },
    tooltips: {
      scrollToTop: "Volver arriba",
      openMenu: "Abrir menú",
      closeMenu: "Cerrar menú",
      changeLanguage: "Cambiar idioma",
      toggleTheme: "Cambiar tema",
      shareOnWhatsapp: "Compartir en WhatsApp",
      shareOnLinkedin: "Compartir en LinkedIn",
      shareOnTwitter: "Compartir en Twitter",
      copyLink: "Copiar enlace",
      viewFullscreen: "Ver pantalla completa",
      exitFullscreen: "Salir de pantalla completa",
      zoomIn: "Acercar",
      zoomOut: "Alejar",
      play: "Reproducir",
      pause: "Pausar",
      mute: "Silenciar",
      unmute: "Activar sonido",
    },
    accessibility: {
      skipToContent: "Saltar al contenido",
      mainNavigation: "Navegación principal",
      openInNewTab: "Abre en nueva pestaña",
      externalLink: "Enlace externo",
      loading: "Cargando",
      imageOf: "Imagen de",
      slideOf: "Diapositiva {current} de {total}",
      currentPage: "Página actual",
      goToPage: "Ir a página",
      previousSlide: "Diapositiva anterior",
      nextSlide: "Siguiente diapositiva",
      closeDialog: "Cerrar diálogo",
      expandSection: "Expandir sección",
      collapseSection: "Colapsar sección",
      closeModal: "Cerrar modal",
      testimonialFrom: "Testimonio de",
    },
    blog: {
      heroLabel: "Blog & Insights",
      heroTitle: "Construyendo Productos Digitales",
      heroTitleHighlight: "con Tecnología, Rendimiento y Diseño",
      heroSubtitle: "Artículos, tutoriales e insights prácticos sobre desarrollo moderno, frontend, backend y creación de productos digitales.",
      featuredLabel: "Artículo Destacado",
      readFullArticle: "Leer artículo completo",
      searchPlaceholder: "Buscar artículos...",
      allCategories: "Todos",
      noResults: "No se encontraron artículos",
      noResultsFor: "Sin resultados para",
      newArticlesSoon: "Nuevos artículos próximamente.",
      ctaTitle: "¿Quieres contenido exclusivo?",
      ctaSubtitle: "Contáctenos y descubra cómo podemos ayudar a su proyecto a crecer.",
      ctaButton: "Contáctenos",
      backToBlog: "Volver al Blog",
      readingTime: "min de lectura",
      views: "visualizaciones",
      share: "Compartir",
      authorTeam: "Equipo SevenDevX",
      authorDescription: "Desarrollo de software, diseño de interfaces y creación de productos digitales enfocados en rendimiento.",
      contactLink: "Contáctenos",
      continuReading: "Seguir leyendo",
      likedContent: "¿Te gustó el contenido?",
      likedContentSubtitle: "Contáctenos para transformar sus ideas en realidad.",
    },
    projectsHub: {
      heroTitle: "Todos los Proyectos",
      heroSubtitle: "Explorando soluciones reales con tecnología y diseño de alto nivel",
      backButton: "Volver",
      projects: "proyectos",
      highlights: "destacados",
      clearFilters: "Limpiar filtros",
      featured: "Destacado",
      mainFeatured: "Destacado Principal",
    },
    pwa: {
      installApp: "Instalar aplicación",
      updateAvailable: "Actualización disponible",
      updateNow: "Actualizar ahora",
      later: "Después",
      offlineReady: "Listo para uso sin conexión",
      offlineMessage: "La aplicación está disponible sin internet.",
      newContent: "Nuevo contenido disponible",
      reload: "Recargar",
    },
    common: {
      loading: "Cargando...",
      error: "Error",
      close: "Cerrar",
      learnMore: "Saber más",
      viewAll: "Ver todos",
      from: "Desde",
      perMonth: "/mes",
      days: "días",
      onConsultation: "Bajo consulta",
      yes: "Sí",
      no: "No",
      or: "o",
      and: "y",
      by: "por",
      in: "en",
      of: "de",
      to: "para",
      at: "a las",
      for: "para",
      with: "con",
      without: "sin",
      all: "Todos",
      none: "Ninguno",
      other: "Otro",
      more: "Más",
      less: "Menos",
      new: "Nuevo",
      old: "Antiguo",
      free: "Gratis",
      paid: "Pago",
      popular: "Popular",
      recommended: "Recomendado",
      featured: "Destacado",
      trending: "Tendencia",
      exclusive: "Exclusivo",
      limited: "Limitado",
      soon: "Próximamente",
      now: "Ahora",
      today: "Hoy",
      yesterday: "Ayer",
      tomorrow: "Mañana",
      week: "Semana",
      month: "Mes",
      year: "Año",
      hours: "horas",
      minutes: "minutos",
      seconds: "segundos",
    },
  },
};

// Testimonials data traduzidos
export const testimonialsData: Record<Language, Array<{
  name: string;
  role: string;
  content: string;
  rating: number;
}>> = {
  pt: [
    {
      name: "Carlos Silva",
      role: "CEO, TechStart",
      content: "A SevenDevX transformou nossa visão em realidade. O site entregue superou todas as expectativas em design e performance.",
      rating: 5,
    },
    {
      name: "Maria Santos",
      role: "Diretora de Marketing, InnovaHub",
      content: "Profissionalismo impecável. Entregaram o projeto antes do prazo e com qualidade excepcional. Altamente recomendado!",
      rating: 5,
    },
    {
      name: "João Oliveira",
      role: "Fundador, StartupBR",
      content: "Excelente comunicação e resultado final incrível. A equipe entendeu perfeitamente nossa necessidade e entregou além.",
      rating: 5,
    },
    {
      name: "Ana Rodrigues",
      role: "Gerente de TI, FinanceiroPlus",
      content: "Parceria excepcional! O sistema desenvolvido otimizou nossos processos em 40%. Equipe técnica de altíssimo nível.",
      rating: 5,
    },
    {
      name: "Pedro Mendes",
      role: "Diretor Comercial, Logitech",
      content: "Atendimento personalizado e soluções sob medida. A SevenDevX entende as necessidades do cliente como ninguém.",
      rating: 5,
    },
    {
      name: "Lúcia Fernandes",
      role: "Fundadora, EcoStore",
      content: "Meu e-commerce ficou perfeito! Design moderno, rápido e fácil de gerenciar. As vendas aumentaram 60% no primeiro mês.",
      rating: 5,
    },
    {
      name: "Roberto Almeida",
      role: "CEO, Construtora Horizonte",
      content: "Transformação digital completa da nossa empresa. Do site aos sistemas internos, tudo impecável e integrado.",
      rating: 5,
    },
  ],
  en: [
    {
      name: "Carlos Silva",
      role: "CEO, TechStart",
      content: "SevenDevX transformed our vision into reality. The delivered website exceeded all expectations in design and performance.",
      rating: 5,
    },
    {
      name: "Maria Santos",
      role: "Marketing Director, InnovaHub",
      content: "Impeccable professionalism. They delivered the project ahead of schedule with exceptional quality. Highly recommended!",
      rating: 5,
    },
    {
      name: "João Oliveira",
      role: "Founder, StartupBR",
      content: "Excellent communication and incredible final result. The team perfectly understood our needs and delivered beyond expectations.",
      rating: 5,
    },
    {
      name: "Ana Rodrigues",
      role: "IT Manager, FinanceiroPlus",
      content: "Exceptional partnership! The developed system optimized our processes by 40%. Top-tier technical team.",
      rating: 5,
    },
    {
      name: "Pedro Mendes",
      role: "Commercial Director, Logitech",
      content: "Personalized service and tailored solutions. SevenDevX understands customer needs like no one else.",
      rating: 5,
    },
    {
      name: "Lúcia Fernandes",
      role: "Founder, EcoStore",
      content: "My e-commerce turned out perfect! Modern design, fast and easy to manage. Sales increased 60% in the first month.",
      rating: 5,
    },
    {
      name: "Roberto Almeida",
      role: "CEO, Construtora Horizonte",
      content: "Complete digital transformation of our company. From the website to internal systems, everything flawless and integrated.",
      rating: 5,
    },
  ],
  es: [
    {
      name: "Carlos Silva",
      role: "CEO, TechStart",
      content: "SevenDevX transformó nuestra visión en realidad. El sitio entregado superó todas las expectativas en diseño y rendimiento.",
      rating: 5,
    },
    {
      name: "Maria Santos",
      role: "Directora de Marketing, InnovaHub",
      content: "Profesionalismo impecable. Entregaron el proyecto antes del plazo y con calidad excepcional. ¡Altamente recomendado!",
      rating: 5,
    },
    {
      name: "João Oliveira",
      role: "Fundador, StartupBR",
      content: "Excelente comunicación y resultado final increíble. El equipo entendió perfectamente nuestra necesidad y entregó más allá.",
      rating: 5,
    },
    {
      name: "Ana Rodrigues",
      role: "Gerente de TI, FinanceiroPlus",
      content: "¡Asociación excepcional! El sistema desarrollado optimizó nuestros procesos en un 40%. Equipo técnico de primer nivel.",
      rating: 5,
    },
    {
      name: "Pedro Mendes",
      role: "Director Comercial, Logitech",
      content: "Servicio personalizado y soluciones a medida. SevenDevX entiende las necesidades del cliente como nadie.",
      rating: 5,
    },
    {
      name: "Lúcia Fernandes",
      role: "Fundadora, EcoStore",
      content: "¡Mi e-commerce quedó perfecto! Diseño moderno, rápido y fácil de gestionar. Las ventas aumentaron 60% en el primer mes.",
      rating: 5,
    },
    {
      name: "Roberto Almeida",
      role: "CEO, Construtora Horizonte",
      content: "Transformación digital completa de nuestra empresa. Del sitio a los sistemas internos, todo impecable e integrado.",
      rating: 5,
    },
  ],
};
