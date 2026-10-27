import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
function load(file, imports = {}) {
  const compiled = ts.transpileModule(
    fs.readFileSync(new URL(file, import.meta.url), "utf8"),
    {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        esModuleInterop: true,
      },
    },
  ).outputText;
  const exports = {};
  new Function("exports", "require", compiled)(
    exports,
    (name) => imports[name] || require(name),
  );
  return exports;
}
const workspace = load("../src/lib/stageWorkspace.ts");
let response = {
    data: { id: "d", project_id: "p", stage_id: "s" },
    error: null,
  },
  filters = [],
  writes = [];
const query = {
  update(payload) {
    writes.push(payload);
    return this;
  },
  eq(key, value) {
    filters.push([key, value]);
    return this;
  },
  select() {
    return this;
  },
  async maybeSingle() {
    return response;
  },
  async single() {
    return response;
  },
  insert(payload) {
    writes.push(payload);
    return this;
  },
};
const hooks = load("../src/hooks/useDocuments.ts", {
  "@tanstack/react-query": {
    useQuery: () => ({}),
    useMutation: (options) => options,
    useQueryClient: () => ({ invalidateQueries() {} }),
  },
  "@/integrations/supabase/client": { supabase: { from: () => query } },
  "@/hooks/use-toast": { useToast: () => ({ toast() {} }) },
});
test("all six stages have manual templates for every suggested document, without invented commitments", () => {
  assert.equal(Object.keys(hooks.STAGE_DOC_CATALOG).length, 6);
  let count = 0;
  for (const entries of Object.values(hooks.STAGE_DOC_CATALOG))
    for (const entry of entries) {
      count++;
      assert.ok(workspace.STAGE_WORKBOOKS[entry.type]);
      const result = workspace.stageDocumentTemplate(
        entry.type,
        entry.title,
        { title: "Aurora", description: "Contexto informado" },
        { company: "Cliente exemplo" },
      );
      assert.match(result, /Aurora/);
      assert.match(result, /Cliente exemplo/);
      assert.match(result, /\[A preencher\]/);
      assert.doesNotMatch(result, /R\$|aprovado pelo cliente|garantimos/i);
    }
  assert.equal(count, 19);
});
test("readiness does not count empty documents or template placeholders as finished work", () => {
  const catalog = [
    { type: "briefing", title: "Briefing" },
    { type: "qa", title: "QA" },
  ];
  assert.deepEqual(
    workspace.stageReadiness(
      catalog,
      [
        { type: "briefing", content: "[A preencher]" },
        { type: "qa", content: "Plano revisado" },
      ],
      [{ is_done: true }, { is_done: false }],
    ),
    { documents: 1, expected: 2, missing: ["Briefing"], done: 1, total: 2 },
  );
});
test("date conversion preserves local wall-clock time and rejects invalid sequences", () => {
  const date = new Date(2026, 9, 27, 14, 35);
  assert.equal(
    workspace.toLocalDateTime(date.toISOString()),
    "2026-10-27T14:35",
  );
  assert.equal(workspace.toLocalDateTime("bad"), "");
  assert.equal(
    workspace.validateStageDates("2026-10-27T14:35", "2026-10-28T10:00")
      .started_at,
    date.toISOString(),
  );
  assert.throws(
    () => workspace.validateStageDates("2026-10-28T10:00", "2026-10-27T10:00"),
    /anterior/,
  );
  assert.deepEqual(workspace.validateStageDates("", ""), {
    started_at: null,
    due_at: null,
  });
});
test("document updates use tenant/stage/time preconditions and do not send stale server timestamps", async () => {
  filters = [];
  writes = [];
  response = { data: { id: "d", project_id: "p", stage_id: "s" }, error: null };
  await hooks
    .useUpsertDocument()
    .mutationFn({
      id: "d",
      project_id: "p",
      stage_id: "s",
      updated_at: "old-time",
      created_at: "old-created",
      version: 2,
      title: "QA",
      content: "Evidência",
    });
  assert.deepEqual(filters, [
    ["id", "d"],
    ["project_id", "p"],
    ["stage_id", "s"],
    ["updated_at", "old-time"],
  ]);
  assert.equal(writes[0].version, 3);
  assert.ok(!("updated_at" in writes[0]));
  assert.ok(!("created_at" in writes[0]));
});
test("a concurrent document edit is rejected without a false success response", async () => {
  response = { data: null, error: null };
  await assert.rejects(
    hooks
      .useUpsertDocument()
      .mutationFn({
        id: "d",
        project_id: "p",
        stage_id: "s",
        updated_at: "stale",
      }),
    /mudou/,
  );
  response = { data: null, error: new Error("RLS denied") };
  await assert.rejects(
    hooks
      .useUpsertDocument()
      .mutationFn({ id: "d", project_id: "p", stage_id: "s" }),
    /RLS denied/,
  );
});
test("AI generation opens an unsaved editor instead of overwriting the stored document", () => {
  const source = fs.readFileSync(
    new URL("../src/components/admin/StageDocuments.tsx", import.meta.url),
    "utf8",
  );
  const generate = source.slice(
    source.indexOf("  const generate ="),
    source.indexOf("  const customDocs"),
  );
  assert.doesNotMatch(generate, /upsert\.mutateAsync/);
  assert.match(generate, /setEditing/);
  assert.doesNotMatch(generate, /google\/gemini/);
  assert.match(source, /useEditorDraft/);
});
