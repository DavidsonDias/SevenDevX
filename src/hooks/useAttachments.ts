/**
 * 📎 useAttachments — sistema unificado de anexos (logo, file, idea, document, contract)
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type AttachmentType = "logo" | "file" | "idea" | "document" | "contract";

interface ListFilter {
  clientId?: string | null;
  projectId?: string | null;
  stageId?: string | null;
  type?: AttachmentType;
}

export const useAttachments = (filter: ListFilter) => {
  return useQuery({
    queryKey: ["attachments", filter],
    enabled: !!(filter.clientId || filter.projectId || filter.stageId),
    queryFn: async () => {
      let q = supabase.from("attachments").select("*").order("created_at", { ascending: false });
      if (filter.clientId) q = q.eq("client_id", filter.clientId);
      if (filter.projectId) q = q.eq("project_id", filter.projectId);
      if (filter.stageId) q = q.eq("stage_id", filter.stageId);
      if (filter.type) q = q.eq("type", filter.type);
      const { data, error } = await q;
      if (error) throw error;
      return data;
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
      const { error: upErr } = await supabase.storage.from("attachments").upload(path, params.file, { upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("attachments").getPublicUrl(path);

      const { data, error } = await supabase
        .from("attachments")
        .insert({
          name: params.file.name,
          file_url: pub.publicUrl,
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
      if (path) await supabase.storage.from("attachments").remove([path]);
      const { error } = await supabase.from("attachments").delete().eq("id", att.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attachments"] });
      toast({ title: "Arquivo removido" });
    },
  });
};
