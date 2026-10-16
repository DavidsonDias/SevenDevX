export function summarizeProviderHealth(rows: { is_active: boolean | null; health_status: string | null }[]) {
  const active = rows.filter(row => row.is_active === true);
  const healthy = active.filter(row => row.health_status === 'operational' || row.health_status === 'ok').length;
  const degraded = active.filter(row => ['offline', 'warning', 'error', 'down'].includes(row.health_status ?? '')).length;
  return { active: active.length, healthy, degraded, unknown: active.length - healthy - degraded };
}