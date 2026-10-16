export type BankCsvRow = { date: string; description: string; amount: number };

/** Three-column bank CSV; quoted separators stay inside their field. */
export function parseBankCsv(text: string): BankCsvRow[] {
  const input = text.replace(/^\uFEFF/, "");
  if (!input.trim()) return [];
  const header = input;
  const separators = { ";": 0, "\t": 0 };
  let inQuotes = false;
  for (let i = 0; i < header.length; i++) {
    if (header[i] === '"') {
      if (inQuotes && header[i + 1] === '"') i++;
      else inQuotes = !inQuotes;
    } else if (!inQuotes && (header[i] === "\n" || header[i] === "\r")) break;
    else if (!inQuotes && (header[i] === ";" || header[i] === "\t")) separators[header[i]]++;
  }
  const delimiter = separators[";"] >= 2 ? ";" : separators["\t"] >= 2 ? "\t" : ",";
  const records: string[][] = [];
  let row: string[] = [], field = "", quoted = false, closed = false;
  function finishField() { row.push(field.trim()); field = ""; closed = false; }
  function finishRow() { finishField(); if (row.some(Boolean)) records.push(row); row = []; }
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') { field += '"'; i++; }
      else if (char === '"') { quoted = false; closed = true; }
      else field += char;
    } else if (char === delimiter) finishField();
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[i + 1] === "\n") i++;
      finishRow();
    } else if (char === '"' && !field.trim() && !closed) { field = ""; quoted = true; }
    else if (char === '"' || (closed && char.trim())) throw new Error("CSV com aspas inválidas.");
    else if (!closed) field += char;
  }
  if (quoted) throw new Error("CSV com aspas não fechadas.");
  if (field || row.length || closed) finishRow();
  if (records[0] && /^(data|date)$/i.test(records[0][0])) records.shift();
  return records.map((columns, index) => {
    const invalid = () => new Error(`Linha de dados ${index + 1} inválida. Use três colunas: data, descrição e valor.`);
    if (columns.length !== 3) throw invalid();
    const [dateText, description, moneyText] = columns;
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateText);
    const brDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(dateText);
    const date = dateMatch ? dateText : brDate ? `${brDate[3]}-${brDate[2]}-${brDate[1]}` : "";
    const parsedDate = new Date(`${date}T00:00:00.000Z`);
    if (!date || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== date || !description) throw invalid();
    const money = moneyText.replace(/^R\$\s*/, "").trim();
    let normalized: string;
    if (/^[+-]?(?:\d+|\d{1,3}(?:\.\d{3})+),\d{1,2}$/.test(money)) normalized = money.replace(/\./g, "").replace(",", ".");
    else if (/^[+-]?\d{1,3}(?:\.\d{3})+$/.test(money)) normalized = money.replace(/\./g, "");
    else if (/^[+-]?\d+(?:\.\d{1,2})?$/.test(money)) normalized = money;
    else throw invalid();
    const amount = Number(normalized);
    if (!Number.isFinite(amount) || !Number.isSafeInteger(Math.round(amount * 100))) throw invalid();
    return { date, description, amount };
  });
}
