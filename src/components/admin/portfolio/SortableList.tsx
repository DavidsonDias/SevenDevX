/**
 * 🚀 SortableList.tsx — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file src/components/admin/portfolio/SortableList.tsx
 * @module SevenOS/UI
 * @layer Presentation
 * @status Active
 *
 * @description
 * Primitiva universal de ordenação do módulo Portfólio: drag-and-drop
 * (mouse/touch/teclado) + campo "Posição" numérico, ambos escrevendo na
 * MESMA fonte canônica — a ordem do array de ids entregue ao consumidor.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Posições são sempre 1..n, consecutivas, sem duplicidade nem zero
 * 🔒 Drag e posição numérica NUNCA são fontes distintas de ordem
 * 🔒 O drag jamais é o único caminho: o input numérico é a via acessível
 *
 * @updated 2026-08-28
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { useState, type ReactNode } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, TouchSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

export type SortableListProps<T> = {
  items: T[];
  getId: (item: T) => string;
  /** Recebe a nova ordem canônica completa (1..n implícito pelo índice). */
  onReorder: (orderedIds: string[]) => void;
  renderItem: (item: T, index: number, controls: ReactNode) => ReactNode;
  disabled?: boolean;
  className?: string;
};

// ============================================================================
// 🧱 SUBCOMPONENTS
// ============================================================================

/** Campo "Posição": alternativa acessível e determinística ao drag. */
export function PositionInput({
  index, total, onMove, label,
}: { index: number; total: number; onMove: (to: number) => void; label: string }) {
  const [draft, setDraft] = useState<string>(String(index + 1));

  // 🔒 Mantém o input sincronizado quando a lista é reordenada por outro caminho.
  const shown = document.activeElement instanceof HTMLInputElement && document.activeElement.dataset.pos === label
    ? draft
    : String(index + 1);

  const commit = (raw: string) => {
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    const clamped = Math.min(Math.max(Math.round(n), 1), total);
    if (clamped - 1 !== index) onMove(clamped - 1);
  };

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={total}
      data-pos={label}
      value={shown}
      aria-label={`Posição de ${label}`}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
      className="w-12 h-9 shrink-0 rounded-md border border-border bg-background/40 text-center text-xs outline-none focus-visible:border-foreground/60 focus-visible:ring-1 focus-visible:ring-foreground/30"
    />
  );
}

/** Linha arrastável — expõe o handle para o consumidor posicionar. */
function Row<T>({
  item, index, total, getId, renderItem, onMove, disabled,
}: {
  item: T; index: number; total: number;
  getId: (i: T) => string;
  renderItem: SortableListProps<T>["renderItem"];
  onMove: (from: number, to: number) => void;
  disabled?: boolean;
}) {
  const id = getId(item);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled });

  const controls = (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        ref={setNodeRef as unknown as React.Ref<HTMLButtonElement>}
        {...attributes}
        {...listeners}
        aria-label={`Arrastar para reordenar (posição ${index + 1} de ${total})`}
        className="h-9 w-7 grid place-items-center rounded-md text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-grab active:cursor-grabbing touch-none focus-visible:ring-1 focus-visible:ring-foreground/40 disabled:opacity-30"
        disabled={disabled}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <PositionInput index={index} total={total} label={id} onMove={(to) => onMove(index, to)} />
    </div>
  );

  return (
    <li
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={isDragging ? "relative z-10 opacity-80" : undefined}
    >
      {renderItem(item, index, controls)}
    </li>
  );
}

// ============================================================================
// 🏗️ MAIN COMPONENT
// ============================================================================

/** Lista ordenável reutilizada por Stack, Projetos, Carreira e coleções. */
export default function SortableList<T>({
  items, getId, onReorder, renderItem, disabled, className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = items.map(getId);

  const move = (from: number, to: number) => {
    if (to < 0 || to >= ids.length || to === from) return;
    onReorder(arrayMove(ids, from, to));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={className ?? "space-y-2"}>
          {items.map((item, i) => (
            <Row
              key={getId(item)}
              item={item}
              index={i}
              total={items.length}
              getId={getId}
              renderItem={renderItem}
              onMove={move}
              disabled={disabled}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
