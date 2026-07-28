/**
 * ⚙️ useSystemSettings.ts — SevenOS
 *
 * @file useSystemSettings.ts
 * @module Platform/Settings
 *
 * @description
 * Leitura e escrita das configurações globais (`system_settings`),
 * expostas como um mapa `chave → valor`.
 *
 * @security
 *   A tabela é restrita a administradores por RLS. Uma escrita feita por
 *   usuário sem papel admin falha no banco — o retorno booleano do
 *   `setSetting` reflete esse resultado; não presuma sucesso.
 *
 * @sideEffects
 *   `setSetting` faz upsert com `onConflict: "key"` e atualiza o estado local.
 *
 * @see docs/database/TABLES.md
 */
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export type SettingsMap = Record<string, any>;

export function useSystemSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("system_settings").select("key, value");
    const map: SettingsMap = {};
    for (const r of data ?? []) map[r.key] = r.value;
    setSettings(map);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setSetting = useCallback(async (key: string, value: any) => {
    const { error } = await supabase
      .from("system_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (!error) setSettings((p) => ({ ...p, [key]: value }));
    return !error;
  }, []);

  return { settings, loading, setSetting, reload: load };
}
