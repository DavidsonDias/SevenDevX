# Documentação de arquitetura

## Onde vive

`/docs/architecture/` é a fonte única de verdade arquitetural. Diagramas usam **Mermaid**.

## Regras

1. **Descrever o real.** Antes de escrever: ler implementação → mapear fluxo atual → remover referências obsoletas.
2. **Um diagrama por conceito.** Não misturar auth, dados e deploy no mesmo grafo.
3. **Source of truth explícito.** Quando existir cadeia canônica, documente:

```text
tech_registry (DB)
  ↓ useRegistry
TechIconCDN / TechIcon
  ↓
TechShowcase · ProjectPickerModal · Site Creation CMS
```

4. **Camadas.** UI → hooks (React Query) → Supabase Client (RLS) → Postgres, com Edge Functions para operações privilegiadas/externas.
5. **Sem números inventados.** Latências e custos só entram com medição citada e data.

## Estrutura mínima de um doc de arquitetura

- Contexto
- Diagrama
- Componentes envolvidos (com caminho real de arquivo)
- Fluxo passo a passo
- Falhas e fallback
- Riscos / cuidados
