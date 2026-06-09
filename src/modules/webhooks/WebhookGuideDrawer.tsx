/**
 * 📘 WebhookGuideDrawer — Guia completo enterprise de criação e uso de Webhooks no SevenOS.
 * Frontend-only: passo-a-passo, exemplos CURL/JSON, HMAC, troubleshooting, FAQs, eventos disponíveis.
 */
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Webhook as WebhookIcon, Copy, Check, ShieldCheck, Zap, AlertTriangle,
  HelpCircle, BookOpen, Code2, Send, Lock, Activity, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useScrollLock } from "@/hooks/useScrollLock";

type Section =
  | "intro" | "criar" | "eventos" | "payload" | "hmac"
  | "exemplos" | "replay" | "troubleshooting" | "faq";

const SECTIONS: { id: Section; label: string; icon: any }[] = [
  { id: "intro",         label: "Visão geral",       icon: BookOpen },
  { id: "criar",         label: "Criar webhook",     icon: WebhookIcon },
  { id: "eventos",       label: "Eventos disponíveis", icon: Activity },
  { id: "payload",       label: "Estrutura do payload", icon: Code2 },
  { id: "hmac",          label: "Assinatura HMAC",   icon: ShieldCheck },
  { id: "exemplos",      label: "Exemplos CURL/Node", icon: Send },
  { id: "replay",        label: "Retry & Replay",    icon: Zap },
  { id: "troubleshooting", label: "Troubleshooting", icon: AlertTriangle },
  { id: "faq",           label: "FAQ",               icon: HelpCircle },
];

const EVENT_CATALOG: { event: string; description: string; sample: Record<string, any> }[] = [
  { event: "lead.created",          description: "Novo lead capturado pelo site ou painel.",       sample: { id: "uuid", name: "João", whatsapp: "+5511...", source: "site" } },
  { event: "lead.updated",          description: "Lead foi editado (status, owner, tags).",        sample: { id: "uuid", changed: ["status"], status: "qualified" } },
  { event: "project.created",       description: "Projeto criado no pipeline.",                    sample: { id: "uuid", name: "Site PsicoOne", client_id: "uuid" } },
  { event: "project.pipeline_changed", description: "Projeto mudou de etapa no kanban.",          sample: { id: "uuid", from: "discovery", to: "design" } },
  { event: "contract.signed",       description: "Contrato assinado pelo cliente.",                sample: { id: "uuid", project_id: "uuid", signed_at: "ISO" } },
  { event: "payment.received",      description: "Pagamento recebido / transação confirmada.",     sample: { id: "uuid", amount: 12000, currency: "BRL", method: "pix" } },
  { event: "deployment.failed",     description: "Deploy falhou em Vercel/Netlify.",               sample: { provider: "vercel", project: "site", commit: "abc1234" } },
  { event: "deployment.ready",      description: "Deploy concluído com sucesso.",                  sample: { provider: "vercel", url: "https://...", commit: "abc1234" } },
  { event: "message.received",      description: "Mensagem recebida no Contact Center / WhatsApp.", sample: { from: "+5511...", text: "Olá", channel: "whatsapp" } },
  { event: "user.invited",          description: "Novo usuário convidado para a workspace.",       sample: { email: "user@x.com", role: "user" } },
  { event: "user.login",            description: "Usuário fez login com sucesso.",                  sample: { user_id: "uuid", ip: "1.2.3.4", at: "ISO" } },
];

function CodeBlock({ children, lang = "bash" }: { children: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true); toast.success("Copiado");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="relative group rounded-lg border border-white/10 bg-black/60 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/10 bg-white/[0.02]">
        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-mono">{lang}</span>
        <button onClick={copy} className="text-white/40 hover:text-white transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11.5px] leading-relaxed text-white/85 font-mono">{children}</pre>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, kicker }: { icon: any; title: string; kicker?: string }) {
  return (
    <div className="mb-4">
      {kicker && <div className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-1">{kicker}</div>}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center">
          <Icon className="w-4 h-4 text-white/80" />
        </div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
    </div>
  );
}

export default function WebhookGuideDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  useScrollLock(open);
  const [active, setActive] = useState<Section>("intro");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-black/85 backdrop-blur-md flex items-stretch justify-end"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-4xl h-full bg-[#070707] border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <header className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.04] to-transparent">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center">
                  <WebhookIcon className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">Documentação enterprise</div>
                  <h2 className="text-lg font-bold truncate">Webhooks — Guia completo</h2>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
            </header>

            {/* Body — sidebar + content */}
            <div className="flex-1 grid sm:grid-cols-[220px_1fr] overflow-hidden">
              {/* Sidebar */}
              <nav className="border-r border-white/10 p-3 overflow-y-auto bg-white/[0.015] hidden sm:block">
                {SECTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(s.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors mb-0.5 ${
                      active === s.id ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <s.icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{s.label}</span>
                    {active === s.id && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </button>
                ))}
              </nav>
              {/* Mobile section selector */}
              <div className="sm:hidden border-b border-white/10 p-2 overflow-x-auto flex gap-1">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs ${active === s.id ? "bg-white text-black" : "bg-white/5 text-white/60"}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="overflow-y-auto p-6 space-y-6">
                {active === "intro" && (
                  <section>
                    <SectionTitle icon={BookOpen} title="O que são webhooks no SevenOS" kicker="01 · Visão geral" />
                    <p className="text-sm text-white/70 leading-relaxed">
                      Webhooks são <b>callbacks HTTP</b> que o SevenOS dispara para um endpoint seu sempre que um evento ocorre
                      (lead criado, pagamento recebido, projeto movido no kanban, etc). Você cadastra uma URL, escolhe os eventos,
                      e o sistema entrega o payload assinado com HMAC + retry automático.
                    </p>
                    <div className="grid sm:grid-cols-3 gap-3 mt-5">
                      {[
                        { icon: Zap, t: "Realtime", d: "Disparo em < 200ms após o evento." },
                        { icon: Lock, t: "HMAC SHA-256", d: "Cada entrega assinada — verifique no destino." },
                        { icon: Activity, t: "Retry + Replay", d: "Reentregas automáticas e manual via UI." },
                      ].map((c) => (
                        <div key={c.t} className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                          <c.icon className="w-4 h-4 text-white/70 mb-2" />
                          <div className="text-sm font-semibold">{c.t}</div>
                          <div className="text-xs text-white/50 mt-1">{c.d}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs text-amber-200 flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <b>Endpoint seu, não nosso.</b> Você precisa de uma URL pública (HTTPS recomendado) que aceite POST e responda 2xx em até 10s.
                        Para testar localmente use <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="underline">webhook.site</a> ou <a href="https://ngrok.com" target="_blank" rel="noopener noreferrer" className="underline">ngrok</a>.
                      </div>
                    </div>
                  </section>
                )}

                {active === "criar" && (
                  <section>
                    <SectionTitle icon={WebhookIcon} title="Criar seu primeiro webhook" kicker="02 · Passo a passo" />
                    <ol className="space-y-3">
                      {[
                        { t: "Tenha uma URL pronta", d: "Endpoint HTTPS que aceite POST com JSON. Para testes rápidos: webhook.site gera uma URL temporária com inspector embutido." },
                        { t: 'Clique em "Novo webhook"', d: "No topo desta página. Dê um nome descritivo (ex: \"Slack #vendas\", \"CRM HubSpot\")." },
                        { t: "Cole a URL do endpoint", d: "Cole a URL completa, incluindo path. Ex: https://hooks.slack.com/services/T00/B00/XXX" },
                        { t: "Selecione os eventos", d: "Marque apenas o que precisa — quanto mais eventos, mais tráfego no seu endpoint." },
                        { t: "Salve e copie o SECRET", d: "Após criar, clique no ícone de cópia para pegar o secret HMAC. Guarde — você vai usá-lo para validar a assinatura." },
                        { t: "Teste com o botão Enviar", d: "O sistema dispara um evento test.ping. Veja o status (2xx = sucesso) na lista de entregas." },
                      ].map((s, i) => (
                        <li key={i} className="flex gap-3 p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
                          <div className="w-7 h-7 rounded-full bg-white text-black text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                          <div>
                            <div className="text-sm font-semibold">{s.t}</div>
                            <div className="text-xs text-white/55 mt-1 leading-relaxed">{s.d}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </section>
                )}

                {active === "eventos" && (
                  <section>
                    <SectionTitle icon={Activity} title="Catálogo de eventos" kicker="03 · Tudo que você pode escutar" />
                    <div className="space-y-2">
                      {EVENT_CATALOG.map((e) => (
                        <details key={e.event} className="group rounded-xl border border-white/10 bg-white/[0.02] open:bg-white/[0.04]">
                          <summary className="flex items-center justify-between cursor-pointer p-3.5 list-none">
                            <div>
                              <code className="text-xs font-mono text-white">{e.event}</code>
                              <div className="text-xs text-white/50 mt-0.5">{e.description}</div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="p-3 pt-0">
                            <CodeBlock lang="json">{JSON.stringify({ event: e.event, data: e.sample }, null, 2)}</CodeBlock>
                          </div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}

                {active === "payload" && (
                  <section>
                    <SectionTitle icon={Code2} title="Estrutura do payload" kicker="04 · Schema universal" />
                    <p className="text-sm text-white/70 mb-3">Todo webhook recebe um POST JSON com a estrutura abaixo:</p>
                    <CodeBlock lang="json">{`{
  "event": "lead.created",
  "delivery_id": "wd_2026_abc123",
  "occurred_at": "2026-06-09T20:11:02.123Z",
  "workspace": "sevendevx",
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "whatsapp": "+5511999999999",
    "source": "site",
    "tags": ["website", "qualified"]
  }
}`}</CodeBlock>
                    <div className="mt-5 space-y-2 text-xs text-white/60">
                      <div><b className="text-white">Headers enviados:</b></div>
                      <CodeBlock lang="http">{`POST /seu-endpoint HTTP/1.1
Content-Type: application/json
User-Agent: SevenOS-Webhook/1.0
X-SevenOS-Event: lead.created
X-SevenOS-Delivery: wd_2026_abc123
X-SevenOS-Signature: sha256=5d41402abc4b2a76b9719d911017c592...
X-SevenOS-Timestamp: 1749499862`}</CodeBlock>
                    </div>
                  </section>
                )}

                {active === "hmac" && (
                  <section>
                    <SectionTitle icon={ShieldCheck} title="Validando a assinatura HMAC" kicker="05 · Segurança" />
                    <p className="text-sm text-white/70 mb-3">
                      Cada request inclui <code className="text-xs bg-white/5 px-1.5 py-0.5 rounded">X-SevenOS-Signature</code>.
                      Calcule HMAC-SHA256 do <b>body bruto</b> com seu secret e compare em <b>tempo constante</b>.
                    </p>
                    <div className="text-xs text-white/50 mb-2 font-semibold">Node.js / Deno</div>
                    <CodeBlock lang="ts">{`import { createHmac, timingSafeEqual } from "node:crypto";

export function verifySevenOS(req, rawBody: string, secret: string) {
  const header = req.headers["x-sevenos-signature"] as string; // "sha256=..."
  const provided = Buffer.from(header.replace("sha256=", ""), "hex");
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}`}</CodeBlock>

                    <div className="text-xs text-white/50 mt-5 mb-2 font-semibold">Python (FastAPI)</div>
                    <CodeBlock lang="python">{`import hmac, hashlib
def verify(raw_body: bytes, header: str, secret: str) -> bool:
    expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header.removeprefix("sha256="))`}</CodeBlock>

                    <div className="mt-5 p-3 rounded-lg border border-red-500/30 bg-red-500/5 text-xs text-red-200 flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div><b>Nunca</b> compare assinaturas com <code>===</code> simples — use <code>timingSafeEqual</code> para evitar timing attacks.</div>
                    </div>
                  </section>
                )}

                {active === "exemplos" && (
                  <section>
                    <SectionTitle icon={Send} title="Receivers prontos para colar" kicker="06 · Templates" />
                    <div className="text-xs text-white/50 mb-2 font-semibold">CURL — testar seu endpoint manualmente</div>
                    <CodeBlock lang="bash">{`curl -X POST https://seu-endpoint.com/webhooks/sevenos \\
  -H "Content-Type: application/json" \\
  -H "X-SevenOS-Event: test.ping" \\
  -d '{"event":"test.ping","data":{"hello":"world"}}'`}</CodeBlock>

                    <div className="text-xs text-white/50 mt-5 mb-2 font-semibold">Express (Node)</div>
                    <CodeBlock lang="ts">{`import express from "express";
const app = express();
app.post("/webhooks/sevenos",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const sig = req.header("X-SevenOS-Signature")!;
    if (!verifySevenOS(req, req.body.toString(), process.env.SEVENOS_SECRET!))
      return res.status(401).send("invalid signature");
    const evt = JSON.parse(req.body.toString());
    console.log("got event", evt.event, evt.data);
    res.sendStatus(200);
});`}</CodeBlock>

                    <div className="text-xs text-white/50 mt-5 mb-2 font-semibold">Encaminhar para Slack</div>
                    <CodeBlock lang="ts">{`if (evt.event === "payment.received") {
  await fetch(process.env.SLACK_WEBHOOK!, {
    method: "POST",
    body: JSON.stringify({ text: \`💰 R$ \${evt.data.amount/100} recebido\` }),
  });
}`}</CodeBlock>
                  </section>
                )}

                {active === "replay" && (
                  <section>
                    <SectionTitle icon={Zap} title="Retry automático e Replay manual" kicker="07 · Resiliência" />
                    <div className="space-y-3 text-sm text-white/70 leading-relaxed">
                      <p>Se o seu endpoint responder com <b>status fora de 2xx</b> ou <b>timeout (10s)</b>, o SevenOS reenfila:</p>
                      <ul className="space-y-1.5 text-xs text-white/60 pl-4 list-disc">
                        <li>Tentativa 1 — imediato</li>
                        <li>Tentativa 2 — após 30s</li>
                        <li>Tentativa 3 — após 2min</li>
                        <li>Tentativa 4 — após 10min</li>
                        <li>Tentativa 5 — após 1h (última)</li>
                      </ul>
                      <p>Após 5 falhas, a entrega vira <code className="bg-white/5 px-1.5 py-0.5 rounded">dead-letter</code> e aparece em vermelho na timeline.</p>
                      <div className="p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                        <b className="text-white">Replay manual:</b> clique em qualquer entrega na coluna direita → painel abre → botão <i>"Reenviar"</i> dispara nova entrega imediata sem aguardar a fila.
                      </div>
                    </div>
                  </section>
                )}

                {active === "troubleshooting" && (
                  <section>
                    <SectionTitle icon={AlertTriangle} title="Erros comuns e como resolver" kicker="08 · Troubleshooting" />
                    <div className="space-y-2">
                      {[
                        { p: "Status 401/403", s: "Sua aplicação está rejeitando — verifique a validação HMAC (secret correto, body bruto, header exato)." },
                        { p: "Status 404", s: "URL errada ou path mudou. Edite o webhook e atualize a URL." },
                        { p: "Timeout / 524", s: "Seu endpoint demora >10s. Responda 200 imediatamente e processe async (fila / job)." },
                        { p: "Status 0 / connection refused", s: "Endpoint offline ou bloqueado por firewall. Confirme HTTPS público acessível externamente." },
                        { p: "SSL handshake failed", s: "Certificado expirado/inválido. Renove o cert ou use Let's Encrypt." },
                        { p: "Eventos não chegam", s: "Verifique: webhook ativo (toggle verde), evento marcado, e que o evento foi realmente disparado no sistema." },
                        { p: "Duplicados", s: "Idempotência: use o header X-SevenOS-Delivery como chave única no seu lado." },
                      ].map((t) => (
                        <div key={t.p} className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                          <div className="text-sm font-semibold text-white">{t.p}</div>
                          <div className="text-xs text-white/55 mt-1">{t.s}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {active === "faq" && (
                  <section>
                    <SectionTitle icon={HelpCircle} title="Perguntas frequentes" kicker="09 · FAQ" />
                    <div className="space-y-2">
                      {[
                        { q: "Posso ter múltiplos webhooks para o mesmo evento?", a: "Sim. Cada um recebe a entrega independentemente, com retry separado." },
                        { q: "O secret muda?", a: "Não automaticamente. Você pode rotacionar deletando e recriando o webhook." },
                        { q: "Posso filtrar payload (só leads de SP, etc)?", a: "Ainda não no webhook puro — use uma Automação (when → if → then → call webhook) para filtros condicionais." },
                        { q: "Qual o limite de eventos por segundo?", a: "Sem cap por workspace por enquanto. Endpoints lentos viram fila eventual." },
                        { q: "Como ver o body exato que enviei?", a: "Clique numa entrega na timeline → abre o Payload Viewer com request + response completos." },
                        { q: "Posso usar HTTP (não HTTPS)?", a: "Tecnicamente sim, mas fortemente desencorajado — secrets viajam em texto claro na rede." },
                      ].map((f, i) => (
                        <details key={i} className="group rounded-xl border border-white/10 bg-white/[0.02]">
                          <summary className="flex items-center justify-between cursor-pointer p-3.5 list-none">
                            <span className="text-sm">{f.q}</span>
                            <ChevronRight className="w-4 h-4 text-white/30 group-open:rotate-90 transition-transform" />
                          </summary>
                          <div className="px-3.5 pb-3.5 text-xs text-white/60 leading-relaxed">{f.a}</div>
                        </details>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
