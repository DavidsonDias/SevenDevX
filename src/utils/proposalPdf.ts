/** @file Selectable-text proposal PDF, with automatic continuation pages. */
import {
  PROPOSAL_SECTIONS,
  proposalWarnings,
  type Proposal,
} from "@/lib/proposals";

/** The caller supplies a raster image resolved through the existing private attachment hook. */
export async function createProposalPdf(
  proposal: Proposal,
  logoDataUrl?: string,
) {
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: [297, 167.0625],
    compress: true,
  });
  const width = 297,
    height = 167.0625,
    margin = 22,
    bottom = 143;
  const company = proposal.company || proposal.clientName || "Cliente";
  const clean = (value: string) =>
    [...value]
      .filter(
        (char) => char.charCodeAt(0) >= 32 || char === "\n" || char === "\t",
      )
      .join("")
      .replace(/[•]/g, "-")
      .replace(/[↗→]/g, ">");
  let y = 0;
  let page = 0;
  const start = (label: string, continuation = false) => {
    if (page++) pdf.addPage();
    pdf.setFillColor("#080c12");
    pdf.rect(0, 0, width, height, "F");
    pdf.setDrawColor("#17253d");
    pdf.setLineWidth(0.25);
    pdf.circle(286, 18, 63);
    pdf.setFillColor("#3667ff");
    pdf.rect(margin, 18, 1, 5, "F");
    pdf.setTextColor("#88a7ff");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(
      clean(label.toUpperCase() + (continuation ? " / CONTINUAÇÃO" : "")),
      margin + 4,
      22,
    );
    pdf.setTextColor("#ffffff");
    pdf.setFontSize(12);
    pdf.text("SEVENDEVX", width - margin, 22, { align: "right" });
    pdf.setDrawColor("#243044");
    pdf.line(margin, 152, width - margin, 152);
    pdf.setTextColor("#8793a6");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const footer = pdf.splitTextToSize(clean(`SEVENDEVX / ${company}`), 180)[0];
    pdf.text(footer, margin, 160);
    pdf.text(String(page).padStart(2, "0"), width - margin, 160, {
      align: "right",
    });
    y = 42;
  };
  const write = (
    value: string,
    size: number,
    color: string,
    bold = false,
    label = "",
  ) => {
    pdf.setFont("helvetica", bold ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(
      clean(value),
      width - margin * 2,
    );
    for (const line of lines) {
      if (y + size * 0.42 > bottom) start(label, true);
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(color);
      pdf.text(line, margin, y);
      y += size * 0.48;
    }
    y += 5;
  };
  const card = (value: string, label: string, financial = false) => {
    const size = financial && value.length < 100 ? 28 : 15;
    const lineHeight = size * 0.48;
    pdf.setFont("helvetica", financial ? "bold" : "normal");
    pdf.setFontSize(size);
    const lines: string[] = pdf.splitTextToSize(
      clean(value),
      width - margin * 2 - 22,
    );
    let offset = 0;
    while (offset < lines.length) {
      if (bottom - y < lineHeight + 22) start(label, true);
      const count = Math.min(
        lines.length - offset,
        Math.max(1, Math.floor((bottom - y - 16) / lineHeight)),
      );
      const boxHeight = count * lineHeight + 16;
      pdf.setFillColor(financial ? "#112954" : "#151d2a");
      pdf.roundedRect(margin, y, width - margin * 2, boxHeight, 4, 4, "F");
      pdf.setFillColor("#3667ff");
      pdf.rect(margin + 4, y + 7, 1, 5, "F");
      pdf.setFont("helvetica", financial ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor("#e2e8f4");
      for (let line = 0; line < count; line++)
        pdf.text(lines[offset + line], margin + 11, y + 11 + line * lineHeight);
      offset += count;
      y += boxHeight + 5;
    }
  };
  const cardGrid = (paragraphs: string[], label: string) => {
    const gap = 6,
      boxWidth = (width - margin * 2 - gap) / 2,
      lineHeight = 6.4;
    for (let row = 0; row < paragraphs.length; row += 2) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      const cells = paragraphs
        .slice(row, row + 2)
        .map(
          (value) =>
            pdf.splitTextToSize(clean(value), boxWidth - 16) as string[],
        );
      const boxHeight =
        Math.max(...cells.map((lines) => lines.length)) * lineHeight + 18;
      if (y + boxHeight > bottom) start(label, true);
      cells.forEach((lines, column) => {
        const x = margin + column * (boxWidth + gap);
        pdf.setFillColor("#151d2a");
        pdf.roundedRect(x, y, boxWidth, boxHeight, 4, 4, "F");
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9);
        pdf.setTextColor("#88a7ff");
        pdf.text(String(row + column + 1).padStart(2, "0"), x + 8, y + 9);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(14);
        pdf.setTextColor("#e2e8f4");
        lines.forEach((line, index) =>
          pdf.text(line, x + 8, y + 17 + index * lineHeight),
        );
      });
      y += boxHeight + gap;
    }
  };
  start("Proposta comercial / Desenvolvimento digital");
  if (logoDataUrl && /^data:image\/(png|jpeg);base64,/.test(logoDataUrl)) {
    const image = pdf.getImageProperties(logoDataUrl);
    const scale = Math.min(45 / image.width, 24 / image.height);
    pdf.setFillColor("#ffffff");
    pdf.roundedRect(margin, y - 4, 51, 30, 2, 2, "F");
    pdf.addImage(
      logoDataUrl,
      image.fileType,
      margin + 3,
      y - 1,
      image.width * scale,
      image.height * scale,
    );
    y += 40;
  }
  write(
    proposal.headline || proposal.title,
    26,
    "#ffffff",
    true,
    "Apresentação",
  );
  write(proposal.title, 16, "#88a7ff", false, "Apresentação");
  write(
    `Preparada para ${company}${proposal.clientName && company !== proposal.clientName ? ` / ${proposal.clientName}` : ""}`,
    12,
    "#c5cdda",
    false,
    "Apresentação",
  );
  write(
    `Emissão: ${proposal.issuedOn || "A definir"}    |    Validade: ${proposal.validUntil || "A definir"}`,
    10,
    "#a5b0c2",
    false,
    "Apresentação",
  );
  const clientContact = [proposal.email, proposal.phone]
    .filter(Boolean)
    .join(" | ");
  if (clientContact)
    write(clientContact, 10, "#a5b0c2", false, "Contato do cliente");
  const warnings = proposalWarnings(proposal);
  if (warnings.length)
    write(
      `RASCUNHO - revisar: ${warnings.join(", ")}.`,
      10,
      "#f1c56b",
      false,
      "Apresentação",
    );
  for (const [index, section] of PROPOSAL_SECTIONS.entries()) {
    const value = proposal[section.key].trim();
    if (!value) continue;
    start(`${String(index + 1).padStart(2, "0")} / ${section.title}`);
    write(section.title, 27, "#ffffff", true, section.title);
    pdf.setFillColor("#3667ff");
    pdf.rect(margin, y, 26, 1, "F");
    y += 12;
    const paragraphs = value.split(/\n\s*\n|\n/).filter((line) => line.trim());
    if (
      paragraphs.length > 1 &&
      paragraphs.length <= 8 &&
      paragraphs.every((line) => line.length <= 250)
    )
      cardGrid(paragraphs, section.title);
    else
      for (const paragraph of paragraphs)
        card(paragraph, section.title, section.key === "investment");
  }
  pdf.setProperties({
    title: proposal.title,
    subject: `Proposta comercial para ${company}`,
    author: "SevenDevX",
    creator: "SevenOS",
  });
  return pdf;
}

/** Resolve only an already-authorized raster attachment; SVG and arbitrary HTML are excluded. */
export async function proposalLogoData(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    const timeout = window.setTimeout(() => {
      image.src = "";
      reject(
        new Error(
          "A logo não carregou. Tente novamente ou escolha “Sem logo”.",
        ),
      );
    }, 12000);
    image.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        const scale = Math.min(
          1,
          800 / Math.max(image.naturalWidth, image.naturalHeight),
        );
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Não foi possível preparar a logo.");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        reject(
          new Error(
            "Não foi possível preparar a logo. Escolha outro arquivo PNG/JPEG/WebP.",
          ),
        );
      }
    };
    image.onerror = () => {
      clearTimeout(timeout);
      reject(
        new Error(
          "Logo indisponível. Atualize os anexos ou escolha “Sem logo”.",
        ),
      );
    };
    image.src = url;
  });
}

export function proposalFilename(proposal: Proposal) {
  const name = (proposal.company || proposal.clientName || proposal.title)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .slice(0, 70);
  return `Proposta-SevenDevX-${name || "cliente"}.pdf`;
}
