# Plano de execução por fases

| ETAPA | AMBIENTE | AÇÃO | PRÉ-REQUISITO | RISCO | ROLLBACK | VALIDAÇÃO | CRITÉRIO DE ACEITE |
|---|---|---|---|---|---|---|---|
| PREPARAR-1 | origem | capturar preflight e export oficial | autorização leitura/export | export incompleto | repetir após 24h se limite | checksum/manifesto | artefato fora da origem |
| PREPARAR-2 | destino | identificar e auditar vazio | credenciais/identificação | conflito existente | abandonar destino contaminado | `01-preflight` | compatibilidade aprovada |
| PREPARAR-3 | isolado | restaurar dump oficial | backup validado | falha schema/Auth | descartar ambiente | `08-validation` | restore reproduzível |
| PREPARAR-4 | isolado | copiar Storage e configurar Auth/Functions sem efeitos | ensaio DB aprovado | ACL/secret incorreto | recriar ambiente | manifestos/smokes | testes isolados aprovados |
| AUTORIZAR-1 | gestão | aprovar janela e go/no-go | relatório do ensaio | decisão sem evidência | adiar | checklist assinado | autorização explícita |
| EXECUTAR-1 | origem | suspender escritas/jobs/webhooks | janela iniciada | indisponibilidade | reabrir origem | filas estáveis | zero escrita em trânsito |
| EXECUTAR-2 | origem | backup final e delta Storage | escritas estabilizadas | perda do delta | manter origem pausada e repetir | checksum | snapshot final íntegro |
| EXECUTAR-3 | destino | restore/import final | snapshot íntegro | erro/import parcial | descartar/recriar destino | logs + validação | zero erro crítico |
| VALIDAR-1 | destino | comparar estrutura, IDs, Auth, Storage, RLS | restore completo | falso positivo por contagem | manter origem | SQL + manifests | todas diferenças explicadas |
| VALIDAR-2 | destino | testes funcionais controlados | validação read-only | efeitos externos | manter integrações off | evidências por caso | suíte crítica aprovada |
| EXECUTAR-4 | frontend | trocar conexão e publicar | go final | cache/conexão errada | republicar build anterior | smoke produção | app usa apenas destino |
| EXECUTAR-5 | destino | liberar escrita e ativar jobs/webhooks um a um | smoke aprovado | duplicação | desativar destino e avaliar rollback | monitor/DLQ | processamento único |
| VALIDAR-3 | ambos | monitorar e preservar origem | corte concluído | regressão tardia | `10-rollback.md` | métricas/logs | janela estável aprovada |

## Ordem recomendada

PREPARAR → autorização específica para ensaio → ensaio isolado → relatório de diferenças → autorização de corte → congelamento → backup final → restore final → validação → troca → ativação gradual → monitoramento. `Remove Lovable Cloud` não faz parte desta sequência inicial.

## Status da Fase 1

**PRONTO PARA AUTORIZAR A FASE 2**, entendida como preparação controlada do destino, geração/validação dos backups oficiais e ensaio isolado. Isto **não** autoriza corte, importação em produção, remoção do Cloud ou publicação.

Gates ainda pendentes para execução/corte: destino externo identificado e auditado; dump oficial final com checksum; restore isolado bem-sucedido; inventário/checksum completo de Storage; configuração implantada de Auth/Functions/secrets confirmada; janela e rollback aprovados.
