/** @file Selectable-text proposal PDF, with automatic continuation pages. */
import {
  visibleProposalSections,
  proposalChannel,
  proposalWarnings,
  type Proposal,
  type ProposalChannelKind,
} from "@/lib/proposals";

import {
  clearLogoWhiteEdges,
  proposalChannelColors,
} from "@/lib/proposalIdentity";

/** The caller supplies a raster image resolved through the existing private attachment hook. */
export async function createProposalPdf(
  proposal: Proposal,
  logoDataUrl?: string,
  brandDataUrl?: string,
  projectImages: Record<string, string> = {},
  visualAssets: {
    icons?: Partial<Record<ProposalChannelKind, string>>;
    background?: string;
  } = {},
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
    if (proposal.theme === "azure") {
      if (visualAssets.background)
        pdf.addImage(
          visualAssets.background,
          "PNG",
          0,
          0,
          width,
          height,
          "azure-background",
        );
      else {
        pdf.setFillColor("#10264a");
        pdf.rect(width * 0.6, 0, width * 0.4, height, "F");
      }
    }
    pdf.setDrawColor("#17253d");
    pdf.setLineWidth(0.25);
    pdf.circle(286, 18, 63);
    pdf.setFillColor("#3667ff");
    pdf.rect(margin, 18, 1, 5, "F");
    pdf.setTextColor("#88a7ff");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(
      clean(
        `${String(page).padStart(2, "0")} / ${label.toUpperCase()}${continuation ? " / CONTINUAÇÃO" : ""}`,
      ),
      margin + 4,
      22,
    );
    if (brandDataUrl) {
      const image = pdf.getImageProperties(brandDataUrl);
      const scale = Math.min(33 / image.width, 17 / image.height);
      const logoWidth = image.width * scale;
      pdf.addImage(
        brandDataUrl,
        image.fileType,
        width - margin - logoWidth,
        10,
        logoWidth,
        image.height * scale,
        "sevendevx-brand",
      );
    } else {
      pdf.setTextColor("#ffffff");
      pdf.setFontSize(12);
      pdf.text("SEVENDEVX", width - margin, 22, { align: "right" });
    }
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
    if (proposal.logoSurface !== "none") {
      pdf.setFillColor(
        proposal.logoSurface === "light" ? "#ffffff" : "#18243a",
      );
      pdf.roundedRect(margin, y - 4, 51, 30, 2, 2, "F");
    }
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
  const icon = (kind: string, x: number, top: number) => {
    const c = proposalChannelColors[kind as ProposalChannelKind] || "#285cbe";
    pdf.setFillColor(c);
    pdf.roundedRect(x, top, 15, 15, 3, 3, "F");
    const brandIcon = visualAssets.icons?.[kind as ProposalChannelKind];
    if (brandIcon) {
      pdf.addImage(
        brandIcon,
        "PNG",
        x + 2.5,
        top + 2.5,
        10,
        10,
        `channel-${kind}`,
      );
      return;
    }
    pdf.setDrawColor("#ffffff");
    pdf.setLineWidth(0.5);
    if (kind === "email") {
      pdf.rect(x + 3, top + 4, 7, 5);
      pdf.line(x + 3, top + 4, x + 6.5, top + 7);
      pdf.line(x + 10, top + 4, x + 6.5, top + 7);
    } else if (kind === "instagram") {
      pdf.roundedRect(x + 3, top + 3, 7, 7, 2, 2);
      pdf.circle(x + 6.5, top + 6.5, 1.8);
      pdf.circle(x + 8.8, top + 4.3, 0.35);
    } else if (kind === "youtube") {
      pdf.setFillColor("#ffffff");
      pdf.triangle(x + 5, top + 4, x + 5, top + 9, x + 9, top + 6.5, "F");
    } else if (kind === "phone" || kind === "whatsapp") {
      pdf.lines(
        [
          [0, 2],
          [2, 2],
          [2, 0],
          [1, -1],
          [-1, -1],
          [-1, 1],
          [-2, -2],
          [1, -1],
          [-1, -1],
          [-1, 1],
        ],
        x + 4,
        top + 4,
        [1, 1],
        "S",
        false,
      );
    } else if (kind === "linkedin") {
      pdf.setTextColor("#ffffff");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.text("in", x + 3, top + 9);
    } else {
      pdf.circle(x + 6.5, top + 6.5, 3.7);
      pdf.ellipse(x + 6.5, top + 6.5, 1.7, 3.7);
      pdf.line(x + 3, top + 6.5, x + 10, top + 6.5);
    }
  };
  const contain = (
    data: string,
    x: number,
    top: number,
    w: number,
    h: number,
    id: string,
  ) => {
    const image = pdf.getImageProperties(data),
      scale = Math.min(w / image.width, h / image.height);
    pdf.addImage(
      data,
      image.fileType,
      x + (w - image.width * scale) / 2,
      top + (h - image.height * scale) / 2,
      image.width * scale,
      image.height * scale,
      id,
    );
  };
  for (const section of visibleProposalSections(proposal)) {
    const value = proposal[section.key].trim();
    start(section.title);
    if (section.key === "portfolio" && proposal.projects.length) {
      const shortIntro = !!value && value.length <= 160;
      if (shortIntro) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(10);
        pdf.setTextColor("#b6c4d8");
        pdf.text(
          pdf.splitTextToSize(clean(value), width - margin * 2),
          margin,
          34,
        );
      }
      // Three visual cards per page. Long summaries use a wide card without dropping text.
      for (let offset = 0; offset < proposal.projects.length;) {
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(11);
        const group = proposal.projects.slice(offset, offset + 3);
        const w = (width - margin * 2 - 12) / 3;
        const measures = group.map((project) => {
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          const title = pdf.splitTextToSize(
            clean(project.title),
            w - 12,
          ) as string[];
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(11);
          const summary = pdf.splitTextToSize(
            clean(project.summary),
            w - 12,
          ) as string[];
          return {
            title,
            summary,
            height:
              63 +
              title.length * 5 +
              summary.length * 4.2 +
              Math.ceil(project.category.length / 35) * 3.5,
          };
        });
        const wide = measures.some((item) => item.height > bottom - 42);
        const batch = wide ? group.slice(0, 1) : group;
        batch.forEach((project, column) => {
          const x = wide ? margin : margin + column * (w + 6),
            boxWidth = wide ? width - margin * 2 : w;
          const textX = wide ? x + 101 : x + 6,
            textW = wide ? boxWidth - 108 : w - 12;
          pdf.setFillColor("#18243a");
          pdf.roundedRect(x, 42, boxWidth, bottom - 42, 5, 5, "F");
          const data = projectImages[project.id];
          if (data)
            contain(
              data,
              x + 4,
              46,
              wide ? 90 : w - 8,
              wide ? 80 : 31,
              `project-${project.id}`,
            );
          else {
            pdf.setTextColor("#8295b2");
            pdf.setFontSize(10);
            pdf.text("SEM IMAGEM", x + 8, wide ? 75 : 63);
          }
          let cursor = wide ? 51 : 83;
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(14);
          pdf.setTextColor("#ffffff");
          const titles = pdf.splitTextToSize(
            clean(project.title),
            textW,
          ) as string[];
          titles.forEach((line) => {
            pdf.text(line, textX, cursor);
            cursor += 5;
          });
          cursor += 2;
          pdf.setFont("helvetica", "normal");
          pdf.setFontSize(9);
          pdf.setTextColor("#88a7ff");
          const categories = pdf.splitTextToSize(
            clean(project.category),
            textW,
          ) as string[];
          categories.forEach((line) => {
            pdf.text(line, textX, cursor);
            cursor += 3.5;
          });
          cursor += 3;
          pdf.setFontSize(11);
          pdf.setTextColor("#c5d0e0");
          const summaries = pdf.splitTextToSize(
            clean(project.summary),
            textW,
          ) as string[];
          summaries.forEach((line) => {
            pdf.text(line, textX, cursor);
            cursor += 4.2;
          });
          if (project.url) {
            pdf.setFontSize(10);
            pdf.setTextColor("#27ccff");
            pdf.textWithLink(
              "VISITAR PROJETO >",
              textX,
              Math.max(cursor + 6, 132),
              { url: project.url },
            );
          }
        });
        offset += batch.length;
        if (offset < proposal.projects.length) start(section.title, true);
      }
      if (!value || shortIntro) continue;
      start("Portfólio / Apresentação", true);
    }
    write(section.title, 27, "#ffffff", true, section.title);
    pdf.setFillColor("#3667ff");
    pdf.rect(margin, y, 26, 1, "F");
    y += 12;
    if (section.key === "social" || section.key === "contact") {
      y = 65;
      for (const line of value.split(/\n/).filter((line) => line.trim())) {
        const channel = proposalChannel(line);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(15);
        const lines = pdf.splitTextToSize(
          clean(channel.text),
          width - margin * 2 - 39,
        ) as string[];
        let offset = 0;
        while (offset < lines.length) {
          if (y + 20 > bottom) start(section.title, true);
          const count = Math.min(
            lines.length - offset,
            Math.max(1, Math.floor((bottom - y - 10) / 5.5)),
          );
          const boxHeight = Math.max(20, count * 5.5 + 10);
          pdf.setFillColor("#18243a");
          pdf.roundedRect(margin, y, width - margin * 2, boxHeight, 4, 4, "F");
          icon(channel.kind, margin + 5, y + 3.5);
          pdf.setFont("helvetica", "bold");
          pdf.setFontSize(15);
          pdf.setTextColor("#28caff");
          lines
            .slice(offset, offset + count)
            .forEach((text, index) =>
              pdf.text(text, margin + 26, y + 11 + index * 5.5),
            );
          if (channel.href)
            pdf.link(margin, y, width - margin * 2, boxHeight, {
              url: channel.href,
            });
          y += boxHeight + 4;
          offset += count;
        }
      }
      continue;
    }
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
export async function proposalLogoData(
  url: string,
  treatment: Proposal["logoTreatment"] = "original",
): Promise<string> {
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
        if (treatment === "white-edges") {
          const pixels = context.getImageData(
            0,
            0,
            canvas.width,
            canvas.height,
          );
          const trimmed = clearLogoWhiteEdges(
            pixels.data,
            canvas.width,
            canvas.height,
          );
          pixels.data.set(trimmed.data);
          context.putImageData(pixels, 0, 0);
          const result = document.createElement("canvas");
          result.width = trimmed.width + 8;
          result.height = trimmed.height + 8;
          const resultContext = result.getContext("2d");
          if (!resultContext)
            throw new Error("Não foi possível preparar a logo.");
          resultContext.drawImage(
            canvas,
            trimmed.left,
            trimmed.top,
            trimmed.width,
            trimmed.height,
            4,
            4,
            trimmed.width,
            trimmed.height,
          );
          resolve(result.toDataURL("image/png"));
        } else resolve(canvas.toDataURL("image/png"));
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

/** Optional geometric background, generated locally without changing brand artwork. */
export function proposalThemeData(
  theme: Proposal["theme"],
): string | undefined {
  if (theme !== "azure") return undefined;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 675;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível preparar o tema.");
  context.fillStyle = "#080c12";
  context.fillRect(0, 0, 1200, 675);
  const blue = context.createRadialGradient(1200, 0, 0, 1200, 0, 1000);
  blue.addColorStop(0, "#123b79");
  blue.addColorStop(1, "#080c12");
  context.fillStyle = blue;
  context.fillRect(0, 0, 1200, 675);
  const accent = context.createRadialGradient(0, 675, 0, 0, 675, 500);
  accent.addColorStop(0, "#102c4d");
  accent.addColorStop(1, "#102c4d00");
  context.fillStyle = accent;
  context.fillRect(0, 0, 1200, 675);
  return canvas.toDataURL("image/png");
}
