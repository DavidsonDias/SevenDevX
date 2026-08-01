/**
 * TimeTrackerWidget.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/components/admin/finance/TimeTrackerWidget.tsx
 * @module SevenOS/Finance
 *
 * @description
 * Registro de horas do projeto, base do cálculo de margem.
 *
 * @security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⏱️ TimeTrackerWidget — timer start/stop + lista de horas do projeto.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Play, Square, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeamMembers } from "@/hooks/useFinance";
import { useTimeEntries, useRunningEntry, useStartTimer, useStopTimer, useDeleteTimeEntry } from "@/hooks/useTimeTracking";
import { formatHours, formatMoney } from "@/lib/money";

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Widget de apontamento de horas do projeto (start/stop e lançamento manual).
 */
export default function TimeTrackerWidget({ projectId, stageId }: { projectId: string; stageId?: string }) {
  const { data: members = [] } = useTeamMembers();
  const [memberId, setMemberId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [now, setNow] = useState(Date.now());

  const { data: entries = [] } = useTimeEntries(projectId);
  const { data: running } = useRunningEntry(memberId || undefined);
  const start = useStartTimer();
  const stop = useStopTimer();
  const del = useDeleteTimeEntry();

  useEffect(() => {
    if (members.length && !memberId) setMemberId(members[0].id);
  }, [members, memberId]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [running]);

  const member = members.find((m: any) => m.id === memberId);
  const elapsed = running ? Math.max(0, Math.floor((now - new Date(running.started_at).getTime()) / 1000)) : 0;
  const elapsedStr = `${Math.floor(elapsed / 3600)}:${String(Math.floor((elapsed % 3600) / 60)).padStart(2, "0")}:${String(elapsed % 60).padStart(2, "0")}`;

  const handleStart = async () => {
    if (!member) return;
    await start.mutateAsync({
      project_id: projectId,
      stage_id: stageId || null,
      member_id: member.id,
      description: description || null,
      hourly_cost_brl_snapshot: Number(member.hourly_cost_brl || 0),
      hourly_rate_brl_snapshot: Number(member.hourly_rate_brl || 0),
    });
  };

  const totalMin = entries.filter((e: any) => e.ended_at).reduce((s: number, e: any) => s + Number(e.duration_minutes || 0), 0);
  const totalCost = entries.filter((e: any) => e.ended_at).reduce((s: number, e: any) => s + (Number(e.duration_minutes || 0) / 60) * Number(e.hourly_cost_brl_snapshot || 0), 0);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-300" /> Time tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {members.length === 0 && (
            <p className="text-xs text-white/50 text-center py-3 border border-dashed border-white/10 rounded-lg">
              Cadastre membros do time em <span className="text-white/80">/admin/financeiro → Time</span> para começar.
            </p>
          )}

          {members.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Membro" /></SelectTrigger>
                <SelectContent>
                  {members.map((m: any) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                className="bg-white/5 border-white/10 sm:col-span-2"
                placeholder="O que você está fazendo?"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>
          )}

          {running ? (
            <div className="flex items-center justify-between p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-lg">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-emerald-400">Em andamento</div>
                <div className="text-2xl font-mono font-bold text-emerald-300">{elapsedStr}</div>
                {running.description && <div className="text-xs text-white/60 mt-1">{running.description}</div>}
              </div>
              <Button onClick={() => stop.mutate(running.id)} className="bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25">
                <Square className="w-4 h-4 mr-2" /> Parar
              </Button>
            </div>
          ) : members.length > 0 && (
            <Button onClick={handleStart} disabled={start.isPending} className="w-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25">
              <Play className="w-4 h-4 mr-2" /> Iniciar timer
            </Button>
          )}

          {/* Resumo */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            <div className="p-2.5 border border-white/10 rounded-lg">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Total trabalhado</div>
              <div className="text-sm font-bold">{formatHours(totalMin)}</div>
            </div>
            <div className="p-2.5 border border-white/10 rounded-lg">
              <div className="text-[10px] text-purple-300 uppercase tracking-wider">Custo de time</div>
              <div className="text-sm font-bold text-purple-300">{formatMoney(totalCost)}</div>
            </div>
          </div>

          {/* Entries */}
          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {entries.slice(0, 30).map((e: any) => {
              const m = members.find((mm: any) => mm.id === e.member_id);
              return (
                <div key={e.id} className="flex items-center justify-between p-2 border border-white/10 rounded-lg text-xs gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="truncate">{e.description || <span className="text-white/40">sem descrição</span>}</div>
                    <div className="text-[10px] text-white/40">
                      {m?.name || "—"} · {new Date(e.started_at).toLocaleString("pt-BR")}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono">{e.ended_at ? formatHours(e.duration_minutes) : <span className="text-emerald-400">rodando</span>}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(e.id)}><Trash2 className="w-3 h-3 text-red-400/70" /></Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
