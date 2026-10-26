/** @file Append-only commercial snapshots under the existing admin RLS policies. */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  PROPOSAL_KIND,
  proposalSchema,
  proposalMarkdown,
  readProposal,
  type Proposal,
} from "./proposals";

/** Never updates contracts, stage status, or an earlier document version. */
export async function appendProposalSnapshot(
  db: SupabaseClient<Database>,
  scope: { projectId: string; stageId: string; actorId?: string },
  proposal: Proposal,
  expectedId: string | null,
) {
  const valid = proposalSchema.parse(proposal);
  const { data: current, error: readError } = await db
    .from("stage_documents")
    .select("id,metadata,version")
    .eq("project_id", scope.projectId)
    .eq("stage_id", scope.stageId)
    .order("created_at", { ascending: false });
  if (readError) throw readError;
  const latest = current.find((row) => readProposal(row.metadata));
  if ((latest?.id || null) !== expectedId)
    throw new Error(
      "Existe uma versão mais recente. Reabra a proposta para comparar. Suas alterações continuam neste editor.",
    );
  // Concurrent inserts cannot erase one another. Version numbers are labels, IDs identify snapshots.
  const { data, error } = await db
    .from("stage_documents")
    .insert({
      project_id: scope.projectId,
      stage_id: scope.stageId,
      type: "custom",
      title: `Proposta comercial — ${valid.company || valid.clientName || valid.title}`,
      content: proposalMarkdown(valid),
      metadata: { kind: PROPOSAL_KIND, proposal: valid },
      version: (latest?.version || 0) + 1,
      created_by: scope.actorId,
      generated_by_ai: false,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    created_at: data.created_at,
    version: data.version,
    proposal: valid,
  };
}
