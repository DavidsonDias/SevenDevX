# TSDoc Standard

## Formato

```ts
/**
 * Obtém os projetos vinculados ao cliente informado.
 *
 * @param clientId - Identificador único do cliente (`clients.id`).
 * @returns Lista de projetos ordenada por `updated_at` desc.
 *
 * @throws {PostgrestError} Quando a consulta ao backend falhar.
 *
 * @example
 * ```ts
 * const projects = await getProjectsByClient(client.id);
 * ```
 */
```

## Documentar obrigatoriamente

- Funções e utilitários exportados
- Hooks (`src/hooks`, hooks internos de módulos)
- Services / repositories / adapters
- Edge Functions (cabeçalho + contrato de entrada/saída)
- Providers e contextos
- Schemas (Zod), interfaces e tipos não triviais
- Funções de segurança, criptografia e MFA
- Processamento assíncrono, filas, retries
- Algoritmos não triviais (pricing, forecast, extração de paleta)

## Não documentar

Getters triviais, re-exports, `return data;`, props autoexplicativas.

## Hooks

Hooks devem informar propósito, entrada, saída, side effects, cache e invalidação:

```ts
/**
 * Gerencia configuração e estado das integrações externas.
 *
 * @remarks
 * Cache via React Query; a chave `["integrations"]` é invalidada após
 * qualquer mutation de provider para manter as sessões admin coerentes.
 *
 * @returns Queries, mutations e estado dos providers.
 */
```

## Componentes

```ts
/**
 * Renderiza um card de integração externa.
 *
 * @remarks
 * Usa o renderer de logos global e o Brand Palette Engine para derivar
 * glow/beam a partir da identidade do provider.
 *
 * @param provider - Provider renderizado.
 * @param onConfigure - Disparado ao abrir a configuração.
 * @param onTest - Disparado ao testar a conexão.
 */
```

## Erros

Sempre documente o tipo de erro propagado e se ele é tratado pelo chamador (`toast`, boundary, retorno `{ error }`).
