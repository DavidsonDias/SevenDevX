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
import { useState, useEffect } from "react";
import {
  FileSignature, Upload, Loader2, ExternalLink, Save,
  FileText, Sparkles, Download, ChevronDown, ChevronUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAiGenerate } from "@/hooks/useEcosystem";
import { exportMarkdownToPdf } from "@/utils/pdfExport";

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

interface JuridicalForm {
  value: string;
  installments: string;
  deadline: string;
  pages: string;
  revisions: string;
  foro: string;
  sla_days: string;
  extras: string;
}

const DEFAULT_FORM: JuridicalForm = {
  value: "",
  installments: "50% no ato e 50% na entrega",
  deadline: "",
  pages: "",
  revisions: "2",
  foro: "São Paulo/SP",
  sla_days: "15",
  extras: "",
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [form, setForm] = useState<JuridicalForm>(DEFAULT_FORM);

  useEffect(() => {
    setStatus(data.contract_status || "pending");
    setText(data.contract_text || "");
    setUrl(data.contract_url || "");
  }, [id]);

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
      const { data: pub } = supabase.storage.from("attachments").getPublicUrl(path);
      setUrl(pub.publicUrl);
      await persist({ contract_url: pub.publicUrl, contract_status: status === "pending" ? "sent" : status });
      if (status === "pending") setStatus("sent");
      toast({ title: "Contrato enviado" });
    } catch (e: any) {
      toast({ title: "Falha no upload", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateAi = async () => {
    setGenerating(true);
    try {
      const fullContext = {
        ...(aiContext || {}),
        value: form.value || undefined,
        installments: form.installments || undefined,
        deadline: form.deadline || undefined,
        pages: form.pages || undefined,
        revisions: form.revisions || undefined,
        foro: form.foro || undefined,
        sla_days: form.sla_days || undefined,
        extras: form.extras || undefined,
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

        {/* Parâmetros jurídicos para alimentar a IA */}
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="w-full text-[11px] text-white/60 hover:text-white/90 flex items-center justify-center gap-1 py-1.5"
        >
          {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Parâmetros do contrato (IA)
        </button>

        {showAdvanced && (
          <div className="grid grid-cols-2 gap-2 p-3 bg-white/[0.03] border border-white/10 rounded-lg">
            <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Valor total
              <input value={form.value} onChange={(e) => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="Ex: R$ 4.500,00" className={inputCls + " mt-1"} />
            </label>
            <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Parcelamento
              <input value={form.installments} onChange={(e) => setForm(f => ({ ...f, installments: e.target.value }))}
                placeholder="Ex: 50/50" className={inputCls + " mt-1"} />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/50">Prazo
              <input value={form.deadline} onChange={(e) => setForm(f => ({ ...f, deadline: e.target.value }))}
                placeholder="30 dias" className={inputCls + " mt-1"} />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/50">Páginas/telas
              <input value={form.pages} onChange={(e) => setForm(f => ({ ...f, pages: e.target.value }))}
                placeholder="5" className={inputCls + " mt-1"} />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/50">Revisões
              <input value={form.revisions} onChange={(e) => setForm(f => ({ ...f, revisions: e.target.value }))}
                className={inputCls + " mt-1"} />
            </label>
            <label className="text-[10px] uppercase tracking-wider text-white/50">SLA (dias)
              <input value={form.sla_days} onChange={(e) => setForm(f => ({ ...f, sla_days: e.target.value }))}
                className={inputCls + " mt-1"} />
            </label>
            <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Foro
              <input value={form.foro} onChange={(e) => setForm(f => ({ ...f, foro: e.target.value }))}
                placeholder="São Paulo/SP" className={inputCls + " mt-1"} />
            </label>
            <label className="col-span-2 text-[10px] uppercase tracking-wider text-white/50">Observações extras
              <textarea value={form.extras} onChange={(e) => setForm(f => ({ ...f, extras: e.target.value }))}
                rows={2} placeholder="Ex: integrações específicas, exclusões…" className={inputCls + " mt-1"} />
            </label>
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
      </div>
    </div>
  );
}
