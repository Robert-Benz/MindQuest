import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Clock, Activity, 
  ShieldCheck, HeartPulse, FileText, Sparkles, Brain, Sun, Tag, ChevronRight, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "../../firebaseConfig";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { toast } from "sonner";

export default function HistoricoPaciente() {
  const navigate = useNavigate();
  const location = useLocation();

  const pacienteUid = location.state?.pacienteUid;

  const [loading, setLoading] = useState(true);
  const [paciente, setPaciente] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [analises, setAnalises] = useState([]);
  const [abaAtiva, setAbaAtiva] = useState("humores");
  const [analiseSelecionada, setAnaliseSelecionada] = useState(null);

  useEffect(() => {
    if (!pacienteUid) {
      toast.error("Nenhum paciente selecionado.");
      navigate("/MenuPsicologo");
      return;
    }

    const carregarDadosClinicos = async () => {
      try {
        setLoading(true);

        const userDocRef = doc(db, "usuarios", pacienteUid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          toast.error("Paciente não encontrado no sistema.");
          navigate("/MenuPsicologo");
          return;
        }

        setPaciente({ id: userDocSnap.id, ...userDocSnap.data() });

        const humoresRef = collection(db, "usuarios", pacienteUid, "registrosHumor");
        const humoresSnap = await getDocs(humoresRef);

        const listaHumor = humoresSnap.docs.map((docSnap) => {
          const data = docSnap.data();
          let dataFormatada = "Data não informada";

          if (data.data) {
            const dateObj = typeof data.data.toDate === "function" 
              ? data.data.toDate() 
              : new Date(data.data);
            
            dataFormatada = dateObj.toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit"
            });
          }

          return {
            id: docSnap.id,
            ...data,
            dataFormatada
          };
        });
        
        listaHumor.sort((a, b) => new Date(b.data?.seconds ? b.data.seconds * 1000 : b.data) - new Date(a.data?.seconds ? a.data.seconds * 1000 : a.data));
        setRegistros(listaHumor);

        const analisesRef = collection(db, "usuarios", pacienteUid, "analisesSemanais");
        const analisesSnap = await getDocs(analisesRef);

        const listaAnalises = analisesSnap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            dataReferencia: data.geradoEm || data.criadoEm || d.id.replace("analise_", "")
          };
        });

        listaAnalises.sort((a, b) => String(b.dataReferencia).localeCompare(String(a.dataReferencia)));
        setAnalises(listaAnalises);

      } catch (error) {
        console.error("Erro ao carregar prontuário:", error);
        toast.error("Erro ao carregar dados do paciente.");
      } finally {
        setLoading(false);
      }
    };

    carregarDadosClinicos();
  }, [pacienteUid, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-[#E97451] size-8 animate-spin" />
      </div>
    );
  }

  const codigo = paciente?.codigoUnico || paciente?.codigoPaciente || "MQ-PAC";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo / Voltar */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate("/MenuPsicologo")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/80 border border-peach-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sigilo Clínico</span>
          </div>
        </div>

        {/* Card do Paciente */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-orange-50 border border-orange-100 flex items-center justify-center text-3xl shadow-inner font-black text-[#E97451]">
            {paciente?.nome ? paciente.nome.charAt(0).toUpperCase() : "P"}
          </div>

          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full text-xs font-mono font-bold text-orange-600 mb-2">
            {codigo}
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{paciente?.nome || "Paciente"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{paciente?.email || "Sem e-mail registado"}</p>

          {/* Abas */}
          <div className="flex justify-center gap-2 mt-6 p-1 bg-slate-50 rounded-2xl max-w-xs mx-auto border border-slate-100">
            <button
              type="button"
              onClick={() => setAbaAtiva("humores")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaAtiva === "humores" 
                  ? "bg-white text-orange-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Humores ({registros.length})
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("analises")}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                abaAtiva === "analises" 
                  ? "bg-white text-orange-600 shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Análises IA ({analises.length})
            </button>
          </div>
        </motion.div>

        {/* Aba de Humores */}
        {abaAtiva === "humores" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Activity size={16} className="text-orange-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                Check-ins de Humor Registados
              </span>
            </div>

            {registros.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                <HeartPulse className="mx-auto size-9 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">Nenhum check-in registado ainda.</p>
                <p className="text-xs text-slate-400 mt-0.5">Assim que o paciente registar no diário, aparecerá aqui.</p>
              </div>
            ) : (
              registros.map((reg, index) => (
                <div 
                  key={reg.id || index} 
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3.5 hover:border-orange-100 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl shadow-inner">
                        {reg.emoji || "🙂"}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{reg.humor || "Sentimento"}</h3>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={11} /> {reg.dataFormatada}
                        </p>
                      </div>
                    </div>
                  </div>

                  {(reg.clima || (reg.fatores && reg.fatores.length > 0)) && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {reg.clima && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-slate-50 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Sun size={12} className="text-orange-400" />
                          {reg.clima.condicao}
                        </span>
                      )}

                      {reg.fatores?.map((fator, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium bg-orange-50/70 text-orange-600 px-2.5 py-1 rounded-lg border border-orange-100">
                          <Tag size={10} />
                          {fator}
                        </span>
                      ))}
                    </div>
                  )}

                  {reg.nota && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                      <FileText size={16} className="text-orange-400 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium text-slate-600 leading-relaxed italic">
                        "{reg.nota}"
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Aba de Análises IA */}
        {abaAtiva === "analises" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex items-center gap-2 px-1">
              <Brain size={16} className="text-[#E97451]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                Relatórios Gerados pela IA
              </span>
            </div>

            {analises.length === 0 ? (
              <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-[2.5rem]">
                <Brain className="mx-auto size-9 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">Nenhum relatório emitido ainda.</p>
                <p className="text-xs text-slate-400 mt-0.5">As análises são processadas conforme o paciente completa os registos.</p>
              </div>
            ) : (
              analises.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  onClick={() => setAnaliseSelecionada(item)}
                  className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 hover:border-orange-200 shadow-sm hover:shadow-md transition-all cursor-pointer group space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-orange-50 text-[#E97451] group-hover:bg-orange-100 transition-colors">
                        <Sparkles size={16} />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 group-hover:text-[#E97451] transition-colors">
                          {item.rotulo || `Análise Periódica #${analises.length - idx}`}
                        </h3>
                        {item.geradoEm && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            Gerado em {new Date(item.geradoEm).toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="size-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-500 transition-all">
                      <ChevronRight size={16} />
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 pl-1 font-medium">
                    {item.textoFeedbackIA || "Toque para visualizar os detalhes desta análise clínica."}
                  </p>
                </div>
              ))
            )}
          </motion.div>
        )}

      </div>

      {/* Modal da Análise Completa */}
      <AnimatePresence>
        {analiseSelecionada && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setAnaliseSelecionada(null)} 
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-7 md:p-8 border border-white z-10 max-h-[85vh] overflow-y-auto custom-scrollbar space-y-5"
            >
              <button 
                type="button"
                onClick={() => setAnaliseSelecionada(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="space-y-1 pr-8">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} /> Relatório Clínico IA
                </span>
                <h2 className="text-xl font-black text-slate-800">
                  {analiseSelecionada.rotulo || "Análise de Humor"}
                </h2>
                {analiseSelecionada.geradoEm && (
                  <p className="text-xs text-slate-400">
                    Processado às {new Date(analiseSelecionada.geradoEm).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50/70 border border-orange-100 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider block">Humor Predominante</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">{analiseSelecionada.emojiPredominante || "✨"}</span>
                    <strong className="text-sm font-bold text-slate-800">{analiseSelecionada.humorPredominante || "Equilibrado"}</strong>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total de Check-ins</span>
                  <strong className="text-xl font-black text-slate-800 block mt-1">
                    {analiseSelecionada.totalRegistros || 0}
                  </strong>
                </div>
              </div>

              {analiseSelecionada.fatoresMaisComuns && analiseSelecionada.fatoresMaisComuns.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Fatores mais frequentes no período
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analiseSelecionada.fatoresMaisComuns.map((fator, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl text-xs flex items-center gap-1">
                        <Tag size={11} className="text-orange-500" />
                        {fator}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Parecer e Insights da Inteligência Artificial
                </span>
                <div className="bg-orange-50/40 border border-orange-100/60 p-4 rounded-2xl">
                  <p className="text-xs text-slate-700 leading-relaxed font-medium whitespace-pre-line">
                    {analiseSelecionada.textoFeedbackIA || "Nenhum parecer detalhado registado."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setAnaliseSelecionada(null)}
                className="w-full py-3.5 bg-[#E97451] hover:bg-[#C06043] text-white rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                Fechar Relatório
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}