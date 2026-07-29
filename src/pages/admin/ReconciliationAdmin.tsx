/**
 * ReconciliationAdmin.tsx — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/pages/admin/ReconciliationAdmin.tsx
 * @module SevenOS/Admin
 * @route /admin/finance/reconciliation
 *
 * @description
 * Conciliação bancária a partir de importações.
 *
 * @security Rota protegida por `ProtectedRoute requiredRole="admin"`; a autoridade final é RLS.
 *
 * @see docs/architecture/MODULE_MAP.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🏛️ ReconciliationAdmin — conciliação bancária manual + import CSV.
 * CSV: data,descricao,valor (valor positivo=entrada / negativo=saída).
 */
import { useState, useRef, useMemo } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Check, Upload, FileText, RotateCcw, AlertCircle, Banknote } from "lucide-react";
import AdminPageShell from "@/components/admin/AdminPageShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatMoney } from "@/lib/money";

function parseCsv(text: string): Array<{ date: string; description: string; amount: number }> {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return [];
  const start = /data|date/i.test(lines[0]) ? 1 : 0;
  const out: any[] = [];
  for (let i = start; i < lines.length; i++) {
    const parts = lines[i].split(/[,;\t]/).map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 3) continue;
    const [d, desc, val] = parts;
    const date = d.includes("/") ? d.split("/").reverse().join("-") : d;
    const amount = parseFloat(val.replace(/\./g, "").replace(",", "."));
    if (Number.isNaN(amount)) continue;
    out.push({ date, description: desc, amount });
  }
  return out;
}

export default function ReconciliationAdmin() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [staged, setStaged] = useState<Array<{ date: string; description: string; amount: number; status: "new" | "matched" | "skip" }>>([]);
  const [fileName, setFileName] = useState<string>("");

  const { data: pending = [] } = useQuery({
    queryKey: ["tx_unreconciled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("id,description,amount_brl,kind,status,occurred_at,bank_ref,reconciled")
        .eq("reconciled", false)
        .order("occurred_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: reconciled = [] } = useQuery({
    queryKey: ["tx_reconciled"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("id,description,amount_brl,kind,status,occurred_at,bank_ref,reconciled_at")
        .eq("reconciled", true)
        .order("reconciled_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data || [];
    },
  });

  const totalUnrec = useMemo(() => pending.reduce((s, t) => s + Number(t.amount_brl || 0) * (t.kind === "income" ? 1 : -1), 0), [pending]);

  const markReconciled = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .update({ reconciled: true, reconciled_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tx_unreconciled"] });
      qc.invalidateQueries({ queryKey: ["tx_reconciled"] });
      toast({ title: "Transação conciliada" });
    },
  });

  const unmark = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("transactions")
        .update({ reconciled: false, reconciled_at: null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tx_unreconciled"] });
      qc.invalidateQueries({ queryKey: ["tx_reconciled"] });
      toast({ title: "Reabertura concluída" });
    },
  });

  const importStaged = useMutation({
    mutationFn: async () => {
      const toImport = staged.filter((s) => s.status === "new");
      if (!toImport.length) return { imported: 0 };
      const rows = toImport.map((s) => ({
        kind: s.amount >= 0 ? "income" : "expense",
        category: s.amount >= 0 ? "other_income" : "other_expense",
        status: "paid",
        description: s.description,
        amount: Math.abs(s.amount),
        amount_brl: Math.abs(s.amount),
        currency: "BRL",
        fx_rate_used: 1,
        occurred_at: new Date(s.date).toISOString(),
        reconciled: true,
        reconciled_at: new Date().toISOString(),
        imported_from: fileName,
        bank_ref: `${s.date}|${s.description}|${s.amount}`,
      }));
      const { error } = await supabase.from("transactions").insert(rows as any);
      if (error) throw error;
      await supabase.from("bank_import_batches").insert({
        file_name: fileName,
        source: "csv",
        rows_total: staged.length,
        rows_imported: toImport.length,
        rows_skipped: staged.length - toImport.length,
      });
      return { imported: toImport.length };
    },
    onSuccess: (r) => {
      toast({ title: `${r.imported} transações importadas` });
      setStaged([]);
      setFileName("");
      qc.invalidateQueries({ queryKey: ["tx_unreconciled"] });
      qc.invalidateQueries({ queryKey: ["tx_reconciled"] });
    },
    onError: (e: any) => toast({ title: "Erro ao importar", description: e.message, variant: "destructive" }),
  });

  const handleFile = async (f: File) => {
    setFileName(f.name);
    const text = await f.text();
    const parsed = parseCsv(text);
    if (!parsed.length) {
      toast({ title: "Nenhuma linha válida no CSV", variant: "destructive" });
      return;
    }
    // tentar match contra pending por valor exato
    const enhanced = parsed.map((p) => {
      const match = pending.find((t) => Math.abs(Number(t.amount_brl) - Math.abs(p.amount)) < 0.01);
      return { ...p, status: match ? ("matched" as const) : ("new" as const) };
    });
    setStaged(enhanced);
  };

  return (
    <AdminPageShell title="Conciliação Bancária" subtitle="Concilia transações com extrato CSV ou marca manualmente">
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-white/5 border-white/10"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Pendentes</span><AlertCircle className="w-4 h-4 text-amber-400" /></div>
          <div className="text-2xl font-bold">{pending.length}</div>
        </CardContent></Card>
        <Card className="bg-white/5 border-white/10"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Saldo não conciliado</span><Banknote className="w-4 h-4 text-blue-400" /></div>
          <div className={`text-2xl font-bold ${totalUnrec >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(totalUnrec)}</div>
        </CardContent></Card>
        <Card className="bg-white/5 border-white/10"><CardContent className="p-5">
          <div className="flex items-center justify-between mb-2"><span className="text-[10px] uppercase tracking-[0.2em] text-white/50">Já conciliadas</span><Check className="w-4 h-4 text-emerald-400" /></div>
          <div className="text-2xl font-bold">{reconciled.length}+</div>
        </CardContent></Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="pending">Pendentes ({pending.length})</TabsTrigger>
          <TabsTrigger value="import">Importar CSV</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-[0.15em] text-white/40 border-b border-white/10">
                    <tr>
                      <th className="text-left p-3">Data</th>
                      <th className="text-left p-3">Descrição</th>
                      <th className="text-left p-3 hidden sm:table-cell">Status</th>
                      <th className="text-right p-3">Valor</th>
                      <th className="text-right p-3">Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-white/50">Tudo conciliado 🎉</td></tr>}
                    {pending.map((t: any) => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="p-3 text-white/60 text-xs whitespace-nowrap">{new Date(t.occurred_at).toLocaleDateString("pt-BR")}</td>
                        <td className="p-3">{t.description}</td>
                        <td className="p-3 hidden sm:table-cell"><Badge variant="outline" className="border-white/10 text-white/60 text-[10px]">{t.status}</Badge></td>
                        <td className={`p-3 text-right whitespace-nowrap ${t.kind === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.kind === "income" ? "+" : "−"} {formatMoney(Number(t.amount_brl))}
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => markReconciled.mutate(t.id)} disabled={markReconciled.isPending}>
                            <Check className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-6">
              <input ref={inputRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
              {!staged.length ? (
                <div className="border-2 border-dashed border-white/10 rounded-xl p-10 text-center">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-white/40" />
                  <p className="text-white/70 mb-1 font-medium">Importar extrato bancário</p>
                  <p className="text-xs text-white/40 mb-4">CSV com colunas: data, descrição, valor (positivo = entrada)</p>
                  <Button onClick={() => inputRef.current?.click()} className="bg-white text-black hover:bg-white/90">
                    <FileText className="w-4 h-4 mr-2" /> Selecionar arquivo
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm font-medium">{fileName}</div>
                      <div className="text-xs text-white/50">{staged.length} linhas · {staged.filter((s) => s.status === "matched").length} já existem · {staged.filter((s) => s.status === "new").length} novas</div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setStaged([]); setFileName(""); }}>Cancelar</Button>
                      <Button size="sm" onClick={() => importStaged.mutate()} disabled={importStaged.isPending} className="bg-emerald-500 hover:bg-emerald-600">
                        Importar {staged.filter((s) => s.status === "new").length} novas
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-auto border border-white/10 rounded-lg">
                    <table className="w-full text-sm">
                      <tbody>
                        {staged.map((s, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="p-2 text-xs text-white/60">{s.date}</td>
                            <td className="p-2">{s.description}</td>
                            <td className={`p-2 text-right ${s.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(s.amount)}</td>
                            <td className="p-2 text-right">
                              {s.status === "matched" ? (
                                <Badge variant="outline" className="border-amber-400/40 text-amber-300 text-[10px]">já existe</Badge>
                              ) : (
                                <Badge variant="outline" className="border-emerald-400/40 text-emerald-300 text-[10px]">nova</Badge>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-[10px] uppercase tracking-[0.15em] text-white/40 border-b border-white/10">
                    <tr>
                      <th className="text-left p-3">Conciliada em</th>
                      <th className="text-left p-3">Descrição</th>
                      <th className="text-right p-3">Valor</th>
                      <th className="text-right p-3">Reabrir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reconciled.map((t: any) => (
                      <tr key={t.id} className="border-b border-white/5">
                        <td className="p-3 text-xs text-white/50">{t.reconciled_at ? new Date(t.reconciled_at).toLocaleString("pt-BR") : "—"}</td>
                        <td className="p-3">{t.description}</td>
                        <td className={`p-3 text-right ${t.kind === "income" ? "text-emerald-400" : "text-rose-400"}`}>
                          {t.kind === "income" ? "+" : "−"} {formatMoney(Number(t.amount_brl))}
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="ghost" onClick={() => unmark.mutate(t.id)}>
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminPageShell>
  );
}
