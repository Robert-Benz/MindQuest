import { Home, Calendar, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/menu", icon: Home, label: "Início" },
    { path: "/calendario", icon: Calendar, label: "Calendário" },
    { path: "/perfil", icon: User, label: "Perfil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-safe">
      <div className="max-w-md mx-auto flex justify-around items-center p-3">
        {navItems.map((item) => {
          const isActive = location.pathname.toLowerCase() === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-all ${
                isActive ? "text-peach-500 scale-110" : "text-slate-400 hover:text-peach-400"
              }`}
            >
              <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-bold ${isActive ? "opacity-100" : "opacity-0 h-0"}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}