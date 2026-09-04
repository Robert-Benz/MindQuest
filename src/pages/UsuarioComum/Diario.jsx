import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, ArrowLeft, Plus, Calendar, 
  Trash2, Sparkles, Send, X, Lock, ShieldCheck, EyeOff
} from "lucide-react";
import { auth, db } from "../../firebaseConfig";
import { collection, query, orderBy, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

export default function Diario() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [diarios, setDiarios] = useState([]);
  const [modalNovo, setModalNovo] = useState(false);
  const [diarioSelecionado, setDiarioSelecionado] = useState(null);

  const [titulo, setTitulo] = useState("");
  const [conteudo, setConteudo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const fetchDiarios = async (user) => {
    try {
      const q = query(
        collection(db, "usuarios", user.uid, "diario"),
        orderBy("data", "desc")
      );
      const querySnapshot = await getDocs(q);
      const lista = querySnapshot.docs.map(d => {
        const dataDoc = d.data();
        let dataFormatada;
        if (dataDoc.data && typeof dataDoc.data.toDate === 'function') {
          dataFormatada = dataDoc.data.toDate();
        } else {
          dataFormatada = new Date(dataDoc.data || Date.now());
        }
        return { id: d.id, ...dataDoc, dataFormatada };
      });
      setDiarios(lista);
    } catch (error) {
      console.error("Erro ao buscar diários:", error);
      toast.error("Erro ao carregar seu histórico de diários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchDiarios(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSalvarDiario = async (e) => {
    e.preventDefault();
    if (!titulo.trim() || !conteudo.trim()) {
      toast.error("Preencha o título e o texto do diário.");
      return;
    }

    setSalvando(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, "usuarios", user.uid, "diario"), {
        titulo,
        conteudo,
        data: new Date().toISOString()
      });

      toast.success("Reflexão salva com sucesso!");
      setTitulo("");
      setConteudo("");
      setModalNovo(false);
      fetchDiarios(user);
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao salvar no diário.");
    } finally {
      setSalvando(false);
    }
  };

  const handleDeletar = async (id) => {
    if (!window.confirm("Deseja realmente apagar esta reflexão?")) return;
    try {
      const user = auth.currentUser;
      await deleteDoc(doc(db, "usuarios", user.uid, "diario", id));
      toast.success("Diário apagado.");
      setDiarioSelecionado(null);
      fetchDiarios(user);
    } catch (error) {
      toast.error("Erro ao apagar diário.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28 relative">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/menu")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Painel Principal
          </button>
          <div className="flex items-center gap-1.5 bg-peach-50 border border-peach-100 px-3 py-1 rounded-full text-peach-600 text-[10px] font-bold">
            <Lock size={12} /> Criptografado & Confidencial
          </div>
        </div>

        {/* Card do Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 flex justify-between items-center"
        >
          <div>
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <BookOpen size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest">Espaço Pessoal</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Diário Emocional</h1>
            <p className="text-xs text-slate-400 mt-0.5">Desabafe, organize seus pensamentos e acompanhe sua evolução.</p>
          </div>

          <button 
            onClick={() => setModalNovo(true)}
            className="size-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <Plus size={24} />
          </button>
        </motion.div>

        {/* Observação de Privacidade Total */}
        <div className="p-4 bg-white rounded-2xl border border-peach-100 shadow-sm flex items-start gap-3">
          <div className="size-8 rounded-xl bg-peach-50 flex items-center justify-center text-peach-500 shrink-0 mt-0.5">
            <EyeOff size={16} />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800">Privacidade Absoluta</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Suas anotações são estritamente suas. Este diário <strong>não é compartilhado com psicólogos</strong> e <strong>não é lido ou processado por Inteligência Artificial</strong>.
            </p>
          </div>
        </div>

        {/* Listagem dos Diários */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 animate-pulse">Carregando suas reflexões...</div>
        ) : (
          <div className="space-y-3">
            {diarios.length === 0 ? (
              <div className="bg-white rounded-[2.5rem] p-10 text-center border border-white shadow-sm">
                <BookOpen size={40} className="mx-auto text-slate-300 mb-3" />
                <h3 className="text-sm font-bold text-slate-700">Nenhum registro ainda</h3>
                <p className="text-xs text-slate-400 mt-1">Toque no botão de mais (+) acima para escrever sua primeira reflexão do dia.</p>
              </div>
            ) : (
              diarios.map((item) => (
                <motion.div
                  whileHover={{ y: -2 }}
                  key={item.id}
                  onClick={() => setDiarioSelecionado(item)}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm cursor-pointer hover:border-peach-200 transition-all space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Calendar size={12} className="text-peach-400" />
                      {item.dataFormatada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-[10px] bg-peach-50 text-peach-600 font-bold px-2.5 py-0.5 rounded-full">Privado</span>
                  </div>
                  <h3 className="font-extrabold text-slate-800 text-base">{item.titulo}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{item.conteudo}</p>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal de Novo Diário */}
      <AnimatePresence>
        {modalNovo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalNovo(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 z-10"
            >
              <button onClick={() => setModalNovo(false)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>

              <h2 className="text-xl font-black text-slate-800 mb-1">Novo Registro no Diário</h2>
              
              {/* Aviso no Modal */}
              <div className="bg-amber-50 border border-amber-100/70 p-3 rounded-xl flex items-center gap-2 mb-6">
                <Lock size={14} className="text-amber-500 shrink-0" />
                <span className="text-[11px] text-amber-700/90 font-medium leading-tight">
                  Este texto fica salvo apenas para você. Nem IA nem terapeutas têm acesso.
                </span>
              </div>

              <form onSubmit={handleSalvarDiario} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Título da Reflexão</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Um dia de superações..." 
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Seus Pensamentos</label>
                  <textarea 
                    rows="5"
                    placeholder="Escreva aqui o que passou pela sua mente..." 
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 resize-none"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  disabled={salvando}
                  className="w-full py-4 bg-peach-500 hover:bg-peach-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-peach-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {salvando ? <Sparkles className="size-5 animate-spin" /> : <><Send size={16} /> Salvar Reflexão</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal para Visualização do Diário */}
      <AnimatePresence>
        {diarioSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDiarioSelecionado(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 z-10 max-h-[85vh] overflow-y-auto"
            >
              <button onClick={() => setDiarioSelecionado(null)} className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors">
                <X size={18} />
              </button>

              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-peach-500 uppercase tracking-widest">
                    {diarioSelecionado.dataFormatada.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={10} /> Privado
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-800">{diarioSelecionado.titulo}</h2>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{diarioSelecionado.conteudo}</p>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handleDeletar(diarioSelecionado.id)}
                  className="flex-1 py-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={16} /> Apagar Registro
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}