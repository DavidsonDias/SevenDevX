/**
 * 🚀 CvEditor.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/CvEditor.tsx
 * @module SevenOS/Admin
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Editor estruturado do currículo servido pela API `portfolio-content`
 * (rota `/curriculo` e PDF do site do Portfólio Davidson).
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 O SevenOS é a única fonte de verdade do currículo — o site só consome
 * 🔒 Componente controlado: não persiste nada, apenas emite `onChange`
 *
 * @updated 2026-08-07
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { Plus, Trash2 } from "lucide-react";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type CvExperience = {
  role: string;
  company: string;
  period: string;
  location?: string;
  description: string;
};

export type CvEducation = { course: string; school: string; period: string };

export type CvCertification = { name: string; issuer: string; year: string };

export type CvData = {
  summary?: string;
  headline?: string;
  location?: string;
  phone?: string;
  email?: string;
  linkedin?: string;
  website?: string;
  languages?: string[];
  skills?: string[];
  highlights?: string[];
  experiences?: CvExperience[];
  education?: CvEducation[];
  certifications?: CvCertification[];
};

type Props = { value: CvData; onChange: (next: CvData) => void };

// ============================================================================
// 🎨 INTERNAL COMPONENTS
// ============================================================================

const inputCls =
  "w-full bg-background/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-foreground/40 transition-colors";

const Field = ({
  label,
  value,
  onChange,
  textarea,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
    {textarea ? (
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className={inputCls}
      />
    ) : (
      <input
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
    )}
  </label>
);

const SectionHead = ({ title, onAdd }: { title: string; onAdd: () => void }) => (
  <div className="flex items-center justify-between gap-3">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
    <button
      type="button"
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider border border-border rounded px-2.5 py-1.5 hover:bg-foreground/5 transition-colors"
    >
      <Plus className="w-3.5 h-3.5" /> Adicionar
    </button>
  </div>
);

const RowShell = ({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) => (
  <div className="relative rounded-lg border border-border p-3 pr-10 space-y-3">
    {children}
    <button
      type="button"
      onClick={onRemove}
      aria-label="Remover item"
      className="absolute top-3 right-3 p-1.5 rounded border border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** Editor completo do currículo (resumo, experiências, formação, certificações). */
export default function CvEditor({ value, onChange }: Props) {
  const cv: Required<CvData> = {
    summary: value.summary ?? "",
    headline: value.headline ?? "",
    location: value.location ?? "",
    phone: value.phone ?? "",
    email: value.email ?? "",
    linkedin: value.linkedin ?? "",
    website: value.website ?? "",
    languages: value.languages ?? [],
    skills: value.skills ?? [],
    highlights: value.highlights ?? [],
    experiences: value.experiences ?? [],
    education: value.education ?? [],
    certifications: value.certifications ?? [],
  };

  const patch = (next: Partial<CvData>) => onChange({ ...cv, ...next });

  /** Atualiza um item de lista mantendo a imutabilidade do array. */
  const setItem = <T,>(list: T[], i: number, item: T) =>
    list.map((current, index) => (index === i ? item : current));

  return (
    <div className="space-y-6">
      <Field label="Headline" value={cv.headline} onChange={(v) => patch({ headline: v })} placeholder="Systems Analyst | Front-End Developer" />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Localização" value={cv.location} onChange={(v) => patch({ location: v })} placeholder="Belo Horizonte, MG" />
        <Field label="Telefone" value={cv.phone} onChange={(v) => patch({ phone: v })} placeholder="+55 31 ..." />
        <Field label="E-mail" value={cv.email} onChange={(v) => patch({ email: v })} placeholder="voce@email.com" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Website" value={cv.website} onChange={(v) => patch({ website: v })} placeholder="https://..." />
        <Field label="LinkedIn" value={cv.linkedin} onChange={(v) => patch({ linkedin: v })} placeholder="https://linkedin.com/in/..." />
      </div>

      <Field
        label="Resumo profissional"
        value={cv.summary}
        onChange={(v) => patch({ summary: v })}
        textarea
        placeholder="Um parágrafo curto, no tom do LinkedIn."
      />

      <Field
        label="Idiomas (separados por vírgula)"
        value={cv.languages.join(", ")}
        onChange={(v) => patch({ languages: v.split(",").map((s) => s.trim()).filter(Boolean) })}
        placeholder="Português (nativo), Inglês (intermediário)"
      />

      <Field
        label="Competências (separadas por vírgula)"
        value={cv.skills.join(", ")}
        onChange={(v) => patch({ skills: v.split(",").map((s) => s.trim()).filter(Boolean) })}
        textarea
        placeholder="React, Node.js, SQL Server, Scrum"
      />

      <Field
        label="Destaques (um por linha)"
        value={cv.highlights.join("\n")}
        onChange={(v) => patch({ highlights: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
        textarea
        placeholder={"Plataforma SevenOS em produção\nSites e PWAs entregues para clientes reais"}
      />

      {/* Experiências */}
      <div className="space-y-3">
        <SectionHead
          title="Experiência"
          onAdd={() =>
            patch({ experiences: [...cv.experiences, { role: "", company: "", period: "", location: "", description: "" }] })
          }
        />
        {cv.experiences.map((exp, i) => (
          <RowShell
            key={i}
            onRemove={() => patch({ experiences: cv.experiences.filter((_, index) => index !== i) })}
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cargo" value={exp.role} onChange={(v) => patch({ experiences: setItem(cv.experiences, i, { ...exp, role: v }) })} />
              <Field label="Empresa" value={exp.company} onChange={(v) => patch({ experiences: setItem(cv.experiences, i, { ...exp, company: v }) })} />
              <Field label="Período" value={exp.period} onChange={(v) => patch({ experiences: setItem(cv.experiences, i, { ...exp, period: v }) })} />
              <Field label="Local" value={exp.location ?? ""} onChange={(v) => patch({ experiences: setItem(cv.experiences, i, { ...exp, location: v }) })} />
            </div>
            <Field
              label="Descrição"
              value={exp.description}
              textarea
              onChange={(v) => patch({ experiences: setItem(cv.experiences, i, { ...exp, description: v }) })}
            />
          </RowShell>
        ))}
      </div>


      {/* Formação */}
      <div className="space-y-3">
        <SectionHead
          title="Formação"
          onAdd={() => patch({ education: [...cv.education, { course: "", school: "", period: "" }] })}
        />
        {cv.education.map((ed, i) => (
          <RowShell key={i} onRemove={() => patch({ education: cv.education.filter((_, index) => index !== i) })}>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Curso" value={ed.course} onChange={(v) => patch({ education: setItem(cv.education, i, { ...ed, course: v }) })} />
              <Field label="Instituição" value={ed.school} onChange={(v) => patch({ education: setItem(cv.education, i, { ...ed, school: v }) })} />
              <Field label="Período" value={ed.period} onChange={(v) => patch({ education: setItem(cv.education, i, { ...ed, period: v }) })} />
            </div>
          </RowShell>
        ))}
      </div>

      {/* Certificações */}
      <div className="space-y-3">
        <SectionHead
          title="Certificações"
          onAdd={() => patch({ certifications: [...cv.certifications, { name: "", issuer: "", year: "" }] })}
        />
        {cv.certifications.map((c, i) => (
          <RowShell
            key={i}
            onRemove={() => patch({ certifications: cv.certifications.filter((_, index) => index !== i) })}
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Nome" value={c.name} onChange={(v) => patch({ certifications: setItem(cv.certifications, i, { ...c, name: v }) })} />
              <Field label="Emissor" value={c.issuer} onChange={(v) => patch({ certifications: setItem(cv.certifications, i, { ...c, issuer: v }) })} />
              <Field label="Ano" value={c.year} onChange={(v) => patch({ certifications: setItem(cv.certifications, i, { ...c, year: v }) })} />
            </div>
          </RowShell>
        ))}
      </div>
    </div>
  );
}
