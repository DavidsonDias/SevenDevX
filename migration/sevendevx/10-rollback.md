# Plano de rollback

## Critérios objetivos de interrupção

Falha no restore; divergência inexplicada de IDs/FKs/Auth/Storage; policy mais permissiva; login admin indisponível; perda/corrupção de arquivo; jobs/webhooks duplicados; erro crítico nas rotas principais; e-mails/cobranças não autorizados; incapacidade de restaurar origem.

## Antes de novas escritas no destino

Manter origem pausada para escrita, mas íntegra; reverter build/configuração para endpoint da origem; reativar somente jobs/webhooks canônicos da origem; invalidar artefato de destino; confirmar acesso e filas. Este é o rollback simples.

## Depois de novas escritas no destino

Não trocar apenas a URL. Congelar ambos, inventariar delta por tabela/ID/timestamp e objetos, reconciliar em ambiente isolado, preservar trilha de auditoria, importar delta validado para a origem ou concluir correção no destino. Decisão humana obrigatória. Nenhuma operação destrutiva antes da reconciliação.

## Irreversível

`Remove Lovable Cloud` exclui a instância e exports nela armazenados; fica expressamente fora do corte inicial e só pode ocorrer após período de estabilidade, backups externos restauráveis e autorização específica. Rotação de webhook secrets, troca de VAPID e disparos externos exigem procedimentos próprios.

## Artefatos necessários

Build/commit anterior, variáveis públicas anteriores guardadas com segurança, backup final com checksum, inventários origem/destino, estado de jobs/webhooks, lista do delta e responsáveis pela decisão.
