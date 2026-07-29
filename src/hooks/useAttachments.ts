/**
 * useAttachments.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/hooks/useAttachments.ts
 * @module Hooks
 *
 * @description
 * CRUD de anexos no bucket privado, sempre com URL assinada.
 *
 * @remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations.
 *
 * @see src/hooks/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📎 useAttachments — sistema unificado de anexos com URLs ASSINADAS (bucket privado).
 * Segurança enterprise: URLs expiram em 1h, geradas sob demanda via React Query.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { signMany, ATTACHMENTS_BUCKET, invalidateUrl, getFileUrl } from "@/lib/storage";

export type AttachmentType = "logo" | "file" | "idea" | "document" | "contract";

interface ListFilter {
  clientId?: string | null;
  projectId?: string | null;
  stageId?: string | null;
  type?: AttachmentType;
}

const SIGN_TTL = 60 * 60; // 1h

export const useAttachments = (filter: ListFilter) => {
  return useQuery({
    queryKey: ["attachments", filter],
    enabled: !!(filter.clientId || filter.projectId || filter.stageId),
    staleTime: 30_000,
    queryFn: async () => {
      let q = supabase.from("attachments").select("*").order("created_at", { ascending: false });
      if (filter.clientId) q = q.eq("client_id", filter.clientId);
      if (filter.projectId) q = q.eq("project_id", filter.projectId);
      if (filter.stageId) q = q.eq("stage_id", filter.stageId);
      if (filter.type) q = q.eq("type", filter.type);
      const { data, error } = await q;
      if (error) throw error;

      // Resolve signed URLs (private bucket) via central cache
      const paths = (data || [])
        .map((a: any) => a?.metadata?.storage_path)
        .filter(Boolean) as string[];
      const urlMap = paths.length ? await signMany(paths) : new Map<string, string>();
      return (data || []).map((a: any) => {
        const path = a?.metadata?.storage_path;
        return path && urlMap.has(path) ? { ...a, file_url: urlMap.get(path) } : a;
      });
    },
  });
};

export const useUploadAttachment = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (params: {
      file: File;
      type: AttachmentType;
      clientId?: string | null;
      projectId?: string | null;
      stageId?: string | null;
    }) => {
      const ext = params.file.name.split(".").pop() || "bin";
      const folder =
        params.stageId ? `stages/${params.stageId}` :
        params.projectId ? `projects/${params.projectId}` :
        params.clientId ? `clients/${params.clientId}` :
        "misc";
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("attachments")
        .upload(path, params.file, { upsert: false, contentType: params.file.type });
      if (upErr) throw upErr;

      // Signed URL for immediate display
      const { data: signed } = await supabase.storage
        .from("attachments")
        .createSignedUrl(path, SIGN_TTL);

      const { data, error } = await supabase
        .from("attachments")
        .insert({
          name: params.file.name,
          file_url: signed?.signedUrl || "",
          mime_type: params.file.type,
          size_bytes: params.file.size,
          type: params.type,
          client_id: params.clientId || null,
          project_id: params.projectId || null,
          stage_id: params.stageId || null,
          metadata: { storage_path: path },
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attachments"] });
      toast({ title: "Arquivo enviado" });
    },
    onError: (e: any) => toast({ title: "Falha no upload", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteAttachment = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (att: any) => {
      const path = att?.metadata?.storage_path;
      if (path) {
        await supabase.storage.from(ATTACHMENTS_BUCKET).remove([path]);
        invalidateUrl(path);
      }
      const { error } = await supabase.from("attachments").delete().eq("id", att.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attachments"] });
      toast({ title: "Arquivo removido" });
    },
  });
};
