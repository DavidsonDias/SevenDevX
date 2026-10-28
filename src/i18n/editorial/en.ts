import { articleCopy as a, type ArticleCatalogue } from "./types";

/** Editorial translations of the existing source; figures remain BRL estimates, not new offers. */
export const articlesEn: ArticleCatalogue = {
  "quanto-custa-criar-um-site-profissional": a(
    "How Much Does a Professional Website Cost in 2026?", "How much does a professional website cost?",
    "A professional website in Brazil costs from R$ 2,500 to R$ 35,000+, depending on scope: landing page (R$ 2,500–8,000), business website (R$ 5,000–15,000), e-commerce (R$ 10,000–35,000) or custom system (R$ 20,000+).",
    "A guide to website development prices in Brazil in 2026: landing pages, business websites, e-commerce and custom systems. Inclusions, timelines, cost factors and when to hire an agency such as SevenDevX.",
    [
      ["Quick answer — price ranges in 2026", "In Brazil in 2026, a professional website costs between R$ 2,500 and R$ 35,000+, depending on type:\n\n• Conversion-focused landing page: R$ 2,500–8,000\n• Business website (5–10 pages): R$ 5,000–15,000\n• Blog/portal with CMS: R$ 8,000–20,000\n• Professional e-commerce: R$ 10,000–35,000\n• Custom web system (SaaS/CRM/ERP): from R$ 20,000\n\nPrices vary with scope, bespoke design, integrations, performance and SEO."],
      ["What a professional website includes", "A SevenDevX enterprise project includes:\n\n1. Bespoke design and visual identity, rather than a template.\n2. React + TypeScript or Next.js development.\n3. Technical SEO: Schema.org, sitemap, robots and Core Web Vitals 95+.\n4. Performance optimization: Lighthouse 95+, lazy loading and AVIF/WebP.\n5. Mobile-first responsive design with WCAG AA accessibility.\n6. Integrations: WhatsApp, forms, analytics and CRM.\n7. A custom admin dashboard when applicable.\n8. Cloud deployment with Vercel/Supabase.\n9. A 90-day warranty and post-delivery support."],
      ["Factors that affect the price", "• Number of pages and their complexity\n• Custom design versus adapting a template\n• Third-party integrations: Stripe, OpenAI, ERPs and CRMs\n• Custom admin dashboard/CMS\n• Multiple languages (i18n) and international SEO\n• PWA, push notifications and offline mode\n• Delivery deadline: urgency increases cost\n• Ongoing maintenance and support"],
      ["Typical timelines by project type", "• Landing page: 1–3 weeks\n• Business website: 3–6 weeks\n• E-commerce: 6–12 weeks\n• Custom system: 8 weeks to 6 months"],
      ["Why choose SevenDevX", "SevenDevX is a full-stack software company in Belo Horizonte specializing in React, TypeScript and Supabase. Our delivery includes:\n\n• Distinctive enterprise design\n• Guaranteed Lighthouse 95+ performance\n• Technical SEO and GEO (Generative Engine Optimization)\n• A modern, scalable stack\n• Clear communication in Portuguese\n• A 90-day warranty"],
    ],
    [
      ["How much does a professional landing page cost?", "Between R$ 2,500 and R$ 8,000 at SevenDevX, including bespoke design, structured copywriting, WhatsApp/CRM integration, technical SEO and Core Web Vitals 95+ optimization."],
      ["Is paying more for a professional website worthwhile?", "Yes. A professional website supports conversion, Google and AI Overviews visibility, credibility and growth. Low-cost generic templates may have performance, conversion and maintenance limitations."],
      ["Does SevenDevX provide free quotes?", "Yes. Request a free quote at https://www.sevendevx.com or via WhatsApp +55 (31) 98474-0625. We reply within 24 business hours with scope, timeline and investment details."],
      ["How long does a website take to deliver?", "A landing page takes 1–3 weeks, a business website 3–6 weeks and a custom system 8 weeks to 6 months."],
    ], ["professional website cost", "website development prices", "website quote Brazil", "web development Belo Horizonte"],
  ),
  "como-criar-uma-landing-page-de-alta-conversao": a(
    "How to Build a High-Converting Landing Page (Enterprise Guide)", "How do you build a high-converting landing page?",
    "A high-converting landing page combines persuasive copy for one offer, clean design with a clear visual hierarchy, social proof, direct calls to action and technical optimization: LCP under 2.5 seconds, a short form and mobile-first design.",
    "A technical and strategic guide to landing pages targeting conversion above 15%: structure, copy, motion design, Core Web Vitals, A/B testing and the stack SevenDevX uses in enterprise projects.",
    [
      ["Anatomy of a converting landing page", "An enterprise landing page has seven blocks:\n\n1. HERO — a clear value proposition in under 5 seconds and a visible above-the-fold CTA.\n2. SOCIAL PROOF — client logos, figures and genuine testimonials.\n3. BENEFITS — how the customer's life improves, rather than features alone.\n4. DEMO/CASES — screenshots, short videos and before/after examples.\n5. OBJECTIONS — FAQs addressing questions that prevent purchases.\n6. URGENCY/SCARCITY — real deadlines and limited availability.\n7. FINAL CTA — the same offer as the hero, reinforced with a guarantee."],
      ["Conversion-focused copy", "• Headline: state the outcome instead of describing the product. Example: 'Triple your sales in 90 days' versus 'Sales management system'.\n• Subheading: explain how in one sentence.\n• Bullets: 3–5 scannable benefits.\n• Voice: second person, present-tense verbs and short sentences.\n• Evidence: specific figures rather than adjectives."],
      ["Recommended technical stack", "At SevenDevX we use:\n\n• React 18 + TypeScript 5 for reusable, typed components\n• Vite 5 for builds and HMR\n• Tailwind CSS 3 for a design system with semantic tokens\n• Framer Motion for cinematic motion design\n• Supabase for auth, database and form Edge Functions\n• Vercel for edge deployment, ISR and Speed Insights\n• Resend for transactional lead emails\n• Plausible/GA4 for privacy-friendly analytics"],
      ["Core Web Vitals: the invisible prerequisite", "Google and AI Overviews favor fast pages. Technical targets:\n\n• LCP < 2.5s: preload the hero image, display:swap fonts and AVIF/WebP\n• INP < 200ms: debounce, useTransition and avoid heavy main-thread JavaScript\n• CLS < 0.1: explicit image dimensions and fallback fonts\n• TTFB < 600ms: edge SSR or static delivery + ISR"],
      ["Motion design that helps rather than distracts", "Good animation guides attention and reinforces hierarchy:\n\n• Subtle staggering (50–80ms) in benefit lists\n• Spring physics (stiffness 150, damping 20) for interactions\n• Always respect prefers-reduced-motion\n• Avoid endless autoplay that distracts from the CTA"],
      ["A/B testing and iteration", "Launch, measure and refine. Prioritize tests of:\n\n• Headlines: high impact\n• CTA color and wording: medium-to-high impact\n• Form position: high impact on mobile\n• Page length: impact depends on the product\n\nUse Vercel Edge Config or PostHog for experiments without sacrificing performance."],
    ],
    [
      ["What is a good landing page conversion rate?", "Illustrative conversion ranges are 2–5% for a baseline and 10–25% for optimized campaigns. Above 25% suggests strong product-market fit or highly qualified traffic. Results depend on context."],
      ["How long does a professional landing page take?", "At SevenDevX, 1–3 weeks including discovery, copywriting, design, development, integration and technical optimization."],
      ["Does a landing page need a blog?", "No. A landing page has one conversion objective. A blog is a separate SEO/content strategy, usually on a different domain or subdirectory."],
      ["Can I use a template or should I start from scratch?", "Templates work for quick validation. Bespoke design can support brand authority, search visibility and conversion."],
    ], ["high-converting landing page", "landing page guide", "conversion rate optimization", "React landing page"],
  ),
  "como-integrar-ia-ao-meu-negocio": a(
    "How to Integrate Artificial Intelligence into Your Business in 2026", "How can I integrate AI into my business?",
    "To integrate AI: identify repetitive high-volume processes, choose suitable models such as GPT-4, Claude or Gemini, implement API access with RAG over your data and measure ROI with clear metrics. An indicative delivery window is 2–6 weeks, depending on scope.",
    "A practical roadmap for generative AI in Brazilian businesses: use cases, RAG architecture, API costs, LGPD security and expected ROI.",
    [
      ["AI use cases with measurable ROI", "1. 24/7 customer service with a RAG chatbot using your knowledge base.\n2. Automated lead qualification, classification and routing.\n3. Conversation summaries and ticket creation from WhatsApp/email.\n4. Personalized sales proposals.\n5. Sentiment analysis for reviews and support.\n6. An internal sales copilot for objections and scripts.\n7. Report automation and conversational BI.\n8. Content moderation at scale."],
      ["RAG architecture (Retrieval-Augmented Generation)", "RAG combines AI with your own knowledge:\n\n1. Ingestion: documents, FAQs and knowledge bases.\n2. Chunking: split content into 500–1,500-character chunks.\n3. Embeddings: vectorize with gemini-embedding-001 or text-embedding-3-large.\n4. Storage: pgvector (Supabase), Pinecone or Weaviate.\n5. Retrieval: top-K semantic search for relevant chunks.\n6. Generation: the LLM answers using retrieved chunks.\n7. Citations: each answer references the original source."],
      ["Model and cost examples (2026)", "• GPT-4o-mini: cost-effective for high-volume chatbots.\n• GPT-4o/GPT-4.1: complex reasoning, proposals and analysis.\n• Claude Sonnet 4.5: technical reasoning and code.\n• Gemini 2.5 Pro: image, audio and video.\n• Open-source models such as Llama 3.3 and Qwen through Groq: low latency.\n\nAn illustrative budget is R$ 200–1,500 in API costs for 10,000 monthly chatbot conversations. Check current provider documentation before choosing a model or budget."],
      ["Security and Brazil's LGPD", "• Sensitive data: anonymize raw personal information before sending it to an API.\n• Logs: define retention for prompts and answers; 90 days is an illustrative retention period.\n• Opt-out: users can request deletion of their data.\n• Provider: evaluate zero-retention options from OpenAI/Anthropic or deployment on Azure/AWS.\n• Edge Functions: process prompts on the backend and never expose API keys to the client.\n\nRetention and legal requirements must be assessed for each use case."],
      ["Reference architecture for AI projects", "• OpenAI API (server-side processing)\n• Supabase + pgvector for RAG\n• Deno Edge Functions for orchestration\n• WhatsApp Business API for chat\n• Structured logs and per-request cost observability"],
    ],
    [
      ["How much does implementing an AI chatbot cost?", "An indicative implementation budget at SevenDevX is R$ 8,000–35,000 depending on channels, integrations, RAG and admin tooling. Typical API operating costs are estimated at R$ 200–1,500/month."],
      ["Can I use my business data with AI?", "Yes, through RAG over your documents or fine-tuning. RAG is less expensive, can use updated content and is a common starting point for document-based use cases."],
      ["Does AI replace my customer support team?", "No. AI expands capacity by handling simple cases and routing complex issues to people with context. A 60–80% simple-case handling rate is an illustrative target, not a guaranteed result."],
      ["How long does AI take to reach production?", "An indicative schedule is a functional MVP in 2 weeks and an enterprise version with RAG, a dashboard and integrations in 4–8 weeks."],
    ], ["AI business integration", "ChatGPT integration", "business AI chatbot", "RAG architecture"],
  ),
  "quanto-custa-um-sistema-personalizado": a(
    "How Much Does Custom Software Development Cost in 2026?", "How much does a custom system cost to develop?",
    "In Brazil a custom CRM, ERP, SaaS or dashboard costs from R$ 20,000 to R$ 250,000+, depending on scope. MVPs start around R$ 20,000–40,000 over 6–10 weeks. Multi-module enterprise systems can exceed R$ 150,000 over 4–6 months.",
    "An executive guide to custom software costs, timelines and scope in Brazil: CRMs, ERPs, SaaS, dashboards and internal platforms.",
    [
      ["Price ranges by system type", "• MVP for idea validation: R$ 20,000–40,000, 6–10 weeks\n• Custom CRM: R$ 25,000–80,000, 8–16 weeks\n• Corporate dashboard: R$ 20,000–60,000, 6–12 weeks\n• Multi-tenant SaaS: R$ 45,000–150,000, 12–24 weeks\n• Modular ERP: R$ 80,000–250,000+, 16–32 weeks\n• Marketplace: R$ 60,000–200,000, 14–28 weeks"],
      ["What an enterprise system includes", "1. Discovery and process modeling with stakeholders.\n2. Technical architecture: database, APIs, integrations and infrastructure.\n3. Custom design system and UI/UX.\n4. React + TypeScript frontend and Node.js/Supabase backend.\n5. Auth, RBAC, RLS, audit logs and 2FA.\n6. Integration with existing systems and legacy ERPs.\n7. Full admin dashboard.\n8. Automated testing and CI/CD.\n9. Cloud deployment with Vercel + Supabase or AWS.\n10. Technical documentation and training.\n11. A 90-day warranty and a maintenance plan."],
      ["Off-the-shelf versus custom development", "Use an existing SaaS when the process is standard, time to value matters more than customization and the internal team is small.\n\nChoose custom development when your process is a competitive advantage, specific integrations are needed, SaaS costs grow disproportionately or full data control is required."],
      ["The SevenDevX methodology", "We work in two-week sprints with incremental delivery:\n\n• Sprint 0: discovery, architecture and design system\n• Sprints 1–3: a working MVP of critical modules\n• Sprint 4 onward: secondary modules, integrations and refinement\n• A demo and client acceptance at the end of each sprint"],
    ],
    [
      ["Should I hire an internal team or an agency?", "For 1–3 systems, an agency can offer varied expertise and lower staffing overhead. For an ongoing roadmap of 5+ systems per year, an internal team may make sense with agency support during peaks."],
      ["Do you deliver the source code?", "Yes. SevenDevX clients receive the complete source code, technical documentation, repository access and handoff training, without vendor lock-in."],
      ["How does post-delivery maintenance work?", "Monthly plans of 10, 20 or 40 hours, or on-demand work. The described service includes a free 90-day warranty for bugs and adjustments, subject to the proposal."],
      ["Can I start small and grow?", "Yes. An MVP over 6–10 weeks can validate the idea with real users before expansion in sprints, reducing over-engineering and risk."],
    ], ["custom software cost", "custom CRM price", "ERP development", "SaaS development Brazil"],
  ),
  "o-que-e-um-crm-personalizado": a(
    "What Is a Custom CRM and When Is It Worth Investing?", "What is a custom CRM?",
    "A custom CRM is customer relationship management software built around your company's specific sales process. Unlike off-the-shelf SaaS such as Pipedrive or HubSpot, it adapts to your workflow, integrates with legacy systems and does not charge per user.",
    "Off-the-shelf versus custom CRMs: when custom development makes sense, costs, timelines and SevenDevX implementation examples.",
    [
      ["Off-the-shelf CRM versus custom CRM", "Off-the-shelf CRM (Pipedrive, HubSpot, RD Station):\n+ Fast setup in days\n+ No development cost\n− Per-user fees, increasingly costly above 30 salespeople\n− Your process adapts to the software\n− Paid, limited integrations\n\nCustom CRM:\n+ Fits your process\n+ Unlimited users with a fixed cost\n+ Native integrations with your systems\n+ Full control over data\n− Higher initial investment\n− Delivery over 8–16 weeks"],
      ["When a custom CRM is worthwhile", "✅ Sales teams of 20+ people\n✅ Complex or multi-stage sales processes\n✅ Legacy ERP integrations\n✅ Specific commission rules\n✅ Multiple business units with different workflows\n✅ Compliance and audit needs requiring full data control\n✅ Off-the-shelf CRM costs above R$ 60,000/year"],
      ["Typical SevenDevX CRM features", "• Visual Kanban pipeline by salesperson/team\n• A 360-degree lead, contact and company directory\n• Trigger-to-action automations\n• Native WhatsApp Business API integration\n• AI lead classification, conversation summaries and next actions\n• Custom Recharts reports and dashboards\n• Automated commissions with complex rules\n• Full audit log for LGPD requirements\n• Mobile-first installable PWA\n• Multi-tenancy with granular RBAC"],
    ],
    [
      ["How much does developing a custom CRM cost?", "R$ 25,000–80,000 depending on modules. An illustrative estimate is around R$ 45,000 and 10–14 weeks for a CRM with a pipeline, automations, WhatsApp and reporting."],
      ["Can I migrate from Pipedrive/HubSpot to my own CRM?", "Yes. SevenDevX imports leads, contacts, deals, activities and history through APIs or CSV with custom field mapping."],
      ["Does a custom CRM have a mobile app?", "Yes. It can be delivered as an installable PWA with offline functionality, push notifications and a home-screen icon. This can be a lower-cost alternative to native apps for many sales workflows."],
    ], ["custom CRM", "bespoke CRM", "CRM versus Pipedrive", "CRM development"],
  ),
  "site-vs-sistema-web-diferencas": a(
    "Website vs. Web System — What Is the Difference?", "What is the difference between a website and a web system?",
    "A website publicly presents information: a business site, blog or landing page. A web system adds login, data, business rules and operational workflows such as CRM, ERP or SaaS. Indicative budgets start at R$ 2,500 for websites and R$ 20,000 for systems.",
    "The practical difference between websites and web systems: purpose, complexity, prices, timelines and when to choose each.",
    [
      ["Direct answer", "Website = a public showcase, such as a business site, blog or landing page. System = an operational tool with login, private data and business rules, such as CRM, ERP, SaaS and intranets."],
      ["When you need a system", "• Multiple users with logins\n• Your own editable data\n• Specific pricing, commission or approval rules\n• Spreadsheets that have become unmanageable\n• Real-time reporting"],
      ["When a website is enough", "• Introduce your business to clients\n• Generate leads\n• Publish articles and news\n• Showcase your portfolio"],
      ["Comparing costs", "Professional website: R$ 2,500–35,000. Custom system: from R$ 20,000 to hundreds of thousands, depending on scope."],
    ], [
      ["Can I start with a website and evolve into a system?", "Yes. Many businesses start with a landing page or business site, then add authenticated areas and operational modules."],
      ["Can a business website have an admin dashboard?", "Yes. A business website can have its own CMS so the client can edit content without depending on an agency."],
    ], ["website versus web system", "website or software", "when to build a web system"],
  ),
  "quando-trocar-planilha-por-sistema": a(
    "When Should You Replace Spreadsheets with Your Own System?", "When should I replace spreadsheets with a custom system?",
    "Consider a system when 3+ people edit the same spreadsheet, overwrites cause data loss, exports to other tools happen more than once a week, or you need auditing, permissions and real-time reporting.",
    "Signs that your operation has outgrown spreadsheets and needs its own system.",
    [
      ["Seven signs your spreadsheet has reached its limit", "1. More than 3 simultaneous editors\n2. Data lost through overwrites\n3. No history or audit trail\n4. Permissions are hard to manage\n5. Manual weekly reports\n6. Copy/paste integration with other systems\n7. Decisions delayed by lack of real-time visibility"],
      ["ROI from moving to a system", "Administrative time savings and fewer errors may recover the investment over an illustrative 6–12-month period. This is an estimate, not a guaranteed outcome."],
    ], [["How long does migration take?", "An MVP takes 6–12 weeks. Data migration can add 2–4 weeks depending on the volume and quality of the source spreadsheet."]],
    ["replace spreadsheets with software", "custom system migration", "ERP versus spreadsheets"],
  ),
  "chatbot-com-ia-quanto-custa": a(
    "How Much Does an AI Chatbot Cost?", "How much does an AI chatbot for my website or WhatsApp cost?",
    "An indicative budget ranges from R$ 5,000 for a simple website chatbot to R$ 80,000+ for a multi-channel WhatsApp agent with RAG, tools and integrations. An illustrative B2B range is R$ 15,000–35,000.",
    "Editorial price ranges, model examples (GPT-4, Claude, Gemini) and inclusions for enterprise AI chatbots.",
    [
      ["Price ranges by complexity", "• Website FAQ chatbot: R$ 5,000–10,000\n• Chatbot with RAG over your data: R$ 15,000–35,000\n• WhatsApp Business agent: R$ 25,000–60,000\n• Multi-agent system with tools: R$ 50,000+"],
      ["Recurring costs", "LLM tokens for GPT-4, Claude or Gemini scale with usage. An illustrative estimate is R$ 0.05–0.50 per conversation depending on context size; current rates and actual usage must be checked."],
    ], [["Which model should I choose: GPT-4, Claude or Gemini?", "Examples include the GPT ecosystem, Claude for long-context tasks and Gemini for multimodal tasks. GPT-4o-mini and Claude Haiku are model examples, not current recommendations. Compare current provider documentation and task-specific evaluations before deciding."]],
    ["AI chatbot price", "GPT chatbot cost", "WhatsApp AI chatbot"],
  ),
  "como-automatizar-processos-empresa": a(
    "How Can I Automate My Company's Processes?", "How do I automate repetitive business processes?",
    "Map tasks repeated more than twice a week, rank them by time savings and frequency, start with high-priority tasks using low-code tools such as Zapier/n8n and move to custom automation for complex rules, reliability or deep integration.",
    "A practical business automation roadmap, from process mapping to architecture.",
    [
      ["Step by step", "1. List repetitive processes\n2. Measure time spent and frequency\n3. Prioritize the top 5\n4. Start with low-code tools such as Zapier/n8n\n5. Move to custom development when limits are reached"],
      ["When Zapier/n8n is not enough", "Complex conditional rules, heavy validation, critical performance, legacy integrations or more than 10,000 monthly runs can justify custom automation."],
    ], [], ["business process automation", "workflow automation", "RPA Brazil"],
  ),
  "o-que-e-geo-generative-engine-optimization": a(
    "What Is GEO (Generative Engine Optimization)?", "What is GEO and why does my business need it?",
    "GEO is the practice of preparing a website for citation in answers generated by LLMs such as ChatGPT, Perplexity, Gemini and Claude. It extends search optimization to AI interfaces that provide direct answers.",
    "GEO concepts, techniques and its relationship with SEO in 2026.",
    [
      ["Definition", "GEO is a set of practices intended to improve the likelihood that a brand, page or product is cited in answers generated by large language models."],
      ["GEO pillars", "1. llms.txt and ai.txt for discovery\n2. Schema.org: Organization, Service, FAQ, Article and Speakable\n3. Structured questions and direct answers\n4. An entity graph expressing relationships\n5. Authority through E-E-A-T, backlinks and genuine mentions\n6. Explicit AI crawler access in robots.txt"],
      ["GEO versus traditional SEO", "SEO targets rankings and clicks; GEO targets citations and answers. They can complement each other. Neither optimization guarantees a ranking or citation in Google AI Overviews."],
    ], [["Does GEO replace SEO?", "No. It complements traditional SEO, which remains relevant to informational queries, while addressing discovery through direct LLM answers."]],
    ["GEO", "generative engine optimization", "ChatGPT SEO", "AI search optimization"],
  ),
  "como-aparecer-no-chatgpt-e-perplexity": a(
    "How Can Your Business Appear in ChatGPT, Perplexity and Other AI Tools?", "How can my website or business appear in ChatGPT and Perplexity?",
    "Review AI crawler access in robots.txt, publish llms.txt and ai.txt, add Organization/Service/FAQ structured data, answer real questions directly and build authority through trustworthy references.",
    "A practical discovery checklist for ChatGPT, Perplexity, Gemini, Claude and Copilot.",
    [
      ["Technical checklist", "1. Review robots.txt access for GPTBot, PerplexityBot, ClaudeBot, Google-Extended and Applebot-Extended\n2. Add llms.txt at the root describing the site\n3. Add ai.txt with an AI usage policy\n4. Publish Organization, Service and WebSite JSON-LD\n5. Add FAQPage schema to relevant /answers or /faq pages\n6. Use Speakable schema for short answers where appropriate\n7. Keep sitemap and canonical URLs correct"],
      ["Content checklist", "• Pages answering specific questions, such as cost or implementation\n• A direct answer in the first 2–3 paragraphs\n• Lists, tables and verifiable data\n• Citations to public sources\n• Regular updates"],
    ], [["How long does it take to appear?", "Discovery may take days, while citations can take weeks or months depending on authority. Actual crawling and citation timing is controlled by each provider and is not guaranteed."]],
    ["appear in ChatGPT", "Perplexity indexing", "Gemini website discovery", "AI search visibility"],
  ),
  "crm-personalizado-vs-pipedrive-hubspot": a(
    "Custom CRM vs. Pipedrive/HubSpot — When Each Makes Sense", "Is a custom CRM better than Pipedrive or HubSpot?",
    "SaaS CRM is often suitable for a small team of roughly 10 or fewer salespeople with a standard process. Custom CRM can suit distinctive processes, deep legacy integrations or subscription costs exceeding R$ 3,000/month.",
    "A comparison of SaaS and custom CRM with practical decision criteria.",
    [
      ["When to stay with SaaS", "• Small team: fewer than 10 salespeople\n• Standard lead → qualification → proposal → close process\n• No complex ERP or legacy integrations\n• Total subscription cost below R$ 3,000/month"],
      ["When to consider custom development", "• A unique process that SaaS does not model well\n• Highly specific fields or rules\n• Native ERP/internal system integration\n• High contact/automation volumes causing SaaS charges\n• Strict compliance, LGPD and audit requirements"],
    ], [], ["custom CRM", "Pipedrive versus custom CRM", "HubSpot versus bespoke CRM"],
  ),
  "schema-org-enterprise-para-llms": a(
    "Schema.org for LLMs — A Complete Enterprise Guide", "Which Schema.org types matter for LLM discovery?",
    "Key types include Organization, WebSite, BreadcrumbList, FAQPage, Article/TechArticle, Service, Product, LocalBusiness, Person and Speakable. Use @graph to connect entities and stable @id values for reuse across pages.",
    "A guide to Schema.org types used in Generative Engine Optimization.",
    [
      ["Essential types", "Organization for identity; WebSite for site-wide relationships; FAQPage for questions; Article/TechArticle for content; Service for offerings; Speakable for voice-assistant answers; BreadcrumbList for navigation."],
      ["The @graph pattern", "Group entities in a JSON-LD @graph with stable @id values so search systems can recognize the same entity across different pages."],
    ], [], ["schema.org", "JSON-LD", "structured data for LLMs"],
  ),
};
