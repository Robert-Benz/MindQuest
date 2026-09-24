import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  ArrowLeft, X, Trash2, Edit3, Sun, Tag, Lock, Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../../firebaseConfig";
import { collection, query, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";
import HeaderUsuario from "../../components/HeaderUsuario";

export default function Calendario() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  
  const fetchRegistros = async (user) => {
    try {
      const q = query(
        collection(db, "usuarios", user.uid, "registrosHumor"),
        orderBy("data", "asc") 
      );
      const querySnapshot = await getDocs(q);
      
      const dadosMapeados = [];
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        let dataRegistro;
        
        if (data.data && typeof data.data.toDate === "function") {
          dataRegistro = data.data.toDate();
        } else {
          dataRegistro = new Date(data.data);
        }

        if (
          dataRegistro.getMonth() === currentDate.getMonth() &&
          dataRegistro.getFullYear() === currentDate.getFullYear()
        ) {
          dadosMapeados.push({ ...data, docId: documento.id, dataRegistro });
        }
      });

      setRegistros(dadosMapeados);
    } catch (error) {
      console.error("Erro ao procurar histórico:", error);
      toast.error("Erro ao carregar o histórico.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchRegistros(user);
      } else {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [currentDate, navigate]);

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDelete = async () => {
    if (!registroSelecionado) return;
    const confirm = window.confirm("Tem a certeza de que deseja apagar este registo?");
    if (!confirm) return;

    try {
      const user = auth.currentUser;
      await deleteDoc(doc(db, "usuarios", user.uid, "registrosHumor", registroSelecionado.docId));
      toast.success("Registo apagado com sucesso!");
      setRegistroSelecionado(null);
      fetchRegistros(user); 
    } catch (error) {
      toast.error("Erro ao apagar o registo.");
    }
  };

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const diasNoMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const primeiroDiaDoMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const nomeMes = currentDate.toLocaleString("pt-BR", { month: "long" });
  const ano = currentDate.getFullYear();

  const espacosVazios = Array.from({ length: primeiroDiaDoMes }, (_, i) => i);
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const diasFelizes = registros.filter(r => r.nivel >= 80).length;

  const verificarSeEhHoje = (dataRegistro) => {
    const hoje = new Date();
    return (
      dataRegistro.getDate() === hoje.getDate() &&
      dataRegistro.getMonth() === hoje.getMonth() &&
      dataRegistro.getFullYear() === hoje.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32">
      
      {/* Cabeçalho partilhado do utilizador */}
      <HeaderUsuario />

      <div className="max-w-xl mx-auto space-y-6">

        {/* Card Principal do Calendário */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-6 md:p-8 space-y-6 relative overflow-hidden"
        >
          {/* Seletor do Mês */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <button 
              type="button"
              onClick={prevMonth} 
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-[#E97451] transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft size={20} />
            </button>

            <div className="text-center capitalize">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{nomeMes} {ano}</h2>
              <span className="text-[10px] text-orange-500 font-bold uppercase tracking-widest block mt-0.5">
                Histórico de Humor
              </span>
            </div>

            <button 
              type="button"
              onClick={nextMonth} 
              className="p-2.5 rounded-2xl bg-slate-50 hover:bg-orange-50 text-slate-400 hover:text-[#E97451] transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Sparkles className="size-6 text-orange-400 animate-pulse" />
              <span className="text-xs font-medium">A carregar o seu calendário...</span>
            </div>
          ) : (
            <>
              {/* Grelha dos Dias */}
              <div className="grid grid-cols-7 gap-2">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-[11px] font-black text-slate-400 uppercase tracking-wider py-1">
                    {dia}
                  </div>
                ))}

                {espacosVazios.map((espaco) => (
                  <div key={`empty-${espaco}`} className="aspect-square" />
                ))}

                {diasArray.map((dia) => {
                const registroDoDia = registros.find(r => r.dataRegistro.getDate() === dia);
                const hoje = new Date();
                const ehHoje = 
                  dia === hoje.getDate() && 
                  currentDate.getMonth() === hoje.getMonth() && 
                  currentDate.getFullYear() === hoje.getFullYear();

                return (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    key={dia}
                    onClick={() => {
                      if (registroDoDia) {
                        setRegistroSelecionado(registroDoDia);
                      } else if (ehHoje) {
                        navigate("/humor");
                      }
                    }}
                    className={`min-h-[58px] aspect-square flex items-center justify-center rounded-2xl text-xs font-semibold transition-all relative select-none
                    ${
                      registroDoDia
                        ? "bg-gradient-to-br from-orange-50 to-amber-50/70 border border-orange-200/80 shadow-sm hover:shadow-md cursor-pointer text-slate-800"
                        : ehHoje
                          ? "bg-white border-2 border-dashed border-[#E97451] text-[#E97451] cursor-pointer hover:bg-orange-50/40"
                          : "bg-slate-50/60 border border-slate-100/60 text-slate-300 cursor-default"
                    }`}
                  >
                    {/* Número do dia fixo no canto superior esquerdo */}
                    <span className={`absolute top-1.5 left-2 text-[10px] leading-none ${ehHoje ? "font-black text-[#E97451]" : "text-slate-400"}`}>
                      {dia}
                    </span>
                    
                    {/* Emoji ou sinal de + perfeitamente centralizado no card */}
                    {registroDoDia ? (
                      <span className="text-2xl drop-shadow-sm pt-2">{registroDoDia.emoji}</span>
                    ) : ehHoje ? (
                      <span className="text-base font-black text-[#E97451] pt-1">+</span>
                    ) : null}
                  </motion.div>
                );
              })}
              </div>

              {/* Resumo do Mês */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-500 to-[#E97451] text-white shadow-lg shadow-orange-500/20 flex items-start gap-3.5">
                <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-md shrink-0">
                  <CalendarIcon className="size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black">Resumo de {nomeMes}</h3>
                  <p className="text-xs text-orange-100 mt-1 leading-relaxed">
                    Registou <strong className="text-white">{diasFelizes} dias felizes</strong> este mês. 
                    {registros.length === 0 ? " Comece a registar para obter análises detalhadas." : " Continue a manter a regularidade do seu autocuidado!"}
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>

      </div>

      {/* Modal de Detalhes do Registo */}
      <AnimatePresence>
        {registroSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setRegistroSelecionado(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-7 border border-white z-10"
            >
              <button 
                type="button"
                onClick={() => setRegistroSelecionado(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>

              <div className="text-center mb-5 mt-1">
                <div className="text-6xl mb-3">{registroSelecionado.emoji}</div>
                <h3 className="text-2xl font-black text-slate-900">{registroSelecionado.humor}</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5 capitalize">
                  {registroSelecionado.dataRegistro.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-100">
                {registroSelecionado.clima && (
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <Sun className="size-4 text-orange-400" />
                    <span className="font-bold">Clima:</span> {registroSelecionado.clima.condicao}
                  </div>
                )}
                
                {registroSelecionado.fatores && registroSelecionado.fatores.length > 0 && (
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <Tag className="size-4 text-orange-400 mt-0.5" />
                    <div>
                      <span className="font-bold">Fatores:</span> 
                      <div className="flex flex-wrap gap-1 mt-1">
                        {registroSelecionado.fatores.map(f => (
                          <span key={f} className="bg-white px-2 py-0.5 rounded-md text-[11px] border border-slate-200 font-medium">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {registroSelecionado.nota && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Anotações:</p>
                    <p className="text-xs text-slate-700 italic">"{registroSelecionado.nota}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Trash2 className="size-4" /> Apagar
                  </button>
                  
                  {verificarSeEhHoje(registroSelecionado.dataRegistro) ? (
                    <button 
                      type="button"
                      onClick={() => navigate("/humor", { state: { registroParaEditar: registroSelecionado } })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-white bg-[#E97451] hover:bg-[#d66340] font-bold text-xs transition-colors cursor-pointer shadow-md shadow-orange-500/20"
                    >
                      <Edit3 className="size-4" /> Editar
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-slate-400 bg-slate-100 cursor-not-allowed font-bold text-xs">
                      <Lock className="size-3.5" />
                      Não editável
                    </div>
                  )}
                </div>
                
                {!verificarSeEhHoje(registroSelecionado.dataRegistro) && (
                  <p className="text-[10px] text-center text-slate-400 mt-1 uppercase tracking-widest font-bold">
                    Apenas os registos de hoje podem ser alterados.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}