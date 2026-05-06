/**
 * 📜 ContractCard — Gestão de Termo/Contrato (TC) para cliente OU projeto.
 * Recursos:
 * - Status (pendente/enviado/aprovado/rejeitado)
 * - Upload de PDF/DOC/imagem
 * - Texto livre (editor)
 * - Geração com IA (contrato jurídico nível software house)
 * - Export PDF (html2pdf)
 * - Campos de contexto jurídico (parcelas, foro, prazo) que alimentam a IA
 */
import { useState, useEffect, useMemo } from "react";
import {
  FileSignature, Upload, Loader2, ExternalLink, Save,
  FileText, Sparkles, Download, ChevronDown, ChevronUp,
  Calculator, AlertTriangle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAiGenerate } from "@/hooks/useEcosystem";
import { exportMarkdownToPdf } from "@/utils/pdfExport";
import ContractVersionHistory from "@/components/admin/ContractVersionHistory";
import PricingEngineModal from "@/components/admin/PricingEngineModal";
import {
  ContractConfig, DEFAULT_CONTRACT_CONFIG, recalcInstallments,
  maskBRL, parseBRL, maskDocument, validateContract,
} from "@/lib/contractBuilder";

type Entity = "clients" | "projects";

interface Props {
  entity: Entity;
  id: string;
  data: {
    contract_status?: string | null;
    contract_text?: string | null;
    contract_url?: string | null;
    contract_updated_at?: string | null;
  };
  /** Contexto opcional que será mesclado com os dados do formulário e enviado à IA. */
  aiContext?: {
    client?: { name?: string; company?: string; email?: string; segment?: string; document?: string };
    project?: { title?: string; description?: string; category?: string; budget?: string | number };
    services?: string[];
  };
  /** Usado para nomear o arquivo PDF (slug). */
  entityName?: string;
  onChange?: () => void;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Pendente", cls: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  sent:     { label: "Enviado",  cls: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  approved: { label: "Aprovado", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Rejeitado",cls: "bg-red-500/10 text-red-300 border-red-500/30" },
};



export default function ContractCard({ entity, id, data, aiContext, entityName, onChange }: Props) {
  const { toast } = useToast();
  const ai = useAiGenerate();
  const [status, setStatus] = useState(data.contract_status || "pending");
  const [text, setText] = useState(data.contract_text || "");
  const [url, setUrl] = useState(data.contract_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showBuilder, setShowBuilder] = useState(true);
  const [pricingOpen, setPricingOpen] = useState(false);

  // Auto-fill com dados do cliente/projeto
  const initialCfg = useMemo<ContractConfig>(() => {
    const c = aiContext?.client;
    const p = aiContext?.project;
    return {
      ...DEFAULT_CONTRACT_CONFIG,
      project_name: p?.title || entityName || "",
      project_scope: p?.description || "",
      client_name: c?.name || c?.company || "",
      client_document: c?.document || "",
      client_address: "",
      client_email: c?.email || "",
      price_total: typeof p?.budget === "number" ? p.budget : parseBRL(String(p?.budget || "")),
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [cfg, setCfg] = useState<ContractConfig>(() => recalcInstallments(initialCfg));

  useEffect(() => {
    setStatus(data.contract_status || "pending");
    setText(data.contract_text || "");
    setUrl(data.contract_url || "");
    setCfg(recalcInstallments(initialCfg));
  }, [id, initialCfg, data.contract_status, data.contract_text, data.contract_url]);

  const update = <K extends keyof ContractConfig>(k: K, v: ContractConfig[K]) =>
    setCfg((prev) => recalcInstallments({ ...prev, [k]: v }));

  const validationErrors = useMemo(() => validateContract(cfg), [cfg]);

  const persist = async (patch: any) => {
    setSaving(true);
    const payload = { ...patch, contract_updated_at: new Date().toISOString() };
    const { error } = await supabase.from(entity).update(payload).eq("id", id);
    setSaving(false);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return false;
    }
    onChange?.();
    return true;
  };

  const handleSave = async () => {
    const ok = await persist({ contract_status: status, contract_text: text, contract_url: url });
    if (ok) toast({ title: "Contrato salvo" });
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `contracts/${entity}/${id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("attachments").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data: signed } = await supabase.storage.from("attachments").createSignedUrl(path, 60 * 60 * 24 * 7);
      const finalUrl = signed?.signedUrl || path;
      setUrl(finalUrl);
      await persist({ contract_url: finalUrl, contract_status: status === "pending" ? "sent" : status });
      if (status === "pending") setStatus("sent");
      toast({ title: "Contrato enviado" });
    } catch (e: any) {
      toast({ title: "Falha no upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAi = async () => {
    if (validationErrors.length) {
      toast({
        title: "Preencha os campos obrigatórios",
        description: validationErrors.join(", "),
        variant: "destructive",
      });
      return;
    }
    setGenerating(true);
    try {
      // Envia config ESTRUTURADA + valores formatados (BRL) para a IA
      const fullContext = {
        ...(aiContext || {}),
        contract_config: {
          ...cfg,
          price_total_formatted: maskBRL(cfg.price_total),
          price_entry_formatted: maskBRL(cfg.price_entry),
          price_remaining_formatted: maskBRL(cfg.price_remaining),
        },
      };
      const content: string = await ai.mutateAsync({
        task: "contract_generate",
        context: fullContext,
      });
      if (content) {
        setText(content);
        await persist({ contract_text: content, contract_status: status === "pending" ? "sent" : status });
        if (status === "pending") setStatus("sent");
        toast({ title: "Contrato gerado pela IA" });
      }
    } catch (e: any) {
      toast({ title: "Erro ao gerar contrato", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleExportPdf = async () => {
    if (!text.trim()) {
      toast({ title: "Sem conteúdo", description: "Gere ou digite o contrato antes de exportar.", variant: "destructive" });
      return;
    }
    setExporting(true);
    try {
      await exportMarkdownToPdf({
        title: `Contrato — ${entityName || aiContext?.client?.name || aiContext?.project?.title || "SevenDevX"}`,
        markdown: text,
        filename: `contrato-${entityName || aiContext?.client?.name || "sevendevx"}`,
      });
    } catch (e: any) {
      toast({ title: "Erro ao gerar PDF", description: e.message, variant: "destructive" });
    } finally {
      setExporting(false);
    }
  };

  const meta = STATUS[status] || STATUS.pending;
  const inputCls = "w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs outline-none focus:border-white/30";

  return (
    <div className="border border-white/10 rounded-xl p-4 bg-white/[0.02]">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h4 className="font-bold flex items-center gap-2 text-sm">
          <FileSignature className="w-4 h-4" /> Termo / Contrato
        </h4>
        <span className={`text-[10px] px-2 py-1 rounded uppercase tracking-wider border ${meta.cls}`}>
          {meta.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded px-2 py-2 text-xs outline-none focus:border-white/30"
          >
            {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          <label className="cursor-pointer bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2 py-2 text-xs flex items-center justify-center gap-1.5">
            <input
              type="file"
              accept=".pdf,.doc,.docx,image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }}
            />
            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
            {url ? "Substituir" : "Upload"}
          </label>
        </div>

        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded hover:bg-blue-500/20 text-blue-300"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="truncate flex-1">Ver arquivo do contrato</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {/* 🧱 Contract Builder estruturado */}
        <button
          type="button"
          onClick={() => setShowBuilder((v) => !v)}
          className="w-full text-[11px] text-white/60 hover:text-white/90 flex items-center justify-center gap-1 py-1.5"
        >
          {showBuilder ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Parâmetros do contrato (Builder + IA)
        </button>

        {showBuilder && (
          <div className="space-y-3 p-3 bg-white/[0.03] border border-white/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-white/50">Identificação</span>
              <button
                type="button"
                onClick={() => setPricingOpen(true)}
                className="text-[10px] uppercase tracking-wider px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20 inline-flex items-center gap-1"
                title="Calcular orçamento sugerido"
              >
                <Calculator className="w-3 h-3" /> AI Pricing
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Projeto *
                <input value={cfg.project_name} onChange={(e) => update("project_name", e.target.value)}
                  className={inputCls + " mt-1"} placeholder="Ex: Landing Page Curso XPTO" />
              </label>
              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Escopo detalhado *
                <textarea value={cfg.project_scope} onChange={(e) => update("project_scope", e.target.value)}
                  rows={3} className={inputCls + " mt-1 font-sans"} placeholder="Descreva o que será entregue, tecnologias, integrações…" />
              </label>

              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50 pt-1">Cliente</label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Nome / Razão Social *
                <input value={cfg.client_name} onChange={(e) => update("client_name", e.target.value)} className={inputCls + " mt-1"} />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">CPF / CNPJ
                <input value={cfg.client_document} onChange={(e) => update("client_document", maskDocument(e.target.value))}
                  className={inputCls + " mt-1"} placeholder="000.000.000-00" />
              </label>
              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Endereço
                <input value={cfg.client_address} onChange={(e) => update("client_address", e.target.value)}
                  className={inputCls + " mt-1"} placeholder="Rua, nº, cidade/UF" />
              </label>
              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Email
                <input value={cfg.client_email} onChange={(e) => update("client_email", e.target.value)}
                  className={inputCls + " mt-1"} placeholder="cliente@email.com" />
              </label>

              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50 pt-1">Financeiro</label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Valor total *
                <input value={cfg.price_total ? maskBRL(cfg.price_total) : ""}
                  onChange={(e) => update("price_total", parseBRL(e.target.value))}
                  className={inputCls + " mt-1"} placeholder="R$ 0,00" />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Forma de pagamento
                <select value={cfg.payment_method} onChange={(e) => update("payment_method", e.target.value as any)}
                  className={inputCls + " mt-1"}>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="transferencia">Transferência</option>
                  <option value="cartao">Cartão</option>
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Entrada (50%)
                <input readOnly value={maskBRL(cfg.price_entry)}
                  className={inputCls + " mt-1 opacity-70"} />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Restante
                <input readOnly value={maskBRL(cfg.price_remaining)}
                  className={inputCls + " mt-1 opacity-70"} />
              </label>
              {cfg.payment_method === "pix" && (
                <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Chave PIX
                  <input value={cfg.pix_key} onChange={(e) => update("pix_key", e.target.value)}
                    className={inputCls + " mt-1"} />
                </label>
              )}

              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50 pt-1">Prazo & SLA</label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Prazo (dias) *
                <input type="number" min={1} value={cfg.deadline_days}
                  onChange={(e) => update("deadline_days", Number(e.target.value))}
                  className={inputCls + " mt-1"} />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Tipo de entrega
                <select value={cfg.delivery_type} onChange={(e) => update("delivery_type", e.target.value as any)}
                  className={inputCls + " mt-1"}>
                  <option value="remoto">Remoto</option>
                  <option value="presencial">Presencial</option>
                  <option value="hibrido">Híbrido</option>
                </select>
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Revisões inclusas
                <input type="number" min={0} value={cfg.revisions_limit}
                  onChange={(e) => update("revisions_limit", Number(e.target.value))}
                  className={inputCls + " mt-1"} />
              </label>
              <label className="text-[10px] uppercase tracking-wider text-white/50">Suporte (dias)
                <input type="number" min={0} value={cfg.support_days}
                  onChange={(e) => update("support_days", Number(e.target.value))}
                  className={inputCls + " mt-1"} />
              </label>
              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Foro
                <input value={cfg.foro} onChange={(e) => update("foro", e.target.value)}
                  className={inputCls + " mt-1"} />
              </label>
              <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Observações extras
                <textarea value={cfg.extras} onChange={(e) => update("extras", e.target.value)}
                  rows={2} className={inputCls + " mt-1"} placeholder="Integrações específicas, exclusões, premissas…" />
              </label>
            </div>

            {validationErrors.length > 0 && (
              <div className="flex items-start gap-2 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded p-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Faltando: {validationErrors.join(" · ")}</span>
              </div>
            )}
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Texto do contrato (gere com IA ou edite manualmente)…"
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-xs outline-none focus:border-white/30 font-mono"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full text-xs px-3 py-2 bg-white text-black rounded font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar contrato
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleGenerateAi}
            disabled={generating}
            className="text-xs px-3 py-2 bg-purple-500/15 border border-purple-500/30 text-purple-200 rounded font-bold inline-flex items-center justify-center gap-1.5 hover:bg-purple-500/25 disabled:opacity-50"
          >
            {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {text ? "Regerar com IA" : "Gerar com IA"}
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting || !text.trim()}
            className="text-xs px-3 py-2 bg-blue-500/15 border border-blue-500/30 text-blue-200 rounded font-bold inline-flex items-center justify-center gap-1.5 hover:bg-blue-500/25 disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            Baixar PDF
          </button>
        </div>

        {data.contract_updated_at && (
          <p className="text-[10px] text-white/40 text-center">
            Atualizado em {new Date(data.contract_updated_at).toLocaleString("pt-BR")}
          </p>
        )}

        <ContractVersionHistory entityType={entity === "clients" ? "client" : "project"} entityId={id} />
      </div>
    </div>
  );
}
