/**
 * 🚀 EditorDrawer.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/EditorDrawer.tsx
 * @module SevenOS/UI
 * @layer Presentation
 * @status Active
 *
 * @description
 * Drawer padrão de edição do CMS do Portfólio: formulário completo fora da
 * listagem, com estados de salvamento explícitos e guarda de alterações
 * não salvas.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Nunca fecha silenciosamente descartando alterações pendentes
 * 🔒 Escape/overlay respeitam a guarda de alterações
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState, type ReactNode } from "react";
import { Loader2, Save, Check, AlertCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  dirty: boolean;
  state: SaveState;
  onSave: () => void;
  children: ReactNode;
  footerExtra?: ReactNode;
};

// ============================================================================
// 🧱 SUBCOMPONENTS
// ============================================================================

/** Selo textual do estado de salvamento. */
export function SaveBadge({ state }: { state: SaveState }) {
  const map: Record<SaveState, { label: string; icon: ReactNode }> = {
    idle: { label: "Salvo", icon: <Check className="w-3.5 h-3.5" /> },
    saved: { label: "Salvo", icon: <Check className="w-3.5 h-3.5" /> },
    dirty: { label: "Alterações não salvas", icon: <AlertCircle className="w-3.5 h-3.5" /> },
    saving: { label: "Salvando…", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
    error: { label: "Erro ao salvar", icon: <AlertCircle className="w-3.5 h-3.5" /> },
  };
  const s = map[state];
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider ${
        state === "error" ? "text-destructive" : state === "dirty" ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {s.icon} {s.label}
    </span>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** Sheet lateral (fullscreen no mobile) com rodapé fixo de ações. */
export default function EditorDrawer({
  open, onOpenChange, title, description, dirty, state, onSave, children, footerExtra,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  const requestClose = (next: boolean) => {
    if (!next && dirty) {
      setConfirming(true);
      return;
    }
    onOpenChange(next);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={requestClose}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-xl p-0 flex flex-col gap-0"
        >
          <SheetHeader className="px-4 sm:px-6 py-4 border-b border-border text-left">
            <SheetTitle className="text-base">{title}</SheetTitle>
            {description && <SheetDescription className="text-xs">{description}</SheetDescription>}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">{children}</div>

          <div className="border-t border-border px-4 sm:px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
            <SaveBadge state={state} />
            <div className="flex items-center gap-2">
              {footerExtra}
              <Button variant="ghost" className="min-h-11" onClick={() => requestClose(false)}>
                Fechar
              </Button>
              <Button className="min-h-11" onClick={onSave} disabled={state === "saving" || !dirty}>
                {state === "saving" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Salvar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você possui alterações não salvas.</AlertDialogTitle>
            <AlertDialogDescription>
              Descarte as alterações ou volte para continuar editando.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => {
                setConfirming(false);
                onOpenChange(false);
              }}
            >
              Descartar
            </Button>
            <AlertDialogAction
              onClick={() => {
                setConfirming(false);
                onSave();
              }}
            >
              Salvar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
