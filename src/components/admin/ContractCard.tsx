/**
 * 📜 ContractCard — gestão de Termo/Contrato (TC) para cliente OU projeto.
 * Suporta upload de PDF + texto livre + status (pendente/enviado/aprovado/rejeitado).
 */
import { useState, useEffect } from "react";
import { FileSignature, Upload, Loader2, ExternalLink, Save, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  onChange?: () => void;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  pending:  { label: "Pendente", cls: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  sent:     { label: "Enviado",  cls: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  approved: { label: "Aprovado", cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Rejeitado",cls: "bg-red-500/10 text-red-300 border-red-500/30" },
};

export default function ContractCard({ entity, id, data, onChange }: Props) {
  const { toast } = useToast();
  const [status, setStatus] = useState(data.contract_status || "pending");
  const [text, setText] = useState(data.contract_text || "");
  const [url, setUrl] = useState(data.contract_url || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const meta = STATUS[status] || STATUS.pending;

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

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Texto do termo, observações ou cláusulas (opcional)…"
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-2 text-xs outline-none focus:border-white/30"
        />

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full text-xs px-3 py-2 bg-white text-black rounded font-bold inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />} Salvar contrato
        </button>

        {data.contract_updated_at && (
          <p className="text-[10px] text-white/40 text-center">
            Atualizado em {new Date(data.contract_updated_at).toLocaleString("pt-BR")}
          </p>
        )}
      </div>
    </div>
  );
}
