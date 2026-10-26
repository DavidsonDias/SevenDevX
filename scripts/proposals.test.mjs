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
const pdf = load("../src/utils/proposalPdf.ts", { "@/lib/proposals": model });
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
