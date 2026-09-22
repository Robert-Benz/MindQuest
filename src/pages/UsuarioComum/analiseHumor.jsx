import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BrainCircuit, Sparkles, Calendar, 
  ChevronRight, Smile, X, Brain, Tag 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, getDocs, doc, setDoc 
} from "firebase/firestore";
import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";
import { gerarRelatorioSemanalIA } from "../../services/aiService";

export default function AnaliseHumor() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analises, setAnalises] = useState([]);
  const [analiseAberta, setAnaliseAberta] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      await carregarEProcessar(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  const carregarEProcessar = async (uid) => {
    try {
      // 1. Busca todos os registros de humor (sem filtros rígidos que quebrem no Firestore)
      const humorRef = collection(db, "usuarios", uid, "registrosHumor");
      const humorSnap = await getDocs(humorRef);
      
      const registros = humorSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      console.log("Registros de humor encontrados no banco:", registros);

      // 2. Busca subcoleção analisesSemanais
      const analiseRef = collection(db, "usuarios", uid, "analisesSemanais");
      const analiseSnap = await getDocs(analiseRef);
      let listaAnalises = analiseSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      // Identificador único para a análise de hoje
      const hojeStr = new Date().toISOString().split("T")[0];
      const docIdHoje = `analise_${hojeStr}`;

      const jaExisteHoje = listaAnalises.some(a => a.id === docIdHoje);

      // Se temos registros de humor e ainda não gerou a de hoje, gera e grava
      if (!jaExisteHoje && registros.length > 0) {
        console.log("Gerando nova análise para hoje...");
        const nova = await gerarEGravacao(uid, docIdHoje, registros);
        if (nova) {
          listaAnalises.unshift(nova);
        }
      }

      setAnalises(listaAnalises);
    } catch (err) {
      console.error("Erro detalhado no fluxo de análises:", err);
      toast.error("Erro ao carregar análises. Veja o console.");
    } finally {
      setLoading(false);
    }
  };

  const gerarEGravacao = async (uid, docId, registros) => {
    try {
      // Mapeamento de contagem dos humores reais cadastrados
      const contagemHumor = {};
      const contagemTags = {};

      registros.forEach(r => {
        const h = r.humor || "Neutro";
        contagemHumor[h] = (contagemHumor[h] || 0) + 1;

        if (r.fatores && Array.isArray(r.fatores)) {
          r.fatores.forEach(f => {
            contagemTags[f] = (contagemTags[f] || 0) + 1;
          });
        }
      });

      // Humor que mais apareceu (ex: se empatou entre Ansioso e Feliz, pega o mais recente)
      const humorPredominante = Object.keys(contagemHumor).reduce((a, b) => 
        contagemHumor[a] > contagemHumor[b] ? a : b, 
        registros[0]?.humor || "Neutro"
      );

      const emojiPredominante = registros.find(r => r.humor === humorPredominante)?.emoji || "🙂";
      const fatoresMaisComuns = Object.keys(contagemTags)
        .sort((a, b) => contagemTags[b] - contagemTags[a])
        .slice(0, 3);

      let feedbackIA = "";
      try {
        feedbackIA = await gerarRelatorioSemanalIA({
          totalRegistros: registros.length,
          humorPredominante,
          fatoresMaisComuns,
          atividadesConcluidas: []
        });
      } catch (errIA) {
        console.warn("Falha no aiService, aplicando texto gerado padrão:", errIA);
        feedbackIA = `Você registrou oscilações entre ${Object.keys(contagemHumor).join(" e ")}. Notamos que você tem buscado acolher suas emoções. Continue reservando momentos de pausa para manter sua clareza!`;
      }

      const hoje = new Date();
      const rotuloFormatado = `Análise de ${hoje.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}`;

      const novaAnalise = {
        id: docId,
        rotulo: rotuloFormatado,
        totalRegistros: registros.length,
        humorPredominante,
        emojiPredominante,
        fatoresMaisComuns,
        textoFeedbackIA: feedbackIA,
        geradoEm: new Date().toISOString()
      };

      // Gravação direta no Firestore: usuarios/{uid}/analisesSemanais/{docId}
      await setDoc(doc(db, "usuarios", uid, "analisesSemanais", docId), novaAnalise);
      console.log("Análise salva com sucesso no Firestore!", novaAnalise);

      return novaAnalise;
    } catch (err) {
      console.error("Erro ao salvar análise no Firestore:", err);
      return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-orange-400 size-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo e Navegação */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate("/Menu")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <BrainCircuit size={14} className="text-orange-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Insights</span>
          </div>
        </div>

        {/* Card do Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <BrainCircuit size={36} className="fill-white/20" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Histórico de Análises</h1>
          <p className="text-xs text-slate-500 mt-1">
            Insights automáticos gerados pela IA sobre os seus últimos registros.
          </p>
        </motion.div>

        {/* Lista de Análises com Card Detalhado */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
            Relatórios Processados
          </h2>

          <AnimatePresence mode="popLayout">
            {analises.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem]"
              >
                <Smile className="mx-auto size-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Nenhuma análise disponível ainda</p>
                <p className="text-[11px] text-slate-400 mt-1">Assim que você registrar humores, o relatório aparecerá aqui.</p>
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
                  className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center text-2xl shrink-0 border border-orange-100/60 shadow-sm select-none">
                      {item.emojiPredominante || "✨"}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-wider text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Calendar size={10} /> {item.rotulo || "Relatório Recente"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {item.totalRegistros} {item.totalRegistros === 1 ? "registro" : "registros"}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-800">
                        Predomínio: {item.humorPredominante}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.textoFeedbackIA}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={18} className="text-slate-300 shrink-0" />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>

      {/* Modal Rico com as Métricas Reais */}
      <AnimatePresence>
        {analiseAberta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative bg-white w-full max-w-xl md:max-w-2xl rounded-[2.5rem] shadow-2xl p-6 sm:p-9 border border-white z-10 max-h-[85vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setAnaliseAberta(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="text-center mt-2 mb-6">
                <div className="bg-[#FFF1EB] size-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-orange-100 shadow-sm">
                  <Sparkles className="text-[#E97451] size-7" />
                </div>
                <span className="text-[10px] font-bold text-[#E97451] uppercase tracking-widest">
                  {analiseAberta.rotulo}
                </span>
                <h2 className="text-2xl font-black text-slate-800 leading-tight mt-1">
                  Análise do seu Sentir ✨
                </h2>
              </div>

              {/* Humor Predominante */}
              <div className="bg-[#FFFDF4] p-5 rounded-2xl border border-amber-100/90 text-center mb-5 shadow-sm">
                <div className="text-6xl mb-2 select-none drop-shadow-sm">
                  {analiseAberta.emojiPredominante || "😐"}
                </div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Seu humor foi mais</p>
                <h3 className="text-2xl font-black text-slate-800 mt-0.5">
                  {analiseAberta.humorPredominante}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Com base em <strong>{analiseAberta.totalRegistros} humores</strong> analisados.
                </p>
              </div>

              {/* Tags de Fatores */}
              {analiseAberta.fatoresMaisComuns?.length > 0 && (
                <div className="mb-5 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                    <Tag size={12} className="text-[#E97451]" /> O que mais impactou seus dias
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {analiseAberta.fatoresMaisComuns.map((fator, index) => (
                      <span
                        key={index}
                        className="bg-slate-50 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200/80"
                      >
                        {fator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback IA */}
              <div className="bg-gradient-to-br from-orange-500/5 via-amber-400/5 to-transparent p-5 rounded-2xl border border-orange-200/40 relative mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-orange-100 p-1 rounded-lg">
                    <Brain className="size-3.5 text-[#E97451]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#E97451] uppercase tracking-wider">
                    Insight da MindQuest IA
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium text-justify">
                  "{analiseAberta.textoFeedbackIA}"
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAnaliseAberta(null)}
                className="w-full py-4 bg-[#E97451] hover:bg-[#C06043] text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-sm cursor-pointer"
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