import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactMultiStep from '@/components/ContactMultiStep';
import SEOHead from '@/components/SEOHead';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAnalytics } from '@/hooks/useAnalytics';
export default function ContactPage(){
 const {language}=useLanguage();
 useAnalytics();
 const text={pt:['Contato — SevenDevX | Conte seu projeto','Converse com a SevenDevX sobre criação de sites, sistemas e soluções digitais. Organize os detalhes do projeto e solicite uma proposta.'],en:['Contact — SevenDevX | Tell us about your project','Talk to SevenDevX about websites, systems and digital solutions. Organize your project details and request a proposal.'],es:['Contacto — SevenDevX | Cuéntanos tu proyecto','Habla con SevenDevX sobre sitios web, sistemas y soluciones digitales. Organiza los detalles de tu proyecto y solicita una propuesta.']}[language];
 return <><SEOHead title={text[0]} description={text[1]} url="https://www.sevendevx.com/contact" type="website"/><div className="bg-background text-foreground min-h-screen"><Header/><main id="main-content" tabIndex={-1} className="pt-20 focus:outline-none"><h1 className="sr-only">{text[0]}</h1><ContactMultiStep/></main><Footer/></div></>;
}
