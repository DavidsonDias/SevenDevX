/**
 * 🚀 WebhookPayloadViewer.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/modules/webhooks/WebhookPayloadViewer.tsx
 * @module Webhooks
 * @layer Feature Module
 * @status Active
 *
 * @description
 * Visualizador de payloads de webhook.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `WebhookPayloadViewer`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 * ✅ Aciona Edge Functions: `webhook-dispatch`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * WebhookPayloadViewer
 *    ├── Dialog
 *    ├── DialogContent
 *    ├── DialogHeader
 *    └── DialogTitle
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * WebhookPayloadViewer.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lucide — iconografia do design system
 * ✅ Supabase Client — dados, auth e RPC
 * ✅ Sonner — feedback via toast
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/modules/webhooks/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 🪟 WebhookPayloadViewer — JSON inspector com syntax highlight, copy & replay
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, RotateCw, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Delivery {
  id: string;
  webhook_id: string;
  event: string;
  payload: any;
  response_status: number | null;
  response_body: string | null;
  duration_ms: number | null;
  delivered_at: string;
  error: string | null;
}

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const highlight = (json: string) =>
  json
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/("(?:\\.|[^"\\])*")(\s*:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
      (m, str, colon, kw, num) => {
        if (str) return colon
          ? `<span class="text-sky-300">${str}</span>${colon}`
          : `<span class="text-emerald-300">${str}</span>`;
        if (kw) return `<span class="text-amber-300">${kw}</span>`;
        if (num) return `<span class="text-fuchsia-300">${num}</span>`;
        return m;
      });

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function WebhookPayloadViewer({
  delivery, open, onClose, onReplayed,
}: { delivery: Delivery | null; open: boolean; onClose: () => void; onReplayed?: () => void }) {
  const [replaying, setReplaying] = useState(false);
  if (!delivery) return null;
  const ok = (delivery.response_status ?? 0) >= 200 && (delivery.response_status ?? 0) < 300;
  const json = JSON.stringify(delivery.payload ?? {}, null, 2);

  const replay = async () => {
    setReplaying(true);
    const { data, error } = await supabase.functions.invoke("webhook-dispatch", {
      body: { webhook_id: delivery.webhook_id, event: delivery.event, payload: delivery.payload },
    });
    setReplaying(false);
    if (error) toast.error(error.message);
    else if ((data as any)?.ok) toast.success(`Replay OK · ${(data as any).status} · ${(data as any).duration_ms}ms`);
    else toast.warning(`Replay ${(data as any)?.status || "?"}`);
    onReplayed?.();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl bg-black/95 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 font-mono text-sm">
            {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
            <span>{delivery.event}</span>
            <span className={`px-2 py-0.5 rounded text-[11px] ${ok ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
              {delivery.response_status ?? "ERR"}
            </span>
            <span className="text-white/40 text-[11px]">{delivery.duration_ms}ms</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-2 mb-3">
          <button onClick={replay} disabled={replaying}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-medium hover:bg-white/90 disabled:opacity-50">
            <RotateCw className={`w-3.5 h-3.5 ${replaying ? "animate-spin" : ""}`} /> Replay delivery
          </button>
          <button onClick={() => { navigator.clipboard.writeText(json); toast.success("Payload copiado"); }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 text-xs hover:bg-white/5">
            <Copy className="w-3.5 h-3.5" /> Copiar payload
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Payload</div>
            <pre className="text-[11px] font-mono bg-black/60 border border-white/10 rounded-lg p-3 overflow-x-auto leading-relaxed"
              dangerouslySetInnerHTML={{ __html: highlight(json) }} />
          </div>
          {delivery.response_body && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Response</div>
              <pre className="text-[11px] font-mono bg-black/60 border border-white/10 rounded-lg p-3 overflow-x-auto max-h-48 leading-relaxed text-white/70">
                {delivery.response_body}
              </pre>
            </div>
          )}
          {delivery.error && (
            <div className="p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-300 font-mono">
              {delivery.error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
