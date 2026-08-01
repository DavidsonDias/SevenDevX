/**
 * AttachmentManager.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/AttachmentManager.tsx
 * @module SevenOS/UI
 *
 * @description
 * Gerência de anexos no bucket privado; sempre por URL assinada.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 📂 AttachmentManager — gerenciador unificado de anexos.
 * Pode ser escopado a cliente / projeto / etapa, com tipos (logo, file, idea, document).
 * Drag & drop, preview de imagens, download e delete.
 */
import { useState, useRef } from "react";
import { Upload, Loader2, X, FileText, Image as ImageIcon, Lightbulb, FileBadge } from "lucide-react";
import { useAttachments, useUploadAttachment, useDeleteAttachment, AttachmentType } from "@/hooks/useAttachments";
import FilePreview from "./FilePreview";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const TYPE_META: Record<AttachmentType, { label: string; icon: any; cls: string }> = {
  logo:      { label: "Logo",       icon: ImageIcon,  cls: "bg-purple-500/10 text-purple-300 border-purple-500/30" },
  file:      { label: "Arquivo",    icon: FileText,   cls: "bg-white/10 text-white/70 border-white/20" },
  idea:      { label: "Ideia",      icon: Lightbulb,  cls: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  document:  { label: "Documento",  icon: FileBadge,  cls: "bg-blue-500/10 text-blue-300 border-blue-500/30" },
  contract:  { label: "Contrato",   icon: FileBadge,  cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
};

interface Props {
  title?: string;
  clientId?: string | null;
  projectId?: string | null;
  stageId?: string | null;
  defaultType?: AttachmentType;
  allowedTypes?: AttachmentType[];
  compact?: boolean;
}



// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

export default function AttachmentManager({
  title = "Anexos",
  clientId, projectId, stageId,
  defaultType = "file",
  allowedTypes = ["file", "logo", "idea", "document"],
  compact = false,
}: Props) {
  const { data: items = [] } = useAttachments({ clientId, projectId, stageId });
  const upload = useUploadAttachment();
  const remove = useDeleteAttachment();
  const [type, setType] = useState<AttachmentType>(defaultType);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await upload.mutateAsync({ file, type, clientId, projectId, stageId });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" /> {title}
          <span className="text-xs text-white/40 font-normal">({items.length})</span>
        </h4>
        <div className="flex items-center gap-1">
          {allowedTypes.map((t) => {
            const meta = TYPE_META[t];
            const Icon = meta.icon;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                title={meta.label}
                className={`text-[10px] px-2 py-1 rounded border inline-flex items-center gap-1 transition-colors ${
                  type === t ? meta.cls : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/5"
                }`}
              >
                <Icon className="w-3 h-3" /> {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <label
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors mb-3 ${
          drag ? "border-white/40 bg-white/5" : "border-white/15 hover:border-white/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {upload.isPending ? (
          <div className="flex items-center justify-center gap-2 text-sm text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" /> Enviando…
          </div>
        ) : (
          <div className="text-xs text-white/60">
            <Upload className="w-4 h-4 mx-auto mb-1.5" />
            Arraste ou clique · <strong>{TYPE_META[type].label}</strong>
          </div>
        )}
      </label>

      {items.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-3">Nenhum anexo ainda.</p>
      ) : (
        <div className={compact ? "space-y-1.5" : "grid grid-cols-2 gap-2"}>
          {items.map((att: any) => {
            const meta = TYPE_META[att.type as AttachmentType] || TYPE_META.file;
            const Icon = meta.icon;
            return compact ? (
              <div key={att.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg group border border-white/5">
                <Icon className="w-4 h-4 text-white/60 shrink-0" />
                <div className="flex-1 min-w-0">
                  <FilePreview attachment={att} variant="row" />
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded border ${meta.cls}`}>{meta.label}</span>
                <button onClick={() => remove.mutate(att)} className="opacity-0 group-hover:opacity-100 text-white/40 hover:text-red-400">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div key={att.id} className="border border-white/10 rounded-lg overflow-hidden bg-white/[0.02] group relative">
                <FilePreview attachment={att} />
                <div className="p-2 flex items-center gap-1.5">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${meta.cls}`}>{meta.label}</span>
                  <p className="text-[11px] text-white/70 truncate flex-1" title={att.name}>{att.name}</p>
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => remove.mutate(att)}
                    className="p-1 rounded bg-black/60 hover:bg-red-500/40"
                    title="Excluir"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
