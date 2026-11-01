import type { CaseStudy } from "@/data/caseStudies";
import type { Language } from "../translations";
import { caseFingerprint, resolveCaseStudy } from "./cases";

/** A metric needs a public source, measurement period and matching source revision before publication. */
export interface CaseEvidence {
  sourceUrl: string;
  period: string;
  sourceRevision: string;
  metricLabels: readonly string[];
}

// Original case records remain intact. Add evidence here only after owner review.
export const caseEvidence: Readonly<Record<string, CaseEvidence>> = {};

const scopeOutcomes: Record<string, readonly [string, string, string]> = {
  "psicoone-plataforma-psicologia-clinica": ["Prontuário, agenda e gestão financeira reunidos em uma plataforma para a rotina clínica.", "Records, scheduling and financial management brought together for clinical workflows.", "Historial, agenda y gestión financiera reunidos para el trabajo clínico."],
  "george-fiuza-site-institucional-advocacia": ["Presença digital orientada à descoberta dos serviços e ao contato com a barbearia.", "A digital presence focused on discovering services and contacting the barbershop.", "Presencia digital orientada a descubrir los servicios y contactar con la barbería."],
  "foodopsx-gestao-restaurantes": ["Pedidos, estoque e operação financeira organizados em um fluxo de gestão para restaurantes.", "Orders, inventory and financial operations organized into a restaurant management workflow.", "Pedidos, inventario y operaciones financieras organizados en un flujo para restaurantes."],
  "acaios-franquia-acai-multi-unidade": ["Gestão de unidades, pedidos e operação de franquias em uma experiência integrada.", "Location, order and franchise operations management in an integrated experience.", "Gestión de locales, pedidos y operaciones de franquicias en una experiencia integrada."],
  "homeos-automacao-residencial": ["Controles e dispositivos da casa conectada reunidos em uma interface de automação.", "Connected-home controls and devices brought together in an automation interface.", "Controles y dispositivos del hogar conectado reunidos en una interfaz de automatización."],
  "githubpro-viewer-perfis-github": ["Consulta de perfis e repositórios com apresentação organizada de informações do GitHub.", "Profile and repository exploration with an organized presentation of GitHub information.", "Consulta de perfiles y repositorios con información de GitHub presentada de forma organizada."],
  "cleansweep-gestao-servicos-limpeza": ["Contratos, escalas e acompanhamento dos serviços organizados para a operação de limpeza.", "Contracts, schedules and service tracking organized for cleaning operations.", "Contratos, turnos y seguimiento de servicios organizados para operaciones de limpieza."],
  "logix-rastreamento-frota-logistica": ["Acompanhamento de frota e entregas conectado à operação de despacho e ao portal do embarcador.", "Fleet and delivery tracking connected to dispatch operations and the shipper portal.", "Seguimiento de flota y entregas conectado al despacho y al portal del cargador."],
  "edutrack-gestao-escola-particular": ["Rotinas acadêmicas, comunicação com responsáveis e gestão financeira em um ambiente digital.", "Academic workflows, guardian communication and financial management in a digital environment.", "Rutinas académicas, comunicación con tutores y gestión financiera en un entorno digital."],
  "medflow-prontuario-clinica-multiprofissional": ["Prontuário, agenda compartilhada e atendimento digital organizados para equipes multiprofissionais.", "Records, shared scheduling and digital care organized for multidisciplinary teams.", "Historial, agenda compartida y atención digital organizados para equipos multidisciplinares."],
};

export function resolvePublishedCase(source: CaseStudy, requested: Language, evidence = caseEvidence[source.slug]) {
  const resolved = resolveCaseStudy(source, requested);
  const index = resolved.language === "pt" ? 0 : resolved.language === "en" ? 1 : 2;
  const verified = evidence && /^https:\/\/[^\s]+$/.test(evidence.sourceUrl) && evidence.period.trim() && evidence.sourceRevision === caseFingerprint(source);
  const metrics = verified ? resolved.caseStudy.metrics.filter((_, i) => evidence.metricLabels.includes(source.metrics[i].label)) : [];
  // No business-outcome claim or numeric proof is inferred from the implementation itself.
  return { ...resolved, caseStudy: { ...resolved.caseStudy, metrics, outcome: scopeOutcomes[source.slug]?.[index] ?? "" } };
}
