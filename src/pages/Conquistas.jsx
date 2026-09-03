import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Award, Flame, Smile, Film, 
  MapPin, BookOpen, Moon, Lock, CheckCircle2, Leaf, Headphones
} from "lucide-react";
import { motion } from "framer-motion";

/* =========================================================
   DADOS SIMULADOS DAS CONQUISTAS (BADGES)
========================================================= */
const conquistas = [
  {
    id: 1,
    titulo: "Semente Plantada",
    descricao: "Deu o primeiro passo e completou seu perfil.",
    icone: Leaf,
    cor: "text-emerald-500",
    bgCor: "bg-emerald-50",
    borderCor: "border-emerald-100",
    desbloqueado: true,
    data: "Hoje",
  },
  {
    id: 2,
    titulo: "Coração Leve",
    descricao: "Registrou uma melhora de humor em 3 dias seguidos.",
    icone: Smile,
    cor: "text-pink-500",
    bgCor: "bg-pink-50",
    borderCor: "border-pink-100",
    desbloqueado: true,
    data: "Ontem",
  },
  {
    id: 3,
    titulo: "Escritor da Alma",
    descricao: "Escreveu 5 registros profundos no seu diário.",
    icone: BookOpen,
    cor: "text-amber-500",
    bgCor: "bg-amber-50",
    borderCor: "border-amber-100",
    desbloqueado: true,
    data: "Há 2 dias",
  },
  {
    id: 4,
    titulo: "Cinéfilo Zen",
    descricao: "Assistiu a um Comfort Movie recomendado pelo app.",
    icone: Film,
    cor: "text-purple-500",
    bgCor: "bg-purple-50",
    borderCor: "border-purple-100",
    desbloqueado: true,
    data: "Há 1 semana",
  },
  {
    id: 5,
    titulo: "Chama Acesa",
    descricao: "Manteve uma sequência de uso por 7 dias seguidos.",
    icone: Flame,
    cor: "text-orange-500",
    bgCor: "bg-orange-50",
    borderCor: "border-orange-100",
    desbloqueado: false,
    progresso: 5,
    meta: 7,
  },
  {
    id: 6,
    titulo: "Mente Serena",
    descricao: "Completou 10 sessões de meditação guiada.",
    icone: Headphones,
    cor: "text-blue-500",
    bgCor: "bg-blue-50",
    borderCor: "border-blue-100",
    desbloqueado: false,
    progresso: 8,
    meta: 10,
  },
  {
    id: 7,
    titulo: "Explorador Local",
    descricao: "Visitou um novo local relaxante ao ar livre.",
    icone: MapPin,
    cor: "text-teal-500",
    bgCor: "bg-teal-50",
    borderCor: "border-teal-100",
    desbloqueado: false,
    progresso: 0,
    meta: 1,
  },
  {
    id: 8,
    titulo: "Sono de Pedra",
    descricao: "Cumpriu a rotina noturna completa.",
    icone: Moon,
    cor: "text-indigo-500",
    bgCor: "bg-indigo-50",
    borderCor: "border-indigo-100",
    desbloqueado: false,
    progresso: 0,
    meta: 1,
  },
];

/* =========================================================
   ANIMAÇÕES DO FRAMER MOTION
========================================================= */
const containerAnimacao = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemAnimacao = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */
export default function Conquistas() {
  const navigate = useNavigate();

  const conquistasDesbloqueadas = conquistas.filter(c => c.desbloqueado).length;
  const totalConquistas = conquistas.length;
  const progressoTotal = Math.round((conquistasDesbloqueadas / totalConquistas) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO E NAVEGAÇÃO */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Perfil
          </button>

          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <Award size={14} className="text-orange-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Galeria de Badges
            </span>
          </div>
        </div>

        {/* HEADER: RESUMO DE CONQUISTAS */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center overflow-hidden"
        >
          {/* Efeitos de Luz de Fundo */}
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <Award size={40} className="fill-white/20" />
            <Sparkles className="absolute -top-2 -right-2 size-6 text-yellow-300 animate-pulse" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Suas Conquistas</h1>
          <p className="text-xs text-slate-500 mt-1 mb-5">Cada pequeno passo constrói a sua jornada.</p>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>Progresso Total</span>
              <span className="text-orange-500">{conquistasDesbloqueadas} de {totalConquistas}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden p-[1px]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#E97451]"
                initial={{ width: 0 }}
                animate={{ width: `${progressoTotal}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* LISTA DE BADGES EM GRID */}
        <motion.div 
          variants={containerAnimacao}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-4"
        >
          {conquistas.map((badge) => {
            const Icone = badge.icone;

            return (
              <motion.div 
                key={badge.id}
                variants={itemAnimacao}
                className={`relative p-5 rounded-[2rem] border flex flex-col items-center text-center transition-all duration-300 ${
                  badge.desbloqueado 
                    ? "bg-white border-white shadow-md hover:shadow-lg hover:-translate-y-1 cursor-pointer" 
                    : "bg-slate-50/50 border-slate-100 opacity-80 grayscale-[0.3]"
                }`}
              >
                {/* Ícone Bloqueado/Desbloqueado */}
                {!badge.desbloqueado && (
                  <div className="absolute top-4 right-4 text-slate-300">
                    <Lock size={14} />
                  </div>
                )}
                {badge.desbloqueado && (
                  <div className="absolute top-4 right-4 text-emerald-400">
                    <CheckCircle2 size={16} className="fill-emerald-50" />
                  </div>
                )}

                {/* Badge Visual */}
                <div className={`size-16 rounded-[1.25rem] flex items-center justify-center mb-3 shadow-sm ${
                  badge.desbloqueado ? badge.bgCor : "bg-slate-200"
                }`}>
                  <Icone className={`size-8 ${badge.desbloqueado ? badge.cor : "text-slate-400"}`} />
                </div>

                {/* Textos */}
                <h3 className={`text-sm font-black tracking-tight leading-tight ${
                  badge.desbloqueado ? "text-slate-800" : "text-slate-500"
                }`}>
                  {badge.titulo}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 leading-snug">
                  {badge.descricao}
                </p>

                {/* Área Inferior (Data ou Progresso) */}
                <div className="mt-auto pt-3 w-full">
                  {badge.desbloqueado ? (
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${badge.bgCor} ${badge.cor}`}>
                      {badge.data}
                    </span>
                  ) : (
                    <div className="w-full space-y-1.5">
                      <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-wide px-1">
                        <span>Progresso</span>
                        <span>{badge.progresso}/{badge.meta}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div 
                          className="h-full bg-slate-400 rounded-full" 
                          style={{ width: `${(badge.progresso / badge.meta) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </div>
  );
}