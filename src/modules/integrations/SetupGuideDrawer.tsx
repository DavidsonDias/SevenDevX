/**
 * 📘 SetupGuideDrawer — Tutorial premium passo a passo por provider
 * - Checklist persistente em localStorage
 * - Code blocks com copy
 * - Troubleshooting / FAQs / CURL examples
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle2, BookOpen, Copy, Check, AlertCircle, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Step = {
  title: string;
  body: string;
  link?: { label: string; url: string };
  code?: { lang: string; value: string };
};
type FAQ = { q: string; a: string };
type Trouble = { problem: string; solution: string };

type Guide = {
  intro: string;
  secretsExpected?: string[];
  steps: Step[];
  curl?: { label: string; value: string }[];
  troubleshooting?: Trouble[];
  faq?: FAQ[];
};

const GUIDES: Record<string, Guide> = {
  github: {
    intro: "Conecte sua conta GitHub para monitorar repositórios, PRs, commits e validar o token automaticamente.",
    secretsExpected: ["GITHUB_TOKEN"],
    steps: [
      { title: "Gere um Personal Access Token (fine-grained)", body: "GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens. Validade recomendada: 90 dias.", link: { label: "Abrir GitHub Tokens", url: "https://github.com/settings/tokens?type=beta" } },
      { title: "Selecione os scopes mínimos", body: "Repository access: All repositories (ou específicos). Permissions: Contents (read), Metadata (read), Pull requests (read), Commit statuses (read)." },
      { title: "Salve o secret GITHUB_TOKEN", body: "Cole o token em Cloud → Secrets. O teste no SevenOS valida automaticamente: /user, scopes, rate limit e listagem de repositórios." },
      { title: "Execute o teste no SevenOS", body: "Volte ao modal da integração GitHub e clique em Testar conexão. Você verá 5 checks com latência e payload completo." },
    ],
    curl: [
      { label: "Validar token", value: `curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user` },
      { label: "Listar repos", value: `curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user/repos?per_page=3` },
    ],
    troubleshooting: [
      { problem: "401 Bad credentials", solution: "Token expirado ou inválido. Gere um novo em github.com/settings/tokens." },
      { problem: "403 Resource not accessible by integration", solution: "Faltam scopes. Edite o token e adicione a permissão necessária." },
      { problem: "Rate limit baixo", solution: "Tokens autenticados têm 5000 req/h. Se estiver baixo, há outro processo consumindo." },
    ],
    faq: [
      { q: "Posso usar OAuth App em vez de PAT?", a: "Sim, mas o teste atual usa Bearer token. OAuth App requer fluxo de autorização adicional." },
      { q: "O SevenOS armazena meu token?", a: "O token fica apenas em Secrets do backend, jamais exposto ao frontend." },
    ],
  },

  vercel: {
    intro: "Acompanhe deploys, projects e teams da Vercel em tempo real.",
    secretsExpected: ["VERCEL_TOKEN"],
    steps: [
      { title: "Crie um Access Token", body: "Vercel → Account Settings → Tokens → Create. Scope: Full Account (ou específico do time).", link: { label: "Vercel Tokens", url: "https://vercel.com/account/tokens" } },
      { title: "Salve VERCEL_TOKEN nos Secrets", body: "Cloud → Secrets → adicione VERCEL_TOKEN." },
      { title: "Teste a conexão", body: "O SevenOS valida /v2/user, /v2/teams e /v9/projects retornando latência e payload." },
      { title: "Webhook (opcional)", body: "Para deploys realtime, configure um webhook apontando para sua função webhook-dispatch." },
    ],
    curl: [
      { label: "Validar token", value: `curl -H "Authorization: Bearer $VERCEL_TOKEN" https://api.vercel.com/v2/user` },
      { label: "Listar projetos", value: `curl -H "Authorization: Bearer $VERCEL_TOKEN" "https://api.vercel.com/v9/projects?limit=5"` },
    ],
    troubleshooting: [
      { problem: "403 forbidden", solution: "Token sem permissão no team. Recrie com scope correto." },
      { problem: "404 em projeto específico", solution: "Use o ID correto (não o nome) ou prefixe com o teamId via query param." },
    ],
    faq: [
      { q: "Quanto tempo o token dura?", a: "Sem expiração por padrão, mas pode ser revogado a qualquer momento." },
    ],
  },

  figma: {
    intro: "Valide acesso a arquivos Figma e use no projeto.",
    secretsExpected: ["FIGMA_TOKEN"],
    steps: [
      { title: "Gere um Personal Access Token", body: "Figma → Settings → Personal access tokens → Generate new token. Escolha escopo File content (read).", link: { label: "Figma Settings", url: "https://www.figma.com/settings" } },
      { title: "Salve FIGMA_TOKEN", body: "Cloud → Secrets → FIGMA_TOKEN." },
      { title: "Teste a conexão", body: "O SevenOS valida /v1/me e listagem de teams." },
    ],
    curl: [
      { label: "Validar token", value: `curl -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/me` },
    ],
    troubleshooting: [
      { problem: "403 Invalid token", solution: "Token revogado ou sem escopo. Gere novo em figma.com/settings." },
    ],
  },

  whatsapp: {
    intro: "Conecte o WhatsApp Business Cloud API (Meta) para receber leads e enviar mensagens.",
    secretsExpected: ["WHATSAPP_TOKEN", "WHATSAPP_PHONE_ID", "WHATSAPP_BUSINESS_ACCOUNT_ID"],
    steps: [
      { title: "Crie um app Business no Meta", body: "developers.facebook.com → My Apps → Create App → Business → adicione o produto WhatsApp.", link: { label: "Meta for Developers", url: "https://developers.facebook.com" } },
      { title: "Gere um Access Token permanente", body: "Use System User do Business Manager → Generate Token → escopo whatsapp_business_messaging + whatsapp_business_management." },
      { title: "Salve secrets no SevenOS", body: "WHATSAPP_TOKEN, WHATSAPP_PHONE_ID e (opcional) WHATSAPP_BUSINESS_ACCOUNT_ID em Cloud → Secrets." },
      { title: "Configure webhook (opcional)", body: "Subscribe ao evento messages apontando para sua função webhook-dispatch. Use o Verify Token retornado pelo SevenOS." },
      { title: "Teste a conexão", body: "O SevenOS valida o phone number e (se WABA_ID informado) as subscriptions." },
    ],
    curl: [
      { label: "Validar phone number", value: `curl -H "Authorization: Bearer $WHATSAPP_TOKEN" "https://graph.facebook.com/v20.0/$WHATSAPP_PHONE_ID?fields=verified_name,display_phone_number"` },
      { label: "Enviar mensagem template", value: `curl -X POST -H "Authorization: Bearer $WHATSAPP_TOKEN" -H "Content-Type: application/json" \\\n  -d '{"messaging_product":"whatsapp","to":"+5531999999999","type":"template","template":{"name":"hello_world","language":{"code":"en_US"}}}' \\\n  "https://graph.facebook.com/v20.0/$WHATSAPP_PHONE_ID/messages"` },
    ],
    troubleshooting: [
      { problem: "190 OAuthException", solution: "Token de usuário expirou. Gere token permanente via System User." },
      { problem: "Número não verificado", solution: "Conclua a verificação por SMS no Business Manager antes de enviar mensagens." },
      { problem: "Webhook não recebe nada", solution: "Verifique se subscribed_apps inclui seu app e se o Verify Token bate." },
    ],
    faq: [
      { q: "Posso usar número pessoal?", a: "Não. Precisa ser um número não registrado no WhatsApp pessoal, dedicado à Cloud API." },
    ],
  },

  google: {
    intro: "Conecte Google Workspace (Calendar, Drive) via OAuth 2.0.",
    secretsExpected: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
    steps: [
      { title: "Crie um projeto no Google Cloud", body: "console.cloud.google.com → New Project.", link: { label: "Google Cloud Console", url: "https://console.cloud.google.com" } },
      { title: "Configure OAuth consent screen", body: "Tipo External, adicione scopes (calendar, drive.readonly) e domínios autorizados." },
      { title: "Crie credenciais OAuth 2.0", body: "Tipo Web Application. Adicione o redirect URL exibido pelo SevenOS." },
      { title: "Salve GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET", body: "Em Cloud → Secrets. O fluxo OAuth completo será habilitado em fase futura." },
    ],
    troubleshooting: [
      { problem: "redirect_uri_mismatch", solution: "O URL configurado no Google Cloud precisa bater 100% (sem barra final divergente) com o usado no app." },
    ],
  },
};

const STORAGE_KEY = (id: string) => `setup-guide-done:${id}`;

function CopyBlock({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative group">
      {label && <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</div>}
      <pre className="text-[10px] font-mono p-2.5 bg-black/60 border border-white/10 rounded overflow-x-auto whitespace-pre-wrap break-all">
{value}
      </pre>
      <button
        onClick={() => {
          navigator.clipboard.writeText(value);
          setCopied(true);
          toast.success("Copiado");
          setTimeout(() => setCopied(false), 1500);
        }}
        className="absolute top-1.5 right-1.5 p-1 rounded bg-white/5 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copiar"
      >
        {copied ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3 text-white/60" />}
      </button>
    </div>
  );
}

export default function SetupGuideDrawer({
  providerId, open, onClose,
}: { providerId: string | null; open: boolean; onClose: () => void }) {
  const guide = providerId ? GUIDES[providerId] : null;
  const [done, setDone] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!providerId) return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY(providerId));
      if (raw) setDone(new Set(JSON.parse(raw)));
      else setDone(new Set());
    } catch { setDone(new Set()); }
  }, [providerId]);

  const toggleDone = (i: number) => {
    setDone((d) => {
      const n = new Set(d);
      n.has(i) ? n.delete(i) : n.add(i);
      if (providerId) {
        try { localStorage.setItem(STORAGE_KEY(providerId), JSON.stringify([...n])); } catch {}
      }
      return n;
    });
  };

  return (
    <AnimatePresence>
      {open && guide && providerId && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-[60] w-full sm:w-[520px] bg-[#0a0a0a] border-l border-white/10 flex flex-col"
          >
            <header className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                  <BookOpen className="w-3.5 h-3.5" /> Guia de configuração
                </div>
                <h2 className="text-xl font-bold mt-1 capitalize">{providerId}</h2>
                <p className="text-sm text-white/60 mt-2">{guide.intro}</p>
                {guide.secretsExpected && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {guide.secretsExpected.map((s) => (
                      <span key={s} className="text-[10px] font-mono px-2 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 shrink-0"><X className="w-4 h-4" /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Steps */}
              <section>
                <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Passo a passo</h3>
                <div className="space-y-3">
                  {guide.steps.map((s, i) => {
                    const isDone = done.has(i);
                    return (
                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
                        className={`p-4 rounded-xl border ${isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]"}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleDone(i)}
                            className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isDone ? "border-emerald-400 bg-emerald-400/20" : "border-white/20 hover:border-white/50"}`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <span className="text-[11px] text-white/50">{i + 1}</span>}
                          </button>
                          <div className="min-w-0 flex-1">
                            <h4 className={`font-semibold ${isDone ? "line-through text-white/50" : ""}`}>{s.title}</h4>
                            <p className="text-sm text-white/60 mt-1">{s.body}</p>
                            {s.code && <div className="mt-2"><CopyBlock value={s.code.value} label={s.code.lang} /></div>}
                            {s.link && (
                              <a href={s.link.url} target="_blank" rel="noreferrer"
                                className="inline-flex items-center gap-1.5 mt-2 text-xs text-emerald-300 hover:text-emerald-200">
                                <ExternalLink className="w-3 h-3" /> {s.link.label}
                              </a>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>

              {/* CURL */}
              {guide.curl && guide.curl.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">Exemplos CURL</h3>
                  <div className="space-y-3">
                    {guide.curl.map((c, i) => <CopyBlock key={i} value={c.value} label={c.label} />)}
                  </div>
                </section>
              )}

              {/* Troubleshooting */}
              {guide.troubleshooting && guide.troubleshooting.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-3 h-3" /> Troubleshooting
                  </h3>
                  <div className="space-y-2">
                    {guide.troubleshooting.map((t, i) => (
                      <div key={i} className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                        <div className="text-xs font-semibold text-amber-200">{t.problem}</div>
                        <div className="text-xs text-white/70 mt-1">{t.solution}</div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* FAQ */}
              {guide.faq && guide.faq.length > 0 && (
                <section>
                  <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3 flex items-center gap-2">
                    <HelpCircle className="w-3 h-3" /> FAQ
                  </h3>
                  <div className="space-y-2">
                    {guide.faq.map((f, i) => (
                      <details key={i} className="p-3 rounded-lg border border-white/10 bg-white/[0.02]">
                        <summary className="cursor-pointer text-xs font-semibold text-white/90">{f.q}</summary>
                        <p className="text-xs text-white/60 mt-2">{f.a}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <footer className="p-4 border-t border-white/10 text-[11px] text-white/40 text-center tabular-nums">
              {done.size}/{guide.steps.length} passos concluídos
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
