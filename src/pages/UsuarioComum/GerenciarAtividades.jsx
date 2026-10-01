import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ListTodo, Sparkles, Trash2, CheckCircle2, Circle, 
  CalendarHeart, RefreshCw, Clock, Zap, Coins 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, addDoc, getDocs, updateDoc, deleteDoc, 
  doc, query, orderBy, limit, getDoc, increment, where 
} from "firebase/firestore";

import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";
import HeaderUsuario from "../../components/HeaderUsuario";
import { gerarAtividadesPersonalizadas } from "../../services/aiService";

// Obtém a data local de hoje no formato YYYY-MM-DD
const getDataHojeFormatada = () => {
  const agora = new Date();
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

export default function GerenciarAtividades() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [gerandoIA, setGerandoIA] = useState(false);
  const [atividades, setAtividades] = useState([]);
  const [userUid, setUserUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setUserUid(user.uid);
      await carregarAtividadesDoDia(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  // Função central para geração de 3 missões com a IA
  const executarGeracaoComIA = async (uid, titulosExistentes = []) => {
    if (gerandoIA) return;
    setGerandoIA(true);

    try {
      // 1. Dados cadastrais do usuário
      const userSnap = await getDoc(doc(db, "usuarios", uid));
      const dadosUsuario = userSnap.exists() ? userSnap.data() : {};

      // 2. Registro de humor mais recente
      const humorSnap = await getDocs(
        query(collection(db, "usuarios", uid, "registrosHumor"), orderBy("data", "desc"), limit(1))
      );
      const ultimoHumor = humorSnap.empty ? { humor: "Equilibrado", emoji: "🙂" } : humorSnap.docs[0].data();

      // 3. Chamada ao serviço de IA
      const sugestoes = await gerarAtividadesPersonalizadas(
        dadosUsuario, 
        ultimoHumor, 
        titulosExistentes
      );

      // 4. Salva exatamente 3 missões diárias com dataReferencia
      const hojeStr = getDataHojeFormatada();
      const loteTres = (sugestoes || []).slice(0, 3);
      const novasSalvas = [];

      for (const item of loteTres) {
        const novaMissao = {
          titulo: item.titulo,
          descricao: item.descricao,
          categoria: item.categoria || "Bem-Estar",
          tempoEstimado: item.tempoEstimado || "10 min",
          xp: Number(item.xp) || 10,
          concluida: false,
          dataReferencia: hojeStr,
          criadoEm: new Date().toISOString()
        };
        const refDoc = await addDoc(collection(db, "usuarios", uid, "atividades"), novaMissao);
        novasSalvas.push({ id: refDoc.id, ...novaMissao });
      }

      setAtividades(novasSalvas);
      toast.success("Missões do dia preparadas! 🎯");
    } catch (error) {
      console.error("Erro ao gerar missões:", error);
      toast.error("Não foi possível gerar novas missões.");
    } finally {
      setGerandoIA(false);
    }
  };

  // Carrega apenas as missões de hoje (sem orderBy no Firebase para evitar erro de índice composto)
  const carregarAtividadesDoDia = async (uid) => {
    try {
      const hojeStr = getDataHojeFormatada();
      
      const q = query(
        collection(db, "usuarios", uid, "atividades"),
        where("dataReferencia", "==", hojeStr)
      );

      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

      // Ordenação local em memória por horário de criação
      lista.sort((a, b) => String(a.criadoEm || "").localeCompare(String(b.criadoEm || "")));

      // Se ainda não existirem missões criadas hoje, gera automaticamente via IA
      if (lista.length === 0) {
        await executarGeracaoComIA(uid, []);
      } else {
        setAtividades(lista);
      }
    } catch (error) {
      console.error("Erro ao procurar atividades do dia:", error);
      toast.error("Erro ao carregar atividades de hoje.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (atividade) => {
    const uid = userUid || auth.currentUser?.uid;
    if (!uid) return;

    const novoStatus = !atividade.concluida;
    const valorMoedas = 10;
    const valorXP = Number(atividade.xp) || 10;

    setAtividades(prev => prev.map(a => 
      a.id === atividade.id ? { ...a, concluida: novoStatus } : a
    ));

    try {
      await updateDoc(doc(db, "usuarios", uid, "atividades", atividade.id), {
        concluida: novoStatus,
        concluidaEm: novoStatus ? new Date().toISOString() : null
      });

      if (novoStatus) {
        await updateDoc(doc(db, "usuarios", uid), {
          xp: increment(valorXP),
          moedas: increment(valorMoedas)
        });
        toast.success(`Concluído! +${valorXP} XP e +${valorMoedas} Moedas 🪙`);
      } else {
        await updateDoc(doc(db, "usuarios", uid), {
          xp: increment(-valorXP),
          moedas: increment(-valorMoedas)
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar status.");
      carregarAtividadesDoDia(uid);
    }
  };

  const handleExcluir = async (id) => {
    const uid = userUid || auth.currentUser?.uid;
    if (!uid) return;

    try {
      await deleteDoc(doc(db, "usuarios", uid, "atividades", id));
      setAtividades(prev => prev.filter(a => a.id !== id));
      toast.success("Atividade removida.");
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  };

  const total = atividades.length;
  const concluidas = atividades.filter(a => a.concluida).length;
  const progresso = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-[var(--primary)] size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32">
      
      <HeaderUsuario />
      
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Resumo Diário */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-slate-900/5 p-7 md:p-9 text-center"
        >
          <div 
            style={{ backgroundColor: "var(--primary)" }}
            className="relative size-20 mx-auto mb-4 rounded-[1.75rem] flex items-center justify-center shadow-lg shadow-slate-900/5 text-white"
          >
            <CalendarHeart size={36} className="fill-white/20" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Missões do Dia</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Complete as 3 metas diárias para ganhar XP e Moedas.</p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Metas Diárias</span>
                <span className="text-sm font-bold text-slate-700">{concluidas} de {total} concluídas</span>
              </div>
              <span className="text-2xl font-black text-[var(--primary)]">{progresso}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-[var(--primary)]"
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Botão de Regeneração Manual */}
        <button
          type="button"
          onClick={() => {
            const titulos = atividades.map(a => a.titulo || a.texto).filter(Boolean);
            executarGeracaoComIA(userUid, titulos);
          }}
          disabled={gerandoIA}
          style={{ backgroundColor: "var(--primary)" }}
          className="w-full py-4 px-6 rounded-2xl text-white font-bold text-sm shadow-lg shadow-slate-900/5 flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.99] cursor-pointer disabled:opacity-50"
        >
          {gerandoIA ? (
            <>
              <RefreshCw className="size-5 animate-spin" />
              <span>Preparando sugestões...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-5" />
              <span>Gerar Missões de Hoje</span>
            </>
          )}
        </button>

        {/* Lista de Atividades */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {atividades.length === 0 && !gerandoIA ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem]"
              >
                <ListTodo className="mx-auto size-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Sem missões ativas</p>
                <p className="text-[11px] text-slate-400 mt-1">Clique no botão acima para gerar tarefas.</p>
              </motion.div>
            ) : (
              atividades.map((ativ) => (
                <motion.div 
                  key={ativ.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-4 rounded-2xl border transition-all ${
                    ativ.concluida 
                      ? "bg-slate-50 border-slate-100 opacity-60" 
                      : "bg-white border-slate-100 shadow-xs hover:border-[var(--primary-light)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div 
                      onClick={() => handleToggle(ativ)}
                      className="flex items-start gap-3 flex-1 cursor-pointer select-none"
                    >
                      <div className="mt-0.5 shrink-0">
                        {ativ.concluida ? (
                          <CheckCircle2 size={22} className="text-emerald-500 fill-emerald-50" />
                        ) : (
                          <Circle size={22} className="text-slate-300 hover:text-[var(--primary)]" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[var(--primary)] bg-[var(--primary-light)] px-2 py-0.5 rounded-md">
                            {ativ.categoria || "Rotina"}
                          </span>
                          {ativ.tempoEstimado && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                              <Clock size={11} /> {ativ.tempoEstimado}
                            </span>
                          )}
                          {ativ.xp && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                              <Zap size={10} className="fill-amber-500 text-amber-500" /> +{ativ.xp} XP
                            </span>
                          )}
                          <span className="text-[10px] text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                            <Coins size={10} className="fill-[var(--primary)] text-[var(--primary)]" /> +10 Moedas
                          </span>
                        </div>

                        <h3 className={`text-sm font-bold leading-tight ${
                          ativ.concluida ? "text-slate-400 line-through" : "text-slate-800"
                        }`}>
                          {ativ.titulo || ativ.texto}
                        </h3>

                        {ativ.descricao && (
                          <p className={`text-xs ${
                            ativ.concluida ? "text-slate-400" : "text-slate-500"
                          }`}>
                            {ativ.descricao}
                          </p>
                        )}
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleExcluir(ativ.id)}
                      className="p-1.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer shrink-0"
                      title="Remover missão"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}