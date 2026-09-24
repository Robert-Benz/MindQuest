import { useNavigate, useLocation } from "react-router-dom";
import { Users, User, MessageSquare, BriefcaseMedical,Home } from "lucide-react";

export default function BottomNavPsicologo() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/MenuPsicologo", label: "Início", icon: Home},
    { path: "/PerfilPsicologo", label: "Perfil", icon: User},
  ];

  return (
    <>
      {/* Espaçador invisível para o conteúdo final da tela não ficar oculto atrás da barra */}
      <div className="h-28 w-full pointer-events-none" aria-hidden="true" />

      {/* Barra de Navegação com z-30 para não cobrir modais */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-peach-100 py-3.5 px-8 flex justify-around items-center max-w-sm mx-auto rounded-t-[2.5rem] shadow-lg shadow-orange-900/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isActive ? "text-[#E97451] scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={22} className={isActive ? "fill-orange-100" : ""} />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}