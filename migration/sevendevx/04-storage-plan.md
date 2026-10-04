# Plano de Storage

## Inventário

Oito buckets reais: privados `attachments`, `backups`, `database_export_02_10_26`, `database_export_27_09_26`, `portfolio-covers`; públicos `blog-images`, `project-images`, `tech-icons`. O estado público/privado, limites, MIME types, policies e metadados serão extraídos pelo preflight.

## Cópia controlada

1. Congelar uploads no corte, mantendo leitura na origem.
2. Gerar inventário por bucket com caminho, tamanho, MIME, ETag/metadados e checksum calculado do conteúdo baixado.
3. Copiar sem alterar nomes/caminhos/case; preservar content-type/cache-control e metadados necessários.
4. Recriar buckets/policies equivalentes no destino; `attachments`, `backups` e `portfolio-covers` permanecem privados.
5. Comparar contagem, soma de bytes e checksum por objeto. Contagem igual não basta.
6. Atualizar referências persistidas somente quando contiverem host absoluto da origem, em transação, com mapa antes/depois e rollback. Caminhos lógicos não devem mudar.
7. URLs assinadas antigas expiram por natureza; regenerá-las no destino. Nunca copiar signed URLs como referência permanente.

## Riscos e rollback

Buckets extras não constam nas migrations locais; usar banco real. Não tornar bucket privado público para corrigir exibição. Em falha, manter referências/frontend na origem, bloquear escrita no destino e repetir somente objetos divergentes. Exclusão da origem fica fora da migração e exige autorização posterior.

## Aceite

8 buckets equivalentes; todos os objetos inventariados presentes; bytes/checksums iguais; URLs públicas funcionais; signed URLs privadas autorizadas e acesso anônimo negado; uploads testados apenas no ensaio isolado.
