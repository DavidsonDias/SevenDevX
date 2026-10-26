/** @file Accessible client side panel; the available panel width governs the content layout. */
import type { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { confirmLeaveEdits } from "@/lib/unsavedChanges";

export default function ClientWorkspace({
  client,
  onClose,
  children,
}: {
  client: {
    name: string;
    company?: string | null;
    email?: string | null;
    phone?: string | null;
  };
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open && confirmLeaveEdits()) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-3xl p-0 flex flex-col overflow-hidden h-[var(--sevenos-viewport-height,100dvh)] [&>button]:min-h-11 [&>button]:min-w-11"
      >
        <header className="shrink-0 border-b border-white/10 p-5 pr-16">
          <SheetTitle className="break-words">{client.name}</SheetTitle>
          <SheetDescription className="mt-1 break-words">
            {client.company || "Perfil do cliente"}
          </SheetDescription>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60 mt-3 break-all">
            {client.email && (
              <a href={`mailto:${client.email}`}>{client.email}</a>
            )}
            {client.phone && <span>{client.phone}</span>}
          </div>
        </header>
        <div className="p-4 sm:p-6 space-y-6 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}
