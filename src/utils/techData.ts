/**
 * techData.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/utils/techData.ts
 * @module Utils
 *
 * @description
 * Metadados de tecnologias (cores e identificadores de ícone).
 *
 * @see src/utils/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧠 TechStack Data v1.0 Pro++ ULTIMATE — Catálogo de Tecnologias Profissionais
 * ════════════════════════════════════════════════════════════════════════════════
 *
 * Arquivo de tecnologia completo, documentado estilo "Enterprise-Level".
 * Inclui:
 *
 *  ✔ Tipagem forte de Technology (name, category, link, icon, etc.)
 *  ✔ Organização modular por categorias (Front-End, Back-End, Database, DevOps, Design)
 *  ✔ Descrições profissionais otimizadas para copywriting
 *  ✔ Paleta de cores oficial para cada tecnologia
 *  ✔ Suporte total para React Icons (IconType)
 *  ✔ Exportações adicionais:
 *      → featuredTechs (Top 8 da Home)
 *      → categories (para filtros dinâmicos)
 *
 * Estrutura:
 *  1. Imports de ícones (react-icons)
 *  2. Interface Technology
 *  3. Array techData (catálogo principal)
 *  4. featuredTechs (top tecnologias para preview)
 *  5. categories (filtros dinâmicos)
 *
 * @version 3.0.0 (2025-11-17)
 * @author  
 *   SevenDevX — Enterprise Web Development, Software & Branding
 *
 * @compatibility
 *   React 18+, Next.js 14+, Vite 5+, TypeScript 5+
 *
 * @license Proprietary — Uso restrito à SevenDevX
 * ════════════════════════════════════════════════════════════════════════════════
 */

import { IconType } from "react-icons";

// Front-End Icons
import {
  SiHtml5,
  SiCss3,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiRedux,
  SiTailwindcss,
  SiBootstrap,
  SiSass,
  SiVite,
} from "react-icons/si";

// Back-End Icons
import {
  SiNodedotjs,
  SiExpress,
  SiNestjs,
  SiGraphql,
  SiPrisma,
  SiSequelize,
  SiPython,
} from "react-icons/si";

// Database Icons
import {
  SiMysql,
  SiPostgresql,
  SiMongodb,
  SiFirebase,
} from "react-icons/si";

// DevOps Icons
import {
  SiDocker,
  SiGit,
  SiGithub,
  SiGitlab,
  SiAmazonwebservices,
  SiVercel,
  SiRender,
  SiRailway,
  SiPostman,
  SiNotion,
  SiLinux,
  SiKubernetes,
  SiTerraform,
  SiRedis,
} from "react-icons/si";

import { SiFigma, SiCanva } from "react-icons/si";
import { VscCode } from "react-icons/vsc";

// ============================================================================
// 📘 2. INTERFACE PRINCIPAL — TIPAGEM FORTEMENTE DOCUMENTADA
// ============================================================================

/**
 * Estrutura padrão de representação de uma tecnologia.
 *
 * @property name       Nome da tecnologia
 * @property category   Categoria agrupada
 * @property description Texto persuasivo e profissional
 * @property icon       Ícone SVG importado de react-icons
 * @property color      Cor oficial da marca
 * @property link       Link da documentação oficial
 */
export interface Technology {
  name: string;
  category: "Front-End" | "Back-End" | "Database" | "DevOps" | "Design";
  description: string;
  icon: IconType | string;
  color: string;
  link: string;
}

// ============================================================================
// 📚 3. CATÁLOGO PRINCIPAL — TODAS AS TECNOLOGIAS
// ============================================================================

export const techData: Technology[] = [
  // ────────────────────────────────────────────────────────────────
  // 🎨 FRONT-END
  // ────────────────────────────────────────────────────────────────
  {
    name: "HTML5",
    category: "Front-End",
    description:
      "HTML5 é a base estrutural da web moderna, trazendo semântica, acessibilidade e padrões globais para um código limpo e escalável.",
    icon: SiHtml5,
    color: "#E34F26",
    link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML",
  },
  {
    name: "CSS3",
    category: "Front-End",
    description:
      "CSS3 transforma layouts simples em experiências visuais ricas, com responsividade, animações, variáveis e efeitos avançados.",
    icon: SiCss3,
    color: "#1572B6",
    link: "https://developer.mozilla.org/pt-BR/docs/Web/CSS",
  },
  {
    name: "JavaScript",
    category: "Front-End",
    description:
      "JavaScript é a linguagem que dá vida às interfaces, permitindo interatividade, lógica dinâmica e aplicações responsivas.",
    icon: SiJavascript,
    color: "#F7DF1E",
    link: "https://developer.mozilla.org/pt-BR/docs/Web/JavaScript",
  },
  {
    name: "TypeScript",
    category: "Front-End",
    description:
      "TypeScript adiciona tipagem estática ao JavaScript, garantindo segurança, robustez e manutenção facilitada em grandes sistemas.",
    icon: SiTypescript,
    color: "#3178C6",
    link: "https://www.typescriptlang.org/",
  },
  {
    name: "React",
    category: "Front-End",
    description:
      "React é a biblioteca número 1 na criação de interfaces modulares e reativas, focada em performance e componentização.",
    icon: SiReact,
    color: "#61DAFB",
    link: "https://react.dev/",
  },
  {
    name: "Next.js",
    category: "Front-End",
    description:
      "Next.js é o framework React definitivo, combinando SSR, SSG e Edge para entregar velocidade, SEO e experiência premium.",
    icon: SiNextdotjs,
    color: "#FFFFFF",
    link: "https://nextjs.org/",
  },
  {
    name: "Redux",
    category: "Front-End",
    description:
      "Redux gerencia estados complexos com previsibilidade, padronização e segurança para projetos escaláveis.",
    icon: SiRedux,
    color: "#764ABC",
    link: "https://redux.js.org/",
  },
  {
    name: "Tailwind CSS",
    category: "Front-End",
    description:
      "Tailwind é o framework utility-first mais rápido para criar interfaces personalizadas com eficiência e precisão.",
    icon: SiTailwindcss,
    color: "#06B6D4",
    link: "https://tailwindcss.com/",
  },
  {
    name: "Bootstrap",
    category: "Front-End",
    description:
      "Bootstrap acelera o desenvolvimento com seu sistema de grid poderoso e componentes responsivos prontos para uso.",
    icon: SiBootstrap,
    color: "#7952B3",
    link: "https://getbootstrap.com/",
  },
  {
    name: "Sass",
    category: "Front-End",
    description:
      "Sass evolui o CSS com variáveis, mixins e arquitetura modular, deixando o código mais limpo e escalável.",
    icon: SiSass,
    color: "#CC6699",
    link: "https://sass-lang.com/",
  },
  {
    name: "Vite",
    category: "Front-End",
    description:
      "Vite é o bundler ultrarrápido com HMR instantâneo e build otimizado para projetos modernos.",
    icon: "/icons/tech/vite.svg",
    color: "#646CFF",
    link: "https://vitejs.dev/",
  },

  // ────────────────────────────────────────────────────────────────
  // ⚙️ BACK-END
  // ────────────────────────────────────────────────────────────────
  {
    name: "Node.js",
    category: "Back-End",
    description:
      "Node.js executa JavaScript no servidor, permitindo APIs rápidas, modernas e escaláveis.",
    icon: "/icons/tech/nodejs.svg",
    color: "#339933",
    link: "https://nodejs.org/",
  },
  {
    name: "Express.js",
    category: "Back-End",
    description:
      "Express é o framework minimalista e flexível que potencia APIs REST sólidas e de alta performance.",
    icon: SiExpress,
    color: "#FFFFFF",
    link: "https://expressjs.com/",
  },
  {
    name: "NestJS",
    category: "Back-End",
    description:
      "NestJS eleva o desenvolvimento backend com arquitetura modular, TypeScript nativo e padrões sólidos.",
    icon: SiNestjs,
    color: "#E0234E",
    link: "https://nestjs.com/",
  },
  {
    name: "GraphQL",
    category: "Back-End",
    description:
      "GraphQL permite consultas flexíveis onde o cliente recebe exatamente os dados que precisa.",
    icon: SiGraphql,
    color: "#E10098",
    link: "https://graphql.org/",
  },
  {
    name: "Prisma",
    category: "Back-End",
    description:
      "Prisma é o ORM moderno, tipado e seguro para Node.js, trazendo produtividade máxima.",
    icon: SiPrisma,
    color: "#2D3748",
    link: "https://www.prisma.io/",
  },
  {
    name: "Sequelize",
    category: "Back-End",
    description:
      "Sequelize é um ORM maduro que suporta múltiplos bancos e facilita operações SQL complexas.",
    icon: SiSequelize,
    color: "#52B0E7",
    link: "https://sequelize.org/",
  },

  // ────────────────────────────────────────────────────────────────
  // 🗄️ DATABASE
  // ────────────────────────────────────────────────────────────────
  {
    name: "MySQL",
    category: "Database",
    description:
      "MySQL é leve, rápido e amplamente utilizado em aplicações de todos os tamanhos.",
    icon: "/icons/tech/mysql.svg",
    color: "#4479A1",
    link: "https://www.mysql.com/",
  },
  {
    name: "PostgreSQL",
    category: "Database",
    description:
      "PostgreSQL é o banco relacional mais avançado, com recursos robustos e estabilidade exemplar.",
    icon: SiPostgresql,
    color: "#336791",
    link: "https://www.postgresql.org/",
  },
  {
    name: "MongoDB",
    category: "Database",
    description:
      "MongoDB é o banco NoSQL mais popular, perfeito para dados flexíveis e escalabilidade.",
    icon: SiMongodb,
    color: "#47A248",
    link: "https://www.mongodb.com/",
  },
  {
    name: "Firebase",
    category: "Database",
    description:
      "Firebase oferece banco em tempo real, autenticação, hosting e análises — tudo integrado.",
    icon: SiFirebase,
    color: "#FFCA28",
    link: "https://firebase.google.com/",
  },

  // ────────────────────────────────────────────────────────────────
  // ⚙️ DEVOPS / INFRA
  // ────────────────────────────────────────────────────────────────
  {
    name: "Docker",
    category: "DevOps",
    description:
      "Docker facilita a criação de ambientes isolados, portáveis e 100% replicáveis.",
    icon: "/icons/tech/docker.svg",
    color: "#2496ED",
    link: "https://www.docker.com/",
  },
  {
    name: "Git",
    category: "DevOps",
    description:
      "Git é o sistema de versionamento mais utilizado no planeta, essencial para qualquer equipe.",
    icon: SiGit,
    color: "#F05032",
    link: "https://git-scm.com/",
  },
  {
    name: "GitHub",
    category: "DevOps",
    description:
      "GitHub é a plataforma global para colaboração, repositórios e CI/CD.",
    icon: SiGithub,
    color: "#FFFFFF",
    link: "https://github.com/",
  },
  {
    name: "Vercel",
    category: "DevOps",
    description:
      "Vercel é a plataforma mais rápida para deploy de aplicações Front-End e Edge Functions.",
    icon: SiVercel,
    color: "#FFFFFF",
    link: "https://vercel.com/",
  },
  {
    name: "AWS",
    category: "DevOps",
    description:
      "AWS é o ecossistema mais robusto de cloud computing, com centenas de serviços.",
    icon: SiAmazonwebservices,
    color: "#FF9900",
    link: "https://aws.amazon.com/",
  },
  {
    name: "Linux",
    category: "DevOps",
    description:
      "Linux é o sistema operacional open-source que domina servidores e infraestrutura global.",
    icon: "/icons/tech/linux.svg",
    color: "#FCC624",
    link: "https://www.linux.org/",
  },
  {
    name: "Python",
    category: "Back-End",
    description:
      "Python é a linguagem versátil para automação, data science, IA e desenvolvimento backend.",
    icon: "/icons/tech/python.svg",
    color: "#3776AB",
    link: "https://www.python.org/",
  },
  {
    name: "Kubernetes",
    category: "DevOps",
    description:
      "Kubernetes é a plataforma de orquestração de containers líder do mercado.",
    icon: SiKubernetes,
    color: "#326CE5",
    link: "https://kubernetes.io/",
  },
  {
    name: "Terraform",
    category: "DevOps",
    description:
      "Terraform é a ferramenta de Infrastructure as Code mais popular para provisionar recursos.",
    icon: SiTerraform,
    color: "#7B42BC",
    link: "https://www.terraform.io/",
  },
  {
    name: "Redis",
    category: "Database",
    description:
      "Redis é o banco de dados in-memory ultrarrápido para cache, filas e sessões.",
    icon: "/icons/tech/redis.svg",
    color: "#DC382D",
    link: "https://redis.io/",
  },
  {
    name: "GitLab",
    category: "DevOps",
    description:
      "GitLab é uma plataforma DevOps all-in-one com CI/CD completo integrado.",
    icon: SiGitlab,
    color: "#FC6D26",
    link: "https://gitlab.com/",
  },
  {
    name: "Render",
    category: "DevOps",
    description:
      "Render é uma plataforma moderna de deploy que une facilidade e escalabilidade.",
    icon: SiRender,
    color: "#46E3B7",
    link: "https://render.com/",
  },
  {
    name: "Railway",
    category: "DevOps",
    description:
      "Railway é a maneira mais rápida de subir APIs, bancos e serviços em produção.",
    icon: SiRailway,
    color: "#FFFFFF",
    link: "https://railway.app/",
  },
  {
    name: "Postman",
    category: "DevOps",
    description:
      "Postman é a plataforma padrão global para testes, documentação e colaboração em APIs.",
    icon: SiPostman,
    color: "#FF6C37",
    link: "https://www.postman.com/",
  },
  {
    name: "VS Code",
    category: "DevOps",
    description:
      "VS Code é o editor mais completo, rápido e extensível do mundo.",
    icon: "/icons/tech/vscode.svg",
    color: "#007ACC",
    link: "https://code.visualstudio.com/",
  },
  {
    name: "Notion",
    category: "DevOps",
    description:
      "Notion é o super-app moderno para documentação, gestão e colaboração.",
    icon: SiNotion,
    color: "#FFFFFF",
    link: "https://www.notion.so/",
  },

  // ────────────────────────────────────────────────────────────────
  // 🎨 DESIGN
  // ────────────────────────────────────────────────────────────────
  {
    name: "Figma",
    category: "Design",
    description:
      "Figma é a ferramenta nº1 para UI/UX, protótipos e design colaborativo.",
    icon: "/icons/tech/figma.svg",
    color: "#F24E1E",
    link: "https://www.figma.com/",
  },
  {
    name: "Canva",
    category: "Design",
    description:
      "Canva permite criar visuais profissionais rapidamente e com facilidade.",
    icon: SiCanva,
    color: "#00C4CC",
    link: "https://www.canva.com/",
  },
];

// ============================================================================
// ⭐ 4. TOP 8 TECNOLOGIAS EM DESTAQUE PARA HOME
// ============================================================================
export const featuredTechs = techData.slice(0, 8);

// ============================================================================
// 🏷️ 5. CATEGORIAS DISPONÍVEIS PARA FILTROS
// ============================================================================
export const categories = [
  "Todas",
  "Front-End",
  "Back-End",
  "Database",
  "DevOps",
  "Design",
] as const;
