/**
 * 🖼️ FilePreview — preview robusto de anexos do bucket privado.
 * - Resolve signed URL sob demanda (jamais usa file_url legado/público).
 * - Fallback elegante em erro (broken / not found).
 * - Suporta imagem, PDF (embed), e ícone genérico.
 */
import { useEffect, useState } from "react";
import { Loader2, FileText, AlertCircle, Download } from "lucide-react";
import { getFileUrl, resolveStoragePath } from "@/lib/storage";

interface Props {
  attachment: any;
  variant?: "card" | "row";
  className?: string;
  onClickOverride?: () => void;
}

const isImage = (m?: string) => !!m && m.startsWith("image/");
const isPdf = (m?: string, name?: string) =>
  m === "application/pdf" || (!!name && name.toLowerCase().endsWith(".pdf"));

export default function FilePreview({ attachment, variant = "card", className = "" }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let alive = true;
    setState("loading");
    const path = resolveStoragePath(attachment);
    if (!path) {
      setState("error");
      return;
    }
    getFileUrl(path)
      .then((u) => {
        if (!alive) return;
        if (!u) setState("error");
        else { setUrl(u); setState("ready"); }
      })
      .catch(() => alive && setState("error"));
    return () => { alive = false; };
  }, [attachment?.id, attachment?.file_url, attachment?.metadata?.storage_path]);

  const mime = attachment?.mime_type;
  const name = attachment?.name;
  const img = isImage(mime);
  const pdf = isPdf(mime, name);

  if (variant === "row") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {state === "loading" && <Loader2 className="w-4 h-4 animate-spin text-white/40" />}
        {state === "error" && <span title="Arquivo indisponível"><AlertCircle className="w-4 h-4 text-red-400" /></span>}
        {state === "ready" && url && (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline truncate">
            {name}
          </a>
        )}
      </div>
    );
  }

  return (
    <div className={`aspect-video bg-black/40 relative overflow-hidden ${className}`}>
      {state === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/[0.02]">
          <Loader2 className="w-5 h-5 animate-spin text-white/40" />
        </div>
      )}
      {state === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1 p-2 bg-red-500/5 border border-red-500/20">
          <AlertCircle className="w-6 h-6 text-red-400/80" />
          <span className="text-[10px] text-red-300/80 leading-tight">
            Arquivo indisponível
          </span>
          <span className="text-[9px] text-white/40 truncate max-w-full px-1">{name}</span>
        </div>
      )}
      {state === "ready" && url && (
        <>
          {img ? (
            <a href={url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
              <img
                src={url}
                alt={name}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={() => setState("error")}
              />
            </a>
          ) : pdf ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex flex-col items-center justify-center bg-blue-500/5 hover:bg-blue-500/10 transition-colors"
            >
              <FileText className="w-8 h-8 text-blue-300/80 mb-1" />
              <span className="text-[10px] text-blue-200/70">Abrir PDF</span>
            </a>
          ) : (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-full flex flex-col items-center justify-center bg-white/[0.03] hover:bg-white/5 transition-colors"
            >
              <Download className="w-8 h-8 text-white/40 mb-1" />
              <span className="text-[10px] text-white/50">Baixar</span>
            </a>
          )}
        </>
      )}
    </div>
  );
}
