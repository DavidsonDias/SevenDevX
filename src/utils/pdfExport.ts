/**
 * 📄 pdfExport — Client-side PDF generation using html2pdf.js.
 * Funciona em iOS/iPad sem servidor.
 */
import html2pdf from "html2pdf.js";

const sanitize = (name: string) =>
  name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "documento";

const wrapMarkdownHtml = (titleHtml: string, bodyHtml: string) => {
  return `
    <div style="font-family: 'Helvetica', 'Arial', sans-serif; color: #111; padding: 32px; max-width: 720px; margin: 0 auto;">
      <header style="border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 24px; display:flex; justify-content:space-between; align-items:center;">
        <strong style="font-size: 18px; letter-spacing: 2px;">SEVENDEVX</strong>
        <span style="font-size: 11px; color: #666;">${new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</span>
      </header>
      <h1 style="font-size: 22px; margin: 0 0 16px 0;">${titleHtml}</h1>
      <div style="font-size: 13px; line-height: 1.6;">${bodyHtml}</div>
      <footer style="margin-top: 48px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 10px; color: #888; text-align:center;">
        Documento gerado por SevenDevX — sevendevx.com
      </footer>
    </div>
  `;
};

/**
 * Exporta uma string Markdown como PDF profissional.
 * Usa marcação simples (h1/h2/h3, negrito, listas, parágrafos).
 */
export async function exportMarkdownToPdf(opts: {
  title: string;
  markdown: string;
  filename?: string;
}) {
  const { title, markdown, filename } = opts;

  // Conversão markdown → HTML simples (sem dependência extra)
  const html = markdownToHtml(markdown);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = wrapMarkdownHtml(escapeHtml(title), html);
  document.body.appendChild(wrapper);

  try {
    await html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename: `${sanitize(filename || title)}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(wrapper)
      .save();
  } finally {
    document.body.removeChild(wrapper);
  }
}

const escapeHtml = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

/** Conversor Markdown→HTML mínimo, suficiente para contratos e documentos. */
function markdownToHtml(md: string): string {
  let html = escapeHtml(md);

  // Cabeçalhos
  html = html.replace(/^### (.*)$/gm, '<h3 style="font-size:14px;margin:18px 0 6px;">$1</h3>');
  html = html.replace(/^## (.*)$/gm, '<h2 style="font-size:16px;margin:22px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px;">$1</h2>');
  html = html.replace(/^# (.*)$/gm, '<h1 style="font-size:20px;margin:24px 0 12px;text-align:center;text-transform:uppercase;letter-spacing:1px;">$1</h1>');

  // Negrito / itálico
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");

  // Listas
  html = html.replace(/(?:^|\n)(?:- |\* )(.*)/g, "\n<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul style="margin:8px 0 8px 20px;">$1</ul>');

  // Parágrafos (linhas em branco)
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      if (block.trim().startsWith("<h") || block.trim().startsWith("<ul") || block.trim().startsWith("<li")) return block;
      if (!block.trim()) return "";
      return `<p style="margin:8px 0;">${block.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}
