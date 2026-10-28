import { publicRouteCopy } from "./publicRouteCopy";
import { translations, type Language } from "./translations";
import { commercialCopy } from "./publicCommercialCopy";
import { projectCopy } from "./publicProjectCopy";
import { projectDetailsCopy } from "./publicProjectDetailsCopy";
import { blogHeadlines } from "./editorial/blogHeadlines";
import { articleHeadlines } from "./editorial/headlines";

/** Reviewed supplemental copy for public routes. Brands, URLs and source content stay intact. */
export const publicCopy: Record<string, readonly [string, string]> = {
  "Solução SevenDevX": ["SevenDevX Solution", "Solución SevenDevX"],
  "PERFIL": ["PROFILE", "PERFIL"],
  "SAIR": ["SIGN OUT", "SALIR"],
  "Desenvolvimento web com inovação, design e performance. Transformamos visões em experiências digitais.": ["Web development with innovation, design and performance. Turning visions into digital experiences.", "Desarrollo web con innovación, diseño y rendimiento. Transformamos visiones en experiencias digitales."],
  "• Codificando o amanhã, hoje!": ["• Coding tomorrow, today!", "• ¡Programando el mañana, hoy!"],
  "Navegação": ["Navigation", "Navegación"],
  "Contato": ["Contact", "Contacto"],
  "Belo Horizonte, MG — Brasil": ["Belo Horizonte, MG — Brazil", "Belo Horizonte, MG — Brasil"],
  "Código": ["Code", "Código"],
  "PORTFÓLIO": ["PORTFOLIO", "PORTAFOLIO"],
  "Projetos em Destaque": ["Featured Projects", "Proyectos Destacados"],
  "Soluções reais desenvolvidas com foco em performance, design e resultado": ["Real solutions built for performance, design and results", "Soluciones reales centradas en rendimiento, diseño y resultados"],
  "Destaque Principal": ["Main Highlight", "Proyecto Principal"],
  "Projeto em destaque": ["Featured project", "Proyecto destacado"],
  "Ver Projeto": ["View Project", "Ver Proyecto"],
  "Ver projeto": ["View project", "Ver proyecto"],
  "Ver todos os projetos": ["View all projects", "Ver todos los proyectos"],
  "Recebido!": ["Received!", "¡Recibido!"],
  "Retornamos em até 24 horas com um plano claro para o seu projeto.": ["We will reply within 24 hours with a clear plan for your project.", "Responderemos en un plazo de 24 horas con un plan claro para tu proyecto."],
  "Fechar": ["Close", "Cerrar"],
  "Passo": ["Step", "Paso"],
  "Voltar": ["Back", "Volver"],
  "Enviando": ["Sending", "Enviando"],
  "Enviar diagnóstico": ["Send request", "Enviar solicitud"],
  "Próximo": ["Next", "Siguiente"],
  "Voltar ao site": ["Back to website", "Volver al sitio"],
  "Nome completo": ["Full name", "Nombre completo"],
  "Senha": ["Password", "Contraseña"],
  "Confirmar senha": ["Confirm password", "Confirmar contraseña"],
  "Ao continuar, você concorda com nossos": ["By continuing, you agree to our", "Al continuar, aceptas nuestros"],
  "Termos de Uso": ["Terms of Use", "Términos de Uso"],
  "O artigo que você procura não existe ou foi removido.": ["The article you are looking for does not exist or has been removed.", "El artículo que buscas no existe o ha sido eliminado."],
  "Brasil": ["Brazil", "Brasil"],
  "Seg - Sex: 9h às 18h": ["Mon–Fri: 9 am–6 pm (Brasília time)", "Lun–Vie: 9:00–18:00 (hora de Brasilia)"],
  "Sáb: 9h às 13h": ["Sat: 9 am–1 pm (Brasília time)", "Sáb: 9:00–13:00 (hora de Brasilia)"],
  "Pular para o conteúdo principal": ["Skip to main content", "Saltar al contenido principal"],
  "Enviar Proposta": ["Submit Proposal", "Enviar Propuesta"],
  "+ integrações enterprise": ["+ enterprise integrations", "+ integraciones empresariales"],
  "Marketplace de Integrações": ["Integrations Marketplace", "Marketplace de Integraciones"],
  "Conectamos seu produto a todo o ecossistema que sua operação precisa. Deploy, IA, pagamentos, comunicação, observabilidade — entregue chave-na-mão pela SevenDevX.": ["We connect your product to the ecosystem your operation needs. Deployment, AI, payments, communication and observability — delivered end to end by SevenDevX.", "Conectamos tu producto con el ecosistema que tu operación necesita. Despliegue, IA, pagos, comunicación y observabilidad — de principio a fin con SevenDevX."],
  "Webhooks com retry/DLQ": ["Webhooks with retries/DLQ", "Webhooks con reintentos/DLQ"],
  "Logs e observabilidade": ["Logs and observability", "Registros y observabilidad"],
  "Todas ·": ["All ·", "Todas ·"],
  "Nenhuma integração encontrada para \"": ["No integrations found for \"", "No se encontraron integraciones para \""],
  "Não viu sua ferramenta?": ["Can't find your tool?", "¿No encuentras tu herramienta?"],
  "Construímos integrações sob demanda. Webhooks customizados, OAuth, sync bidirecional, automações complexas — diga o que você precisa.": ["We build custom integrations: webhooks, OAuth, two-way sync and complex automations. Tell us what you need.", "Creamos integraciones a medida: webhooks, OAuth, sincronización bidireccional y automatizaciones complejas. Cuéntanos qué necesitas."],
  "Solicitar integração customizada": ["Request a custom integration", "Solicitar una integración a medida"],
  "Página não encontrada": ["Page not found", "Página no encontrada"],
  "O destino que você procura não existe neste servidor. Verifique o endereço ou retorne à base.": ["This page does not exist. Check the address or return to the homepage.", "Esta página no existe. Comprueba la dirección o vuelve al inicio."],
  "Voltar ao Início": ["Back to Home", "Volver al Inicio"],
  "Nossos Serviços": ["Our Services", "Nuestros Servicios"],
  "Ativo": ["Active", "Activo"],
  "Perfil completo": ["Complete profile", "Perfil completo"],
  "Membro desde": ["Member since", "Miembro desde"],
  "Último acesso": ["Last access", "Último acceso"],
  "Dados pessoais": ["Personal details", "Datos personales"],
  "Essas informações podem aparecer publicamente no site.": ["This information may appear publicly on the website.", "Esta información puede aparecer públicamente en el sitio."],
  "O e-mail não pode ser alterado por aqui.": ["Your email cannot be changed here.", "No puedes cambiar tu correo aquí."],
  "Salvar alterações": ["Save changes", "Guardar cambios"],
  "Segurança": ["Security", "Seguridad"],
  "Gerencie acesso e credenciais.": ["Manage access and credentials.", "Gestiona el acceso y las credenciales."],
  "Redefinir senha": ["Reset password", "Restablecer contraseña"],
  "Tour Guiado": ["Guided Tour", "Visita Guiada"],
  "Refaça o walkthrough inicial do SevenOS.": ["Restart the SevenOS introduction.", "Reinicia la introducción de SevenOS."],
  "Refazer tour": ["Restart tour", "Reiniciar visita"],
  "Área Admin": ["Admin Area", "Área Admin"],
  "Acesso privilegiado ao SevenOS.": ["Privileged access to SevenOS.", "Acceso privilegiado a SevenOS."],
  "Abrir SevenOS": ["Open SevenOS", "Abrir SevenOS"],
  "Sessão": ["Session", "Sesión"],
  "Sair desta conta neste dispositivo.": ["Sign out of this account on this device.", "Cierra la sesión de esta cuenta en este dispositivo."],
  "Encerrar sessão": ["Sign out", "Cerrar sesión"],
  "Projeto não encontrado.": ["Project not found.", "Proyecto no encontrado."],
  "Voltar aos projetos": ["Back to projects", "Volver a los proyectos"],
  "Ver projeto ao vivo": ["Visit live project", "Visitar proyecto"],
  "Repositório": ["Repository", "Repositorio"],
  "Sobre o projeto": ["About the project", "Sobre el proyecto"],
  "Stack utilizada": ["Technology stack", "Tecnologías utilizadas"],
  "Quer um projeto como esse?": ["Want a project like this?", "¿Quieres un proyecto como este?"],
  "Conte sua ideia e construímos uma solução sob medida para o seu negócio.": ["Tell us your idea and we will build a solution tailored to your business.", "Cuéntanos tu idea y crearemos una solución a medida para tu negocio."],
  "Solicitar orçamento": ["Request a quote", "Solicitar presupuesto"],
  "Validando sua sessão…": ["Validating your session…", "Validando tu sesión…"],
  "A nova senha será aplicada à conta autenticada nesta sessão.": ["The new password will apply to the account authenticated in this session.", "La nueva contraseña se aplicará a la cuenta autenticada en esta sesión."],
  "Nova senha": ["New password", "Nueva contraseña"],
  "Confirmar nova senha": ["Confirm new password", "Confirmar nueva contraseña"],
  "Abra o link de recuperação recebido por email ou solicite um novo.": ["Open the recovery link sent by email or request a new one.", "Abre el enlace de recuperación recibido por correo o solicita uno nuevo."],
  "Voltar ao acesso": ["Back to sign in", "Volver al acceso"],
  "Carregando...": ["Loading...", "Cargando..."],
  "Comparativo Rápido": ["Quick Comparison", "Comparación Rápida"],
  "Recurso": ["Feature", "Característica"],
  "Soluções Premium": ["Premium Solutions", "Soluciones Premium"],
  "Transforme sua Visão em Realidade Digital": ["Turn Your Vision into Digital Reality", "Transforma tu Visión en Realidad Digital"],
  "Do conceito ao lançamento — entregamos soluções com design premium, performance otimizada e suporte que garante resultados.": ["From concept to launch — solutions with premium design, optimized performance and ongoing support.", "Del concepto al lanzamiento — soluciones con diseño premium, rendimiento optimizado y soporte continuo."],
  "Ver Plano Mais Popular": ["View Most Popular Plan", "Ver el Plan Más Popular"],
  "Ver Todos os Planos": ["View All Plans", "Ver Todos los Planes"],
  "Planos de Desenvolvimento": ["Development Plans", "Planes de Desarrollo"],
  "Escolha a solução ideal para o seu projeto — preços transparentes e entregas objetivas.": ["Choose the right solution for your project — transparent pricing and clear deliverables.", "Elige la solución ideal para tu proyecto — precios transparentes y entregables claros."],
  "Mais Popular": ["Most Popular", "Más Popular"],
  "Solicitar Orçamento": ["Request a Quote", "Solicitar Presupuesto"],
  "Ver": ["View", "Ver"],
  "Serviços Premium": ["Premium Services", "Servicios Premium"],
  "Suporte e otimização contínua para garantir resultados reais.": ["Ongoing support and optimization for lasting results.", "Soporte y optimización continua para resultados duraderos."],
  "Contratar": ["Get started", "Contratar"],
  "Depoimentos": ["Testimonials", "Testimonios"],
  "Casos reais e resultados mensuráveis — o que clientes falam sobre nós.": ["Client experiences and measurable results — what clients say about us.", "Experiencias y resultados medibles — lo que dicen nuestros clientes."],
  "Pronto para Decolar?": ["Ready to Take Off?", "¿Listo para Despegar?"],
  "Fale com a nossa equipe e receba uma análise gratuita do seu projeto com recomendações práticas.": ["Talk to our team for a free project review with practical recommendations.", "Habla con nuestro equipo y recibe un análisis gratuito de tu proyecto con recomendaciones prácticas."],
  "Falar com Especialista": ["Talk to a Specialist", "Hablar con un Especialista"],
  "AI Hub da SevenDevX": ["SevenDevX AI Hub", "AI Hub de SevenDevX"],
  "Para agentes de IA e sistemas RAG": ["For AI agents and RAG systems", "Para agentes de IA y sistemas RAG"],
  "A SevenDevX disponibiliza arquivos otimizados para descoberta automática:": ["SevenDevX provides files for automated discovery:", "SevenDevX ofrece archivos para el descubrimiento automatizado:"],
  "Site map para LLMs": ["Site map for LLMs", "Mapa del sitio para LLMs"],
  "Política de uso por IA": ["AI usage policy", "Política de uso por IA"],
  "Sitemap completo": ["Full sitemap", "Mapa del sitio completo"],
  "+ recursos": ["+ resources", "+ recursos"],
  "Projetos reais. Resultados mensuráveis.": ["Real projects. Measurable results.", "Proyectos reales. Resultados medibles."],
  "Todos os cases": ["All case studies", "Todos los casos"],
  "Problema": ["Challenge", "Problema"],
  "Solução": ["Solution", "Solución"],
  "Resultado": ["Outcome", "Resultado"],
  "Serviços envolvidos": ["Services provided", "Servicios prestados"],
  "Mapa semântico de conteúdo": ["Semantic content map", "Mapa semántico de contenido"],
  "Conteúdos relacionados": ["Related content", "Contenido relacionado"],
  "Diferenciais": ["Our strengths", "Diferenciales"],
  "Por que cada detalhe importa": ["Why every detail matters", "Por qué cada detalle importa"],
  "Projetos entregues": ["Delivered projects", "Proyectos entregados"],
  "Sites reais, resultados reais": ["Real websites, real results", "Sitios reales, resultados reales"],
  "Ver portfólio completo": ["View full portfolio", "Ver portafolio completo"],
  "Destaque": ["Featured", "Destacado"],
  "Processo": ["Process", "Proceso"],
  "Do briefing ao launch": ["From brief to launch", "Del briefing al lanzamiento"],
  "Comparativo": ["Comparison", "Comparación"],
  "Critério": ["Criterion", "Criterio"],
  "Fonte:": ["Source:", "Fuente:"],
  "Perguntas frequentes": ["Frequently asked questions", "Preguntas frecuentes"],
  "Tire suas dúvidas": ["Your questions answered", "Resuelve tus dudas"],
  "min de leitura": ["min read", "min de lectura"],
  "Resposta direta": ["Direct answer", "Respuesta directa"],
  "Perguntas Frequentes": ["Frequently Asked Questions", "Preguntas Frecuentes"],
  "Conteúdo relacionado": ["Related content", "Contenido relacionado"],
  "Desenvolvimento Web em": ["Web Development in", "Desarrollo Web en"],
  "A SevenDevX atende empresas em": ["SevenDevX serves businesses in", "SevenDevX atiende empresas en"],
  "Fale com a SevenDevX": ["Talk to SevenDevX", "Habla con SevenDevX"],
  "Catálogo": ["Catalogue", "Catálogo"],
  "Ver todos os serviços": ["View all services", "Ver todos los servicios"],
  "Outras cidades atendidas": ["Other cities we serve", "Otras ciudades atendidas"],
  "Para quais segmentos": ["Industries served", "Sectores atendidos"],
  "O que está incluso": ["What is included", "Qué incluye"],
  "Leitura relacionada": ["Related reading", "Lectura relacionada"],
  "Pronto para começar?": ["Ready to get started?", "¿Listo para empezar?"],
  "Solicite um orçamento gratuito em 24h.": ["Request a free quote within 24 hours.", "Solicita un presupuesto gratuito en 24 horas."],
  "Soluções": ["Solutions", "Soluciones"],
  "Selecione uma vertical para ver detalhes técnicos e exemplos.": ["Select an area to explore technical details and examples.", "Selecciona un área para ver detalles técnicos y ejemplos."],
  "Por que SevenDevX": ["Why SevenDevX", "Por qué SevenDevX"],
  "Diferenciais técnicos": ["Technical strengths", "Diferenciales técnicos"],
  "Pronto para conversar?": ["Ready to talk?", "¿Hablamos?"],
  "Solicite um orçamento gratuito ou veja nossos serviços.": ["Request a free quote or explore our services.", "Solicita un presupuesto gratuito o conoce nuestros servicios."],
  "Ver Serviços": ["View Services", "Ver Servicios"],
  "CRIAÇÃO DE SITES": ["WEBSITE DEVELOPMENT", "CREACIÓN DE SITIOS"],
  "SOLUÇÕES": ["SOLUTIONS", "SOLUCIONES"],
  "Abrir menu": ["Open menu", "Abrir menú"],
  "Fechar menu": ["Close menu", "Cerrar menú"],
  "Selecionar idioma": ["Select language", "Seleccionar idioma"],
  "Fale conosco no WhatsApp": ["Talk to us on WhatsApp", "Habla con nosotros por WhatsApp"],
  "Buscar integração...": ["Search integrations...", "Buscar integración..."],
  "Stack Tecnológica Completa": ["Complete Technology Stack", "Stack Tecnológico Completo"],
  "Sites e aplicações web sob medida": ["Custom websites and web applications", "Sitios y aplicaciones web a medida"],
  "Alta conversão para campanhas": ["High-conversion campaign pages", "Páginas de alta conversión para campañas"],
  "Estratégia e expertise técnica": ["Strategy and technical expertise", "Estrategia y experiencia técnica"],
  "Portfólio de Projetos | SevenDevX — Sites, SaaS & Sistemas Web": ["Project Portfolio | SevenDevX — Websites, SaaS & Web Systems", "Portafolio de Proyectos | SevenDevX — Sitios, SaaS y Sistemas Web"],
  "SevenDevX | Criação de Sites & Desenvolvimento Web Profissional": ["SevenDevX | Professional Websites & Web Development", "SevenDevX | Creación de Sitios y Desarrollo Web Profesional"],
  "Criação de sites profissionais, landing pages de alta conversão, sistemas web e SaaS. Desenvolvimento full stack com React, TypeScript e Node.js em Belo Horizonte.": ["Professional websites, high-conversion landing pages, web systems and SaaS. Full-stack development with React, TypeScript and Node.js in Belo Horizonte, Brazil.", "Sitios profesionales, landing pages de alta conversión, sistemas web y SaaS. Desarrollo full stack con React, TypeScript y Node.js en Belo Horizonte, Brasil."],
};

const normalize = (text: string) => text.replace(/\s+/g, " ").trim();
const indexes: Record<"en" | "es", Map<string, string>> = { en: new Map(), es: new Map() };

// Reuse the existing typed dictionary. Never perform substring replacement or translate identifiers.
function indexTree(pt: unknown, en: unknown, es: unknown) {
  if (typeof pt === "string") {
    if (typeof en === "string") indexes.en.set(normalize(pt), en);
    if (typeof es === "string") indexes.es.set(normalize(pt), es);
  } else if (pt && typeof pt === "object") {
    for (const key of Object.keys(pt)) {
      indexTree((pt as Record<string, unknown>)[key], (en as Record<string, unknown> | undefined)?.[key], (es as Record<string, unknown> | undefined)?.[key]);
    }
  }
}
indexTree(translations.pt, translations.en, translations.es);
for (const [pt, [en, es]] of Object.entries({ ...publicCopy, ...commercialCopy, ...projectCopy, ...articleHeadlines, ...blogHeadlines, ...projectDetailsCopy, ...publicRouteCopy })) {
  indexes.en.set(normalize(pt), en);
  indexes.es.set(normalize(pt), es);
}

/** Unknown editorial copy falls back to its original; content is never fabricated or sent externally. */
export function translatePublicText<T>(value: T, language: Language): T {
  if (language === "pt" || typeof value !== "string") return value;
  const translated = indexes[language].get(normalize(value));
  if (!translated) return value;
  const leading = value.match(/^\s*/)?.[0] || "";
  const trailing = value.match(/\s*$/)?.[0] || "";
  return (leading + translated + trailing) as T;
}


/** Interpolate named values in a complete reviewed message, without translating user data. */
export function formatPublicMessage(template: string, values: Record<string, string | number>, language: Language): string {
  return translatePublicText(template, language).replace(/\{(\w+)\}/g, (token, key: string) => Object.prototype.hasOwnProperty.call(values, key) ? String(values[key]) : token);
}

/** Coverage check also accepts intentionally identical translations such as brand terms. */
export function hasReviewedPublicText(value: string): boolean {
  return indexes.en.has(normalize(value)) && indexes.es.has(normalize(value));
}
