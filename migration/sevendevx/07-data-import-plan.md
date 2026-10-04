# Plano de importação de dados

## Pré-requisitos

Destino vazio e inventariado; dump oficial validado; restore isolado aprovado; Auth importável com UUIDs; buckets criados; jobs/webhooks/e-mails desativados; rollback testado; janela autorizada.

## Ordem por dependência

1. Extensões e tipos suportados.
2. Auth/identidades preservando UUIDs, pelo fluxo oficial.
3. Schema `public`, funções base (`has_role`) e tabelas sem dependências.
4. Dados pais e registries; depois CRM/projetos/CMS; depois filhos, logs e filas conforme grafo de FKs do dump.
5. Ajuste nominal de sequences/identities para `max(id)` quando aplicável.
6. Funções, triggers, RLS, grants, índices e constraints na ordem produzida pelo dump oficial.
7. Storage e referências controladas.
8. Realtime, Functions, secrets, Auth/OAuth/SMTP.
9. Cron/webhooks somente após validação e corte.

Não importar por CSV genérico quando isso perder tipos, JSONB, UUIDs, defaults ou metadados. Não desativar constraints/triggers globalmente. Tabelas de dados reais, auditoria, analytics e health são preservadas salvo decisão explícita posterior — não aplicar retenção durante a migração.

## Sincronização final

Durante a janela, suspender formulários, uploads, admin writes, jobs, webhooks e integrações que gravam; drenar filas; capturar backup final; copiar delta de Storage; restaurar/validar; liberar escrita apenas no destino. Sem replicação comprovada, não prometer zero downtime nem permitir dual-write.

## Aceite

Contagens e conjuntos de IDs iguais; FKs sem órfãos; totals de negócio equivalentes; sequences corretas; Auth e Storage íntegros; nenhum processamento externo duplicado.
