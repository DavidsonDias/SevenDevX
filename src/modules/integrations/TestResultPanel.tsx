/**
 * TestResultPanel.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/integrations/TestResultPanel.tsx
 * @module Integrations
 *
 * @description
 * Resultado normalizado dos testes de conexão.
 *
 * @see src/modules/integrations/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧪 TestResultPanel — Diagnóstico rico do último teste de conexão
 */
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import type { ConnectionTestResult } from "@/hooks/useIntegrations";

/**
 * Exibe o resultado normalizado do teste de conexão de um provider.
 */
export default function TestResultPanel({ result }: { result: ConnectionTestResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border ${result.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"} p-4 space-y-3`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {result.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-300" /> : <XCircle className="w-5 h-5 text-red-300" />}
          <h4 className="font-semibold">{result.ok ? "Conexão saudável" : "Falha na conexão"}</h4>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-white/60 tabular-nums">
          <Clock className="w-3 h-3" /> {result.latency_ms}ms
        </div>
      </div>

      <div className="space-y-1.5">
        {result.checks.map((c, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <span className={`mt-0.5 shrink-0 ${c.ok ? "text-emerald-300" : "text-red-300"}`}>
              {c.ok ? "✓" : "✗"}
            </span>
            <span className="text-white/90">{c.name}</span>
            {c.detail && <span className="text-white/50 truncate">— {c.detail}</span>}
            {c.latency_ms != null && <span className="text-white/40 tabular-nums ml-auto shrink-0">{c.latency_ms}ms</span>}
          </div>
        ))}
      </div>

      {result.rate_limit && (
        <div className="text-[11px] text-white/50 border-t border-white/10 pt-2">
          Rate limit: <span className="text-white/80 tabular-nums">{(result.rate_limit as any).remaining}/{(result.rate_limit as any).limit}</span>
        </div>
      )}

      {result.payload && Object.keys(result.payload).length > 0 && (
        <details className="text-[11px]">
          <summary className="cursor-pointer text-white/50 uppercase tracking-wider hover:text-white/80">Payload completo</summary>
          <pre className="mt-2 p-2.5 bg-black/40 border border-white/10 rounded text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all">
{JSON.stringify(result.payload, null, 2)}
          </pre>
        </details>
      )}

      {result.error && !result.ok && (
        <div className="text-[11px] text-red-300/90 border-t border-white/10 pt-2 font-mono whitespace-pre-wrap break-all">
          {result.error}
        </div>
      )}
    </motion.div>
  );
}
