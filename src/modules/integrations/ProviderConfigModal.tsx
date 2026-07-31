/**
 * ProviderConfigModal.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/integrations/ProviderConfigModal.tsx
 * @module Integrations
 *
 * @description
 * Configuração de provider; segredos são gravados via Edge Function, nunca no cliente.
 *
 * @see src/modules/integrations/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * ⚙️ ProviderConfigModal — Configuração funcional real de um provider
 * - Verifica secrets via edge function `provider-secrets-check` (sem expor valores)
 * - Edita config JSONB (webhook_url, region, base_url, custom...)
 * - Ações: desconectar, resetar health, abrir guia
 */
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Key, CheckCircle2, AlertTriangle, ExternalLink, Loader2, Save, Trash2, RotateCcw, Copy, Eye, BookOpen, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { findCatalogProvider } from "./providerCatalog";
import LogoRenderer from "@/components/ui/logo/LogoRenderer";
import type { IntegrationProvider } from "@/hooks/useIntegrations";
import { useScrollLock } from "@/hooks/useScrollLock";

interface Props {
  provider: IntegrationProvider | null;
  open: boolean;
  onClose: () => void;
  onOpenGuide?: () => void;
}

type SecretStatus = Record<string, { set: boolean; preview?: string }>;

/**
 * Configuração de um provider externo.
 *
 * @security O valor bruto dos segredos nunca retorna ao frontend — apenas metadata mascarada.
 */
export default function ProviderConfigModal({ provider, open, onClose, onOpenGuide }: Props) {
  const qc = useQueryClient();
  useScrollLock(open);

  const catalog = provider ? findCatalogProvider(provider.id) : null;
  const accent = provider?.color || catalog?.color || "#ffffff";
  const secret_refs = useMemo(
    () => (provider?.secret_refs?.length ? provider.secret_refs : catalog?.secrets ?? []),
    [provider, catalog],
  );

  const tenantSettings = catalog?.tenantSettings ?? [];

  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<SecretStatus>({});
  const [config, setConfig] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [rawDraft, setRawDraft] = useState("");
  const [tenantValues, setTenantValues] = useState<Record<string, string>>({});
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !provider) return;
    setConfig(provider.config || {});
    setRawDraft(JSON.stringify(provider.config || {}, null, 2));
    void runCheck();
    void loadTenantSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, provider?.id]);

  const loadTenantSettings = async () => {
    if (!tenantSettings.length) return;
    const keys = tenantSettings.map(s => s.key);
    const { data } = await supabase.from("system_settings" as any).select("key, value").in("key", keys);
    const map: Record<string, string> = {};
    (data || []).forEach((r: any) => {
      const v = r.value;
      map[r.key] = typeof v === "string" ? v : v?.value ?? JSON.stringify(v ?? "");
    });
    setTenantValues(map);
  };

  const saveTenantSettings = async () => {
    if (!tenantSettings.length) return true;
    const rows = tenantSettings
      .filter(s => tenantValues[s.key] !== undefined)
      .map(s => ({ key: s.key, value: tenantValues[s.key] ?? "" }));
    if (!rows.length) return true;
    const { error } = await supabase.from("system_settings" as any).upsert(rows, { onConflict: "key" });
    if (error) { toast.error("Erro salvando settings", { description: error.message }); return false; }
    return true;
  };

  const runCheck = async () => {
    if (!secret_refs.length) {
      setStatus({});
      return;
    }
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("provider-secrets-check", {
        body: { secret_refs },
      });
      if (error) throw error;
      setStatus((data?.status ?? {}) as SecretStatus);
    } catch (e: any) {
      toast.error("Falha ao verificar secrets", { description: e?.message });
    } finally {
      setChecking(false);
    }
  };

  const updateConfigField = (k: string, v: any) =>
    setConfig((c) => ({ ...c, [k]: v }));

  const save = async () => {
    if (!provider) return;
    setSaving(true);
    try {
      let next = config;
      if (showRaw) {
        try {
          next = JSON.parse(rawDraft || "{}");
        } catch {
          toast.error("JSON inválido");
          setSaving(false);
          return;
        }
      }
      const ok = await saveTenantSettings();
      if (!ok) { setSaving(false); return; }
      const { error } = await supabase
        .from("integration_providers" as any)
        .update({ config: next, is_connected: tenantSettings.length ? tenantSettings.filter(s=>s.required).every(s=>!!tenantValues[s.key]) : provider.is_connected, updated_at: new Date().toISOString() })
        .eq("id", provider.id);
      if (error) throw error;
      toast.success("Configuração salva");
      qc.invalidateQueries({ queryKey: ["integration_providers"] });
      setConfig(next);
    } catch (e: any) {
      toast.error("Erro ao salvar", { description: e?.message });
    } finally {
      setSaving(false);
    }
  };

  const disconnect = async () => {
    if (!provider) return;
    if (!confirm(`Desconectar ${provider.name}? Isso desativa a integração e reseta o status.`)) return;
    const { error } = await supabase
      .from("integration_providers" as any)
      .update({
        is_active: false,
        is_connected: false,
        health_status: "unknown",
        last_error: null,
        last_test_at: null,
      })
      .eq("id", provider.id);
    if (error) return toast.error("Falha", { description: error.message });
    toast.success("Desconectado");
    qc.invalidateQueries({ queryKey: ["integration_providers"] });
    onClose();
  };

  const resetHealth = async () => {
    if (!provider) return;
    const { error } = await supabase
      .from("integration_providers" as any)
      .update({ health_status: "unknown", last_error: null })
      .eq("id", provider.id);
    if (error) return toast.error("Falha", { description: error.message });
    toast.success("Health resetado");
    qc.invalidateQueries({ queryKey: ["integration_providers"] });
  };

  const allSet = secret_refs.length > 0 && secret_refs.every((s) => status[s]?.set);

  if (!open || !provider) return null;

  // Inputs sugeridos por categoria
  const suggestedConfigFields: { key: string; label: string; placeholder: string; help?: string }[] = (() => {
    const cat = provider.category;
    if (cat === "comunicacao") {
      return [
        { key: "webhook_url", label: "Webhook URL (público)", placeholder: "https://api.suaapp.com/hooks/...", help: "URL que receberá callbacks." },
        { key: "default_channel", label: "Canal/Destino padrão", placeholder: "#general | +5511..." },
      ];
    }
    if (cat === "deploy" || cat === "cloud") {
      return [
        { key: "base_url", label: "Base URL / Endpoint", placeholder: "https://api.provider.com" },
        { key: "region", label: "Região", placeholder: "us-east-1" },
        { key: "project_id", label: "Project / Account ID", placeholder: "prj_xxx" },
      ];
    }
    if (cat === "automacao") {
      return [
        { key: "webhook_url", label: "Webhook URL", placeholder: "https://hook.eu1.make.com/..." },
        { key: "default_scenario", label: "Cenário/Workflow default", placeholder: "scenario-id" },
      ];
    }
    if (cat === "payments") {
      return [
        { key: "webhook_url", label: "Webhook URL", placeholder: "https://api.suaapp.com/stripe/webhook" },
        { key: "currency", label: "Moeda padrão", placeholder: "BRL" },
      ];
    }
    if (cat === "ia") {
      return [
        { key: "model", label: "Modelo padrão", placeholder: "gpt-5 | gemini-2.5-pro" },
        { key: "max_tokens", label: "Max tokens", placeholder: "4096" },
      ];
    }
    return [
      { key: "base_url", label: "Base URL (opcional)", placeholder: "https://api.provider.com" },
    ];
  })();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-xl flex items-end md:items-center justify-center p-0 md:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0, scale: 0.98 }}
          transition={{ type: "spring", stiffness: 200, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full md:max-w-2xl max-h-[92vh] md:max-h-[88vh] overflow-hidden rounded-t-2xl md:rounded-2xl border border-white/10 bg-[#0a0a0a] flex flex-col"
          style={{ boxShadow: `0 30px 80px ${accent}22, 0 0 60px ${accent}18` }}
        >
          {/* Header */}
          <div className="relative p-5 border-b border-white/10 flex items-start gap-4"
               style={{ background: `linear-gradient(135deg, ${accent}14, transparent 60%)` }}>
            <LogoRenderer slug={catalog?.slug} color={accent} name={provider.name} size={52} glow />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold truncate">{provider.name}</h3>
                <span className="text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded border border-white/10 text-white/60">
                  Configuração
                </span>
              </div>
              <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{catalog?.description ?? provider.description}</p>
              <div className="flex gap-2 mt-2">
                {catalog?.docs && (
                  <a href={catalog.docs} target="_blank" rel="noreferrer"
                     className="text-[11px] text-white/60 hover:text-white inline-flex items-center gap-1">
                    Docs oficiais <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {onOpenGuide && (
                  <button onClick={onOpenGuide}
                          className="text-[11px] text-white/60 hover:text-white inline-flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Guia
                  </button>
                )}
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-white/60 shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="overflow-y-auto px-5 py-5 space-y-6">
            {/* Secrets */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] uppercase tracking-[0.22em] text-white/60 inline-flex items-center gap-2">
                  <Key className="w-3.5 h-3.5" /> Credenciais (secrets)
                </h4>
                <button onClick={runCheck} disabled={checking}
                        className="text-[11px] uppercase tracking-wider px-2.5 py-1.5 rounded-md border border-white/10 hover:bg-white/5 disabled:opacity-50 inline-flex items-center gap-1.5">
                  {checking ? <Loader2 className="w-3 h-3 animate-spin" /> : <ShieldCheck className="w-3 h-3" />}
                  Verificar
                </button>
              </div>

              {secret_refs.length === 0 ? (
                <p className="text-xs text-white/40">Este provider não exige credenciais explícitas.</p>
              ) : (
                <ul className="space-y-2">
                  {secret_refs.map((s) => {
                    const st = status[s];
                    const ok = st?.set;
                    return (
                      <li key={s} className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border ${
                        ok ? "border-emerald-400/30 bg-emerald-400/5" : "border-amber-400/30 bg-amber-400/5"
                      }`}>
                        <div className="min-w-0 flex items-center gap-2.5">
                          {ok ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-amber-300 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className="text-xs font-mono truncate">{s}</p>
                            <p className="text-[10px] text-white/40 font-mono">
                              {ok ? st!.preview : "não configurado"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(s); toast.success("Nome copiado"); }}
                          className="p-1.5 rounded hover:bg-white/5 text-white/50"
                          title="Copiar nome"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {secret_refs.length > 0 && (
                <div className="mt-3 text-[11px] text-white/50 px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] leading-relaxed">
                  Por segurança, valores não são exibidos. Para adicionar/atualizar, abra{" "}
                  <span className="text-white">Configurações → Secrets</span> no Lovable Cloud.
                  Depois clique em <span className="text-white">Verificar</span> para confirmar.
                </div>
              )}
            </section>

            {/* 🔑 Tenant settings — gerenciados in-app (system_settings) */}
            {tenantSettings.length > 0 && (
              <section>
                <h4 className="text-[11px] uppercase tracking-[0.22em] text-white/60 mb-3 inline-flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-emerald-300" /> Credenciais in-app
                  <span className="text-[9px] text-emerald-300/80 border border-emerald-300/30 rounded px-1.5 py-0.5 uppercase tracking-wider">sem Lovable</span>
                </h4>
                <div className="space-y-2.5">
                  {tenantSettings.map((s) => {
                    const val = tenantValues[s.key] ?? "";
                    const reveal = revealedKey === s.key;
                    const isSecret = !!s.secret;
                    return (
                      <label key={s.key} className="block">
                        <span className="text-[10px] uppercase tracking-[0.18em] text-white/50 flex items-center gap-2">
                          {s.label} {s.required && <span className="text-amber-300">*</span>}
                          {val && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                        </span>
                        <div className="mt-1 relative">
                          <input
                            type={isSecret && !reveal ? "password" : "text"}
                            value={val}
                            onChange={(e) => setTenantValues((v) => ({ ...v, [s.key]: e.target.value }))}
                            placeholder={s.placeholder}
                            className="w-full bg-black/40 border border-white/10 rounded-lg pl-3 pr-9 py-2 text-sm focus:outline-none focus:border-emerald-300/50 font-mono"
                            autoComplete="off"
                            spellCheck={false}
                          />
                          {isSecret && (
                            <button
                              type="button"
                              onClick={() => setRevealedKey(reveal ? null : s.key)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/5 text-white/40"
                              title={reveal ? "Ocultar" : "Mostrar"}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        {s.help && <span className="text-[10px] text-white/40 mt-1 block">{s.help}</span>}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-3 text-[10px] text-white/40">
                  Salvos em <code className="text-emerald-300">system_settings</code> · usados diretamente pelas edge functions sem precisar de secrets externos.
                </p>
              </section>
            )}


            {/* Config fields */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[11px] uppercase tracking-[0.22em] text-white/60">Configuração</h4>
                <button onClick={() => setShowRaw((s) => !s)}
                        className="text-[11px] text-white/50 hover:text-white inline-flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {showRaw ? "Formulário" : "JSON cru"}
                </button>
              </div>

              {showRaw ? (
                <textarea
                  value={rawDraft}
                  onChange={(e) => setRawDraft(e.target.value)}
                  rows={10}
                  className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:border-white/30"
                  spellCheck={false}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedConfigFields.map((f) => (
                    <label key={f.key} className="block">
                      <span className="text-[10px] uppercase tracking-[0.18em] text-white/50">{f.label}</span>
                      <input
                        type="text"
                        value={config[f.key] ?? ""}
                        onChange={(e) => updateConfigField(f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="mt-1 w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30"
                      />
                      {f.help && <span className="text-[10px] text-white/35 mt-1 block">{f.help}</span>}
                    </label>
                  ))}
                </div>
              )}
            </section>

            {/* Diagnóstico */}
            <section>
              <h4 className="text-[11px] uppercase tracking-[0.22em] text-white/60 mb-3">Diagnóstico</h4>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <Stat label="Status" value={provider.health_status} />
                <Stat label="Ativo" value={provider.is_active ? "sim" : "não"} />
                <Stat label="Último teste" value={provider.last_test_at ? new Date(provider.last_test_at).toLocaleString("pt-BR") : "—"} />
                <Stat label="Requests" value={String(provider.request_count ?? 0)} />
              </div>
              {provider.last_error && (
                <p className="mt-3 text-[11px] text-red-300/80 border border-red-500/20 bg-red-500/5 rounded px-3 py-2 font-mono">
                  {provider.last_error}
                </p>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-5 py-4 flex flex-wrap items-center gap-2 bg-black/40">
            <button onClick={resetHealth}
                    className="text-[11px] uppercase tracking-wider px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 inline-flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" /> Resetar health
            </button>
            <button onClick={disconnect}
                    className="text-[11px] uppercase tracking-wider px-3 py-2 rounded-lg border border-red-500/30 text-red-300 hover:bg-red-500/10 inline-flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" /> Desconectar
            </button>
            <div className="flex-1" />
            <div className="text-[10px] text-white/40 mr-2 hidden sm:block">
              {allSet ? "✓ todos os secrets prontos" : secret_refs.length ? "⚠ secrets pendentes" : ""}
            </div>
            <button onClick={onClose}
                    className="text-[11px] uppercase tracking-wider px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">
              Fechar
            </button>
            <button onClick={save} disabled={saving}
                    className="text-[11px] uppercase tracking-wider px-3.5 py-2 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50 inline-flex items-center gap-1.5">
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Salvar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-3 py-2 rounded-lg border border-white/10 bg-white/[0.02]">
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/40">{label}</p>
      <p className="text-xs mt-0.5 truncate">{value}</p>
    </div>
  );
}
