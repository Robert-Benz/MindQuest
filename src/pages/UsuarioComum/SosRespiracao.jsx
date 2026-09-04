import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, HeartPulse, PhoneCall, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function SosRespiracao() {
  const navigate = useNavigate();
  const [fase, setFase] = useState("Inspire profundamente...");
  const [tempo, setTempo] = useState(4);
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    let intervalo;
    if (ativo) {
      intervalo = setInterval(() => {
        setTempo((prev) => {
          if (prev === 1) {
            if (fase === "Inspire profundamente...") {
              setFase("Segure a respiração...");
              return 4;
            } else if (fase === "Segure a respiração...") {
              setFase("Expire devagar...");
              return 4;
            } else {
              setFase("Inspire profundamente...");
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [ativo, fase]);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28 flex flex-col justify-between">
      <div className="max-w-xl mx-auto w-full space-y-6">
        
        {/* Topo */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/menu")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Painel Principal
          </button>
          <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-3 py-1 rounded-full text-red-600 text-[10px] font-bold">
            <ShieldAlert size={12} /> Apoio de Emergência
          </div>
        </div>

        {/* Header */}
        <div className="bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 text-center space-y-2">
          <div className="size-12 rounded-2xl bg-peach-50 text-peach-500 flex items-center justify-center mx-auto mb-3">
            <HeartPulse size={24} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Espaço de Calma (SOS)</h1>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Se estiver sentindo ansiedade intensa ou falta de ar, pause por um momento e acompanhe o exercício de respiração abaixo.
          </p>
        </div>

        {/* Círculo de Respiração Animado */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-white shadow-sm flex flex-col items-center justify-center text-center space-y-8">
          <div className="relative size-56 flex items-center justify-center">
            
            {/* Anéis de expansão */}
            <motion.div 
              animate={ativo ? {
                scale: fase === "Inspire profundamente..." ? [1, 1.25] : fase === "Expire devagar..." ? [1.25, 1] : [1.25, 1.25],
                opacity: [0.3, 0.6, 0.3]
              } : { scale: 1 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-peach-200/50"
            />

            <motion.div 
              animate={ativo ? {
                scale: fase === "Inspire profundamente..." ? [1, 1.15] : fase === "Expire devagar..." ? [1.15, 1] : [1.15, 1.15],
              } : { scale: 1 }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-4 rounded-full bg-peach-400/30"
            />

            <div className="relative z-10 size-36 rounded-full bg-gradient-to-br from-orange-400 to-[#E97451] flex flex-col items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <span className="text-3xl font-black">{ativo ? tempo : "Paz"}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">{ativo ? "Segundos" : "Pronto"}</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-black text-slate-800">{ativo ? fase : "Respire fundo e clique em iniciar"}</h2>
            <p className="text-xs text-slate-400">Siga o movimento do círculo para cadenciar o seu fôlego.</p>
          </div>

          <button 
            onClick={() => {
              setAtivo(!ativo);
              setFase("Inspire profundamente...");
              setTempo(4);
            }}
            className="w-full max-w-xs py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            {ativo ? "Pausar Exercício" : "Iniciar Respiração"}
          </button>
        </div>

        {/* Card de Ajuda Humana (CVV) */}
        <div className="bg-gradient-to-r from-orange-50 to-peach-50 p-6 rounded-[2.5rem] border border-orange-100 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest block">Precisa de suporte humano?</span>
            <h3 className="text-sm font-black text-slate-800">Centro de Valorização da Vida</h3>
            <p className="text-[11px] text-slate-500">Atendimento sigiloso 24h por dia via ligação.</p>
          </div>
          <a 
            href="tel:188"
            className="size-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/30 transition-all shrink-0"
            title="Ligar para 188"
          >
            <PhoneCall size={20} />
          </a>
        </div>

      </div>
    </div>
  );
}