/**
 * 🚀 ProjectFinanceBlock.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/finance/ProjectFinanceBlock.tsx
 * @module SevenOS/Finance
 * @layer Presentation / UI
 * @status Active
 *
 * @description
 * Bloco financeiro do projeto: orçamento, transações e margem.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Exporta `ProjectFinanceBlock`
 * ✅ Compõe blocos de UI importados de `@/components` e `@/modules`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🧩 ARQUITETURA DO ARQUIVO                                           │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ProjectFinanceBlock
 *    ├── Card
 *    ├── CardContent
 *    ├── CardHeader
 *    ├── CardTitle
 *    ├── Button
 *    ├── Input
 *    ├── Label
 *    ├── Select
 *    ├── SelectContent
 *    └── SelectItem
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🛠️ DEPENDÊNCIAS RELEVANTES                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Framer Motion — transições e animações
 * ✅ Lucide — iconografia do design system
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ⚡ PERFORMANCE                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Evitar alterações que provoquem layout shift
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see src/components/admin/finance/README.md
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * 💼 ProjectFinanceBlock — orçamento, transações e margem real do projeto.
 */
import { useState } from "react";
import { motion } from "framer-motion";
import { Coins, Plus, Trash2, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  useProjectBudget, useUpsertProjectBudget,
  useTransactions, useUpsertTransaction, useDeleteTransaction,
  useProjectMargin,
} from "@/hooks/useFinance";
import { formatMoney, formatHours } from "@/lib/money";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const TX_INC = [
  { value: "contract", label: "Contrato" },
  { value: "maintenance", label: "Manutenção" },
  { value: "consulting", label: "Consultoria" },
  { value: "recurring", label: "Recorrente" },
  { value: "other_income", label: "Outras receitas" },
];
const TX_EXP = [
  { value: "tool", label: "Ferramenta/SaaS" },
  { value: "infra", label: "Infraestrutura" },
  { value: "freelancer", label: "Freelancer" },
  { value: "tax", label: "Imposto" },
  { value: "marketing", label: "Marketing" },
  { value: "other_expense", label: "Outras despesas" },
];

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/**
 * Bloco financeiro do projeto: orçamento, transações e margem calculada via RPC.
 */
export default function ProjectFinanceBlock({ projectId }: { projectId: string }) {
  const { data: budget } = useProjectBudget(projectId);
  const { data: margin } = useProjectMargin(projectId);
  const { data: txs = [] } = useTransactions({ projectId });
  const upsertBudget = useUpsertProjectBudget();
  const upsertTx = useUpsertTransaction();
  const delTx = useDeleteTransaction();

  const [budgetForm, setBudgetForm] = useState<any>({
    amount_total: budget?.amount_total ?? "",
    currency: budget?.currency ?? "BRL",
    tax_percent: budget?.tax_percent ?? 0,
    estimated_hours: budget?.estimated_hours ?? 0,
  });
  const [txForm, setTxForm] = useState<any>({
    kind: "expense", category: "tool", description: "", amount: "", currency: "BRL", status: "paid",
  });

  const saveBudget = async () => {
    await upsertBudget.mutateAsync({
      project_id: projectId,
      amount_total: Number(budgetForm.amount_total || 0),
      currency: budgetForm.currency,
      tax_percent: Number(budgetForm.tax_percent || 0),
      estimated_hours: Number(budgetForm.estimated_hours || 0),
    });
  };

  const addTx = async () => {
    if (!txForm.description || !txForm.amount) return;
    await upsertTx.mutateAsync({
      ...txForm,
      project_id: projectId,
      amount: Number(txForm.amount),
      occurred_at: new Date().toISOString(),
    });
    setTxForm({ ...txForm, description: "", amount: "" });
  };

  const cats = txForm.kind === "income" ? TX_INC : TX_EXP;
  const marginPct = Number(margin?.margin_percent ?? 0);
  const marginColor = marginPct >= 30 ? "text-emerald-400" : marginPct >= 10 ? "text-yellow-400" : "text-red-400";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="bg-white/5 border-white/10 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Coins className="w-4 h-4 text-yellow-400" /> Financeiro do projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Orçamento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="col-span-2 lg:col-span-1">
              <Label className="text-[10px] uppercase tracking-wider text-white/50">Valor total</Label>
              <Input type="number" step="0.01" value={budgetForm.amount_total} onChange={e => setBudgetForm({ ...budgetForm, amount_total: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-white/50">Moeda</Label>
              <Select value={budgetForm.currency} onValueChange={v => setBudgetForm({ ...budgetForm, currency: v })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-white/50">Imposto %</Label>
              <Input type="number" step="0.1" value={budgetForm.tax_percent} onChange={e => setBudgetForm({ ...budgetForm, tax_percent: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-white/50">Horas est.</Label>
              <Input type="number" step="0.5" value={budgetForm.estimated_hours} onChange={e => setBudgetForm({ ...budgetForm, estimated_hours: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
          </div>
          <Button size="sm" onClick={saveBudget} disabled={upsertBudget.isPending} className="bg-white/10 hover:bg-white/15 text-white border border-white/15">
            Salvar orçamento
          </Button>

          {/* Margem */}
          {margin && (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 pt-2 border-t border-white/10">
              <div className="p-3 border border-white/10 rounded-lg">
                <div className="text-[10px] text-white/50 uppercase tracking-wider">Orçamento</div>
                <div className="text-sm font-bold">{formatMoney(margin.budget_brl)}</div>
              </div>
              <div className="p-3 border border-emerald-500/20 rounded-lg">
                <div className="text-[10px] text-emerald-400/80 uppercase tracking-wider">Receita</div>
                <div className="text-sm font-bold text-emerald-400">{formatMoney(margin.income_brl)}</div>
              </div>
              <div className="p-3 border border-red-500/20 rounded-lg">
                <div className="text-[10px] text-red-400/80 uppercase tracking-wider">Despesa</div>
                <div className="text-sm font-bold text-red-400">{formatMoney(margin.expense_brl)}</div>
              </div>
              <div className="p-3 border border-purple-500/20 rounded-lg">
                <div className="text-[10px] text-purple-300 uppercase tracking-wider">Custo horas</div>
                <div className="text-sm font-bold text-purple-300">{formatMoney(margin.hours_cost_brl)}</div>
                <div className="text-[10px] text-white/40">{formatHours(Number(margin.hours_worked || 0) * 60)} / {Number(margin.hours_estimated || 0)}h</div>
              </div>
              <div className="p-3 border border-white/10 rounded-lg">
                <div className="text-[10px] text-white/50 uppercase tracking-wider flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Margem real</div>
                <div className={`text-sm font-bold ${marginColor}`}>{formatMoney(margin.net_margin_brl)}</div>
                <div className={`text-[10px] ${marginColor}`}>{marginPct}%</div>
              </div>
            </div>
          )}

          {/* Add tx inline */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="text-[10px] uppercase tracking-wider text-white/50 mb-1">Adicionar transação</div>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
              <Select value={txForm.kind} onValueChange={v => setTxForm({ ...txForm, kind: v, category: v === "income" ? "contract" : "tool" })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
              <Select value={txForm.category} onValueChange={v => setTxForm({ ...txForm, category: v })}>
                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>{cats.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Input className="bg-white/5 border-white/10 col-span-2" placeholder="Descrição" value={txForm.description} onChange={e => setTxForm({ ...txForm, description: e.target.value })} />
              <Input className="bg-white/5 border-white/10" type="number" step="0.01" placeholder="Valor" value={txForm.amount} onChange={e => setTxForm({ ...txForm, amount: e.target.value })} />
              <div className="flex gap-1">
                <Select value={txForm.currency} onValueChange={v => setTxForm({ ...txForm, currency: v })}>
                  <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">BRL</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm" onClick={addTx} className="bg-white text-black hover:bg-white/90"><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          {/* Tx list */}
          <div className="space-y-2">
            {txs.map((t: any) => (
              <div key={t.id} className="flex items-center justify-between p-2.5 border border-white/10 rounded-lg gap-2 text-sm">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {t.kind === "income"
                    ? <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    : <ArrowDownRight className="w-4 h-4 text-red-400 shrink-0" />}
                  <span className="truncate">{t.description}</span>
                  <Badge variant="outline" className="text-[10px] border-white/10 hidden sm:inline-flex">{t.category}</Badge>
                </div>
                <div className={`text-sm font-bold shrink-0 ${t.kind === "income" ? "text-emerald-400" : "text-red-400"}`}>
                  {t.kind === "income" ? "+" : "−"} {formatMoney(t.amount_brl)}
                </div>
                <Button size="sm" variant="ghost" onClick={() => delTx.mutate(t.id)}><Trash2 className="w-3.5 h-3.5 text-red-400/70" /></Button>
              </div>
            ))}
            {txs.length === 0 && <p className="text-xs text-white/40 text-center py-3">Sem transações neste projeto.</p>}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
