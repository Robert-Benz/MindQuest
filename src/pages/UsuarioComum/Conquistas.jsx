import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles, Award, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import HeaderUsuario from "../../components/HeaderUsuario";
import BottomNav from "../../components/BottomNav";
import { configConquistas } from "../../utils/conquistas";
import { buscaMetricas,estadoConquista,calcularResumoConquistas } from "../../utils/resumoConquistas";

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
        const dadosMetricas = await buscaMetricas(db, user.uid);
        setMetricas(dadosMetricas);
      } catch (err) {
        console.error("Erro ao carregar conquistas:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center transition-colors duration-300">
        <Sparkles className="text-app-primary size-8 animate-spin" />
      </div>
    );
  }

  // Cálculo usado no Perfil: níveis ganhos / níveis totais
  const { ganhos, total, percent } = calcularResumoConquistas(metricas);

  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-8 text-app-text transition-colors duration-300 antialiased font-sans pb-32">
      <HeaderUsuario />

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate("/Menu")} 
            className="flex items-center gap-2 text-sm font-semibold text-app-muted hover:text-app-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Painel Principal
          </button>

          <div className="flex items-center gap-1.5 bg-app-card border border-app-border px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <Award size={14} className="text-app-primary" />
            <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">
              Troféus e Badges
            </span>
          </div>
        </div>

        {/* Resumo Geral */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-app-card rounded-[2.75rem] border border-app-border shadow-xl p-7 md:p-9 text-center"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-app-primary flex items-center justify-center shadow-lg text-white">
            <Award size={38} className="fill-white/20" />
            <Sparkles className="absolute -top-2 -right-2 size-6 text-yellow-300 animate-pulse" />
          </div>

          <h1 className="text-2xl font-black text-app-text tracking-tight">Galeria de Conquistas</h1>
          <p className="text-xs text-app-muted mt-1 mb-6">
            Evolua as suas badges à medida que cuida da sua mente diariamente.
          </p>

          {/* Progresso geral */}
          <div className="space-y-1.5 text-left">
            <div className="flex justify-between text-[10px] font-bold text-app-muted">
              <span>{ganhos} de {total} níveis conquistados</span>
              <span className="text-app-text font-extrabold">{percent}%</span>
            </div>
            <div className="h-2 rounded-full bg-app-bg border border-app-border overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-app-primary"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Grid de Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {configConquistas.map((badge) => {
            const Icone = badge.icone;
            const estado = estadoConquista(badge, metricas);

            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -3 }}
                className={`relative p-6 rounded-[2.25rem] border transition-all flex flex-col justify-between ${
                  estado.desbloqueado
                    ? "bg-app-card border-app-border shadow-sm hover:border-app-primary/50 hover:shadow-md"
                    : "bg-app-bg border-app-border opacity-75"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`size-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    estado.desbloqueado ? "bg-app-bg border border-app-border" : "bg-app-bg border border-app-border text-app-muted"
                  }`}>
                    <Icone className={`size-7 ${estado.desbloqueado ? badge.cor || "text-app-primary" : "text-app-muted"}`} />
                  </div>

                  {estado.desbloqueado ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-app-primary shadow-sm flex items-center gap-1">
                      <Sparkles size={11} /> Nível {estado.nivelAlcancado}
                    </span>
                  ) : (
                    <span className="p-2 rounded-xl bg-app-card border border-app-border text-app-muted">
                      <Lock size={14} />
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-5">
                  <h3 className="text-base font-black text-app-text tracking-tight leading-snug">
                    {estado.titulo}
                  </h3>
                  <p className="text-xs text-app-muted leading-relaxed font-medium">
                    {estado.descricao}
                  </p>
                </div>

                <div className="pt-3 border-t border-app-border mt-auto">
                  {estado.proximoNivel ? (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold text-app-muted">
                        <span>Próximo: Nível {estado.proximoNivel.lvl}</span>
                        <span className="text-app-text font-extrabold">
                          {estado.valorAtual} / {estado.metaAtual}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-app-bg border border-app-border overflow-hidden">
                        <motion.div
                          className="h-full rounded-full bg-app-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${estado.progressoPercent}%` }}
                          transition={{ duration: 0.6 }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-1 text-app-primary text-xs font-bold bg-app-bg border border-app-border rounded-xl">
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
