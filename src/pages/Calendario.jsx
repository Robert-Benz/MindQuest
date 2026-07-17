import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  ArrowLeft,
  X,
  Trash2,
  Edit3,
  CloudRain,
  Sun,
  Cloud,
  Tag,
  Lock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { collection, query, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";

export default function Calendario() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);

  // [BACKEND] Processo de buscar os registros da tabela de humor em ordem cronológica
  const fetchRegistros = async (user) => {
    try {
      // Adicionado orderBy("data", "asc") para garantir a cronologia
      const q = query(
        collection(db, "usuarios", user.uid, "registrosHumor"),
        orderBy("data", "asc") 
      );
      const querySnapshot = await getDocs(q);
      
      const dadosMapeados = [];
      querySnapshot.forEach((documento) => {
        const data = documento.data();
        let dataRegistro;
        
        if (data.data && typeof data.data.toDate === 'function') {
          dataRegistro = data.data.toDate();
        } else {
          dataRegistro = new Date(data.data);
        }

        // [BACKEND] Implementação lógica do calendário (puxar apenas os dias do mês atual)
        if (
          dataRegistro.getMonth() === currentDate.getMonth() &&
          dataRegistro.getFullYear() === currentDate.getFullYear()
        ) {
          dadosMapeados.push({ ...data, docId: documento.id, dataRegistro });
        }
      });

      setRegistros(dadosMapeados);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      toast.error("Erro ao carregar seu histórico.");
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
    const confirm = window.confirm("Tem certeza que deseja apagar este registro?");
    if (!confirm) return;

    try {
      const user = auth.currentUser;
      await deleteDoc(doc(db, "usuarios", user.uid, "registrosHumor", registroSelecionado.docId));
      toast.success("Registro apagado com sucesso!");
      setRegistroSelecionado(null);
      fetchRegistros(user); 
    } catch (error) {
      toast.error("Erro ao apagar o registro.");
    }
  };

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const diasNoMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const primeiroDiaDoMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const nomeMes = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const ano = currentDate.getFullYear();

  const espacosVazios = Array.from({ length: primeiroDiaDoMes }, (_, i) => i);
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);
  const diasFelizes = registros.filter(r => r.nivel >= 80).length;

  // [BACKEND] Criação da trava de segurança para a não edição
  const verificarSeEhHoje = (dataRegistro) => {
    const hoje = new Date();
    return (
      dataRegistro.getDate() === hoje.getDate() &&
      dataRegistro.getMonth() === hoje.getMonth() &&
      dataRegistro.getFullYear() === hoje.getFullYear()
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-100 via-white to-peach-300 p-6 antialiased text-gray-800 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-white p-6 md:p-8 relative"
      >
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/Menu")} className="p-2 hover:bg-peach-100 rounded-full transition-colors">
            <ArrowLeft className="size-6 text-peach-400" />
          </button>

          <div className="text-center capitalize">
            <h2 className="text-xl font-bold text-peach-500">{nomeMes} {ano}</h2>
            <p className="text-[10px] text-peach-400 font-semibold uppercase tracking-widest">Seu Histórico</p>
          </div>

          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 text-peach-400 hover:text-peach-500 transition-colors"><ChevronLeft /></button>
            <button onClick={nextMonth} className="p-2 text-peach-400 hover:text-peach-500 transition-colors"><ChevronRight /></button>
          </div>
        </div>

        {loading ? (
          <div className="h-64 flex items-center justify-center text-peach-300 animate-pulse">Carregando calendário...</div>
        ) : (
          <>
            <div className="grid grid-cols-7 gap-2 mb-8">
              {diasSemana.map((dia) => (
                <div key={dia} className="text-center text-[10px] font-bold text-peach-300 uppercase italic">
                  {dia}
                </div>
              ))}

              {espacosVazios.map((espaco) => (
                <div key={`empty-${espaco}`} className="aspect-square" />
              ))}

              {/* [FRONTEND] Criação de botões (dias no calendário) */}
              {diasArray.map((dia) => {
                const registroDoDia = registros.find(r => r.dataRegistro.getDate() === dia);

                return (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    key={dia}
                    onClick={() => registroDoDia && setRegistroSelecionado(registroDoDia)}
                    className={`aspect-square flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all ${registroDoDia ? "cursor-pointer" : "cursor-default"}
                    ${
                      registroDoDia
                        ? "bg-peach-100 border border-peach-200 shadow-sm hover:shadow-md"
                        : "bg-peach-50/50 text-peach-200 opacity-60"
                    }`}
                  >
                    <span className="text-[10px] mb-1">{dia}</span>
                    {registroDoDia && (
                      <span className="text-xl">{registroDoDia.emoji}</span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <div className="bg-peach-500 p-6 rounded-3xl text-white shadow-xl shadow-peach-300">
              <div className="flex items-center gap-3 mb-2">
                <CalendarIcon className="size-5 opacity-80" />
                <h3 className="font-bold">Resumo do Mês</h3>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">
                Você teve {diasFelizes} dias <span className="font-bold">Felizes</span> este mês! 
                {registros.length === 0 ? " Comece a registrar para ver seus insights." : " Continue acompanhando sua jornada."}
              </p>
            </div>
          </>
        )}
      </motion.div>

      <AnimatePresence>
        {registroSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setRegistroSelecionado(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 border border-white z-10"
            >
              <button 
                onClick={() => setRegistroSelecionado(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="size-5" />
              </button>

              <div className="text-center mb-6 mt-2">
                <div className="text-6xl mb-4">{registroSelecionado.emoji}</div>
                <h3 className="text-2xl font-black text-slate-800">{registroSelecionado.humor}</h3>
                <p className="text-sm text-slate-400 font-medium mt-1">
                  {registroSelecionado.dataRegistro.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>

              <div className="space-y-4 bg-slate-50 p-5 rounded-3xl mb-6">
                {registroSelecionado.clima && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Sun className="size-4 text-peach-400" />
                    <span className="font-medium">Clima:</span> {registroSelecionado.clima.condicao}
                  </div>
                )}
                
                {registroSelecionado.fatores && registroSelecionado.fatores.length > 0 && (
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <Tag className="size-4 text-peach-400 mt-0.5" />
                    <div>
                      <span className="font-medium">Fatores:</span> 
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {registroSelecionado.fatores.map(f => (
                          <span key={f} className="bg-white px-2 py-1 rounded-md text-xs border border-slate-100 shadow-sm">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {registroSelecionado.nota && (
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Anotações:</p>
                    <p className="text-sm text-slate-600 italic">"{registroSelecionado.nota}"</p>
                  </div>
                )}
              </div>

              {/* [FRONTEND] Interface para Edição de Registro do dia atual e Trava de Segurança */}
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <button 
                    onClick={handleDelete}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-red-500 bg-red-50 hover:bg-red-100 font-semibold transition-colors"
                  >
                    <Trash2 className="size-4" /> Apagar
                  </button>
                  
                  {verificarSeEhHoje(registroSelecionado.dataRegistro) ? (
                    <button 
                      onClick={() => navigate("/humor", { state: { registroParaEditar: registroSelecionado } })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-peach-600 bg-peach-50 hover:bg-peach-100 font-semibold transition-colors"
                    >
                      <Edit3 className="size-4" /> Editar
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-slate-400 bg-slate-100 cursor-not-allowed font-medium text-sm">
                      <Lock className="size-4" />
                      Não editável
                    </div>
                  )}
                </div>
                
                {!verificarSeEhHoje(registroSelecionado.dataRegistro) && (
                  <p className="text-[10px] text-center text-slate-400 mt-1 uppercase tracking-widest font-bold">
                    Apenas registros de hoje podem ser alterados.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}