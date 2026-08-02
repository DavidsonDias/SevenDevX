/**
 * 🚀 WebhookDebugger.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/modules/webhooks/WebhookDebugger.tsx
 * @module Webhooks
 * @layer Feature Module
 * @status Active
 *
 * @description
 * Reenvio e inspeção de entregas de webhook.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `WebhookDebugger`
 * ✅ Aciona Edge Functions: `webhook-dispatch`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * WebhookDebugger.tsx
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
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
 * 🧪 WebhookDebugger — Editor de payload + assinatura HMAC + envio real
 * Permite testar qualquer webhook com payload customizado, ver headers, signature e response.
 */
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Loader2, CheckCircle2, XCircle, Copy, Bug, Shield, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

interface Webhook {
  id: string;
  name: string;
  url: string | null;
  secret: string;
  events: string[];
}

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const PRESETS: Record<string, any> = {
  "test.ping": { hello: "SevenOS", at: new Date().toISOString() },
  "lead.created": { id: "lead_demo_123", name: "Acme Co", email: "contato@acme.com", source: "site" },
  "project.pipeline_changed": { project_id: "proj_demo", from: "lead", to: "proposta" },
  "deployment.ready": { project: "sevenos", env: "production", url: "https://sevenos.app", commit: "abc1234" },
};

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

async function hmacHex(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function WebhookDebugger({
  webhook, open, onClose, onSent,
}: { webhook: Webhook | null; open: boolean; onClose: () => void; onSent?: () => void }) {
  const events = useMemo(() => webhook?.events?.length ? webhook.events : Object.keys(PRESETS), [webhook]);
  const [event, setEvent] = useState<string>(events[0] || "test.ping");
  const [payload, setPayload] = useState<string>(JSON.stringify(PRESETS["test.ping"], null, 2));
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [sending, setSending] = useState(false);
  const [signature, setSignature] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => { setEvent(events[0] || "test.ping"); }, [events]);
  useEffect(() => {
    const preset = PRESETS[event] ?? { event, at: new Date().toISOString() };
    setPayload(JSON.stringify(preset, null, 2));
  }, [event]);

  // Live signature preview
  useEffect(() => {
    if (!webhook?.secret) return;
    try {
      const body = JSON.stringify({ event, payload: JSON.parse(payload), timestamp: new Date().toISOString() });
      setParseError(null);
      hmacHex(webhook.secret, body).then(setSignature);
    } catch (e: any) {
      setParseError(e?.message || "JSON inválido");
      setSignature("");
    }
  }, [payload, event, webhook?.secret]);

  if (!webhook) return null;

  const send = async () => {
    let parsed: any;
    try { parsed = JSON.parse(payload); }
    catch (e: any) { return toast.error("JSON inválido: " + e?.message); }

    setSending(true);
    setResult(null);
    const finalPayload = simulateFailure ? { ...parsed, __force_invalid_signature: true } : parsed;

    const { data, error } = await supabase.functions.invoke("webhook-dispatch", {
      body: { webhook_id: webhook.id, event, payload: finalPayload },
    });
    setSending(false);

    if (error) {
      setResult({ ok: false, error: error.message });
      toast.error(error.message);
    } else {
      setResult(data);
      const ok = (data as any)?.ok;
      ok ? toast.success(`Enviado · ${(data as any).status} · ${(data as any).duration_ms}ms`)
         : toast.warning(`Resposta ${(data as any)?.status || "?"}`);
    }
    onSent?.();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl bg-black/95 border-white/10 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Bug className="w-4 h-4 text-fuchsia-300" />
            <span className="font-mono">{webhook.name}</span>
            <span className="text-white/40">· debugger</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid lg:grid-cols-[1fr_320px] gap-4">
          {/* Editor */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-white/50 block mb-1.5">Evento</label>
              <select value={event} onChange={(e) => setEvent(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono">
                {events.map((ev) => <option key={ev} value={ev} className="bg-black">{ev}</option>)}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] uppercase tracking-wider text-white/50">Payload JSON</label>
                <button onClick={() => { navigator.clipboard.writeText(payload); toast.success("Copiado"); }}
                  className="text-[10px] text-white/50 hover:text-white inline-flex items-center gap-1">
                  <Copy className="w-3 h-3" /> copiar
                </button>
              </div>
              <textarea value={payload} onChange={(e) => setPayload(e.target.value)} rows={14}
                className={`w-full bg-black/60 border rounded-lg px-3 py-2 text-[12px] font-mono leading-relaxed focus:outline-none focus:border-white/30 ${parseError ? "border-red-500/50" : "border-white/10"}`}
                spellCheck={false} />
              {parseError && <div className="text-[11px] text-red-300/90 mt-1 font-mono">{parseError}</div>}
            </div>

            <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer select-none">
              <input type="checkbox" checked={simulateFailure} onChange={(e) => setSimulateFailure(e.target.checked)}
                className="accent-fuchsia-400" />
              Simular falha (marca payload com flag inválida)
            </label>

            <div className="flex gap-2 pt-1">
              <button onClick={send} disabled={sending || !!parseError}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 disabled:opacity-50">
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Disparar webhook
              </button>
            </div>
          </div>

          {/* Side: signature + endpoint */}
          <aside className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Endpoint
              </div>
              <div className="text-[11px] font-mono text-white/80 break-all">{webhook.url}</div>
            </div>

            <div className="rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/[0.04] p-3 space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-fuchsia-300/80 flex items-center gap-1.5">
                <Shield className="w-3 h-3" /> X-SevenOS-Signature (HMAC-SHA256)
              </div>
              <div className="text-[10px] font-mono text-white/80 break-all leading-relaxed">
                {signature || <span className="text-white/30">—</span>}
              </div>
              {signature && (
                <button onClick={() => { navigator.clipboard.writeText(signature); toast.success("Signature copiada"); }}
                  className="text-[10px] text-fuchsia-300/80 hover:text-fuchsia-200 inline-flex items-center gap-1">
                  <Copy className="w-3 h-3" /> copiar
                </button>
              )}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-white/50">Headers enviados</div>
              <pre className="text-[10px] font-mono text-white/70 whitespace-pre-wrap leading-relaxed">
{`Content-Type: application/json
X-SevenOS-Event: ${event}
X-SevenOS-Signature: ${signature ? signature.slice(0, 16) + "…" : "—"}`}
              </pre>
            </div>

            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`rounded-xl border p-3 space-y-1.5 ${result.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
                  <div className="flex items-center gap-2 text-xs">
                    {result.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <XCircle className="w-4 h-4 text-red-300" />}
                    <span className="font-semibold">{result.ok ? "Sucesso" : "Falha"}</span>
                    {result.status != null && <span className="ml-auto font-mono text-white/60">{result.status}</span>}
                  </div>
                  {result.duration_ms != null && <div className="text-[11px] text-white/60 tabular-nums">{result.duration_ms} ms</div>}
                  {result.error && <div className="text-[11px] text-red-300/90 font-mono break-all">{result.error}</div>}
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
