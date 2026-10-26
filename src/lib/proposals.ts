/** @file Proposal snapshots: independent from contracts, with no automatic commitments. */
import { z } from "zod";

export const PROPOSAL_KIND = "sevenos-commercial-proposal-v1";
const text = z.string().max(20000);
/** Only public raster references are persisted, never signed attachment URLs. */
export function safeProposalLink(value: string): string {
  try {
    const url = new URL(value);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password
      ? url.href
      : "";
  } catch {
    return "";
  }
}
export function safeProposalImage(value: string): string {
  if (/^local:[\w.-]+$/.test(value) || /^\/(?!\/)[^?#]*$/.test(value))
    return value;
  const url = safeProposalLink(value);
  if (!url) return "";
  const parsed = new URL(url);
  return parsed.pathname.includes("/object/sign/") ||
    [...parsed.searchParams.keys()].some((key) =>
      /token|secret|signature/i.test(key),
    )
    ? ""
    : url;
}
export const proposalProjectSchema = z.object({
  id: z.string().max(100),
  title: z.string().trim().min(1).max(160),
  summary: z.string().max(450),
  category: z.string().max(80),
  image: z.string().max(2048).transform(safeProposalImage),
  url: z
    .string()
    .max(2048)
    .transform((value) => (value ? safeProposalLink(value) : "")),
});
export type ProposalProject = z.infer<typeof proposalProjectSchema>;
export const proposalSchema = z.object({
  schema: z.literal(1),
  title: text,
  clientName: text,
  company: text,
  email: text,
  phone: text,
  issuedOn: text,
  validUntil: text,
  logoId: text,
  headline: text,
  overview: text,
  deliverables: text,
  timeline: text,
  investment: text,
  payment: text,
  support: text,
  exclusions: text,
  evolution: text,
  about: text,
  portfolio: text,
  nextSteps: text,
  contact: text,
  differentiators: text.default(""),
  growth: text.default(""),
  social: text.default(""),
  projects: z.array(proposalProjectSchema).max(18).default([]),
  logoSurface: z.enum(["none", "light", "dark"]).default("none"),
  logoTreatment: z.enum(["original", "white-edges"]).default("original"),
  theme: z.enum(["classic", "azure"]).default("classic"),
});
export type Proposal = z.infer<typeof proposalSchema>;
export type ProposalField = Exclude<
  keyof Proposal,
  "schema" | "projects" | "logoSurface" | "logoTreatment" | "theme"
>;
export type ProposalSource = {
  project: {
    title?: string | null;
    description?: string | null;
    long_description?: string | null;
    client_name?: string | null;
    budget?: number | null;
  };
  client?: {
    name?: string | null;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
  } | null;
  documents?: { type: string; content: string }[];
  logoId?: string;
  budget?: { amount_total: number; currency: string } | null;
};

/** Imports known facts only. Missing commercial conditions stay empty for human review. */
export function createProposal(
  { project, client, documents = [], logoId = "", budget }: ProposalSource,
  now = new Date(),
): Proposal {
  const source = (type: string) =>
    documents.find((doc) => doc.type === type)?.content || "";
  return {
    schema: 1,
    projects: [],
    logoSurface: "none",
    logoTreatment: "original",
    theme: "classic",
    title: project.title || "Proposta comercial",
    clientName: client?.name || project.client_name || "",
    company: client?.company || "",
    email: client?.email || "",
    phone: client?.phone || "",
    issuedOn: now.toISOString().slice(0, 10),
    validUntil: "",
    logoId,
    headline: "Uma presença digital à altura da sua marca.",
    overview:
      source("briefing") ||
      project.long_description ||
      project.description ||
      client?.notes ||
      "",
    deliverables: source("technical_scope") || source("scope_macro"),
    timeline: source("timeline") || source("roadmap"),
    investment:
      source("investment") ||
      ((budget?.amount_total || project.budget || 0) > 0
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: budget?.currency || "BRL",
          }).format(budget?.amount_total || project.budget || 0)
        : ""),
    payment: "",
    support: "",
    exclusions: "",
    evolution: "",
    about:
      "Estratégia, design e engenharia para transformar necessidades de negócio em experiências digitais.\nDesenvolvimento personalizado, comunicação direta e atenção à qualidade em cada entrega.",
    differentiators:
      "Desenvolvimento personalizado para o modelo de negócio e o momento do cliente.\nExperiência em primeiro lugar: navegação clara e apresentação profissional em diferentes telas.\nVisão de evolução: estrutura planejada para novas funcionalidades e integrações.\nComunicação direta, alinhamentos e transparência nas entregas.",
    growth:
      "Serviços de crescimento podem ser avaliados após o lançamento: SEO, conteúdo e gestão de campanhas.\nSão opcionais e dependem de escopo e orçamento próprios. Verba de anúncios e serviços de terceiros são tratados separadamente. Resultados não são garantidos.",
    social:
      "Instagram: @sevendevx\nYouTube: @sevendevxx\nSite oficial: www.sevendevx.com",
    portfolio:
      "Conheça os projetos e experiências digitais da SevenDevX em www.sevendevx.com.",
    contact: "www.sevendevx.com\nsevendevxx@gmail.com",
    nextSteps:
      "Revisar e aprovar o escopo da proposta.\nAlinhar condições comerciais e cronograma.\nFormalizar a contratação.\nEnviar os materiais necessários para iniciar o projeto.",
  };
}

export const PROPOSAL_SECTIONS: {
  key: ProposalField;
  title: string;
  hint: string;
}[] = [
  {
    key: "overview",
    title: "Visão do projeto",
    hint: "Objetivos, público, contexto e resultados esperados.",
  },
  {
    key: "deliverables",
    title: "Escopo e entregáveis",
    hint: "Descreva o que será entregue, limites, quantidades e critérios de aceite.",
  },
  {
    key: "investment",
    title: "Investimento",
    hint: "Valores, moeda e serviços incluídos. Revise antes de enviar.",
  },
  {
    key: "payment",
    title: "Condições de pagamento",
    hint: "Entrada, parcelas, vencimentos e forma de pagamento.",
  },
  {
    key: "timeline",
    title: "Cronograma",
    hint: "Fases, duração, marcos de aprovação e dependências do cliente.",
  },
  {
    key: "support",
    title: "Suporte e serviços opcionais",
    hint: "Prazo de suporte, limites e valores recorrentes, se aplicáveis.",
  },
  {
    key: "exclusions",
    title: "Premissas e exclusões",
    hint: "Domínio, hospedagem, serviços de terceiros e itens fora do escopo.",
  },
  {
    key: "evolution",
    title: "Evolução futura",
    hint: "Possibilidades futuras, separadas do investimento atual.",
  },
  {
    key: "about",
    title: "Sobre a SevenDevX",
    hint: "Apresentação, forma de trabalho e diferenciais.",
  },
  {
    key: "differentiators",
    title: "Nossos diferenciais",
    hint: "Personalização, experiência, evolução e acompanhamento do projeto.",
  },
  {
    key: "growth",
    title: "Crescimento opcional",
    hint: "SEO, conteúdo e campanhas, sempre com escopo e investimento separados.",
  },
  {
    key: "portfolio",
    title: "Portfólio de referência",
    hint: "Projetos e endereços públicos aprovados para apresentação.",
  },
  {
    key: "social",
    title: "Conecte-se com a SevenDevX",
    hint: "Canais oficiais e redes sociais da empresa.",
  },
  {
    key: "contact",
    title: "Contato SevenDevX",
    hint: "Site, e-mail e canais comerciais.",
  },
  {
    key: "nextSteps",
    title: "Próximos passos",
    hint: "O caminho entre a aprovação e o início do trabalho.",
  },
];

/** Shared section order for preview, Markdown and PDF; empty fields do not create gaps. */
export function visibleProposalSections(p: Proposal) {
  return PROPOSAL_SECTIONS.filter(
    (section) =>
      p[section.key].trim() ||
      (section.key === "portfolio" && p.projects.length),
  );
}
export const PROPOSAL_CHANNELS = {
  whatsapp: { label: "WhatsApp", hint: "(31) 98474-0625" },
  phone: { label: "Telefone", hint: "+55 31 98474-0625" },
  email: { label: "E-mail", hint: "contato@empresa.com" },
  website: { label: "Site", hint: "https://www.empresa.com" },
  instagram: { label: "Instagram", hint: "@empresa ou endereço do perfil" },
  youtube: { label: "YouTube", hint: "@canal ou endereço do canal" },
  linkedin: {
    label: "LinkedIn",
    hint: "https://www.linkedin.com/company/empresa",
  },
  facebook: { label: "Facebook", hint: "https://www.facebook.com/empresa" },
  tiktok: { label: "TikTok", hint: "@empresa ou endereço do perfil" },
  github: { label: "GitHub", hint: "https://github.com/empresa" },
  x: { label: "X", hint: "https://x.com/empresa" },
  other: { label: "Outro texto", hint: "Informação complementar" },
} as const;
export type ProposalChannelKind = keyof typeof PROPOSAL_CHANNELS;
export type ProposalChannel = {
  kind: ProposalChannelKind;
  text: string;
  href: string;
};
export function proposalChannel(line: string): ProposalChannel {
  const value = line.trim();
  const prefix = value.match(/^([^:]{1,20}):\s*/)?.[1].toLocaleLowerCase();
  const explicit = Object.entries(PROPOSAL_CHANNELS).find(
    ([, item]) => item.label.toLocaleLowerCase() === prefix,
  )?.[0] as ProposalChannelKind | undefined;
  const content = explicit ? value.replace(/^[^:]+:\s*/, "") : value;
  const email = content.match(/[\w.+-]+@[\w.-]+\.[a-z]{2,}/i)?.[0];
  const digits = content.replace(/\D/g, "");
  const barePhone =
    /^[+\d\s().-]+$/.test(content) &&
    digits.length >= 10 &&
    digits.length <= 15;
  let href = safeProposalLink(
    content.match(/https?:\/\/[^\s]+/i)?.[0] ||
      (content.match(/www\.[^\s]+/i)?.[0]
        ? `https://${content.match(/www\.[^\s]+/i)?.[0]}`
        : ""),
  );
  if (!href && /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(\/[^\s]*)?$/i.test(content))
    href = safeProposalLink(`https://${content}`);
  const kind: ProposalChannelKind =
    explicit ||
    (email
      ? "email"
      : /whatsapp|wa\.me|api\.whatsapp/i.test(value) || barePhone
        ? "whatsapp"
        : /telefone|^tel:/i.test(value)
          ? "phone"
          : /instagram/i.test(value)
            ? "instagram"
            : /youtube|youtu\.be/i.test(value)
              ? "youtube"
              : /linkedin/i.test(value)
                ? "linkedin"
                : /facebook|fb\.com/i.test(value)
                  ? "facebook"
                  : /tiktok/i.test(value)
                    ? "tiktok"
                    : /github/i.test(value)
                      ? "github"
                      : /^(x|twitter):|https?:\/\/(www\.)?(x|twitter)\.com/i.test(
                            value,
                          )
                        ? "x"
                        : href
                          ? "website"
                          : "other");
  if (kind === "email") href = email ? `mailto:${email}` : "";
  if (kind === "other") href = "";
  const handle = content.match(/@([a-z0-9._-]+)/i)?.[1];
  const roots: Partial<Record<ProposalChannelKind, string>> = {
    instagram: "https://www.instagram.com/",
    youtube: "https://www.youtube.com/@",
    tiktok: "https://www.tiktok.com/@",
    x: "https://x.com/",
  };
  if (!href && handle && roots[kind]) href = roots[kind] + handle;
  if (kind === "phone" || kind === "whatsapp") {
    if (barePhone) {
      const international = `${digits.length <= 11 ? "55" : ""}${digits}`;
      href =
        kind === "whatsapp"
          ? `https://wa.me/${international}`
          : `tel:+${international}`;
    } else if (
      kind !== "whatsapp" ||
      !href ||
      !/^(wa\.me|api\.whatsapp\.com|www\.whatsapp\.com)$/.test(
        new URL(href).hostname,
      )
    )
      href = "";
  }
  return { kind, text: value, href };
}

export function channelDraft(line: string) {
  const channel = proposalChannel(line);
  return {
    kind: channel.kind,
    value: line
      .replace(
        /^(WhatsApp|Telefone|E-mail|Site|Website|Instagram|YouTube|LinkedIn|Facebook|TikTok|GitHub|X|Twitter|Outro texto):\s*/i,
        "",
      )
      .trim(),
  };
}
export function serializeChannels(
  rows: { kind: ProposalChannelKind; value: string }[],
): string {
  return rows
    .filter((row) => row.value.trim())
    .map((row) =>
      row.kind === "other"
        ? row.value.trim()
        : `${PROPOSAL_CHANNELS[row.kind].label}: ${row.value.trim()}`,
    )
    .join("\n");
}

export function proposalWarnings(p: Proposal): string[] {
  return [
    !p.title.trim() && "Título",
    !p.clientName.trim() && "Cliente",
    !p.overview.trim() && "Visão do projeto",
    !p.deliverables.trim() && "Escopo",
    !p.investment.trim() && "Investimento",
    !p.payment.trim() && "Pagamento",
    !p.timeline.trim() && "Cronograma",
    !p.validUntil && "Validade",
  ].filter((value): value is string => !!value);
}

/** Metadata is validated before opening any saved snapshot or local draft. */
export function readProposal(metadata: unknown): Proposal | null {
  if (
    !metadata ||
    typeof metadata !== "object" ||
    !("kind" in metadata) ||
    metadata.kind !== PROPOSAL_KIND ||
    !("proposal" in metadata)
  )
    return null;
  const result = proposalSchema.safeParse(metadata.proposal);
  return result.success ? result.data : null;
}

export function proposalMarkdown(p: Proposal): string {
  return (
    `# ${p.title}\n\n${p.headline}\n\nCliente: ${p.clientName}\nEmpresa: ${p.company}\nE-mail: ${p.email}\nTelefone: ${p.phone}\nEmissão: ${p.issuedOn}\nValidade: ${p.validUntil || "A definir"}\n\n` +
    visibleProposalSections(p)
      .map(
        (section) =>
          `## ${section.title}\n\n${p[section.key]}${section.key === "portfolio" ? p.projects.map((project) => `\n\n### ${project.title}\n${project.summary}\n${project.url}`).join("") : ""}`,
      )
      .join("\n\n")
  );
}

export const STAGE_GUIDES: Record<
  string,
  { goal: string; outputs: string[]; ready: string }
> = {
  discovery: {
    goal: "Entender o negócio antes de propor a solução.",
    outputs: [
      "Briefing validado",
      "Público e necessidades",
      "Indicadores de sucesso",
    ],
    ready:
      "Objetivos, materiais disponíveis e restrições alinhados com o cliente.",
  },
  strategy: {
    goal: "Transformar o diagnóstico em prioridades e um plano viável.",
    outputs: ["Jornada do usuário", "Escopo macro", "Roadmap de entregas"],
    ready: "Prioridades, dependências e limites do projeto acordados.",
  },
  proposal: {
    goal: "Apresentar escopo, investimento e condições com clareza.",
    outputs: ["Proposta comercial", "Cronograma", "Condições de pagamento"],
    ready:
      "Proposta revisada e aprovação do cliente registrada. O contrato é tratado separadamente.",
  },
  design: {
    goal: "Validar a experiência antes de iniciar a construção.",
    outputs: ["Wireframes", "Protótipo navegável", "Design system"],
    ready: "Fluxos, telas e identidade aprovados; pendências documentadas.",
  },
  development: {
    goal: "Construir e testar as entregas conforme o escopo aprovado.",
    outputs: ["Ambiente técnico", "Sprints", "Evidências de QA"],
    ready: "Critérios de aceite verificados e defeitos críticos resolvidos.",
  },
  launch: {
    goal: "Publicar com segurança e preparar a operação do cliente.",
    outputs: ["Deploy e rollback", "Monitoramento", "Treinamento e evolução"],
    ready: "Produção validada, acessos entregues e suporte combinado.",
  },
};
