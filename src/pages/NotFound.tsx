import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center px-6">
        <h1 className="text-8xl md:text-9xl font-bold mb-8 uppercase tracking-tight">
          404
        </h1>
        <p className="text-xl md:text-2xl text-white/70 mb-12 tracking-wide">
          PÁGINA NÃO ENCONTRADA
        </p>
        <Link to="/">
          <button className="inline-flex items-center space-x-2 border-2 border-white px-8 py-4 text-sm tracking-widest uppercase font-semibold hover:bg-white hover:text-black transition-all duration-300">
            <span>Voltar ao Início</span>
            <ArrowRight size={16} />
          </button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
