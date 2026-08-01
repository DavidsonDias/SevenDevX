/**
 * projects.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/data/projects.ts
 * @module Content
 *
 * @description
 * Portfólio estático (slug, descrição, stack e links).
 *
 * @see src/data/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📦 Shared Projects Data — SevenDevX
 * Reused by PortfolioCarousel3D and Projects Hub page
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { FaReact, FaNodeJs } from "react-icons/fa";
import {
  SiFirebase,
  SiTypescript,
  SiD3Dotjs,
  SiTailwindcss,
  SiPostgresql,
  SiNextdotjs,
} from "react-icons/si";

import projectPsicoOne from "@/assets/PsicoOne.png";
import projectGeorgeFiuza from "@/assets/GeorgeFiuza.png";
import projectRoane from "@/assets/Roane.jpg";
import projectDavidsonDias from "@/assets/DavidsonDias.jpg";
import projectGithubProViewer from "@/assets/GithubProViewer.jpeg";
import projectVortexx from "@/assets/Vortexx.jpg";
import projectStellarNavigator from "@/assets/StellarNavigator.jpg";
import projectNatalFestivo from "@/assets/NatalFestivo.png";
import projectNutriSmart from "@/assets/NutriSmart.jpeg";
import projectHomeOS from "@/assets/HomeOS.jpeg";
import projectIBANPS from "@/assets/Ibanps.jpeg";
import projectAcaiOS from "@/assets/AcaiOS.jpeg";
import projectFoodOpsX from "@/assets/FoodOpsX.jpeg";

import projectEcommerce from "@/assets/project-ecommerce.jpg";
import projectDelivery from "@/assets/project-delivery.jpg";
import projectAnalytics from "@/assets/project-analytics.jpg";
import projectErp from "@/assets/project-erp.jpg";
import projectMedical from "@/assets/project-medical.jpg";
import projectArchitecture from "@/assets/project-architecture.jpg";
import projectManagement from "@/assets/project-management.jpg";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  techs: { name: string; icon: React.ElementType; color: string; slug?: string }[];
  liveUrl?: string | null;
  githubUrl?: string | null;
  featured?: boolean;
  tags?: string[];
}

export const projects: Project[] = [
  // 🚀 Novos projetos (destaque)
  {
    id: 101,
    title: "PsicoOne",
    description: "Plataforma SaaS para psicólogos com IA, prontuário inteligente, agenda e teleatendimento.",
    longDescription: "PsicoOne é um SaaS vertical projetado exclusivamente para psicólogos e clínicas de psicologia no Brasil. A plataforma centraliza prontuário eletrônico com geração assistida por IA e transcrição de sessões, agenda com detecção de conflitos e sincronização com Google Calendar, teleatendimento WebRTC com sala de espera e chat em tempo real, gestão financeira com projeções e categorização, e portal do paciente. O diferencial está na integração profunda entre módulos — uma sessão de teleatendimento gera automaticamente o prontuário, vincula à agenda e registra a transação financeira — eliminando retrabalho e devolvendo ao profissional o tempo que deveria ser dedicado ao paciente.",
    image: projectPsicoOne,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    ],
    liveUrl: "https://psicoone.vercel.app/",
    githubUrl: null,
    featured: true,
    tags: ["SaaS", "AI", "PWA"],
  },
  {
    id: 102,
    title: "Barbearia George Fiuza",
    description: "Landing page de alta conversão com agendamento e experiência cinematográfica.",
    longDescription: "Landing page de performance projetada para posicionar a Barbearia George Fiuza como referência premium em Belo Horizonte. A solução integra agendamento direto via WhatsApp e AppBarber, exibe avaliações no estilo Google Reviews com contadores animados de prova social, e entrega uma experiência dark-mode cinematográfica com microinterações em Framer Motion — tudo otimizado para SEO local e conversão mobile-first.",
    image: projectGeorgeFiuza,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#38BDF8" },
    ],
    liveUrl: "https://georgefiuza.vercel.app",
    githubUrl: null,
    tags: ["PWA"],
  },
  {
    id: 103,
    title: "Psicóloga Roane",
    description: "Site institucional premium focado em conversão e experiência do paciente.",
    longDescription: "Site institucional premium desenvolvido para a Psicóloga Roane Stéphane, especialista em Terapia Cognitivo-Comportamental e Psicologia Infantojuvenil. A interface combina animações cinematográficas, tipografia refinada e uma paleta de tons verdes e dourados que transmitem equilíbrio emocional. O diferencial está na arquitetura de conversão silenciosa: cada seção guia o visitante naturalmente até o agendamento via WhatsApp, sem fricção.",
    image: projectRoane,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    ],
    liveUrl: "https://roane.vercel.app/",
    githubUrl: null,
  },
  {
    id: 104,
    title: "Portfólio Davidson",
    description: "Portfólio 3D imersivo com animações avançadas e experiência interativa.",
    longDescription: "Portfólio de desenvolvedor full stack que transcende o padrão de sites pessoais. Construído com identidade visual futurista inspirada na SpaceX, combina cenas 3D com Three.js, micro-interações magnéticas, terminal interativo com comandos reais (neofetch, matrix), cursor neon customizado com trail de partículas e intro cinematográfica com clip-path reveal. A fusão entre engenharia de software de alto nível e design de produto premium entrega performance 60fps mesmo com múltiplas camadas de efeitos visuais.",
    image: projectDavidsonDias,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Three.js", icon: SiD3Dotjs, color: "#F7DF1E" },
    ],
    liveUrl: "https://davidsondias.vercel.app/",
    githubUrl: null,
    tags: ["3D"],
  },
  {
    id: 105,
    title: "GitHub Repo Viewer",
    description: "Dashboard com analytics de repositórios e AI code review.",
    longDescription: "SaaS analítico que consolida dados de repositórios GitHub em um dashboard visual de nível enterprise. Oferece contribution heatmaps, distribuição de linguagens, AI code review automatizado, comparação lado a lado de repositórios e command palette inspirado no VS Code. Como PWA com suporte offline completo, funciona como app instalável em qualquer dispositivo — um diferencial inexistente em concorrentes como GitKraken ou Sourcegraph.",
    image: projectGithubProViewer,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Redux", icon: SiTypescript, color: "#764ABC" },
    ],
    liveUrl: "https://github-proviewer.vercel.app",
    githubUrl: null,
    tags: ["SaaS", "AI", "PWA"],
  },
  {
    id: 106,
    title: "Vortexx",
    description: "Plataforma privacy-first com processamento local e pipeline avançado.",
    longDescription: "SaaS privacy-first projetado para usuários e equipes que precisam capturar mídia de mais de 50 plataformas com qualidade até 4K, sem comprometer dados pessoais. O processamento acontece inteiramente no navegador via FFmpeg.wasm — nenhum arquivo toca um servidor externo. Pipeline profissional de 7 estágios (validação → extração → transcodificação → sanitização de metadados → verificação de integridade → compressão → entrega), sistema de agendamento, downloads em lote e assistente IA contextual. Arquitetura zero-trust: processamento local, zero logs, remoção automática de EXIF/GPS e criptografia ponta-a-ponta.",
    image: projectVortexx,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "PWA", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveUrl: "https://vortexx-alpha.vercel.app",
    githubUrl: null,
    featured: true,
    tags: ["SaaS", "Enterprise", "PWA"],
  },
  {
    id: 107,
    title: "Stellar Navigator",
    description: "Simulador 3D do sistema solar com dados da NASA.",
    longDescription: "Aplicação web que renderiza o Sistema Solar completo em 3D com simulação orbital realista, dados científicos ao vivo da NASA e narração educativa gerada por inteligência artificial. Combina precisão científica (posições, órbitas e rotações reais), interface cinematográfica com HUD holográfico, scanner planetário com estrutura interna animada e sonificação espacial via Web Audio API — tudo rodando diretamente no navegador, sem instalação, em qualquer dispositivo.",
    image: projectStellarNavigator,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Three.js", icon: SiD3Dotjs, color: "#F7DF1E" },
    ],
    liveUrl: "https://stellar-navigator.vercel.app",
    githubUrl: null,
    featured: true,
    tags: ["3D", "AI"],
  },
  {
    id: 108,
    title: "Amigo Oculto Inteligente",
    description: "SaaS multi-tenant com sorteio automatizado e notificações.",
    longDescription: "Plataforma SaaS multi-tenant que digitaliza e eleva a experiência de organizar sorteios de Amigo Oculto para famílias, empresas e comunidades. Oferece gerenciamento centralizado de participantes com perfis visuais, wishlists interativas com links e imagens, algoritmo de sorteio justo com isolamento criptográfico por token, notificação automatizada via WhatsApp, e landing pages públicas personalizáveis por grupo. Arquitetura multi-perfil com Row-Level Security garantindo isolamento total de dados entre tenants, RPCs seguras e painel de analytics exclusivo para owners com KPIs de engajamento.",
    image: projectNatalFestivo,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveUrl: "https://natalfestivo.vercel.app",
    githubUrl: null,
    tags: ["SaaS"],
  },
  {
    id: 109,
    title: "NutriSmart",
    description: "Plataforma SaaS com IA que transforma restrições alimentares em receitas seguras e personalizadas.",
    longDescription: "O NutriSmart é uma plataforma inteligente para pessoas com restrições alimentares — celíacos, intolerantes à lactose, veganos e adeptos de dietas low-carb. A IA embarcada detecta alérgenos, sugere substituições seguras e nunca recomenda ingredientes proibidos. Com 19+ calculadoras especializadas (pizza, panificação, custos, álcool), importação de receitas via vídeo, versionamento, planejamento semanal e análise de custos com margem de lucro, é uma ferramenta enterprise-grade para alimentação segura.",
    image: projectNutriSmart,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#38BDF8" },
    ],
    liveUrl: "https://nutrismartx.vercel.app/",
    githubUrl: null,
    featured: true,
    tags: ["SaaS", "AI", "PWA"],
  },
  {
    id: 110,
    title: "HomeOS",
    description: "Sistema inteligente de gestão doméstica que centraliza tarefas, finanças, estoque e compras.",
    longDescription: "O HomeOS é uma plataforma SaaS multi-tenant de gestão residencial inteligente, projetada para famílias e grupos que compartilham um lar. Resolve o caos da organização doméstica — contas esquecidas, estoque descontrolado, tarefas sem dono — unificando finanças, tarefas com Kanban, controle de estoque com alertas, lista de compras colaborativa e insights gerados por IA em uma interface premium com dark mode. O diferencial está na arquitetura enterprise-grade com RBAC granular, sistema de convites, auditoria completa e painel administrativo separado.",
    image: projectHomeOS,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    ],
    liveUrl: "https://homeosx.vercel.app/",
    githubUrl: null,
    featured: true,
    tags: ["SaaS", "Enterprise", "PWA"],
  },
  {
    id: 111,
    title: "IBANPS",
    description: "Plataforma de gestão para ministério de louvor: escalas, repertório, ensaios e planejamento de culto.",
    longDescription: "O IBANPS é uma plataforma SaaS desenvolvida para a Igreja Batista Nacional Porto Seguro, projetada para centralizar toda a operação do Ministério de Louvor. Resolve o problema crônico de desorganização em equipes ministeriais — substituindo grupos de WhatsApp, planilhas dispersas e comunicação fragmentada por um sistema unificado com gestão de membros, escalas com rodízio, repertório musical com cifras e transposição, planejamento de culto com cronômetro, calendário de eventos, biblioteca digital e analytics de participação.",
    image: projectIBANPS,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    ],
    liveUrl: "https://ibanps.vercel.app/",
    githubUrl: null,
    tags: ["SaaS"],
  },
  {
    id: 112,
    title: "AçaíOS",
    description: "Plataforma operacional completa para açaiterias e franquias — do PDV à inteligência de dados.",
    longDescription: "AçaíOS é um sistema operacional SaaS projetado para negócios de açaí, sorveterias e dark kitchens no Brasil. A plataforma unifica PDV, montagem de pedidos personalizados (Monte seu Açaí), painel de cozinha em tempo real (KDS com Kanban), gestão de produtos e categorias, CRM de clientes e relatórios analíticos — tudo em uma única interface dark-mode com design enterprise.",
    image: projectAcaiOS,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#38BDF8" },
    ],
    liveUrl: "https://acaios.vercel.app/",
    githubUrl: null,
    featured: true,
    tags: ["SaaS", "Enterprise"],
  },
  {
    id: 113,
    title: "FoodOps X",
    description: "Plataforma completa de gestão para restaurantes — do pedido à cozinha em tempo real.",
    longDescription: "FoodOps X é um sistema SaaS de gestão operacional para restaurantes, bares e food services. Projetado para eliminar gargalos entre salão, cozinha e caixa, a plataforma oferece mapa interativo de mesas, pedidos em tempo real via garçom digital, KDS (Kitchen Display System) para a cozinha, cardápio digital com QR Code, PDV completo e assistente com IA integrada.",
    image: projectFoodOpsX,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
    ],
    liveUrl: "https://foodops-x.vercel.app/",
    githubUrl: null,
    featured: true,
    tags: ["SaaS", "AI", "PWA"],
  },
  // 🔽 Projetos originais
  {
    id: 1,
    title: "Sistema ERP Empresarial",
    description: "ERP completo com estoque, financeiro, vendas e relatórios avançados em tempo real.",
    longDescription: "Sistema completo de gestão empresarial com módulos integrados de estoque, vendas, financeiro e RH. Dashboard com mais de 50 relatórios personalizados e análise de dados em tempo real.",
    image: projectErp,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Node.js", icon: FaNodeJs, color: "#339933" },
      { name: "PostgreSQL", icon: SiPostgresql, color: "#4169E1" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
    ],
    liveUrl: "https://sevendevx.com/projects/erp",
    githubUrl: "https://github.com/DavidsonDias/sevendevx-erp",
    tags: ["Enterprise", "SaaS"],
  },
  {
    id: 2,
    title: "E-Commerce Fashion Plus",
    description: "Loja virtual com checkout integrado, painel administrativo e performance otimizada.",
    longDescription: "Plataforma completa de e-commerce com catálogo dinâmico, checkout seguro, painel administrativo, integração com gateways de pagamento e métricas de vendas em tempo real.",
    image: projectEcommerce,
    techs: [
      { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    ],
    liveUrl: "https://sevendevx.com/projects/fashionplus",
    githubUrl: "https://github.com/DavidsonDias/fashion-plus",
  },
  {
    id: 3,
    title: "Dashboard Analytics PRO",
    description: "Dashboard com dados dinâmicos e gráficos avançados utilizando D3.js.",
    longDescription: "Painel de business intelligence com visualização de dados em tempo real, gráficos interativos D3.js, KPIs customizáveis e exportação de relatórios em múltiplos formatos.",
    image: projectAnalytics,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "D3.js", icon: SiD3Dotjs, color: "#F9A03C" },
    ],
    liveUrl: "https://sevendevx.com/projects/analytics",
    githubUrl: "https://github.com/DavidsonDias/analytics-pro",
  },
  {
    id: 4,
    title: "Landing Page Delivery Express",
    description: "Landing de alta conversão com CTA animado e integração WhatsApp.",
    image: projectDelivery,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    ],
    liveUrl: "https://sevendevx.com/projects/delivery",
    githubUrl: "https://github.com/DavidsonDias/delivery-express",
  },
  {
    id: 5,
    title: "Sistema de Agendamento Médico",
    description: "Consultórios e clínicas com agendamento online, prontuário digital e automações.",
    longDescription: "Plataforma completa para clínicas médicas com agendamento online, prontuário eletrônico, integração WhatsApp para lembretes automáticos e relatórios de atendimento.",
    image: projectMedical,
    techs: [
      { name: "Next.js", icon: SiNextdotjs, color: "#000000" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveUrl: null,
    githubUrl: null,
  },
  {
    id: 6,
    title: "Portfólio Arquitetura Premium",
    description: "Website institucional premium, lightbox, animações suaves e SEO avançado.",
    image: projectArchitecture,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Tailwind", icon: SiTailwindcss, color: "#06B6D4" },
    ],
    liveUrl: null,
    githubUrl: null,
  },
  {
    id: 7,
    title: "App de Gestão de Projetos",
    description: "Kanban, equipes, chat interno e relatórios de produtividade em real-time.",
    longDescription: "Aplicação web para gerenciamento ágil de projetos com Kanban board, sprints, time tracking, chat interno e colaboração em equipe em tempo real.",
    image: projectManagement,
    techs: [
      { name: "React", icon: FaReact, color: "#61DAFB" },
      { name: "Node.js", icon: FaNodeJs, color: "#339933" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveUrl: null,
    githubUrl: null,
  },
];

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

export const isValidLiveUrl = (url?: string | null) => {
  if (!url) return false;
  const s = url.trim();
  if (!s || s === "#") return false;
  try {
    return /^https?:\/\//i.test(s);
  } catch {
    return false;
  }
};
