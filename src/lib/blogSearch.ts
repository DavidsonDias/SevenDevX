/** Search treats accents and repeated whitespace consistently across public locales. */
export function normalizeBlogSearch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim().replace(/\s+/g, ' ');
}
