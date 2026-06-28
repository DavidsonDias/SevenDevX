/**
 * 💰 FinanceAdmin — dashboard financeiro do SevenOS.
 * Receitas, despesas, lucro, MRR previsto, multi-moeda (BRL/USD/EUR), time + custo de time.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight, ArrowUpRight, Coins, DollarSign, Plus, Trash2, TrendingUp, Users, RefreshCw, Clock,
} from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  useFxRates, useUpsertFxRate,
  useTeamMembers, useUpsertTeamMember, useDeleteTeamMember,
  useTransactions, useUpsertTransaction, useDeleteTransaction,
} from "@/hooks/useFinance";
import { useTimeEntries } from "@/hooks/useTimeTracking";
import { CurrencyCode, formatMoney, formatHours } from "@/lib/money";

const TX_CATEGORIES_INCOME = [
  { value: "contract", label: "Contrato" },
  { value: "maintenance", label: "Manutenção" },
  { value: "consulting", label: "Consultoria" },
  { value: "recurring", label: "Recorrente" },
  { value: "other_income", label: "Outras receitas" },
];

const TX_CATEGORIES_EXPENSE = [
  { value: "tool", label: "Ferramenta/SaaS" },
  { value: "infra", label: "Infraestrutura" },
  { value: "freelancer", label: "Freelancer" },
  { value: "tax", label: "Imposto" },
  { value: "marketing", label: "Marketing" },
  { value: "salary", label: "Salário/PRO-LABORE" },
  { value: "other_expense", label: "Outras despesas" },
];

/* ───────── KPI CARD ───────── */
const Kpi = ({ icon: Icon, label, value, accent = "text-white" }: any) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card className="bg-white/5 border-white/10 backdrop-blur">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</span>
          <Icon className={`w-4 h-4 ${accent}`} />
        </div>
        <div className={`text-2xl font-bold tracking-tight ${accent}`}>{value}</div>
      </CardContent>
    </Card>
  </motion.div>
);

/* ───────── TRANSACTION DIALOG ───────── */
function TransactionDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>({
    kind: "income",
    category: "contract",
    status: "pending",
    description: "",
    amount: "",
    currency: "BRL",
    occurred_at: new Date().toISOString().slice(0, 10),
  });
  const upsert = useUpsertTransaction();

  const submit = async () => {
    if (!form.description || !form.amount) return;
    await upsert.mutateAsync({
      ...form,
      amount: Number(form.amount),
      occurred_at: new Date(form.occurred_at).toISOString(),
    });
    setOpen(false);
    setForm({ ...form, description: "", amount: "" });
  };

  const cats = form.kind === "income" ? TX_CATEGORIES_INCOME : TX_CATEGORIES_EXPENSE;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova transação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/60">Tipo</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v, category: v === "income" ? "contract" : "tool" })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-white/60">Categoria</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {cats.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs text-white/60">Descrição</Label>
            <Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="col-span-2">
              <Label className="text-xs text-white/60">Valor</Label>
              <Input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-xs text-white/60">Moeda</Label>
              <Select value={form.currency} onValueChange={(v) => setForm({ ...form, currency: v })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-white/60">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="overdue">Atrasado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-white/60">Data</Label>
              <Input type="date" value={form.occurred_at} onChange={e => setForm({ ...form, occurred_at: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
          </div>

          <Button onClick={submit} disabled={upsert.isPending} className="w-full bg-white text-black hover:bg-white/90">
            {upsert.isPending ? "Salvando..." : "Salvar transação"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ───────── FX EDITOR ───────── */
function FxEditor() {
  const { data } = useFxRates();
  const upsert = useUpsertFxRate();
  const [usd, setUsd] = useState("");
  const [eur, setEur] = useState("");
  const latest = data?.latest || {};

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Cotações</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {(["BRL", "USD", "EUR"] as CurrencyCode[]).map(c => (
            <div key={c} className="p-3 border border-white/10 rounded-lg">
              <div className="text-[10px] uppercase tracking-wider text-white/50">{c} → BRL</div>
              <div className="text-lg font-bold">R$ {(latest[c] ?? 0).toFixed(4)}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex gap-2">
            <Input placeholder="Nova cotação USD" type="number" step="0.0001" value={usd} onChange={e => setUsd(e.target.value)} className="bg-white/5 border-white/10" />
            <Button size="sm" variant="outline" disabled={!usd} onClick={async () => { await upsert.mutateAsync({ currency: "USD", rate_to_brl: Number(usd) }); setUsd(""); }}>USD</Button>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Nova cotação EUR" type="number" step="0.0001" value={eur} onChange={e => setEur(e.target.value)} className="bg-white/5 border-white/10" />
            <Button size="sm" variant="outline" disabled={!eur} onClick={async () => { await upsert.mutateAsync({ currency: "EUR", rate_to_brl: Number(eur) }); setEur(""); }}>EUR</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ───────── TEAM MEMBERS ───────── */
function TeamMembersManager() {
  const { data: members = [] } = useTeamMembers();
  const upsert = useUpsertTeamMember();
  const del = useDeleteTeamMember();
  const [form, setForm] = useState<any>({ name: "", role: "", hourly_cost_brl: 0, hourly_rate_brl: 0 });

  const add = async () => {
    if (!form.name) return;
    await upsert.mutateAsync({ ...form, hourly_cost_brl: Number(form.hourly_cost_brl), hourly_rate_brl: Number(form.hourly_rate_brl) });
    setForm({ name: "", role: "", hourly_cost_brl: 0, hourly_rate_brl: 0 });
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4" /> Membros do time</CardTitle>
        <p className="text-xs text-white/50">Custo e valor cobrado por hora — usados para calcular margem real dos projetos.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Input placeholder="Nome" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Cargo" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="bg-white/5 border-white/10" />
          <Input placeholder="Custo/h (R$)" type="number" value={form.hourly_cost_brl} onChange={e => setForm({ ...form, hourly_cost_brl: e.target.value })} className="bg-white/5 border-white/10" />
          <div className="flex gap-2">
            <Input placeholder="Valor/h (R$)" type="number" value={form.hourly_rate_brl} onChange={e => setForm({ ...form, hourly_rate_brl: e.target.value })} className="bg-white/5 border-white/10" />
            <Button size="sm" onClick={add} className="bg-white text-black hover:bg-white/90"><Plus className="w-4 h-4" /></Button>
          </div>
        </div>
        <div className="space-y-2">
          {members.map((m: any) => (
            <div key={m.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg text-sm">
              <div className="min-w-0">
                <div className="font-medium truncate">{m.name} {m.role && <span className="text-white/40">· {m.role}</span>}</div>
                <div className="text-xs text-white/50">Custo {formatMoney(m.hourly_cost_brl)}/h · Valor {formatMoney(m.hourly_rate_brl)}/h</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => del.mutate(m.id)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
            </div>
          ))}
          {members.length === 0 && <p className="text-xs text-white/40 text-center py-4">Nenhum membro cadastrado.</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ───────── MAIN PAGE ───────── */
export default function FinanceAdmin() {
  const { data: txs = [] } = useTransactions();
  const { data: timeEntries = [] } = useTimeEntries();
  const del = useDeleteTransaction();

  const stats = useMemo(() => {
    const incomeAll = txs.filter((t: any) => t.kind === "income").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const incomePaid = txs.filter((t: any) => t.kind === "income" && t.status === "paid").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const expenseAll = txs.filter((t: any) => t.kind === "expense").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const expensePaid = txs.filter((t: any) => t.kind === "expense" && t.status === "paid").reduce((s: number, t: any) => s + Number(t.amount_brl || 0), 0);
    const profit = incomePaid - expensePaid;
    const totalMinutes = timeEntries.filter((t: any) => t.ended_at).reduce((s: number, t: any) => s + Number(t.duration_minutes || 0), 0);
    const teamCost = timeEntries.filter((t: any) => t.ended_at).reduce((s: number, t: any) => s + (Number(t.duration_minutes || 0) / 60) * Number(t.hourly_cost_brl_snapshot || 0), 0);
    return { incomeAll, incomePaid, expenseAll, expensePaid, profit, totalMinutes, teamCost };
  }, [txs, timeEntries]);

  return (
    <AdminPageShell
      title="Financeiro"
      subtitle="Receitas, despesas, lucro real e custo de horas — tudo em BRL com suporte a USD/EUR."
      actions={
        <TransactionDialog
          trigger={
            <Button className="bg-white text-black hover:bg-white/90">
              <Plus className="w-4 h-4 mr-2" /> Nova transação
            </Button>
          }
        />
      }
    >
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={ArrowUpRight} label="Receita (paga)" value={formatMoney(stats.incomePaid)} accent="text-emerald-400" />
        <Kpi icon={ArrowDownRight} label="Despesa (paga)" value={formatMoney(stats.expensePaid)} accent="text-red-400" />
        <Kpi icon={TrendingUp} label="Lucro líquido" value={formatMoney(stats.profit)} accent={stats.profit >= 0 ? "text-emerald-400" : "text-red-400"} />
        <Kpi icon={Clock} label="Custo de horas" value={formatMoney(stats.teamCost)} accent="text-purple-300" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Kpi icon={Coins} label="Receita prevista (todas)" value={formatMoney(stats.incomeAll)} />
        <Kpi icon={Coins} label="Despesa prevista (todas)" value={formatMoney(stats.expenseAll)} />
        <Kpi icon={Clock} label="Horas trabalhadas" value={formatHours(stats.totalMinutes)} />
        <Kpi icon={DollarSign} label="Margem real" value={formatMoney(stats.profit - stats.teamCost)} accent={stats.profit - stats.teamCost >= 0 ? "text-emerald-400" : "text-red-400"} />
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="transactions">Transações</TabsTrigger>
          <TabsTrigger value="team">Time</TabsTrigger>
          <TabsTrigger value="fx">Cotações</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card className="bg-white/5 border-white/10">
            <CardHeader><CardTitle className="text-base">Últimas transações</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {txs.length === 0 && <p className="text-sm text-white/40 text-center py-8">Nenhuma transação ainda. Comece adicionando uma.</p>}
                {txs.map((t: any) => (
                  <div key={t.id} className="flex items-center justify-between p-3 border border-white/10 rounded-lg gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${t.kind === "income" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
                        {t.kind === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{t.description}</div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/50">
                          <span>{new Date(t.occurred_at).toLocaleDateString("pt-BR")}</span>
                          <Badge variant="outline" className="text-[10px] border-white/10">{t.category}</Badge>
                          <Badge variant="outline" className={`text-[10px] border-white/10 ${t.status === "paid" ? "text-emerald-400" : t.status === "overdue" ? "text-red-400" : "text-white/60"}`}>{t.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`text-sm font-bold ${t.kind === "income" ? "text-emerald-400" : "text-red-400"}`}>
                        {t.kind === "income" ? "+" : "−"} {formatMoney(t.amount_brl)}
                      </div>
                      {t.currency !== "BRL" && (
                        <div className="text-[10px] text-white/40">{formatMoney(t.amount, t.currency)}</div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => del.mutate(t.id)}><Trash2 className="w-4 h-4 text-red-400/70" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team"><TeamMembersManager /></TabsContent>
        <TabsContent value="fx"><FxEditor /></TabsContent>
      </Tabs>
    </AdminPageShell>
  );
}
