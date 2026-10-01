import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, CheckSquare, User } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/menu", label: "Início", icon: Home },
    { path: "/calendario", label: "Calendário", icon: Calendar },
    { path: "/atividades", label: "Atividades", icon: CheckSquare },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <>
      {/* Espaçador invisível */}
      <div className="h-28 w-full pointer-events-none" aria-hidden="true" />

      {/* Barra de Navegação Fixa */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-[var(--primary-light)] py-3 px-6 flex justify-around items-center max-w-lg mx-auto rounded-t-2xl shadow-lg shadow-slate-900/5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.toLowerCase() === item.path.toLowerCase();

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={isActive ? { color: "var(--primary)" } : {}}
              className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${
                isActive ? "scale-105" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon 
                size={22} 
                className={isActive ? "fill-[var(--primary-light)]" : "fill-transparent"}
              />
              <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}