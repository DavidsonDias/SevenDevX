# Checklist de corte

## PREPARAR

- [ ] Destino identificado e vazio/auditado.
- [ ] Export oficial e dump final restaurados em ensaio isolado.
- [ ] Checksums e validações aprovados.
- [ ] Secrets configurados por canal seguro; nenhum valor no repositório.
- [ ] Functions implantadas sem jobs/webhooks/tráfego.
- [ ] Auth/OAuth/SMTP/redirects e Storage validados em isolamento.
- [ ] Rollback ensaiado; responsáveis e janela definidos.

## AUTORIZAR

- [ ] Aprovação explícita da Fase 2 e, depois, do corte.
- [ ] Aviso de manutenção preparado; duração baseada no ensaio, não em estimativa não auditada.
- [ ] Critérios go/no-go e canal de decisão confirmados.

## EXECUTAR

- [ ] Bloquear formulários, uploads e alterações administrativas.
- [ ] Pausar cron, webhooks, filas e integrações gravadoras na origem.
- [ ] Drenar processamento em andamento e registrar estado.
- [ ] Gerar backup final após estabilizar escritas; armazenar fora da origem e verificar checksum.
- [ ] Copiar delta de Storage e restaurar banco/Auth no destino.
- [ ] Executar validação read-only e testes autorizados.
- [ ] Trocar conexão/build somente com gates aprovados.
- [ ] Habilitar escrita apenas no destino.
- [ ] Ativar Realtime, webhooks e jobs um a um; origem permanece sem processamento.

## VALIDAR

- [ ] IDs/FKs/constraints/sequences, Auth, buckets e RLS equivalentes.
- [ ] Login/admin/público/CMS/projetos/financeiro/PWA aprovados.
- [ ] Sem duplicação, DLQ anormal, erros 4xx/5xx ou exposição privada.
- [ ] Monitoramento reforçado e rollback ainda disponível.
- [ ] Não remover Lovable Cloud; aguardar autorização posterior.
