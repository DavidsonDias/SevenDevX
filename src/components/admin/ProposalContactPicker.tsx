/** @file Explicit channel selection; edits remain local until applied and proposal saved. */
import { useState } from "react";
import { ArrowDown, ArrowUp, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PROPOSAL_CHANNELS,
  channelDraft,
  proposalChannel,
  serializeChannels,
  type ProposalChannelKind,
} from "@/lib/proposals";
import { channelIcons, channelColors } from "@/lib/proposalIcons";
type Row = { id: string; kind: ProposalChannelKind; value: string };
export default function ProposalContactPicker({
  value,
  onChange,
  title,
}: {
  value: string;
  onChange: (value: string) => void;
  title: string;
}) {
  const [open, setOpen] = useState(false),
    [rows, setRows] = useState<Row[]>([]),
    [error, setError] = useState("");
  const patch = (id: string, change: Partial<Row>) =>
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...change } : row)),
    );
  const move = (index: number, delta: number) =>
    setRows((current) => {
      const copy = [...current];
      [copy[index], copy[index + delta]] = [copy[index + delta], copy[index]];
      return copy;
    });
  return (
    <>
      <button
        type="button"
        className="min-h-11 px-3 my-3 border border-blue-400/40 rounded-lg text-sm"
        onClick={() => {
          setRows(
            value
              .split(/\n/)
              .filter((line) => line.trim())
              .map((line) => ({
                id: crypto.randomUUID(),
                ...channelDraft(line),
              })),
          );
          setError("");
          setOpen(true);
        }}
      >
        Selecionar canais e redes
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl bg-[#090e17] text-white border-white/15 p-4 sm:p-6 flex flex-col overflow-hidden [&>button:last-child]:min-h-11 [&>button:last-child]:min-w-11 [&>button:last-child]:right-1 [&>button:last-child]:top-1">
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              Escolha o tipo para usar o símbolo de marca e o link correto.
              Aplicar altera apenas esta proposta.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 overflow-y-auto space-y-4 pr-1">
            <div className="space-y-4">
              {rows.map((row, index) => {
                const Icon = channelIcons[row.kind];
                return (
                  <div
                    key={row.id}
                    className="rounded-xl p-3 border border-white/15 space-y-3"
                  >
                    <div className="flex flex-wrap gap-2 items-center">
                      <span
                        style={{ backgroundColor: channelColors[row.kind] }}
                        className="p-3 rounded-xl"
                      >
                        <Icon size={24} aria-hidden="true" />
                      </span>
                      <label className="flex-1 min-w-32 text-xs">
                        Tipo de canal
                        <select
                          aria-label={`Tipo do canal ${index + 1}`}
                          value={row.kind}
                          onChange={(event) =>
                            patch(row.id, {
                              kind: event.target.value as ProposalChannelKind,
                            })
                          }
                          className="block w-full min-h-11 mt-1 bg-[#18243a] rounded-lg p-2"
                        >
                          {Object.entries(PROPOSAL_CHANNELS).map(
                            ([key, item]) => (
                              <option key={key} value={key}>
                                {item.label}
                              </option>
                            ),
                          )}
                        </select>
                      </label>
                      <div className="flex">
                        <button
                          type="button"
                          disabled={!index}
                          aria-label={`Subir canal ${index + 1}`}
                          onClick={() => move(index, -1)}
                          className="min-h-11 min-w-11 disabled:opacity-30"
                        >
                          <ArrowUp size={17} className="mx-auto" />
                        </button>
                        <button
                          type="button"
                          disabled={index === rows.length - 1}
                          aria-label={`Descer canal ${index + 1}`}
                          onClick={() => move(index, 1)}
                          className="min-h-11 min-w-11 disabled:opacity-30"
                        >
                          <ArrowDown size={17} className="mx-auto" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Remover canal ${index + 1}`}
                          onClick={() =>
                            setRows((current) =>
                              current.filter((item) => item.id !== row.id),
                            )
                          }
                          className="min-h-11 min-w-11 text-red-300"
                        >
                          <Trash2 size={17} className="mx-auto" />
                        </button>
                      </div>
                    </div>
                    <label className="block text-xs">
                      Endereço, perfil ou número
                      <input
                        aria-label={`Valor do canal ${index + 1}`}
                        value={row.value}
                        maxLength={2000}
                        placeholder={PROPOSAL_CHANNELS[row.kind].hint}
                        onChange={(event) =>
                          patch(row.id, { value: event.target.value })
                        }
                        className="block w-full min-h-11 bg-white/5 border border-white/15 p-3 mt-1 rounded-lg text-sm"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
            {!rows.length && (
              <p className="text-sm text-white/50">
                Adicione os canais que deseja apresentar.
              </p>
            )}
            <button
              type="button"
              disabled={rows.length >= 20}
              onClick={() =>
                setRows((current) => [
                  ...current,
                  { id: crypto.randomUUID(), kind: "whatsapp", value: "" },
                ])
              }
              className="min-h-11 border border-white/20 rounded-lg flex gap-2 items-center justify-center"
            >
              <Plus size={16} />
              Adicionar canal
            </button>
            {error && (
              <p role="alert" className="text-sm text-amber-300">
                {error}
              </p>
            )}
          </div>
          <div className="shrink-0 flex flex-wrap justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="min-h-11 px-4 border rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="min-h-11 px-4 bg-blue-600 rounded-lg font-bold"
              onClick={() => {
                const next = serializeChannels(rows);
                const invalid = rows.findIndex(
                  (row) =>
                    row.value.trim() &&
                    row.kind !== "other" &&
                    !proposalChannel(serializeChannels([row])).href,
                );
                if (invalid >= 0) {
                  setError(
                    `Revise o endereço ou número do canal ${invalid + 1}.`,
                  );
                  return;
                }
                if (next.length > 20000) {
                  setError("O conteúdo excede o limite desta seção.");
                  return;
                }
                onChange(next);
                setOpen(false);
              }}
            >
              Aplicar canais
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
