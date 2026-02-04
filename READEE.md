# 🚀 SevenDevX — Soluções Tecnológicas Modernas e Inovadoras  

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Last Commit](https://img.shields.io/github/last-commit/DavidsonDias/sevendevx)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/sevendevx)
![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4-red)
![Visitors](https://visitor-badge.laobi.icu/badge?page_id=DavidsonDias.sevendevx)
![GitHub Stars](https://img.shields.io/github/stars/DavidsonDias/sevendevx?style=social)
![GitHub Forks](https://img.shields.io/github/forks/DavidsonDias/sevendevx?style=social)
![GitHub Issues](https://img.shields.io/github/issues/DavidsonDias/sevendevx)
![Vercel Status](https://img.shields.io/badge/Status-Online-brightgreen?logo=vercel)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa)

---

## 📖 Sobre o Projeto  

A **SevenDevX** é uma empresa de tecnologia moderna e inovadora, sediada em **Belo Horizonte (MG)**, especializada em:

- 🌐 **Desenvolvimento Web Full Stack**
- 💻 **Criação de Sites e Sistemas Personalizados**
- 🛠️ **Instalação de Software Empresarial**
- 🔧 **Manutenção de Computadores e Hardware**

### 🎯 Propósito do Site

Este projeto é um **site institucional moderno e interativo** que serve como:
- ✨ **Portfólio digital** da empresa
- 🚀 **Vitrine de serviços** e tecnologias
- 📞 **Canal de contato** direto integrado
- 💼 **Demonstração técnica** de capacidades de desenvolvimento

> *"Transformamos ideias em soluções digitais de alto impacto."*

O site foi desenvolvido com **design inspirado na SpaceX**: minimalista, futurista e profissional, utilizando as mais modernas tecnologias web.

🔗 **Acesse em produção:**  
👉 **[https://sevendevx.com](https://sevendevx.com)**

---

## 🧩 Stack Tecnológica

### 🧱 Core Technologies

<div align="center">

| Tecnologia | Versão | Função |
|:----------:|:------:|:------:|
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | 18.3.1 | Framework UI |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) | 5+ | Tipagem Estática |
| ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) | 5+ | Build Tool |
| ![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | 3+ | CSS Framework |
| ![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=for-the-badge&logo=greensock&logoColor=black) | 3.13.0 | Animações |
| ![Framer](https://img.shields.io/badge/Framer-0055FF?style=for-the-badge&logo=framer&logoColor=white) | 12.23.24 | Motion Design |

</div>

### 📦 Principais Dependências

#### 🎨 UI & Design
- **Shadcn/ui** — Componentes acessíveis com Radix UI
- **Lucide React** — Biblioteca de ícones moderna
- **React Icons** — Ícones adicionais
- **Tailwind CSS** — Utility-first CSS
- **Class Variance Authority** — Variantes de componentes

#### 📝 Forms & Validation
- **React Hook Form** — Gerenciamento de formulários
- **Zod** — Validação de schemas TypeScript-first
- **@hookform/resolvers** — Integração RHF + Zod

#### 🔄 State & Data
- **TanStack Query** — Cache e gerenciamento assíncrono
- **React Router** — Roteamento SPA

#### 🎭 Animations
- **GSAP** — Animações JavaScript profissionais
- **Framer Motion** — Animações React declarativas
- **ScrollTrigger** — Animações baseadas em scroll

#### 📊 Utilities
- **date-fns** — Manipulação de datas
- **sonner** — Toast notifications elegantes
- **cmdk** — Command palette
- **Embla Carousel** — Carrosséis responsivos

---

## 📂 Estrutura do Projeto  

```
📁 sevendevx/
├── 📄 index.html
├── 📄 vite.config.ts
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
├── 📄 README.md
├── 📄 TECHNICAL_REPORT.md    # ⭐ Relatório técnico completo
│
├── 📁 public/
│   ├── manifest.json          # PWA Manifest
│   ├── sw.js                  # Service Worker
│   ├── robots.txt             # SEO
│   ├── sitemap.xml            # SEO
│   ├── logo-192.png           # PWA Icons
│   ├── logo-512.png
│   ├── maskable-icon-512.png
│   └── apple-touch-icon.png
│
└── 📁 src/
    ├── main.tsx               # Entry point
    ├── App.tsx                # Root component
    ├── index.css              # Design system global
    │
    ├── 📁 components/
    │   ├── Header.tsx         # Cabeçalho responsivo
    │   ├── Hero.tsx           # Hero com vídeo
    │   ├── Footer.tsx         # Rodapé institucional
    │   ├── SEOHead.tsx        # SEO dinâmico + Schema.org
    │   ├── ServicesPreview.tsx
    │   ├── TechShowcase.tsx   # Showcase de tecnologias
    │   ├── ContactMultiStep.tsx # Formulário multi-etapas
    │   ├── WhatsAppButton.tsx
    │   ├── ExitIntentPopup.tsx
    │   ├── SectionDivider.tsx
    │   └── ui/                # 40+ componentes Shadcn/ui
    │
    ├── 📁 pages/
    │   ├── Index.tsx          # Home
    │   ├── Home.tsx
    │   ├── Services.tsx       # Serviços
    │   ├── Projects.tsx       # Projetos
    │   ├── PrivacyPolicy.tsx
    │   ├── Fornecedores.tsx
    │   └── NotFound.tsx       # 404
    │
    ├── 📁 assets/
    │   ├── videos/
    │   │   └── hero-bg.mp4    # Vídeo Hero
    │   ├── images/            # Imagens WebP otimizadas
    │   └── icons/             # SVG de tecnologias
    │
    ├── 📁 hooks/
    │   ├── use-toast.ts
    │   └── use-mobile.tsx
    │
    ├── 📁 utils/
    │   ├── techData.ts
    │   └── registerServiceWorker.ts
    │
    └── 📁 lib/
        └── utils.ts
```

---

## ⚙️ Funcionalidades Principais

### 🎬 Hero Section Premium
- Vídeo de fundo com autoplay, muted, loop
- Fallback automático para imagem WebP
- Overlay gradiente para legibilidade
- Animações Framer Motion
- Botão CTA com scroll suave

### 📱 Header Dinâmico
- Menu responsivo com animações GSAP
- Menu mobile off-canvas fullscreen
- Scroll behavior inteligente (hide/show)
- Background translúcido com blur
- Staggered animations

### 🎨 Showcase de Tecnologias
- 40+ tecnologias organizadas
- Filtros por categoria (Frontend, Backend, etc)
- Animações GSAP + ScrollTrigger
- Modal detalhado para cada tech
- Hover effects com glow

### 📝 Formulário Multi-Etapas
- 3 etapas com validação em tempo real
- Progress bar visual
- Formatação automática (telefone)
- Integração WhatsApp Business API
- Toast notifications

### 🔍 SEO Avançado
- Meta tags dinâmicas por página
- Schema.org (Organization, WebSite, etc)
- Open Graph + Twitter Cards
- Sitemap XML e robots.txt
- Lighthouse 100/100

### 📱 Progressive Web App
- Manifest.json configurado
- Service Worker com cache estratégico
- Funcionamento offline
- Instalável em dispositivos
- Ícones adaptativos

---

## 🚀 Como Rodar o Projeto

### 📋 Pré-requisitos

- Node.js 18+ ou Bun
- npm, yarn ou bun

### 🔧 Instalação

```bash
# 1️⃣ Clone o repositório
git clone https://github.com/DavidsonDias/sevendevx.git

# 2️⃣ Entre na pasta
cd sevendevx

# 3️⃣ Instale as dependências
npm install
# ou
bun install

# 4️⃣ Execute o servidor de desenvolvimento
npm run dev
# ou
bun dev

# 5️⃣ Acesse no navegador
# http://localhost:8080
```

### 🏗️ Build de Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview

# Arquivos gerados em: dist/
```

---

## 🌐 Deploy na Vercel

O projeto está otimizado para deploy na **Vercel** com configuração automática.

### 📦 Deploy Automático

1. **Conecte o repositório** no [Vercel Dashboard](https://vercel.com)
2. **Configuração auto-detectada** (Vite)
3. **Deploy contínuo** — Cada push = novo deploy
4. **Domínio personalizado** — Configure seu domínio

### ⚙️ Configurações

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

### 🎯 Features Habilitadas

- ✅ Edge Network (CDN global)
- ✅ Compressão Brotli/Gzip
- ✅ HTTP/2 e HTTP/3
- ✅ SSL automático
- ✅ Analytics integrado
- ✅ Preview deployments

---

## 🧰 Ferramentas & Integrações

| Ferramenta | Uso |
|------------|-----|
| ![VS Code](https://img.shields.io/badge/VS%20Code-007ACC?logo=visual-studio-code&logoColor=white) | Editor principal |
| ![Git](https://img.shields.io/badge/Git-F05032?logo=git&logoColor=white) | Controle de versão |
| ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white) | Linting |
| ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black) | Formatação |
| ![Vercel](https://img.shields.io/badge/Vercel-000000?logo=vercel&logoColor=white) | Hosting |
| ![Google Analytics](https://img.shields.io/badge/Analytics-E37400?logo=google-analytics&logoColor=white) | Métricas |

---

## 🎯 Performance & SEO

### ⚡ Lighthouse Scores

<div align="center">

| Métrica | Desktop | Mobile |
|:-------:|:-------:|:------:|
| 🎨 **Performance** | 95+ | 90+ |
| ♿ **Accessibility** | 100 | 100 |
| ✅ **Best Practices** | 95+ | 95+ |
| 🔍 **SEO** | 100 | 100 |

</div>

### 🔍 Otimizações SEO

- ✅ Meta tags dinâmicas
- ✅ Schema.org (4 schemas)
- ✅ Open Graph completo
- ✅ Twitter Cards
- ✅ Sitemap XML
- ✅ Robots.txt
- ✅ Canonical URLs
- ✅ SEO local (GeoTags)

### ⚡ Otimizações de Performance

- ✅ Lazy loading de imagens
- ✅ Formato WebP
- ✅ Code splitting
- ✅ Tree shaking
- ✅ Minificação
- ✅ Compressão Gzip/Brotli
- ✅ Service Worker cache
- ✅ Preload de recursos críticos

---

## 📱 Responsividade

### 📐 Breakpoints

```typescript
screens: {
  'xs': '480px',      // Smartphones pequenos
  'sm': '600px',      // Smartphones
  'md': '768px',      // Tablets portrait
  'tablet': '960px',  // Tablets landscape
  'lg': '1024px',     // Laptops
  'xl': '1280px',     // Desktops
  '2xl': '1920px',    // Large displays
}
```

### 📱 Testes Realizados

- ✅ iPhone SE, 12, 13, 14 Pro
- ✅ Samsung Galaxy S21, S22
- ✅ iPad, iPad Pro
- ✅ Desktop (1080p, 2K, 4K)
- ✅ Chrome, Firefox, Safari, Edge

---

## ♿ Acessibilidade

### 🎯 Conformidade WCAG 2.1 AA

- ✅ Contraste de cores 7:1
- ✅ Navegação por teclado
- ✅ ARIA labels
- ✅ Alt text descritivo
- ✅ Semântica HTML5
- ✅ Focus visível
- ✅ Cabeçalhos hierárquicos
- ✅ Formulários acessíveis

---

## 🔐 Segurança

### 🛡️ Implementações

- ✅ HTTPS obrigatório (SSL)
- ✅ Content Security Policy
- ✅ XSS Protection
- ✅ Sanitização de inputs
- ✅ Rate limiting
- ✅ Security headers
- ✅ Dependências atualizadas

---

## 📊 Estatísticas do Projeto

| Métrica | Valor |
|---------|-------|
| Componentes React | 45+ |
| Páginas | 6 |
| Linhas de Código | ~8.500 |
| Dependências | 70+ |
| Bundle Size (prod) | ~350 KB |
| Tempo de Build | ~15s |
| Tempo de Deploy | ~2min |

---

## 📚 Documentação Adicional

- 📄 **[TECHNICAL_REPORT.md](./TECHNICAL_REPORT.md)** — Relatório técnico completo
- 🌐 **[Site em Produção](https://sevendevx.com)**
- 📖 **[React Docs](https://react.dev)**
- 🎨 **[Tailwind Docs](https://tailwindcss.com)**
- 🎭 **[GSAP Docs](https://greensock.com/gsap/)**
- ⚡ **[Vite Docs](https://vitejs.dev)**

---

## 💬 Contato

<div align="center">

| Canal | Link |
|:-----:|:----:|
| 📧 **Email** | [contato@sevendevx.com](mailto:contato@sevendevx.com) |
| 📱 **WhatsApp** | [Clique aqui](https://wa.me/5531984740625) |
| 🌐 **Website** | [sevendevx.com](https://sevendevx.com) |
| 💼 **LinkedIn** | [/company/sevendevx](https://linkedin.com/company/sevendevx) |
| 📸 **Instagram** | [@sevendevx](https://instagram.com/sevendevx) |
| 🐙 **GitHub** | [@DavidsonDias](https://github.com/DavidsonDias) |

</div>

---

## 🏆 Créditos

**Desenvolvido com ❤️ por:**

<div align="center">

### Davidson Dias
**Full Stack Developer**

[![GitHub](https://img.shields.io/badge/GitHub-100000?logo=github&logoColor=white)](https://github.com/DavidsonDias)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?logo=linkedin&logoColor=white)](https://linkedin.com/in/davidson-dias)

</div>

© 2025 **SevenDevX** — Todos os direitos reservados.

---

## 📜 Licença

Distribuído sob a **MIT License**.  
Consulte o arquivo [LICENSE](./LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2025 SevenDevX

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
...
```

---

<div align="center">

### ⭐ Se este projeto foi útil, deixe uma estrela!

![Star History](https://img.shields.io/github/stars/DavidsonDias/sevendevx?style=social)

**Feito com:** React • TypeScript • Tailwind • GSAP • Framer Motion • PWA

</div>

