import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Award, CheckCircle2, Lock 
} from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import HeaderUsuario from "../../components/HeaderUsuario";
import BottomNav from "../../components/BottomNav";
import { CONFIG_CONQUISTAS } from "../../utils/conquistas";

export default function Conquistas() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    totalHumores: 0,
    totalMissoes: 0,
    nivelApp: 1,
    temTerapeuta: 0,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        // 1. Dados cadastrais e XP
        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        const xp = userData.xp || 0;
        const nivelAtual = Math.floor(xp / 100) + 1;
        const temTerapeuta = userData.terapeuta ? 1 : 0;

        // 2. Registos de humor
        const humoresSnap = await getDocs(collection(db, "usuarios", user.uid, "registrosHumor"));
        const totalHumores = humoresSnap.size;

        // 3. Atividades concluídas
        const ativQuery = query(
          collection(db, "usuarios", user.uid, "atividades"),
          where("concluida", "==", true)
        );
        const ativSnap = await getDocs(ativQuery);
        const totalMissoes = ativSnap.size;

        setMetricas({
          totalHumores,
          totalMissoes,
          nivelApp: nivelAtual,
          temTerapeuta,
        });
      } catch (err) {
        console.error("Erro ao carregar conquistas:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const calcularEstadoBadge = (categoria) => {
    let valorAtual = 0;
    if (categoria.tipo === "humor") valorAtual = metricas.totalHumores;
    if (categoria.tipo === "missoes") valorAtual = metricas.totalMissoes;
    if (categoria.tipo === "nivelApp") valorAtual = metricas.nivelApp;
    if (categoria.tipo === "terapeuta") valorAtual = metricas.temTerapeuta ? Math.max(1, metricas.totalHumores) : 0;

    let nivelAlcancado = 0;
    let proximoNivel = categoria.niveis[0];

    for (let i = 0; i < categoria.niveis.length; i++) {
      if (valorAtual >= categoria.niveis[i].meta) {
        nivelAlcancado = categoria.niveis[i].lvl;
        proximoNivel = categoria.niveis[i + 1] || null;
      } else {
        proximoNivel = categoria.niveis[i];
        break;
      }
    }

    const nivelInfo = nivelAlcancado > 0 
      ? categoria.niveis.find((n) => n.lvl === nivelAlcancado) 
      : categoria.niveis[0];

    const metaAtual = proximoNivel ? proximoNivel.meta : nivelInfo.meta;
    const progressoPercent = proximoNivel 
      ? Math.min(100, Math.round((valorAtual / metaAtual) * 100))
      : 100;

    return {
      desbloqueado: nivelAlcancado > 0,
      nivelAlcancado,
      maxNivel: categoria.niveis.length,
      titulo: nivelAlcancado > 0 ? nivelInfo.titulo : categoria.nomeBase,
      descricao: nivelAlcancado > 0 ? nivelInfo.desc : `Próximo objetivo: ${categoria.niveis[0].desc}`,
      valorAtual,
      metaAtual,
      proximoNivel,
      progressoPercent,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-[#E97451] size-8 animate-spin" />
      </div>
    );
  }

  let totalTiersPossiveis = 0;
  let tiersGanhos = 0;

  CONFIG_CONQUISTAS.forEach((c) => {
    totalTiersPossiveis += c.niveis.length;
    const estado = calcularEstadoBadge(c);
    tiersGanhos += estado.nivelAlcancado;
  });

  const percentGeral = Math.round((tiersGanhos / totalTiersPossiveis) * 100);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32">
      <HeaderUsuario />

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate("/Menu")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#E97451] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Painel Principal
          </button>

          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <Award size={14} className="text-[#E97451]" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
              Troféus e Badges
            </span>
          </div>
        </div>

        {/* Resumo Geral */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center overflow-hidden"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-400 to-[#E97451] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white border-2 border-white">
            <Award size={38} className="fill-white/20" />
            <Sparkles className="absolute -top-2 -right-2 size-6 text-yellow-300 animate-pulse" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Galeria de Conquistas</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">
            Evolua as suas badges à medida que cuida da sua mente diariamente.
          </p>
        </motion.div>

        {/* Grid de Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CONFIG_CONQUISTAS.map((badge) => {
            const Icone = badge.icone;
            const estado = calcularEstadoBadge(badge);

            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -3 }}
                className={`relative p-6 rounded-[2.25rem] border transition-all flex flex-col justify-between ${
                  estado.desbloqueado
                    ? "bg-white border-orange-100/60 shadow-sm hover:shadow-md"
                    : "bg-slate-50/70 border-slate-200/70 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    estado.desbloqueado ? badge.bgCor : "bg-slate-200 text-slate-400"
                  }`}>
                    <Icone className={`size-7 ${estado.desbloqueado ? badge.cor : "text-slate-400"}`} />
                  </div>

                  {estado.desbloqueado ? (
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r ${badge.gradiente} shadow-sm flex items-center gap-1`}>
                      <Sparkles size={11} /> Nível {estado.nivelAlcancado}
                    </span>
                  ) : (
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-400">
                      <Lock size={14} />
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-5">
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-snug">
                    {estado.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {estado.descricao}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100/80 mt-auto">
                  {estado.proximoNivel ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Próximo: Nível {estado.proximoNivel.lvl}</span>
                        <span className="text-slate-700 font-extrabold">
                          {estado.valorAtual} / {estado.metaAtual}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full bg-gradient-to-r ${badge.gradiente}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${estado.progressoPercent}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-1 text-emerald-600 text-xs font-bold bg-emerald-50 rounded-xl">
                      <CheckCircle2 size={14} /> Nível Máximo Conquistado!
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}