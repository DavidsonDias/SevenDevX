/**
 * 🧠 useEcosystem — hooks centralizados do Sistema Operacional SevenDevX
 * Clients, Interactions, Process Stages, Services CMS, FAQ, AI Engine.
 */
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/* ───────────────────────── CLIENTS ───────────────────────── */
export const useClients = () => {
  const qc = useQueryClient();
  useEffect(() => {
    const ch = supabase
      .channel("clients-rt")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () =>
        qc.invalidateQueries({ queryKey: ["clients"] })
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [qc]);

  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
};

export const useClient = (id?: string) =>
  useQuery({
    queryKey: ["clients", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

export const useUpsertClient = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase.from("clients").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("clients").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente salvo" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteClient = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clients"] });
      toast({ title: "Cliente excluído" });
    },
  });
};

/* ─────────────── CLIENT INTERACTIONS (timeline) ─────────────── */
export const useClientInteractions = (clientId?: string) =>
  useQuery({
    queryKey: ["client_interactions", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_interactions")
        .select("*")
        .eq("client_id", clientId!)
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

export const useAddInteraction = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from("client_interactions").insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => {
      qc.invalidateQueries({ queryKey: ["client_interactions", data.client_id] });
      toast({ title: "Interação registrada" });
    },
  });
};

/* ───────────────────────── PROCESS TEMPLATE ───────────────────────── */
export const useDefaultProcessTemplate = () =>
  useQuery({
    queryKey: ["process_template", "default"],
    queryFn: async () => {
      const { data: tpl, error } = await supabase
        .from("process_templates")
        .select("*")
        .eq("is_default", true)
        .maybeSingle();
      if (error) throw error;
      if (!tpl) return null;
      const { data: stages, error: sErr } = await supabase
        .from("process_template_stages")
        .select("*")
        .eq("template_id", tpl.id)
        .order("display_order");
      if (sErr) throw sErr;
      return { ...tpl, stages: stages || [] };
    },
  });

export const useUpdateTemplateStage = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const { data, error } = await supabase
        .from("process_template_stages")
        .update(rest)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process_template"] });
      toast({ title: "Etapa atualizada" });
    },
  });
};

/* ───────────────────────── PROJECT STAGES ───────────────────────── */
export const useProjectStages = (projectId?: string) =>
  useQuery({
    queryKey: ["project_stages", projectId],
    enabled: !!projectId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("project_stages")
        .select("*, checklist:stage_checklist_items(*)")
        .eq("project_id", projectId!)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

export const useInstantiateProjectStages = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ projectId, templateId }: { projectId: string; templateId: string }) => {
      const { data: stages, error } = await supabase
        .from("process_template_stages")
        .select("*")
        .eq("template_id", templateId)
        .order("display_order");
      if (error) throw error;

      const rows = (stages || []).map((s) => ({
        project_id: projectId,
        template_stage_id: s.id,
        slug: s.slug,
        name: s.name,
        display_order: s.display_order,
      }));

      const { data: inserted, error: iErr } = await supabase
        .from("project_stages")
        .insert(rows)
        .select();
      if (iErr) throw iErr;

      // Create default checklist items
      const checklistRows: any[] = [];
      inserted?.forEach((ps, idx) => {
        const tpl = stages?.[idx];
        const items = (tpl?.default_checklist as any[]) || [];
        items.forEach((it: any, i: number) => {
          checklistRows.push({
            stage_id: ps.id,
            title: it.title || it,
            display_order: i,
          });
        });
      });
      if (checklistRows.length > 0) {
        await supabase.from("stage_checklist_items").insert(checklistRows);
      }
      return inserted;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["project_stages", vars.projectId] });
      toast({ title: "Etapas instanciadas no projeto" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useUpdateProjectStage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: any) => {
      const updates: any = { ...rest };
      if (rest.status === "in_progress" && !rest.started_at) updates.started_at = new Date().toISOString();
      if (rest.status === "completed" && !rest.completed_at) updates.completed_at = new Date().toISOString();
      const { data, error } = await supabase.from("project_stages").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data: any) => qc.invalidateQueries({ queryKey: ["project_stages", data.project_id] }),
  });
};

export const useToggleChecklistItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_done, projectId }: { id: string; is_done: boolean; projectId: string }) => {
      const { error } = await supabase
        .from("stage_checklist_items")
        .update({ is_done, done_at: is_done ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
      return projectId;
    },
    onSuccess: (projectId) => qc.invalidateQueries({ queryKey: ["project_stages", projectId] }),
  });
};

/* ───────────────────────── SERVICES CMS ───────────────────────── */
export const usePublishedServices = () =>
  useQuery({
    queryKey: ["services_cms", "published"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services_cms")
        .select("*")
        .eq("is_published", true)
        .order("display_order");
      if (error) throw error;
      return data;
    },
  });

/** Serviços para exibição na HOME — máx 3, ordenados por destaque. */
export const useHomeServices = () =>
  useQuery({
    queryKey: ["services_cms", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services_cms")
        .select("*")
        .eq("is_published", true)
        .eq("show_on_home", true)
        .order("is_featured", { ascending: false })
        .order("display_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

/** Serviços para a página /services — catálogo completo. */
export const useServicesPageServices = () =>
  useQuery({
    queryKey: ["services_cms", "services_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services_cms")
        .select("*")
        .eq("is_published", true)
        .eq("show_on_services_page", true)
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

export const useAllServices = () =>
  useQuery({
    queryKey: ["services_cms", "all"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services_cms").select("*").order("display_order");
      if (error) throw error;
      return data;
    },
  });

export const useUpsertService = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase.from("services_cms").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("services_cms").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services_cms"] });
      toast({ title: "Serviço salvo" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteService = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services_cms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services_cms"] });
      toast({ title: "Serviço excluído" });
    },
  });
};

/* ───────────────────────── FAQ ───────────────────────── */
export const useFaqAll = () =>
  useQuery({
    queryKey: ["faq", "all"],
    queryFn: async () => {
      const [cats, items] = await Promise.all([
        supabase.from("faq_categories").select("*").order("display_order"),
        supabase.from("faq_items").select("*").order("display_order"),
      ]);
      if (cats.error) throw cats.error;
      if (items.error) throw items.error;
      return { categories: cats.data || [], items: items.data || [] };
    },
  });

export const useFaqPublic = () =>
  useQuery({
    queryKey: ["faq", "public"],
    queryFn: async () => {
      const [cats, items] = await Promise.all([
        supabase.from("faq_categories").select("*").eq("is_active", true).order("display_order"),
        supabase.from("faq_items").select("*").eq("is_active", true).order("display_order"),
      ]);
      if (cats.error) throw cats.error;
      if (items.error) throw items.error;
      return { categories: cats.data || [], items: items.data || [] };
    },
  });

export const useUpsertFaqItem = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: any) => {
      const { id, ...rest } = payload;
      if (id) {
        const { data, error } = await supabase.from("faq_items").update(rest).eq("id", id).select().single();
        if (error) throw error;
        return data;
      }
      const { data, error } = await supabase.from("faq_items").insert(rest).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faq"] });
      toast({ title: "FAQ salvo" });
    },
    onError: (e: any) => toast({ title: "Erro", description: e.message, variant: "destructive" }),
  });
};

export const useDeleteFaqItem = () => {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("faq_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["faq"] });
      toast({ title: "Excluído" });
    },
  });
};

/* ───────────────────────── AI ENGINE ───────────────────────── */
export const useAiGenerate = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ task, context, model }: { task: string; context: any; model?: string }) => {
      const { data, error } = await supabase.functions.invoke("ai-engine", {
        body: { task, context, model },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data?.content as string;
    },
    onError: (e: any) => toast({ title: "IA falhou", description: e.message, variant: "destructive" }),
  });
};
