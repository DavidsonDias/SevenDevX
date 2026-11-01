/** Summary of the returned rows, not property-wide totals (Google may omit or limit rows). */
export function searchConsoleSummary(rows: readonly { clicks: number; impressions: number; position: number }[]) {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  return {
    clicks,
    impressions,
    ctr: impressions ? clicks / impressions * 100 : 0,
    position: impressions ? rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions : 0,
  };
}
