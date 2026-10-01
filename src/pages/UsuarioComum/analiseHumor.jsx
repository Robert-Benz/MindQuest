import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BrainCircuit, Sparkles, Calendar, 
  ChevronRight, Smile, X, Brain, Tag 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";

export default function AnaliseHumor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analises, setAnalises] = useState([]);
  const [analiseAberta, setAnaliseAberta] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/home");
        return;
      }
      await carregarHistorico(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  const carregarHistorico = async (uid) => {
    try {
      const analiseRef = collection(db, "usuarios", uid, "analisesSemanais");
      const analiseSnap = await getDocs(query(analiseRef, orderBy("geradoEm", "desc")));
      
      const lista = analiseSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      setAnalises(lista);
    } catch (err) {
      console.error("Erro ao carregar histórico de análises:", err);
      toast.error("Erro ao carregar análises.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center transition-colors duration-300">
        <Sparkles className="text-app-primary size-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-8 text-app-text transition-colors duration-300 antialiased font-sans pb-32">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo e Navegação */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate("/Menu")} 
            className="flex items-center gap-2 text-sm font-semibold text-app-muted hover:text-app-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-1.5 bg-app-card border border-app-border px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <BrainCircuit size={14} className="text-app-primary" />
            <span className="text-[10px] font-black text-app-muted uppercase tracking-widest">Insights</span>
          </div>
        </div>

        {/* Card do Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-app-card rounded-[2.75rem] border border-app-border shadow-xl p-7 md:p-9 text-center"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-app-primary flex items-center justify-center shadow-lg text-white">
            <BrainCircuit size={36} className="fill-white/20" />
          </div>

          <h1 className="text-2xl font-black text-app-text tracking-tight">Histórico de Análises</h1>
          <p className="text-xs text-app-muted mt-1">
            Insights automáticos gerados pela IA sobre os seus registros emocionais.
          </p>
        </motion.div>

        {/* Lista de Análises */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-app-muted uppercase tracking-widest px-2">
            Relatórios Processados
          </h2>

          <AnimatePresence mode="popLayout">
            {analises.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-10 bg-app-card border border-dashed border-app-border rounded-[2rem]"
              >
                <Smile className="mx-auto size-10 text-app-muted mb-3 opacity-50" />
                <p className="text-sm font-bold text-app-muted">Nenhuma análise disponível ainda</p>
                <p className="text-[11px] text-app-muted mt-1 opacity-80">
                  Suas análises de humor serão geradas semanalmente.
                  <br></br>Não esqueça de registrar seu humor.
                </p>
              </motion.div>
            ) : (
              analises.map((item) => (
                <motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => setAnaliseAberta(item)}
                  className="p-5 rounded-2xl bg-app-card border border-app-border shadow-sm hover:border-app-primary/50 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="size-12 rounded-2xl bg-app-bg border border-app-border flex items-center justify-center text-2xl shrink-0 shadow-sm select-none">
                      {item.emojiPredominante || "✨"}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-app-primary bg-app-bg border border-app-border px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar size={10} /> {item.rotulo || "Relatório"}
                        </span>
                        <span className="text-[10px] text-app-muted font-medium">
                          {item.totalRegistros} {item.totalRegistros === 1 ? "registro" : "registros"}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-app-text">
                        Predomínio: {item.humorPredominante}
                      </h3>

                      <p className="text-xs text-app-muted line-clamp-2 leading-relaxed">
                        {item.textoFeedbackIA}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-app-muted shrink-0 opacity-50" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Modal Expandido */}
      <AnimatePresence>
        {analiseAberta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative bg-app-card w-full max-w-xl md:max-w-2xl rounded-[2.5rem] shadow-2xl p-6 sm:p-9 border border-app-border z-10 max-h-[85vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setAnaliseAberta(null)}
                className="absolute top-5 right-5 p-2 bg-app-bg border border-app-border text-app-muted hover:text-app-text rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center mt-2 mb-6">
                <div className="bg-app-bg border border-app-border size-14 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Sparkles className="text-app-primary size-7" />
                </div>
                <span className="text-[10px] font-bold text-app-primary uppercase tracking-widest">
                  {analiseAberta.rotulo}
                </span>
                <h2 className="text-2xl font-black text-app-text leading-tight mt-1">
                  Análise do seu Sentir ✨
                </h2>
              </div>

              <div className="bg-app-bg p-5 rounded-2xl border border-app-border text-center mb-5 shadow-sm">
                <div className="text-6xl mb-2 select-none drop-shadow-sm">
                  {analiseAberta.emojiPredominante || "😐"}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-app-primary">Seu humor foi mais</p>
                <h3 className="text-2xl font-black text-app-text mt-0.5">
                  {analiseAberta.humorPredominante}
                </h3>
                <p className="text-xs text-app-muted font-medium mt-1">
                  Com base em <strong>{analiseAberta.totalRegistros} humores</strong> analisados.
                </p>
              </div>

              {analiseAberta.fatoresMaisComuns?.length > 0 && (
                <div className="mb-5 space-y-2">
                  <label className="text-[10px] font-bold text-app-primary uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    <Tag size={12} /> O que mais impactou seus dias
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {analiseAberta.fatoresMaisComuns.map((fator, index) => (
                      <span
                        key={index}
                        className="bg-app-bg text-app-text text-xs font-semibold px-3 py-1.5 rounded-xl border border-app-border"
                      >
                        {fator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-app-bg p-5 rounded-2xl border border-app-border relative mb-6 shadow-inner">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-app-card border border-app-border p-1.5 rounded-lg">
                    <Brain className="size-4 text-app-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-app-primary uppercase tracking-wider">
                    Insight da MindQuest IA
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-app-text leading-relaxed font-medium text-justify">
                  "{analiseAberta.textoFeedbackIA}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAnaliseAberta(null)}
                className="w-full py-4 bg-app-primary hover:bg-app-hover text-white font-bold rounded-2xl shadow-sm transition-all active:scale-95 text-sm cursor-pointer"
              >
                Fechar
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}