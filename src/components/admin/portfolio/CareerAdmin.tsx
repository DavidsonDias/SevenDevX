/**
 * 🚀 CareerAdmin.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/CareerAdmin.tsx
 * @module SevenOS/Admin
 * @layer Presentation / Admin
 * @status Active
 *
 * @description
 * Área "Carreira" do CMS do Portfólio: perfil profissional, experiências,
 * formação, certificações e competências — todas em listas resumidas com
 * ordenação (drag + posição) e edição em drawer.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 A ordem canônica é a ordem do array em `portfolio_settings.cv`
 * 🔒 Nada é salvo sem ação explícita — o estado sujo é sempre visível
 * 🔒 Exclusão sempre exige confirmação
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState } from "react";
import { Plus, Pencil, Briefcase, GraduationCap, Award, User } from "lucide-react";
import type { CvData, CvExperience, CvEducation, CvCertification } from "@/components/admin/CvEditor";
import { Button } from "@/components/ui/button";
import SortableList from "./SortableList";
import EditorDrawer, { type SaveState } from "./EditorDrawer";
import { Field, ToggleChip, ConfirmDelete } from "./fields";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Collection = "experiences" | "education" | "certifications";

type Props = {
  value: CvData;
  onChange: (next: CvData) => void;
  onSave: () => void;
  state: SaveState;
  dirty: boolean;
};

const SUBAREAS = [
  { key: "profile", label: "Perfil", icon: User },
  { key: "experiences", label: "Experiência", icon: Briefcase },
  { key: "education", label: "Formação", icon: GraduationCap },
  { key: "certifications", label: "Certificações", icon: Award },
] as const;

type SubArea = (typeof SUBAREAS)[number]["key"];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** CMS de carreira (currículo) do Portfólio Davidson. */
export default function CareerAdmin({ value, onChange, onSave, state, dirty }: Props) {
  const [area, setArea] = useState<SubArea>("profile");
  const [editing, setEditing] = useState<{ col: Collection; index: number } | null>(null);

  const cv: CvData = value ?? {};
  const experiences = cv.experiences ?? [];
  const education = cv.education ?? [];
  const certifications = cv.certifications ?? [];

  const list = (col: Collection) =>
    col === "experiences" ? experiences : col === "education" ? education : certifications;

  const setList = (col: Collection, next: unknown[]) => onChange({ ...cv, [col]: next });

  /** Reordena pela chave estável `col-index` gerada na listagem. */
  const reorder = (col: Collection) => (ids: string[]) => {
    const current = list(col) as unknown[];
    setList(col, ids.map((id) => current[Number(id.split("::")[1])]));
  };

  const patchItem = (col: Collection, index: number, patch: Record<string, unknown>) => {
    const current = list(col) as Record<string, unknown>[];
    setList(col, current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const removeItem = (col: Collection, index: number) => {
    setList(col, (list(col) as unknown[]).filter((_, i) => i !== index));
    setEditing(null);
  };

  const addItem = (col: Collection) => {
    const blank =
      col === "experiences"
        ? { role: "", company: "", period: "", location: "", description: "", bullets: [], technologies: [] }
        : col === "education"
          ? { course: "", school: "", period: "" }
          : { name: "", issuer: "", year: "" };
    setList(col, [...(list(col) as unknown[]), blank]);
    setEditing({ col, index: (list(col) as unknown[]).length });
  };

  const rowShell = (
    title: string, subtitle: string, meta: string,
    col: Collection, index: number, controls: React.ReactNode,
  ) => (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-3 flex items-center gap-3">
      {controls}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{title || "(sem título)"}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
        {meta && <p className="text-[10px] text-muted-foreground truncate">{meta}</p>}
      </div>
      <Button variant="outline" size="sm" className="min-h-11 shrink-0" onClick={() => setEditing({ col, index })}>
        <Pencil className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Editar</span>
      </Button>
      <ConfirmDelete title={title || "item"} onConfirm={() => removeItem(col, index)} />
    </div>
  );

  const collectionHeader = (label: string, col: Collection, count: number) => (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wider">{label}</h2>
        <p className="text-[11px] text-muted-foreground">{count} registros · arraste ou digite a posição</p>
      </div>
      <Button size="sm" className="min-h-11" onClick={() => addItem(col)}>
        <Plus className="w-4 h-4" /> Adicionar
      </Button>
    </div>
  );

  const current = editing ? (list(editing.col)[editing.index] as Record<string, unknown> | undefined) : undefined;

  return (
    <div className="space-y-5">
      {/* ── Subnavegação ──────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {SUBAREAS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setArea(key)}
            aria-pressed={area === key}
            className={`shrink-0 inline-flex items-center gap-1.5 min-h-10 rounded-full border px-3 text-[11px] uppercase tracking-wider ${
              area === key ? "border-foreground bg-foreground/10" : "border-border text-muted-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {area === "profile" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider">Perfil profissional</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Headline" value={cv.headline ?? ""} onChange={(v) => onChange({ ...cv, headline: v })} />
            <Field label="Localização" value={cv.location ?? ""} onChange={(v) => onChange({ ...cv, location: v })} />
            <Field label="E-mail" value={cv.email ?? ""} onChange={(v) => onChange({ ...cv, email: v })} />
            <Field label="Telefone" value={cv.phone ?? ""} onChange={(v) => onChange({ ...cv, phone: v })} />
            <Field label="LinkedIn" value={cv.linkedin ?? ""} onChange={(v) => onChange({ ...cv, linkedin: v })} />
            <Field label="Website" value={cv.website ?? ""} onChange={(v) => onChange({ ...cv, website: v })} />
          </div>
          <Field label="Resumo profissional" textarea value={cv.summary ?? ""} onChange={(v) => onChange({ ...cv, summary: v })} />
          <Field
            label="Competências (vírgula)"
            textarea
            value={(cv.skills ?? []).join(", ")}
            onChange={(v) => onChange({ ...cv, skills: v.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
          <Field
            label="Idiomas (vírgula)"
            value={(cv.languages ?? []).join(", ")}
            onChange={(v) => onChange({ ...cv, languages: v.split(",").map((s) => s.trim()).filter(Boolean) })}
          />
          <Field
            label="Destaques (um por linha)"
            textarea
            value={(cv.highlights ?? []).join("\n")}
            onChange={(v) => onChange({ ...cv, highlights: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
          />
          <a
            href="/curriculo"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs border border-border rounded px-3 min-h-11 hover:bg-foreground/5 transition-colors"
            style={{ alignItems: "center", display: "inline-flex" }}
          >
            Visualizar currículo
          </a>
        </div>
      )}

      {area === "experiences" && (
        <div className="space-y-3">
          {collectionHeader("Experiência", "experiences", experiences.length)}
          <SortableList
            items={experiences.map((e, i) => ({ ...e, __id: `experiences::${i}` }))}
            getId={(e) => (e as CvExperience & { __id: string }).__id}
            onReorder={reorder("experiences")}
            renderItem={(e, i, controls) =>
              rowShell(
                (e as CvExperience).role,
                (e as CvExperience).company,
                [(e as CvExperience).period, (e as CvExperience).location].filter(Boolean).join(" · "),
                "experiences", i, controls,
              )
            }
          />
        </div>
      )}

      {area === "education" && (
        <div className="space-y-3">
          {collectionHeader("Formação", "education", education.length)}
          <SortableList
            items={education.map((e, i) => ({ ...e, __id: `education::${i}` }))}
            getId={(e) => (e as CvEducation & { __id: string }).__id}
            onReorder={reorder("education")}
            renderItem={(e, i, controls) =>
              rowShell((e as CvEducation).course, (e as CvEducation).school, (e as CvEducation).period, "education", i, controls)
            }
          />
        </div>
      )}

      {area === "certifications" && (
        <div className="space-y-3">
          {collectionHeader("Certificações", "certifications", certifications.length)}
          <SortableList
            items={certifications.map((c, i) => ({ ...c, __id: `certifications::${i}` }))}
            getId={(c) => (c as CvCertification & { __id: string }).__id}
            onReorder={reorder("certifications")}
            renderItem={(c, i, controls) =>
              rowShell((c as CvCertification).name, (c as CvCertification).issuer, (c as CvCertification).year, "certifications", i, controls)
            }
          />
        </div>
      )}

      {/* ── Drawer de edição ──────────────────────────────────── */}
      <EditorDrawer
        open={!!editing && !!current}
        onOpenChange={(o) => { if (!o) setEditing(null); }}
        title={
          editing?.col === "experiences" ? "Experiência"
            : editing?.col === "education" ? "Formação"
              : "Certificação"
        }
        description="As alterações entram na API após salvar."
        dirty={dirty}
        state={state}
        onSave={onSave}
      >
        {editing && current && editing.col === "experiences" && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Cargo" value={String(current.role ?? "")} onChange={(v) => patchItem("experiences", editing.index, { role: v })} />
              <Field label="Empresa" value={String(current.company ?? "")} onChange={(v) => patchItem("experiences", editing.index, { company: v })} />
              <Field label="Período (exibido)" value={String(current.period ?? "")} onChange={(v) => patchItem("experiences", editing.index, { period: v })} />
              <Field label="Local" value={String(current.location ?? "")} onChange={(v) => patchItem("experiences", editing.index, { location: v })} />
              <Field label="Início (AAAA-MM)" value={String(current.start ?? "")} onChange={(v) => patchItem("experiences", editing.index, { start: v })} />
              <Field label="Fim (AAAA-MM)" value={String(current.end ?? "")} onChange={(v) => patchItem("experiences", editing.index, { end: v })} />
            </div>
            <ToggleChip
              label="Emprego atual"
              checked={!!current.current}
              onChange={(v) => patchItem("experiences", editing.index, { current: v })}
            />
            <Field label="Descrição" textarea value={String(current.description ?? "")} onChange={(v) => patchItem("experiences", editing.index, { description: v })} />
            <Field
              label="Bullets (um por linha)"
              textarea
              value={((current.bullets as string[]) ?? []).join("\n")}
              onChange={(v) => patchItem("experiences", editing.index, { bullets: v.split("\n").map((s) => s.trim()).filter(Boolean) })}
            />
            <Field
              label="Tecnologias (vírgula)"
              value={((current.technologies as string[]) ?? []).join(", ")}
              onChange={(v) => patchItem("experiences", editing.index, { technologies: v.split(",").map((s) => s.trim()).filter(Boolean) })}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Categoria" value={String(current.category ?? "")} onChange={(v) => patchItem("experiences", editing.index, { category: v })} />
              <Field label="Logo da empresa (URL)" value={String(current.logo ?? "")} onChange={(v) => patchItem("experiences", editing.index, { logo: v })} />
            </div>
          </>
        )}

        {editing && current && editing.col === "education" && (
          <>
            <Field label="Curso" value={String(current.course ?? "")} onChange={(v) => patchItem("education", editing.index, { course: v })} />
            <Field label="Instituição" value={String(current.school ?? "")} onChange={(v) => patchItem("education", editing.index, { school: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Período (exibido)" value={String(current.period ?? "")} onChange={(v) => patchItem("education", editing.index, { period: v })} />
              <Field label="Logo (URL)" value={String(current.logo ?? "")} onChange={(v) => patchItem("education", editing.index, { logo: v })} />
            </div>
            <Field label="Descrição" textarea value={String(current.description ?? "")} onChange={(v) => patchItem("education", editing.index, { description: v })} />
          </>
        )}

        {editing && current && editing.col === "certifications" && (
          <>
            <Field label="Nome" value={String(current.name ?? "")} onChange={(v) => patchItem("certifications", editing.index, { name: v })} />
            <Field label="Emissor" value={String(current.issuer ?? "")} onChange={(v) => patchItem("certifications", editing.index, { issuer: v })} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ano" value={String(current.year ?? "")} onChange={(v) => patchItem("certifications", editing.index, { year: v })} />
              <Field label="ID da credencial" value={String(current.credential_id ?? "")} onChange={(v) => patchItem("certifications", editing.index, { credential_id: v })} />
            </div>
            <Field label="URL de verificação" value={String(current.url ?? "")} onChange={(v) => patchItem("certifications", editing.index, { url: v })} />
          </>
        )}
      </EditorDrawer>
    </div>
  );
}
