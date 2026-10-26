import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const source = fs.readFileSync(new URL(file, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText;
  const exports = {};
  new Function("exports", "require", compiled)(
    exports,
    (name) => imports[name] || require(name),
  );
  return exports;
}
const model = load("../src/lib/proposals.ts");
const identity = load("../src/lib/proposalIdentity.ts");
const pdf = load("../src/utils/proposalPdf.ts", {
  "@/lib/proposals": model,
  "@/lib/proposalIdentity": identity,
});
const persistence = load("../src/lib/proposalPersistence.ts", {
  "./proposals": model,
});
const source = {
  project: {
    title: "Site Aurora",
    description: "Catálogo responsivo para uma marca fictícia.",
    budget: 2400,
  },
  client: { name: "Ana Exemplo", company: "Aurora", email: "ana@example.com" },
};

test("autofill uses linked client and briefing without inventing payment, dates or promises", () => {
  const value = model.createProposal(
    {
      ...source,
      documents: [
        { type: "briefing", content: "Briefing validado pelo cliente" },
        { type: "technical_scope", content: "Até 30 produtos" },
      ],
    },
    new Date("2026-10-26T12:00:00Z"),
  );
  assert.equal(value.clientName, "Ana Exemplo");
  assert.equal(value.overview, "Briefing validado pelo cliente");
  assert.equal(value.deliverables, "Até 30 produtos");
  assert.equal(value.payment, "");
  assert.equal(value.validUntil, "");
  assert.equal(value.issuedOn, "2026-10-26");
  assert.match(value.investment, /2.400/);
});
test("no linked client or zero budget is represented as unknown, not a free offer", () => {
  const value = model.createProposal({ project: { title: "Novo", budget: 0 } });
  assert.equal(value.clientName, "");
  assert.equal(value.investment, "");
  assert.ok(model.proposalWarnings(value).includes("Investimento"));
});
test("only versioned, validated proposal metadata is accepted; contracts and corrupt payloads are ignored", () => {
  const proposal = model.createProposal(source);
  assert.deepEqual(
    model.readProposal({ kind: model.PROPOSAL_KIND, proposal }),
    proposal,
  );
  for (const metadata of [
    null,
    {},
    { kind: "contract", proposal },
    { kind: model.PROPOSAL_KIND, proposal: { schema: 99 } },
    {
      kind: model.PROPOSAL_KIND,
      proposal: { ...proposal, overview: "a".repeat(20001) },
    },
  ])
    assert.equal(model.readProposal(metadata), null);
});
test("Markdown fallback preserves all commercial content for existing document tools", () => {
  const proposal = {
    ...model.createProposal(source),
    support: "15 dias, somente correções",
    exclusions: "Hospedagem à parte",
    evolution: "Loja futura com orçamento próprio",
  };
  const markdown = model.proposalMarkdown(proposal);
  assert.match(markdown, /Hospedagem à parte/);
  assert.match(markdown, /Loja futura com orçamento próprio/);
  assert.match(markdown, /ana@example.com/);
});
test("all six workflow stages have specific outputs and review criteria", () => {
  assert.deepEqual(Object.keys(model.STAGE_GUIDES), [
    "discovery",
    "strategy",
    "proposal",
    "design",
    "development",
    "launch",
  ]);
  for (const guide of Object.values(model.STAGE_GUIDES)) {
    assert.ok(guide.goal.length > 25);
    assert.equal(guide.outputs.length, 3);
    assert.ok(guide.ready.length > 30);
  }
});
test("PDF is landscape, contains selectable text and marks incomplete proposals as drafts", async () => {
  const doc = await pdf.createProposalPdf(model.createProposal(source));
  assert.equal(doc.internal.pageSize.getWidth().toFixed(0), "297");
  const pages = doc.internal.pages.flat().join("\n");
  assert.match(pages, /RASCUNHO/);
  assert.match(pages, /Aurora/);
  assert.match(pages, /Site Aurora/);
  assert.ok(doc.getNumberOfPages() >= 4);
});
test("long content continues on new pages without dropping the final line", async () => {
  const proposal = {
    ...model.createProposal(source),
    deliverables:
      Array.from(
        { length: 180 },
        (_, i) =>
          `Entrega ${i + 1}: descrição detalhada para validar paginação e leitura.`,
      ).join("\n") + "\nMARCADOR-FINAL-DO-ESCOPO",
  };
  const doc = await pdf.createProposalPdf(proposal);
  assert.ok(doc.getNumberOfPages() > 10);
  assert.match(
    doc.internal.pages.flat().join("\n"),
    /MARCADOR-FINAL-DO-ESCOPO/,
  );
});
test("export filenames cannot escape directories or contain client punctuation", () => {
  assert.equal(
    pdf.proposalFilename({
      ...model.createProposal(source),
      company: "../../Joias & Cia",
    }),
    "Proposta-SevenDevX--Joias-Cia.pdf",
  );
});

function repository({ rows = [], readError = null, writeError = null } = {}) {
  const writes = [],
    filters = [];
  const query = {
    select: () => query,
    eq: (column, value) => {
      filters.push([column, value]);
      return query;
    },
    order: async () => ({ data: rows, error: readError }),
    insert: (payload) => {
      writes.push(payload);
      return {
        select: () => ({
          single: async () => ({
            data: {
              id: "new-id",
              created_at: "2026-10-26",
              version: payload.version,
            },
            error: writeError,
          }),
        }),
      };
    },
  };
  return {
    db: {
      from: (name) => {
        assert.equal(name, "stage_documents");
        return query;
      },
    },
    writes,
    filters,
  };
}
const scope = {
  projectId: "project-aurora",
  stageId: "proposal-aurora",
  actorId: "admin-example",
};
test("save appends a new scoped snapshot with readable fallback, leaving previous records and contracts untouched", async () => {
  const proposal = model.createProposal(source);
  const repo = repository({
    rows: [
      {
        id: "previous",
        version: 2,
        metadata: { kind: model.PROPOSAL_KIND, proposal },
      },
    ],
  });
  const saved = await persistence.appendProposalSnapshot(
    repo.db,
    scope,
    proposal,
    "previous",
  );
  assert.equal(saved.version, 3);
  assert.equal(repo.writes.length, 1);
  assert.deepEqual(repo.filters, [
    ["project_id", scope.projectId],
    ["stage_id", scope.stageId],
  ]);
  assert.equal(repo.writes[0].type, "custom");
  assert.equal(repo.writes[0].generated_by_ai, false);
  assert.equal(repo.writes[0].created_by, scope.actorId);
  assert.match(repo.writes[0].content, /Ana Exemplo/);
  assert.ok(!("id" in repo.writes[0]));
});
test("a stale editor refuses a write rather than replacing a newer snapshot", async () => {
  const proposal = model.createProposal(source);
  const repo = repository({
    rows: [
      {
        id: "newer",
        version: 3,
        metadata: { kind: model.PROPOSAL_KIND, proposal },
      },
    ],
  });
  await assert.rejects(
    persistence.appendProposalSnapshot(repo.db, scope, proposal, "previous"),
    /versão mais recente/,
  );
  assert.equal(repo.writes.length, 0);
});
test("read and write failures surface without a false save result", async () => {
  const proposal = model.createProposal(source);
  const failedRead = repository({ readError: new Error("read unavailable") });
  await assert.rejects(
    persistence.appendProposalSnapshot(failedRead.db, scope, proposal, null),
    /read unavailable/,
  );
  assert.equal(failedRead.writes.length, 0);
  const failedWrite = repository({ writeError: new Error("RLS denied") });
  await assert.rejects(
    persistence.appendProposalSnapshot(failedWrite.db, scope, proposal, null),
    /RLS denied/,
  );
});
test("invalid drafts are rejected before database access", async () => {
  const repo = repository();
  await assert.rejects(
    persistence.appendProposalSnapshot(repo.db, scope, { schema: 9 }, null),
  );
  assert.equal(repo.filters.length, 0);
  assert.equal(repo.writes.length, 0);
});

test("earlier snapshots remain readable without the new institutional sections", () => {
  const earlier = { ...model.createProposal(source) };
  delete earlier.differentiators;
  delete earlier.growth;
  delete earlier.social;
  const parsed = model.readProposal({
    kind: model.PROPOSAL_KIND,
    proposal: earlier,
  });
  assert.ok(parsed);
  assert.equal(parsed.differentiators, "");
  assert.equal(parsed.overview, earlier.overview);
});

test("institutional logo is embedded on every page, including long-content continuations", async () => {
  const brand =
    "data:image/png;base64," +
    fs
      .readFileSync(
        new URL("../src/assets/proposal-brand.png", import.meta.url),
      )
      .toString("base64");
  const proposal = {
    ...model.createProposal(source),
    deliverables: Array.from(
      { length: 150 },
      (_, i) =>
        `Entrega ${i}: conteúdo extenso para testar as continuações da proposta.`,
    ).join("\n"),
  };
  const doc = await pdf.createProposalPdf(proposal, undefined, brand);
  assert.ok(doc.getNumberOfPages() > 10);
  for (const page of doc.internal.pages.slice(1))
    assert.match(
      page.join("\n"),
      /\/I\d+ Do/,
      "every PDF page must draw the corporate logo",
    );
});

test("sparse sections produce consecutive page labels without empty pages", async () => {
  const proposal = model.createProposal(source);
  for (const section of model.PROPOSAL_SECTIONS) proposal[section.key] = "";
  proposal.overview = "Primeiro conteúdo";
  proposal.evolution = "Segundo conteúdo";
  proposal.nextSteps = "Terceiro conteúdo";
  assert.deepEqual(
    model.visibleProposalSections(proposal).map((item) => item.key),
    ["overview", "evolution", "nextSteps"],
  );
  const doc = await pdf.createProposalPdf(proposal);
  assert.equal(doc.getNumberOfPages(), 4);
  doc.internal.pages
    .slice(1)
    .forEach((page, index) =>
      assert.match(
        page.join("\n"),
        new RegExp(`${String(index + 1).padStart(2, "0")} / `),
      ),
    );
});
test("project-only portfolio is included and snapshots retain their own presentation data", async () => {
  const proposal = model.createProposal(source);
  for (const section of model.PROPOSAL_SECTIONS) proposal[section.key] = "";
  proposal.projects = [
    {
      id: "aurora",
      title: "Aurora",
      summary: "Uma vitrine para a marca.",
      category: "Institucional",
      image: "",
      url: "https://example.com",
    },
  ];
  assert.deepEqual(
    model.visibleProposalSections(proposal).map((item) => item.key),
    ["portfolio"],
  );
  assert.match(model.proposalMarkdown(proposal), /Uma vitrine/);
  const saved = model.readProposal({ kind: model.PROPOSAL_KIND, proposal });
  proposal.projects[0].summary = "Mudança posterior";
  assert.equal(saved.projects[0].summary, "Uma vitrine para a marca.");
  const doc = await pdf.createProposalPdf(saved);
  assert.equal(doc.getNumberOfPages(), 2);
  assert.match(doc.output(), /https:\/\/example.com/);
});
test("legacy snapshots default to no linked projects and unsafe project URLs are removed", () => {
  const proposal = model.createProposal(source);
  delete proposal.projects;
  assert.deepEqual(
    model.readProposal({ kind: model.PROPOSAL_KIND, proposal }).projects,
    [],
  );
  for (const image of [
    "javascript:alert(1)",
    "https://example.com/storage/v1/object/sign/private/image?token=secret",
    "https://example.com/image?signature=secret",
    "//evil.example/image",
  ])
    assert.equal(model.safeProposalImage(image), "");
  assert.equal(model.safeProposalImage("local:Roane.jpg"), "local:Roane.jpg");
  assert.equal(model.safeProposalLink("javascript:alert(1)"), "");
});
test("contacts produce safe actionable links and recognizable channel kinds", () => {
  assert.equal(
    model.proposalChannel("Instagram: @sevendevx").kind,
    "instagram",
  );
  assert.equal(
    model.proposalChannel("E-mail: contato@example.com").href,
    "mailto:contato@example.com",
  );
  assert.equal(
    model.proposalChannel("www.sevendevx.com").href,
    "https://www.sevendevx.com/",
  );
  assert.equal(
    model.proposalChannel("YouTube: @sevendevxx").href,
    "https://www.youtube.com/@sevendevxx",
  );
  assert.equal(model.proposalChannel("javascript:alert(1)").href, "");
});
test("portfolio pagination preserves all project titles and long summaries with raster art and clickable links", async () => {
  const proposal = model.createProposal(source);
  for (const section of model.PROPOSAL_SECTIONS) proposal[section.key] = "";
  const brand =
    "data:image/png;base64," +
    fs
      .readFileSync(
        new URL("../src/assets/proposal-brand.png", import.meta.url),
      )
      .toString("base64");
  proposal.projects = Array.from({ length: 7 }, (_, i) => ({
    id: `case-${i}`,
    title: `Projeto-${i}`,
    summary:
      i === 3 ? "Resumo extenso ".repeat(28) + "FIM-RESUMO" : `Resumo-${i}`,
    category: "Institucional",
    image: "/logo-192.png",
    url: `https://example.com/${i}`,
  }));
  const doc = await pdf.createProposalPdf(
    proposal,
    undefined,
    brand,
    Object.fromEntries(proposal.projects.map((p) => [p.id, brand])),
  );
  const output = doc.internal.pages.flat().join("\n") + doc.output();
  for (const project of proposal.projects)
    assert.match(output, new RegExp(project.title));
  assert.match(output, /FIM-RESUMO/);
  assert.ok(doc.getNumberOfPages() >= 4);
  for (const page of doc.internal.pages.slice(1))
    assert.match(page.join("\n"), /\/I\d+ Do/);
});

test("long contact text continues without loss and three short contacts share one page", async () => {
  const proposal = model.createProposal(source);
  for (const section of model.PROPOSAL_SECTIONS) proposal[section.key] = "";
  proposal.contact =
    "WhatsApp: (31) 98474-0625\nE-mail: contato@example.com\nwww.sevendevx.com";
  let doc = await pdf.createProposalPdf(proposal);
  assert.equal(doc.getNumberOfPages(), 2);
  assert.match(doc.output(), /https:\/\/wa.me\/5531984740625/);
  proposal.contact = "Informações de contato ".repeat(300) + "FIM-CONTATO";
  doc = await pdf.createProposalPdf(proposal);
  assert.ok(doc.getNumberOfPages() > 2);
  assert.match(doc.internal.pages.flat().join("\n"), /FIM-CONTATO/);
});

test("bare Brazilian phone numbers use WhatsApp instead of a website globe", () => {
  for (const number of [
    "3198474-0625",
    "(31) 98474-0625",
    "+55 31 98474-0625",
  ]) {
    const result = model.proposalChannel(number);
    assert.equal(result.kind, "whatsapp");
    assert.equal(result.href, "https://wa.me/5531984740625");
  }
  assert.equal(model.proposalChannel("Telefone: 3198474-0625").kind, "phone");
  assert.equal(
    model.proposalChannel("Telefone: 3198474-0625").href,
    "tel:+5531984740625",
  );
});
test("explicit channel choices survive text persistence and invalid links stay inactive", () => {
  const rows = [
    { kind: "whatsapp", value: "3198474-0625" },
    { kind: "instagram", value: "@sevendevx" },
    { kind: "github", value: "https://github.com/DavidsonDias" },
    { kind: "website", value: "sevendevx.com" },
    { kind: "other", value: "Atendimento mediante agendamento" },
  ];
  const lines = model.serializeChannels(rows).split("\n");
  assert.deepEqual(
    lines.map((line) => model.channelDraft(line).kind),
    rows.map((row) => row.kind),
  );
  assert.equal(model.proposalChannel(lines[3]).href, "https://sevendevx.com/");
  assert.equal(model.proposalChannel("WhatsApp: https://example.com").href, "");
  assert.equal(model.proposalChannel("Site: javascript:alert(1)").href, "");
  assert.equal(
    model.proposalChannel("WhatsApp: https://wa.me/5531984740625").kind,
    "whatsapp",
  );
});
test("earlier proposals receive safe presentation defaults without changing commercial fields", () => {
  const earlier = { ...model.createProposal(source) };
  delete earlier.logoSurface;
  delete earlier.logoTreatment;
  delete earlier.theme;
  const parsed = model.readProposal({
    kind: model.PROPOSAL_KIND,
    proposal: earlier,
  });
  assert.equal(parsed.theme, "classic");
  assert.equal(parsed.logoTreatment, "original");
  assert.equal(parsed.logoSurface, "none");
  assert.equal(parsed.investment, earlier.investment);
});
test("white-edge removal is non-destructive and preserves enclosed white details", () => {
  const pixels = new Uint8ClampedArray(5 * 5 * 4).fill(255);
  for (let y = 1; y < 4; y++)
    for (let x = 1; x < 4; x++) {
      const i = (y * 5 + x) * 4;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = 20;
    }
  pixels[(2 * 5 + 2) * 4] =
    pixels[(2 * 5 + 2) * 4 + 1] =
    pixels[(2 * 5 + 2) * 4 + 2] =
      255;
  const original = new Uint8ClampedArray(pixels);
  const result = identity.clearLogoWhiteEdges(pixels, 5, 5);
  assert.deepEqual(pixels, original);
  assert.equal(result.data[3], 0);
  assert.equal(result.data[(2 * 5 + 2) * 4 + 3], 255);
  assert.equal(result.width, 3);
  assert.equal(result.height, 3);
  assert.equal(result.left, 1);
  assert.throws(
    () =>
      identity.clearLogoWhiteEdges(new Uint8ClampedArray(16).fill(255), 2, 2),
    /vazia/,
  );
});
test("transparent logo boundaries and blue theme remain valid for export", async () => {
  const pixels = new Uint8ClampedArray(16);
  pixels.set([80, 90, 100, 255], 4);
  assert.equal(identity.clearLogoWhiteEdges(pixels, 2, 2).width, 1);
  const proposal = model.createProposal(source);
  proposal.theme = "azure";
  const doc = await pdf.createProposalPdf(proposal);
  assert.ok(doc.getNumberOfPages() > 1);
  assert.ok(identity.proposalThemeStyle("azure").backgroundImage);
});
