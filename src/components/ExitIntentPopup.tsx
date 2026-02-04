import { useState, useEffect } from 'react';
import { X, Gift, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/i18n/LanguageContext';

/**
 * 💎 Exit Intent Popup - Captura visitantes antes de saírem
 * Mostra oferta especial quando o mouse sai da viewport
 */
const ExitIntentPopup = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Só mostra uma vez por sessão
    const shown = sessionStorage.getItem('exit-popup-shown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Detecta quando o mouse sai pela parte superior
      if (e.clientY <= 10 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
        sessionStorage.setItem('exit-popup-shown', 'true');
      }
    };

    // Aguarda 3s antes de ativar (evita trigger acidental)
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 3000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleCTA = () => {
    setIsVisible(false);
    const contactSection = document.getElementById('contact');
    contactSection?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-8 shadow-2xl relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t.accessibility.closeModal}
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Gift className="h-8 w-8 text-primary" />
        </div>

        {/* Content */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-3">{t.modals.exitIntent.title}</h3>
          <p className="text-muted-foreground mb-2">
            {t.modals.exitIntent.subtitle}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {t.modals.exitIntent.description}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleCTA}
              size="lg"
              className="w-full group"
            >
              {t.modals.exitIntent.cta}
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t.modals.exitIntent.dismiss}
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            {t.modals.exitIntent.trustBadge}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExitIntentPopup;
