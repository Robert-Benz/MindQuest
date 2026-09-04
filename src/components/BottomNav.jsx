import { useNavigate, useLocation } from "react-router-dom";
import { Home, Calendar, Heart, User } from "lucide-react";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/menu", label: "Início", icon: Home },
    { path: "/calendario", label: "Calendário", icon: Calendar },
    { path: "/minha-rede", label: "Minha Rede", icon: Heart },
    { path: "/perfil", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-slate-100 py-3 px-6 flex justify-around items-center max-w-lg mx-auto rounded-t-[2.5rem] shadow-lg shadow-slate-900/5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? "text-[#E97451] scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={22} className={isActive ? "fill-orange-100" : ""} />
            <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}