import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ListTodo, Plus, Trash2, 
  CheckCircle2, Circle, Sparkles, CalendarHeart 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, addDoc, getDocs, updateDoc, 
  deleteDoc, doc, query, orderBy 
} from "firebase/firestore";
import { toast } from "sonner";

export default function GerenciarAtividades() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [atividades, setAtividades] = useState([]);
  const [novaAtividade, setNovaAtividade] = useState("");
  const [userUid, setUserUid] = useState(null);

  // Busca as atividades no Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setUserUid(user.uid);
      await carregarAtividades(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  const carregarAtividades = async (uid) => {
    try {
      const q = query(collection(db, "usuarios", uid, "atividades"), orderBy("criadoEm", "desc"));
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAtividades(lista);
    } catch (error) {
      console.error("Erro ao carregar atividades:", error);
      toast.error("Não foi possível carregar sua rotina.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!novaAtividade.trim()) return;

    try {
      const nova = {
        texto: novaAtividade.trim(),
        concluida: false,
        criadoEm: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, "usuarios", userUid, "atividades"), nova);
      
      setAtividades([{ id: docRef.id, ...nova }, ...atividades]);
      setNovaAtividade("");
      toast.success("Hábito adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar atividade.");
    }
  };

  // Alterna entre concluída e pendente
  const handleToggle = async (id, statusAtual) => {
    try {
      // Atualiza UI instantaneamente para parecer mais rápido (Optimistic Update)
      setAtividades(atividades.map(ativ => 
        ativ.id === id ? { ...ativ, concluida: !statusAtual } : ativ
      ));

      // Atualiza Firebase
      const ativRef = doc(db, "usuarios", userUid, "atividades", id);
      await updateDoc(ativRef, { concluida: !statusAtual });
      
      if (!statusAtual) toast.success("Muito bem! Tarefa concluída. ✨");
    } catch (error) {
      toast.error("Erro ao atualizar atividade.");
      // Reverte caso dê erro
      carregarAtividades(userUid);
    }
  };

  // Exclui a atividade
  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(db, "usuarios", userUid, "atividades", id));
      setAtividades(atividades.filter(ativ => ativ.id !== id));
      toast.success("Atividade removida.");
    } catch (error) {
      toast.error("Erro ao remover atividade.");
    }
  };

  // Cálculos da Barra de Progresso
  const total = atividades.length;
  const concluidas = atividades.filter(a => a.concluida).length;
  const progresso = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <div className="size-16 rounded-3xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="text-orange-400 size-8 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ListTodo size={14} className="text-orange-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rotina</span>
          </div>
        </div>

        {/* HEADER: RESUMO DIÁRIO */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-pink-100/40 blur-3xl pointer-events-none" />

          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <CalendarHeart size={36} className="fill-white/20" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gerenciar Atividades</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Organize seu dia e construa hábitos saudáveis.</p>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-left">
            <div className="flex justify-between items-end mb-3">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Progresso do Dia</span>
                <span className="text-sm font-bold text-slate-700">{concluidas} de {total} tarefas</span>
              </div>
              <span className="text-2xl font-black text-orange-500">{progresso}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-[#E97451]"
                initial={{ width: 0 }}
                animate={{ width: `${progresso}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* INPUT: ADICIONAR TAREFA */}
        <form onSubmit={handleAdicionar} className="relative">
          <input 
            type="text" 
            value={novaAtividade}
            onChange={(e) => setNovaAtividade(e.target.value)}
            placeholder="Nova atividade (ex: Beber 2L de água)..." 
            className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm outline-none text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-orange-400/10 focus:border-orange-300 transition-all"
          />
          <button 
            type="submit"
            disabled={!novaAtividade.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-orange-400 hover:bg-orange-500 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all shadow-md shadow-orange-500/20 disabled:shadow-none"
          >
            <Plus size={18} strokeWidth={3} />
          </button>
        </form>

        {/* LISTA DE ATIVIDADES */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {atividades.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-[2rem]"
              >
                <ListTodo className="mx-auto size-10 text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-500">Sua lista está vazia</p>
                <p className="text-[11px] text-slate-400 mt-1">Adicione seu primeiro hábito acima.</p>
              </motion.div>
            ) : (
              atividades.map((ativ) => (
                <motion.div 
                  key={ativ.id}
                  layout
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    ativ.concluida 
                      ? "bg-slate-50 border-slate-100 opacity-70" 
                      : "bg-white border-slate-100 shadow-sm hover:border-orange-200"
                  }`}
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => handleToggle(ativ.id, ativ.concluida)}
                  >
                    <button className="shrink-0 transition-colors">
                      {ativ.concluida ? (
                        <CheckCircle2 size={24} className="text-emerald-500 fill-emerald-50" />
                      ) : (
                        <Circle size={24} className="text-slate-300 hover:text-orange-400" />
                      )}
                    </button>
                    <span className={`text-sm font-semibold transition-all line-clamp-2 ${
                      ativ.concluida ? "text-slate-400 line-through" : "text-slate-700"
                    }`}>
                      {ativ.texto}
                    </span>
                  </div>

                  <button 
                    onClick={() => handleExcluir(ativ.id)}
                    className="ml-3 p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Excluir atividade"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}