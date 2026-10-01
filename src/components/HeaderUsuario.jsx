import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Settings } from "lucide-react";
import { motion } from "framer-motion";
import logoReduzido from "../assets/LogoPessegoReduzido.png";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";

export default function HeaderUsuario() {
  const navigate = useNavigate();
  const [userXP, setUserXP] = useState(0);

  useEffect(() => {
    let unsubUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      try {
        const userRef = doc(db, "usuarios", user.uid);
        unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUserXP(docSnap.data().xp || 0);
          }
        }, (err) => {
          console.warn("Erro ao ouvir XP no header:", err);
        });
      } catch (e) {
        console.warn(e);
      }
    });

    return () => {
      unsubUser();
      unsubscribeAuth();
    };
  }, []);

  const nivelAtual = Math.floor(userXP / 100) + 1;
  const xpProgresso = userXP % 100;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FFFBF9]/85 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-[var(--primary-light)]">
        {/* Lado Esquerdo: Logo e Nome */}
        <div 
          onClick={() => navigate("/menu")} 
          className="flex items-center gap-3 cursor-pointer select-none"
        >
          <div className="bg-white p-1 rounded-xl border border-[var(--primary-light)] shadow-xs flex items-center justify-center w-10 h-10 overflow-hidden">
            <img 
              src={logoReduzido} 
              alt="MindQuest Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[var(--primary)] font-bold leading-none">
              MindQuest
            </p>
          </div>
        </div>

        {/* Lado Direito: Nível, Barra de XP e Perfil */}
        <div className="flex items-center gap-4">
          <div 
            onClick={() => navigate("/perfil")}
            className="flex flex-col items-end cursor-pointer"
            title="Ver progresso"
          >
            <div className="flex items-center gap-1.5 bg-[var(--primary-light)] px-2.5 py-1 rounded-xl border border-[var(--primary-light)] shadow-xs">
              <Sparkles className="size-3.5 text-[var(--primary)]" />
              <span className="text-xs font-black text-[var(--primary)]">Nível {nivelAtual}</span>
            </div>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <motion.div 
                className="h-full bg-[var(--primary)] rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${xpProgresso}%` }} 
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={() => navigate("/perfil")}
            className="bg-white p-2.5 rounded-xl shadow-xs border border-[var(--primary-light)] text-[var(--primary)] hover:opacity-80 transition-opacity cursor-pointer"
            title="Configurações e Perfil"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Espaçador para o topo da página não ficar sob a barra fixa */}
      <div className="h-20 w-full" aria-hidden="true" />
    </>
  );
}