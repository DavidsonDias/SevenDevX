import { useLanguage } from './LanguageContext';

const experienceCopy = {
  pt: {
    universeLabel: 'Universo de projetos SevenDevX', signature: 'SEVENDEVX® / DESIGN + ENGENHARIA',
    skip: 'Pular experiência', eyebrow: 'IDEIAS QUE GANHAM VIDA.', titleOne: 'UM UNIVERSO', titleTwo: 'DE POSSIBILIDADES.',
    introOne: 'Identidade, tecnologia e experiências digitais.', introTwo: 'Explore o que já construímos.', explore: 'Explorar projetos',
    scroll: 'PROJETOS SEVENDEVX · ROLE PARA EXPLORAR', staticNotice: 'Explore os projetos no catálogo completo abaixo.',
    gallery: 'Galeria de projetos', projects: 'SEVENDEVX / PROJETOS', empty: 'Nenhum projeto',
    compact: 'Visão compacta', spatial: 'Voltar à galeria 3D', previous: 'Projeto anterior', next: 'Próximo projeto',
    select: 'Selecionar projeto', selectPrefix: 'Selecionar',
    help: 'Explore pelos controles ou selecione um projeto. Os detalhes e tecnologias continuam nos cards.',
  },
  en: {
    universeLabel: 'SevenDevX project universe', signature: 'SEVENDEVX® / DESIGN + ENGINEERING',
    skip: 'Skip experience', eyebrow: 'IDEAS BROUGHT TO LIFE.', titleOne: 'A UNIVERSE', titleTwo: 'OF POSSIBILITIES.',
    introOne: 'Identity, technology and digital experiences.', introTwo: 'Explore what we have built.', explore: 'Explore projects',
    scroll: 'SEVENDEVX PROJECTS · SCROLL TO EXPLORE', staticNotice: 'Explore the projects in the full catalogue below.',
    gallery: 'Project gallery', projects: 'SEVENDEVX / PROJECTS', empty: 'No projects',
    compact: 'Compact view', spatial: 'Back to 3D gallery', previous: 'Previous project', next: 'Next project',
    select: 'Select project', selectPrefix: 'Select',
    help: 'Use the controls or select a project. Details and technologies remain in the cards.',
  },
  es: {
    universeLabel: 'Universo de proyectos SevenDevX', signature: 'SEVENDEVX® / DISEÑO + INGENIERÍA',
    skip: 'Saltar experiencia', eyebrow: 'IDEAS QUE COBRAN VIDA.', titleOne: 'UN UNIVERSO', titleTwo: 'DE POSIBILIDADES.',
    introOne: 'Identidad, tecnología y experiencias digitales.', introTwo: 'Explora lo que hemos creado.', explore: 'Explorar proyectos',
    scroll: 'PROYECTOS SEVENDEVX · DESPLÁZATE PARA EXPLORAR', staticNotice: 'Explora los proyectos en el catálogo completo de abajo.',
    gallery: 'Galería de proyectos', projects: 'SEVENDEVX / PROYECTOS', empty: 'Ningún proyecto',
    compact: 'Vista compacta', spatial: 'Volver a la galería 3D', previous: 'Proyecto anterior', next: 'Siguiente proyecto',
    select: 'Seleccionar proyecto', selectPrefix: 'Seleccionar',
    help: 'Usa los controles o selecciona un proyecto. Los detalles y las tecnologías siguen en las tarjetas.',
  },
} as const;

export function useExperienceCopy() {
  return experienceCopy[useLanguage().language];
}
