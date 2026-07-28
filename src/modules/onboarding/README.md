# Onboarding Module

## Objetivo

Guiar novos usuários do SevenOS pelas capacidades do sistema e acompanhar progresso.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `OnboardingChecklist.tsx` | Lista de passos com estado persistido |
| `OnboardingTour.tsx` | Tour guiado sobre a interface |
| `tourSteps.ts` | Definição declarativa dos passos |

## Data flow

```text
useOnboarding → onboarding_progress (registro por usuário, RLS owner)
```

## Tabelas

`onboarding_progress`

## Pontos de atenção

- Passos referenciam seletores/elementos reais da UI; mover ou renomear componentes pode quebrar o tour — atualizar `tourSteps.ts` no mesmo commit.
- O tour não deve bloquear a operação: sempre é possível pular.
- Progresso é por usuário, nunca global.
