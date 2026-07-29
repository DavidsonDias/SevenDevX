/**
 * IconUploader.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/IconUploader.tsx
 * @module SevenOS/UI
 *
 * @description
 * Upload de ícones customizados para registros do CMS.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🖼️ IconUploader — drag&drop SVG/PNG uploader for tech & tag icons
 * Stores files in the public `tech-icons` Supabase Storage bucket.
 */
import { useCallback, useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface IconUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  /** Subfolder inside the bucket (e.g. "tech" or "tag"). */
  folder?: string;
  /** Used to build a stable filename. */
  slug?: string;
  size?: number;
  /** Storage bucket (must be public). Defaults to tech-icons. */
  bucket?: string;
  /** Max file size in bytes. Default 1MB. */
  maxBytes?: number;
  /** Landscape aspect (cover style) instead of square. */
  aspect?: "square" | "landscape";
}

const DEFAULT_MAX_BYTES = 1024 * 1024; // 1MB
const ALLOWED = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg", "image/webp"];

export const IconUploader = ({
  value,
  onChange,
  folder = "tech",
  slug = "icon",
  size = 96,
  bucket = "tech-icons",
  maxBytes = DEFAULT_MAX_BYTES,
  aspect = "square",
}: IconUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();

  const handleFile = useCallback(
    async (file: File) => {
      if (!ALLOWED.includes(file.type)) {
        toast({
          title: "Formato inválido",
          description: "Use SVG, PNG, JPG, JPEG ou WebP.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > maxBytes) {
        toast({
          title: "Arquivo muito grande",
          description: `O arquivo deve ter no máximo ${Math.round(maxBytes / 1024 / 1024)}MB.`,
          variant: "destructive",
        });
        return;
      }

      setUploading(true);
      try {
        const ext = file.name.split(".").pop()?.toLowerCase() || "svg";
        const safeSlug = slug.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "icon";
        const path = `${folder}/${safeSlug}-${Date.now()}.${ext}`;

        const { error: upErr } = await supabase.storage
          .from(bucket)
          .upload(path, file, {
            cacheControl: "31536000",
            upsert: false,
            contentType: file.type,
          });
        if (upErr) throw upErr;

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        onChange(data.publicUrl);
        toast({ title: "Upload concluído" });
      } catch (e: any) {
        toast({
          title: "Erro no upload",
          description: e.message || "Falha ao enviar ícone.",
          variant: "destructive",
        });
      } finally {
        setUploading(false);
      }
    },
    [folder, slug, onChange, toast, bucket, maxBytes]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex items-center justify-center rounded-lg border-2 border-dashed cursor-pointer transition-colors overflow-hidden ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        style={
          aspect === "landscape"
            ? { width: "100%", aspectRatio: "16/9", minHeight: 140 }
            : { height: size + 24 }
        }
      >
        {uploading ? (
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        ) : value ? (
          aspect === "landscape" ? (
            <>
              <img src={value} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-background/90 hover:bg-destructive hover:text-destructive-foreground transition-colors z-10"
                aria-label="Remover imagem"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <img src={value} alt="Preview" className="object-contain rounded" style={{ width: size, height: size }} />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onChange(null); }}
                className="absolute top-1 right-1 p-1 rounded-full bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                aria-label="Remover ícone"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground text-xs px-3 text-center">
            <Upload className="w-5 h-5" />
            <span>Clique ou arraste SVG/PNG/JPG/WEBP (≤{Math.round(maxBytes / 1024 / 1024)}MB)</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
};

export default IconUploader;
