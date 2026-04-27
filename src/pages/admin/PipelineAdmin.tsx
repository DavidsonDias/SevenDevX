/**
 * 🧭 PipelineAdmin — Kanban de projetos por estágio comercial
 */
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { useAllProjects } from "@/hooks/useProjects";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const COLUMNS = [
  { id: "lead", label: "Lead", color: "#3B82F6" },
  { id: "discovery", label: "Diagnóstico", color: "#8B5CF6" },
  { id: "proposal", label: "Proposta", color: "#10B981" },
  { id: "execution", label: "Execução", color: "#F59E0B" },
  { id: "launch", label: "Lançamento", color: "#EC4899" },
  { id: "done", label: "Concluído", color: "#6B7280" },
];

export default function PipelineAdmin() {
  const { data: projects = [], isLoading } = useAllProjects();
  const qc = useQueryClient();
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    COLUMNS.forEach((c) => (map[c.id] = []));
    projects.forEach((p: any) => {
      const stage = p.pipeline_stage || "lead";
      if (!map[stage]) map[stage] = [];
      map[stage].push(p);
    });
    return map;
  }, [projects]);

  const move = async (projectId: string, newStage: string) => {
    const { error } = await supabase.from("projects").update({ pipeline_stage: newStage as any }).eq("id", projectId);
    if (error) { toast({ title: "Erro", description: error.message, variant: "destructive" }); return; }
    qc.invalidateQueries({ queryKey: ["projects"] });
    toast({ title: "Etapa atualizada" });
  };

  return (
    <AdminPageShell title="Pipeline" subtitle="Kanban dos projetos por estágio comercial">
      {isLoading ? (
        <p className="text-white/50">Carregando…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {COLUMNS.map((col) => (
            <div key={col.id} className="bg-white/5 border border-white/10 rounded-xl p-3 min-h-[300px]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                  <h3 className="font-bold text-sm uppercase tracking-wider">{col.label}</h3>
                </div>
                <span className="text-xs text-white/40">{grouped[col.id]?.length || 0}</span>
              </div>
              <div className="space-y-2">
                {grouped[col.id]?.map((p: any) => (
                  <motion.div
                    key={p.id}
                    layout
                    className="bg-zinc-950 border border-white/10 rounded-lg p-3 cursor-move"
                  >
                    <h4 className="font-medium text-sm truncate">{p.title}</h4>
                    {p.client_name && <p className="text-xs text-white/50 truncate mt-0.5">{p.client_name}</p>}
                    <select
                      value={p.pipeline_stage || "lead"}
                      onChange={(e) => move(p.id, e.target.value)}
                      className="mt-2 w-full text-[10px] uppercase tracking-wider bg-white/5 border border-white/10 rounded px-2 py-1 outline-none"
                    >
                      {COLUMNS.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                  </motion.div>
                ))}
                {grouped[col.id]?.length === 0 && <p className="text-xs text-white/30 text-center py-6">Vazio</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageShell>
  );
}
