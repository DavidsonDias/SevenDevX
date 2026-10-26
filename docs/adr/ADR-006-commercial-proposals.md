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
- A logo institucional SevenDevX ocupa o canto superior direito da prévia e de todas as páginas do PDF, inclusive continuações; a logo do cliente é independente e aparece na capa. O asset institucional é uma rasterização do SVG já existente no repositório.
- O modelo inclui diferenciais, crescimento opcional e canais oficiais. Esses campos possuem defaults vazios na leitura de snapshots anteriores; nenhum conteúdo comercial já salvo é substituído. O preenchimento de campos vazios é explícito.
- Logos permanecem no Storage privado. Persistimos apenas o ID do anexo, resolvendo sua URL assinada pelos hooks existentes. Não incorporamos URLs temporárias ao snapshot. Falha da imagem é informada, permitindo selecionar outra logo ou exportar sem ela.
- PDFs sem campos essenciais são identificados como rascunho. Exportar ou salvar não envia documentos, aceita contratos, registra aprovação nem dispara cobranças.
- O painel de cliente usa o Sheet acessível, largura máxima de 48rem, cabeçalho fixo e conteúdo com rolagem própria. Contrato e arquivos são empilhados. As seis etapas recebem orientações e checklist legível; documentos de catálogo também podem ser escritos sem IA.

## Validação e limites

Testes exercitam origem dos dados, payload inválido, snapshot novo, conflito, erro de leitura/escrita e PDF longo. A revisão visual usa cliente fictício e não grava propostas em clientes reais. RLS e colunas foram inspecionadas em produção, sem alteração. Android/iOS físicos e a primeira gravação de uma proposta real devem ser conferidos pelo operador. Snapshots exportados são arquivos locais; não ficam automaticamente anexados ao Storage. PPTX não é exportado nesta versão.

## Operação

Vincular o cliente ao projeto; cadastrar a logo em seus arquivos; abrir **Proposta & Alinhamento → Estúdio de propostas**; revisar os dados, escopo e condições; salvar uma versão e baixar o PDF. Para recuperar um conteúdo anterior, escolher a versão e salvar uma nova. Não apagar o histórico para corrigir um documento.

## Rollback

Reverter o commit de interface não exige rollback de banco. Snapshots permanecem legíveis como documentos Markdown pelo motor anterior. Nenhum contrato ou anexo anterior é removido.


## Refinamento visual de portfólio — 2026-10-26

- A seção de portfólio oferece catálogo visual dos projetos públicos, consultando apenas campos de apresentação e exigindo `status=published` e `is_published_on_site=true`. Não usa nem expõe projetos internos. O catálogo é carregado ao abrir a seleção e falhas têm ação de tentar novamente.
- O operador seleciona até 18 projetos, reordena, remove da proposta e edita o resumo (até 450 caracteres), sem alterar o projeto original. A versão salva preserva ID, título, categoria, resumo e referências públicas de imagem/link. Os arquivos de imagem não são duplicados; se a origem for removida, a exportação informa a falha e permite remover a imagem da proposta.
- O campo `projects` tem default vazio para snapshots anteriores. São rejeitados protocolos inseguros e URLs assinadas nas referências persistidas. As logos privadas existentes continuam sendo resolvidas pelo ID do anexo, sem mudança de permissões.
- A prévia exibe cards com imagem sem recorte, resumo e link. O PDF inclui os mesmos dados, com três cards por página para textos curtos e cards amplos para resumos longos. Mais projetos geram páginas de continuação. O Markdown inclui o conteúdo e os links dos projetos.
- Redes e contatos recebem ícones vetoriais e links acionáveis na prévia e no PDF; WhatsApp abre `wa.me`, e-mail abre `mailto`, telefones usam `tel`. Não há envio automático.
- Prévia, Markdown e PDF compartilham a seleção e ordem das seções preenchidas. Um portfólio com projetos aparece mesmo sem texto introdutório. A capa e todas as páginas físicas do PDF recebem numeração contínua, inclusive continuações. Campos essenciais ausentes ainda marcam o documento como rascunho.
- Validação: 271 testes locais aprovados, incluindo seis novos cenários de páginas esparsas, compatibilidade, links seguros, projetos, imagens e contatos longos. Typecheck, lint dos arquivos alterados e build aprovados. Catálogo real lido pelo navegador; proposta fictícia exportada e PDF renderizado para inspeção. Prévia verificada em desktop e 390px, sem overflow horizontal. Nenhuma proposta de cliente real foi gravada durante a validação.


## Identidade visual e canais — 2026-10-26

- Identificação inclui apresentação da logo sem moldura, placa clara ou placa escura. O padrão não acrescenta uma caixa branca. Logos SVG autorizadas passam a ser selecionáveis, além de PNG/JPEG/WebP; o navegador as rasteriza para o PDF, sem inserir SVG arbitrário no DOM.
- O tratamento opcional `white-edges` torna transparente somente branco/quase branco conectado às bordas e recorta as margens. A transformação trabalha numa cópia em memória, não atualiza Storage ou o anexo original e preserva áreas brancas fechadas. Logos com detalhes claros conectados às bordas exigem revisão visual; o modo original continua disponível. Resultados vazios ou falhas impedem a exportação em vez de substituir silenciosamente a marca.
- Seções social/contato oferecem diálogo acessível para selecionar tipo, endereço e ordem. Aplicar serializa os canais em texto compatível com versões anteriores; Cancelar/Escape preservam o campo original. Nenhum contato é enviado. Números brasileiros sem rótulo agora usam WhatsApp em vez de globo; a escolha explícita Telefone usa `tel`.
- WhatsApp, Instagram, YouTube, LinkedIn, Facebook, TikTok, GitHub e X usam os símbolos de marca do pacote react-icons já instalado. E-mail, site, telefone e texto complementar usam símbolos funcionais. Os mesmos ícones são rasterizados localmente para o PDF; não dependem de CDN. Valores inválidos não são aplicados pelo seletor.
- Dois modelos: Clássico e Azure, com azul em gradiente e geometria discreta. O tema fica no snapshot e se aplica à prévia e ao PDF. Snapshots anteriores recebem defaults seguros, mantendo o conteúdo comercial.
- Evidência local: testes de telefone sem formatação, serialização dos canais, links inválidos, compatibilidade, tratamento não destrutivo, detalhes brancos internos e tema. Diálogo verificado em desktop e 390px e exportação PDF real com logo SVG tratada, links e ícones de marca renderizada para inspeção. Nenhum cliente real foi modificado.
