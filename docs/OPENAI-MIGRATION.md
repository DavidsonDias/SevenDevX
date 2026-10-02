# Migração da IA para OpenAI

As funções de IA usam o helper `supabase/functions/_shared/openai.ts`. A chave `OPENAI_API_KEY` deve ser cadastrada exclusivamente nos secrets do Supabase, nunca em variáveis VITE, arquivos versionados ou no navegador do cliente.

Modelos controlados pelo servidor:

- `OPENAI_TEXT_MODEL`: padrão `gpt-4.1-mini`.
- `OPENAI_IMAGE_MODEL`: padrão `gpt-image-1.5`.

Texto mantém Chat Completions, streaming, ferramentas e JSON. Logos usam Images API com prompt e resposta base64. Não há repetição automática de chamadas pagas. O monitor de citações passa a consultar OpenAI; configurações históricas de modelos Gemini não são utilizadas para novas consultas.

## Validação

`node scripts/test-openai-migration.mjs` executa testes offline, sem chamadas externas ou créditos. A verificação confirma bloqueio sem chave, autenticação enviada ao provedor, preservação de streaming e erros, configuração de modelos e formato da geração de imagens.

Também foram executados `npm run typecheck` e `npm run build -- --configLoader runner`. O lockfile foi sincronizado com a dependência jszip já declarada. A configuração Vite usa import.meta.url para resolver o diretório em ESM.

## Limites da implantação

Oito funções de IA foram implantadas com verificação JWT: ai-contract-summarize, ai-engine, logo-variations-ai, lead-score-ai, ai-ops, ai-ops-autonomous, citation-monitor e project-generator. Chamadas sem autenticação retornaram 401. Isso não substitui testes completos com usuários autenticados.

openai-test usa autorização própria por chave secreta Supabase ou JWT de administrador, com verificação JWT do gateway desativada para aceitar chaves opacas modernas. Requisições não autorizadas retornam 401. Consulta somente /v1/models, sem gerar conteúdo. A conexão real retornou 200 e confirmou disponibilidade dos dois modelos configurados. Não devolve chaves nem mensagens brutas de erro do provedor.

Auth: o trigger de cadastro cria perfil e papel user, sem promover automaticamente a admin. A consulta has_role foi liberada apenas para authenticated; demais grants permanecem isolados. Testes transacionais do cadastro foram revertidos e não deixaram contas de teste. O aviso do advisor sobre SECURITY DEFINER em has_role corresponde a essa consulta intencional; proteção contra senhas vazadas continua pendente.

A migração não ativa crons, notificações, pagamentos ou a troca do frontend de produção. Grants, Storage e Auth exigem validação antes da liberação da aplicação. ai-chat ainda precisa de revisão de autorização das conversas; automation-runner possui ações externas que precisam de revisão.

gsc-insights permanece separado: a dependência connector-gateway.lovable.dev é uma integração Google Search Console e requer OAuth Google próprio. OPENAI_API_KEY não resolve essa conexão.

Documentação oficial: https://developers.openai.com/api/reference/resources/chat e https://developers.openai.com/api/reference/resources/images/methods/generate.
