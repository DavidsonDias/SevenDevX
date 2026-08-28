/**
 * 🚀 fields.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/fields.tsx
 * @module SevenOS/UI
 * @layer Presentation
 * @status Active
 *
 * @description
 * Primitivas de formulário compartilhadas pelo CMS do Portfólio, alinhadas
 * ao design system do SevenOS (dark premium, alvos ≥44px no mobile).
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ============================================================================
// 🧱 SUBCOMPONENTS
// ============================================================================

const base =
  "w-full min-h-11 rounded-lg bg-background/40 border border-border px-3 py-2 text-sm outline-none transition-colors focus-visible:border-foreground/60 focus-visible:ring-1 focus-visible:ring-foreground/30";

/** Campo de texto (ou textarea) rotulado. */
export function Field({
  label, value, onChange, textarea, placeholder, type = "text", hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="block space-y-1.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {textarea ? (
        <textarea value={value} rows={4} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={base} />
      ) : (
        <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
      {hint && <span className="block text-[10px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** Select rotulado. */
export function SelectField({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label className="block space-y-1.5 min-w-0">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={base}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

/** Chip de alternância booleana. */
export function ToggleChip({
  label, checked, onChange,
}: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`min-h-9 rounded-full border px-3 text-[11px] uppercase tracking-wider transition-colors focus-visible:ring-1 focus-visible:ring-foreground/40 ${
        checked ? "border-foreground/60 bg-foreground/10 text-foreground" : "border-border text-muted-foreground hover:bg-foreground/5"
      }`}
    >
      {label}
    </button>
  );
}

/** Botão de exclusão com confirmação obrigatória. */
export function ConfirmDelete({
  onConfirm, title, description, trigger,
}: { onConfirm: () => void; title: string; description?: string; trigger?: ReactNode }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label={`Excluir ${title}`}
            className="h-9 w-9 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-destructive hover:bg-foreground/5"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {title}?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? "Esta ação não pode ser desfeita."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
