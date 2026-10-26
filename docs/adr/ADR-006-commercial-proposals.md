# ADR-006 — Propostas comerciais no fluxo de projetos

Status: implementado. Data: 2026-10-26.

## Problema

O projeto possuía documentos técnicos na etapa de proposta, mas não uma apresentação comercial editável. O contrato ocupava grande parte da tela em todas as etapas. No perfil lateral do cliente, colunas baseadas na largura da janela comprimiam o contrato e os anexos.

## Decisão

- O Estúdio de propostas pertence à etapa `proposal`. Importa o cliente vinculado, briefing/escopo/cronograma/investimento existentes, orçamento e logos autorizadas dos anexos do cliente/projeto. Não deduz condições de pagamento ou prazos ausentes.
- Cada salvamento insere um snapshot em `stage_documents`, tipo `custom`, com `metadata.kind = sevenos-commercial-proposal-v1` e payload validado por Zod. O conteúdo Markdown mantém leitura por ferramentas existentes. Contratos, status e documentos anteriores não são atualizados.
- O histórico usa IDs como identidade. Uma leitura anterior ao salvamento detecta versões mais recentes. Inserções simultâneas podem ter o mesmo número de versão, mas preservam os dois snapshots; a numeração não é um bloqueio transacional. Não há migração de schema ou nova permissão.
- Rascunhos locais usam o mecanismo existente, com escopo por usuário/projeto/etapa e recuperação explícita. O salvamento no servidor exige ação do operador. Trocar de etapa consulta a proteção de alterações não salvas.
- Exportação client-side em PDF 16:9, com texto selecionável, paginação de continuação e imagens raster. jsPDF é uma dependência direta já presente de forma transitiva via html2pdf. O módulo de PDF é carregado apenas ao exportar.
- Logos permanecem no Storage privado. Persistimos apenas o ID do anexo, resolvendo sua URL assinada pelos hooks existentes. Não incorporamos URLs temporárias ao snapshot. Falha da imagem é informada, permitindo selecionar outra logo ou exportar sem ela.
- PDFs sem campos essenciais são identificados como rascunho. Exportar ou salvar não envia documentos, aceita contratos, registra aprovação nem dispara cobranças.
- O painel de cliente usa o Sheet acessível, largura máxima de 48rem, cabeçalho fixo e conteúdo com rolagem própria. Contrato e arquivos são empilhados. As seis etapas recebem orientações e checklist legível; documentos de catálogo também podem ser escritos sem IA.

## Validação e limites

Testes exercitam origem dos dados, payload inválido, snapshot novo, conflito, erro de leitura/escrita e PDF longo. A revisão visual usa cliente fictício e não grava propostas em clientes reais. RLS e colunas foram inspecionadas em produção, sem alteração. Android/iOS físicos e a primeira gravação de uma proposta real devem ser conferidos pelo operador. Snapshots exportados são arquivos locais; não ficam automaticamente anexados ao Storage. PPTX não é exportado nesta versão.

## Operação

Vincular o cliente ao projeto; cadastrar a logo em seus arquivos; abrir **Proposta & Alinhamento → Estúdio de propostas**; revisar os dados, escopo e condições; salvar uma versão e baixar o PDF. Para recuperar um conteúdo anterior, escolher a versão e salvar uma nova. Não apagar o histórico para corrigir um documento.

## Rollback

Reverter o commit de interface não exige rollback de banco. Snapshots permanecem legíveis como documentos Markdown pelo motor anterior. Nenhum contrato ou anexo anterior é removido.
