/**
 * KpiCards.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/KpiCards.tsx
 * @module SevenOS/UI
 *
 * @description
 * Indicadores principais do dashboard administrativo.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see src/components/admin/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 📊 KpiCards — KPIs avançados de pipeline, conversão e receita
 */
import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Target, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import GlassCard from "@/components/GlassCard";

interface Kpis {
  pipelineActive: number;
  conversionRate: number; // contacts → clients
  contractsSigned: number;
  contractsPending: number;
  estimatedRevenue: number; // soma de projetos com pipeline ativo
}

export default function KpiCards() {
  const [k, setK] = useState<Kpis | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [pipeline, contactsTotal, clientsTotal, contractsP, contractsS] = await Promise.all([
          supabase.from("projects").select("id", { count: "exact", head: true }).neq("pipeline_stage", "entrega").neq("pipeline_stage", "lead"),
          supabase.from("contacts").select("id", { count: "exact", head: true }),
          supabase.from("clients").select("id", { count: "exact", head: true }).eq("status", "active"),
          supabase.from("clients").select("id", { count: "exact", head: true }).eq("contract_status", "pending"),
          supabase.from("clients").select("id", { count: "exact", head: true }).eq("contract_status", "approved"),
        ]);

        const conv = (contactsTotal.count || 0) > 0
          ? Math.round(((clientsTotal.count || 0) / (contactsTotal.count || 1)) * 100)
          : 0;

        // Receita estimada: usa contratos pendentes/assinados como referência (placeholder simples)
        const estimatedRevenue = ((contractsS.count || 0) * 8500) + ((contractsP.count || 0) * 5000);

        setK({
          pipelineActive: pipeline.count || 0,
          conversionRate: conv,
          contractsSigned: contractsS.count || 0,
          contractsPending: contractsP.count || 0,
          estimatedRevenue,
        });
      } catch (e) {
        console.error("[KpiCards]", e);
      }
    })();
  }, []);

  if (!k) return null;

  const cards = [
    { label: "Pipeline Ativo", value: k.pipelineActive, hint: "projetos em andamento", Icon: Briefcase, accent: "text-blue-400" },
    { label: "Conversão Lead→Cliente", value: `${k.conversionRate}%`, hint: "contatos virando clientes", Icon: Target, accent: "text-green-400" },
    { label: "Contratos Assinados", value: k.contractsSigned, hint: `${k.contractsPending} pendentes`, Icon: TrendingUp, accent: "text-purple-400" },
    { label: "Receita Estimada", value: `R$ ${k.estimatedRevenue.toLocaleString("pt-BR")}`, hint: "baseado em contratos", Icon: DollarSign, accent: "text-yellow-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map(({ label, value, hint, Icon, accent }) => (
        <GlassCard key={label}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
            <Icon className={`w-4 h-4 ${accent}`} />
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-[11px] text-white/40">{hint}</div>
        </GlassCard>
      ))}
    </div>
  );
}
