/**
 * 📘 SetupGuideDrawer — Tutorial passo a passo por provider
 */
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, CheckCircle2, BookOpen } from "lucide-react";
import { useState } from "react";

type Step = { title: string; body: string; link?: { label: string; url: string } };
type Guide = { intro: string; steps: Step[] };

const GUIDES: Record<string, Guide> = {
  github: {
    intro: "Conecte sua conta GitHub para monitorar repositórios, PRs e commits dos seus projetos.",
    steps: [
      { title: "Gere um Personal Access Token", body: "Vá em Settings → Developer settings → Personal access tokens → Fine-grained tokens. Use 90 dias de validade.", link: { label: "Abrir GitHub Tokens", url: "https://github.com/settings/tokens?type=beta" } },
      { title: "Selecione os scopes", body: "Marque: repo (read), metadata (read), pull_requests (read), contents (read)." },
      { title: "Cole o token no SevenOS", body: "Volte aqui, abra a integração GitHub e cole na aba Credenciais. O teste vai validar o owner/repo." },
    ],
  },
  vercel: {
    intro: "Acompanhe deploys em tempo real e receba alertas de erro.",
    steps: [
      { title: "Crie um Access Token", body: "No Vercel, vá em Account Settings → Tokens. Use scope full account ou team.", link: { label: "Vercel Tokens", url: "https://vercel.com/account/tokens" } },
      { title: "Identifique o Project ID", body: "Project Settings → General → Project ID. Cole no campo correspondente." },
      { title: "Habilite o webhook (opcional)", body: "Para deploys em tempo real, copie a URL do webhook do SevenOS em Webhooks e adicione no Vercel." },
    ],
  },
  figma: {
    intro: "Acesse arquivos de design e mantenha sincronia com o produto.",
    steps: [
      { title: "Gere um Personal Access Token", body: "Figma → Settings → Personal access tokens → Generate new token.", link: { label: "Figma Settings", url: "https://www.figma.com/settings" } },
      { title: "Cole o token + a URL do arquivo", body: "O SevenOS valida o token e lista os frames principais." },
    ],
  },
  whatsapp: {
    intro: "Receba leads do WhatsApp Business API direto no Contact Center.",
    steps: [
      { title: "Crie um app no Meta for Developers", body: "developers.facebook.com → My Apps → Create App → Business.", link: { label: "Meta for Developers", url: "https://developers.facebook.com" } },
      { title: "Adicione WhatsApp ao app", body: "No painel, adicione o produto WhatsApp e crie um Access Token permanente." },
      { title: "Configure o webhook", body: "Cole a URL do webhook SevenOS, e selecione o evento 'messages'. Use o verify token mostrado no painel." },
      { title: "Pegue o Phone Number ID", body: "WhatsApp → API Setup → copie o Phone Number ID." },
    ],
  },
  google: {
    intro: "Sincronize Google Calendar e Drive da sua equipe.",
    steps: [
      { title: "Crie um projeto no Google Cloud", body: "console.cloud.google.com → New Project.", link: { label: "Google Cloud Console", url: "https://console.cloud.google.com" } },
      { title: "Configure a tela de consentimento OAuth", body: "Tipo Externo, adicione domínios autorizados e scopes (calendar, drive.readonly)." },
      { title: "Crie credenciais OAuth 2.0", body: "Tipo: Web Application. Adicione o redirect URL do SevenOS mostrado nesta tela." },
    ],
  },
};

export default function SetupGuideDrawer({
  providerId, open, onClose,
}: { providerId: string | null; open: boolean; onClose: () => void }) {
  const [done, setDone] = useState<Set<number>>(new Set());
  const guide = providerId ? GUIDES[providerId] : null;

  return (
    <AnimatePresence>
      {open && guide && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[480px] bg-[#0a0a0a] border-l border-white/10 flex flex-col"
          >
            <header className="p-5 border-b border-white/10 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                  <BookOpen className="w-3.5 h-3.5" /> Guia de configuração
                </div>
                <h2 className="text-xl font-bold mt-1 capitalize">{providerId}</h2>
                <p className="text-sm text-white/60 mt-2">{guide.intro}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5"><X className="w-4 h-4" /></button>
            </header>
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
              {guide.steps.map((s, i) => {
                const isDone = done.has(i);
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
                    className={`p-4 rounded-xl border ${isDone ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/10 bg-white/[0.02]"}`}
                  >
                    <div className="flex items-start gap-3">
                      <button onClick={() => setDone((d) => { const n = new Set(d); n.has(i) ? n.delete(i) : n.add(i); return n; })}
                        className={`mt-0.5 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${isDone ? "border-emerald-400 bg-emerald-400/20" : "border-white/20 hover:border-white/50"}`}>
                        {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <span className="text-[11px] text-white/50">{i + 1}</span>}
                      </button>
                      <div className="min-w-0 flex-1">
                        <h3 className={`font-semibold ${isDone ? "line-through text-white/50" : ""}`}>{s.title}</h3>
                        <p className="text-sm text-white/60 mt-1">{s.body}</p>
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
            <footer className="p-4 border-t border-white/10 text-[11px] text-white/40 text-center">
              {done.size}/{guide.steps.length} passos concluídos
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
