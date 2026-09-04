import { useNavigate, useLocation } from "react-router-dom";
import { Users, Calendar, MessageSquare, UserSquare2, BriefcaseMedical } from "lucide-react";

export default function BottomNavPsicologo() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: "/painel-psicologo", label: "Início", icon: Users, tab: "pacientes" },
    { path: "/calendario-psicologo", label: "Agenda", icon: Calendar },
    { path: "/painel-psicologo", label: "Serviços", icon: BriefcaseMedical, tab: "servicos" },
    { path: "/painel-psicologo", label: "Mensagens", icon: MessageSquare, tab: "chat" },
    { path: "/painel-psicologo", label: "Perfil", icon: UserSquare2, tab: "perfil" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-t border-peach-100 py-3 px-4 flex justify-around items-center max-w-lg mx-auto rounded-t-[2.5rem] shadow-lg shadow-orange-900/5">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const searchParams = new URLSearchParams(location.search);
        const currentTab = searchParams.get("aba") || "pacientes";
        
        const isActive = item.tab 
          ? location.pathname === item.path && currentTab === item.tab 
          : location.pathname === item.path;

        return (
          <button
            key={idx}
            onClick={() => {
              if (item.tab) {
                navigate(`${item.path}?aba=${item.tab}`);
              } else {
                navigate(item.path);
              }
            }}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? "text-[#E97451] scale-105" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Icon size={20} className={isActive ? "fill-orange-100" : ""} />
            <span className="text-[9px] font-bold tracking-wide">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}