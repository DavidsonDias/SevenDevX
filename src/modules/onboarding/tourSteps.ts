/**
 * tourSteps.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/modules/onboarding/tourSteps.ts
 * @module Onboarding
 *
 * @description
 * Passos do tour de onboarding.
 *
 * @see src/modules/onboarding/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

import type { TourStep } from "./OnboardingTour";

export const ADMIN_TOUR: TourStep[] = [
  { id: "welcome", title: "Bem-vindo ao SevenOS 🚀",
    description: "Um tour rápido para você dominar o painel em 60 segundos. Você pode pular a qualquer momento.",
    placement: "center" },
  { id: "menu", title: "Menu lateral", description: "Todas as áreas do sistema estão aqui: pipeline, projetos, financeiro, integrações e mais.",
    targetSelector: "[aria-label='Abrir menu admin']" },
  { id: "search", title: "Busca global ⌘K", description: "Encontre clientes, projetos, contatos e serviços em um único campo. Pressione ⌘K em qualquer tela.",
    targetSelector: "[data-tour='global-search']" },
  { id: "notifications", title: "Central de notificações", description: "Novos leads, mudanças de pipeline e falhas de automação caem direto neste sino — em tempo real.",
    targetSelector: "[data-tour='notif-bell']" },
  { id: "push", title: "Notificações push", description: "Ative para receber alertas críticos no seu celular mesmo com a aba fechada.",
    targetSelector: "[data-tour='push-button']" },
  { id: "checklist", title: "Checklist inicial", description: "Esta lista te guia pelos primeiros passos. Conforme você completa, ela desaparece sozinha.",
    placement: "center" },
];
