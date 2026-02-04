import { useEffect, useRef, useState } from "react";

interface WhatsAppButtonProps {
  phone?: string;
  delay?: number;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phone = "5531984740625",
  delay = 3000,
}) => {
  const [visible, setVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const lastScrollTop = useRef(0);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  // Exibe o botão após o delay configurado
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);
      triggerShake();
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  // Controla visibilidade com base no scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > lastScrollTop.current) {
        setVisible(true);
        if (!hasAnimated) triggerShake();
      } else {
        setVisible(false);
      }

      lastScrollTop.current = Math.max(scrollTop, 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasAnimated]);

  // Animação de "shake" (uma vez só)
  const triggerShake = () => {
    if (hasAnimated || !buttonRef.current) return;
    setHasAnimated(true);
    const btn = buttonRef.current;
    btn.classList.add("shake");
    btn.addEventListener(
      "animationend",
      () => btn.classList.remove("shake"),
      { once: true }
    );
  };

  return (
    <a
      ref={buttonRef}
      href={`https://wa.me/${phone}?text=Olá%2C%20gostaria%20de%20saber%20mais%20sobre%20seus%20serviços!`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      title="Enviar mensagem no WhatsApp"
      className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform
        ${visible ? "opacity-100 scale-100" : "opacity-0 scale-0"}
        bg-[#25D366] hover:scale-110 hover:shadow-[0_0_15px_rgba(37,211,102,0.7)] hover:brightness-125`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        className="w-7 h-7 text-white fill-current"
      >
        <path
          fill="#EDEDED"
          d="M0,512l35.31-128C12.359,344.276,0,300.138,0,254.234C0,114.759,114.759,0,255.117,0S512,114.759,512,254.234S395.476,512,255.117,512c-44.138,0-86.51-14.124-124.469-35.31L0,512z"
        />
        <path
          fill="#55CD6C"
          d="M137.71,430.786l7.945,4.414c32.662,20.303,70.621,32.662,110.345,32.662 c115.641,0,211.862-96.221,211.862-213.628S371.641,44.138,255.117,44.138S44.138,137.71,44.138,254.234 c0,40.607,11.476,80.331,32.662,113.876l5.297,7.945l-20.303,74.152L137.71,430.786z"
        />
        <path
          fill="#FEFEFE"
          d="M187.145,135.945l-16.772-0.883c-5.297,0-10.593,1.766-14.124,5.297 c-7.945,7.062-21.186,20.303-24.717,37.959c-6.179,26.483,3.531,58.262,26.483,90.041s67.09,82.979,144.772,105.048 c24.717,7.062,44.138,2.648,60.028-7.062c12.359-7.945,20.303-20.303,22.952-33.545l2.648-12.359 c0.883-3.531-0.883-7.945-4.414-9.71l-55.614-25.6c-3.531-1.766-7.945-0.883-10.593,2.648l-22.069,28.248 c-1.766,1.766-4.414,2.648-7.062,1.766c-15.007-5.297-65.324-26.483-92.69-79.448c-0.883-2.648-0.883-5.297,0.883-7.062 l21.186-23.834c1.766-2.648,2.648-6.179,1.766-8.828l-25.6-57.379C193.324,138.593,190.676,135.945,187.145,135.945"
        />
      </svg>
    </a>
  );
};

export default WhatsAppButton;