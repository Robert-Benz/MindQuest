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
  Sun,
  Tag,
  Lock,
  Video,
  Clock as ClockIcon,
  User as UserIcon,
  CalendarX,
  CalendarClock,
  CalendarDays,
  Check
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { collection, query, getDocs, deleteDoc, doc, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";

const sessoesMockIniciais = [
  {
    id: "sessao_1",
    dia: 15, 
    horario: "14:30",
    psicologo: "Dra. Juliana Mendes",
    especialidade: "Terapia Cognitivo-Comportamental",
    linkSala: "/SalaSessao" 
  },
  {
    id: "sessao_2",
    dia: 28, 
    horario: "10:00",
    psicologo: "Dr. Carlos Eduardo",
    especialidade: "Psicanálise",
    linkSala: "/SalaSessao"
  }
];

const horariosDisponiveisMock = ["09:00", "10:30", "14:00", "15:30", "17:00"];

const disponibilidadeDiasMock = {
  10: false, 11: true, 12: true, 14: false, 16: true, 17: true, 
  18: false, 20: true, 22: true, 25: false, 26: true, 29: true
};

export default function Calendario() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sessoes, setSessoes] = useState(sessoesMockIniciais);
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const [mostrarModalReagendar, setMostrarModalReagendar] = useState(false);
  const [novaDataReagendamento, setNovaDataReagendamento] = useState(null);
  const [novoHorarioReagendamento, setNovoHorarioReagendamento] = useState("");

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
        
        if (data.data && typeof data.data.toDate === 'function') {
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

  const handleCancelarSessao = (idSessao) => {
    if (window.confirm("Deseja realmente cancelar esta sessão? Lembre-se da política de 12h de antecedência.")) {
      setSessoes(sessoes.filter(sessao => sessao.id !== idSessao));
      setDiaSelecionado(null);
      toast.success("Sessão cancelada com sucesso!");
    }
  };

  const confirmarReagendamento = () => {
    if (!novaDataReagendamento || !novoHorarioReagendamento) {
      toast.error("Selecione uma data disponível e um horário para reagendar.");
      return;
    }

    setSessoes(sessoes.map(s => {
      if (s.id === diaSelecionado.sessao.id) {
        return { ...s, dia: novaDataReagendamento, horario: novoHorarioReagendamento };
      }
      return s;
    }));

    toast.success("Sessão reagendada com sucesso!");
    setMostrarModalReagendar(false);
    setDiaSelecionado(null);
    setNovaDataReagendamento(null);
    setNovoHorarioReagendamento("");
  };

  const handleDeleteHumor = async () => {
    if (!diaSelecionado || !diaSelecionado.registro) return;
    const confirm = window.confirm("Tem certeza que deseja apagar este registro de humor?");
    if (!confirm) return;

    try {
      const user = auth.currentUser;
      await deleteDoc(doc(db, "usuarios", user.uid, "registrosHumor", diaSelecionado.registro.docId));
      toast.success("Registro apagado com sucesso!");
      setDiaSelecionado(null);
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

  const verificarSeEhHoje = (dataRegistro) => {
    if(!dataRegistro) return false;
    const hoje = new Date();
    return (
      dataRegistro.getDate() === hoje.getDate() &&
      dataRegistro.getMonth() === hoje.getMonth() &&
      dataRegistro.getFullYear() === hoje.getFullYear()
    );
  };

  const abrirDetalhesDia = (dia, registroDoDia, sessaoDoDia) => {
    if (registroDoDia || sessaoDoDia) {
      setDiaSelecionado({
        diaNumero: dia,
        registro: registroDoDia,
        sessao: sessaoDoDia
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-100 via-white to-peach-300 p-6 antialiased text-gray-800 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md mx-auto bg-white rounded-[2.5rem] shadow-2xl border border-white p-6 md:p-8 relative"
      >
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate("/menu")} className="p-2 hover:bg-peach-100 rounded-full transition-colors">
            <ArrowLeft className="size-6 text-peach-400" />
          </button>

          <div className="text-center capitalize">
            <h2 className="text-xl font-bold text-peach-500">{nomeMes} {ano}</h2>
            <p className="text-[10px] text-peach-400 font-semibold uppercase tracking-widest">Seu Histórico e Sessões</p>
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

              {diasArray.map((dia) => {
                const registroDoDia = registros.find(r => r.dataRegistro.getDate() === dia);
                const sessaoDoDia = sessoes.find(s => s.dia === dia); 

                return (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    key={dia}
                    onClick={() => abrirDetalhesDia(dia, registroDoDia, sessaoDoDia)}
                    className={`aspect-square relative flex flex-col items-center justify-center rounded-2xl text-sm font-medium transition-all ${(registroDoDia || sessaoDoDia) ? "cursor-pointer" : "cursor-default"}
                    ${
                      (registroDoDia || sessaoDoDia)
                        ? "bg-peach-100 border border-peach-200 shadow-sm hover:shadow-md"
                        : "bg-peach-50/50 text-peach-200 opacity-60"
                    }`}
                  >
                    <span className="text-[10px] mb-1 z-10">{dia}</span>
                    
                    {registroDoDia && (
                      <span className="text-lg leading-none z-10">{registroDoDia.emoji}</span>
                    )}

                    {sessaoDoDia && (
                      <div className="absolute top-1 right-1 size-2.5 bg-blue-500 rounded-full shadow-sm border border-white animate-pulse" />
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

      {/* Modal Principal de Detalhes do Dia */}
      <AnimatePresence>
        {diaSelecionado && !mostrarModalReagendar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setDiaSelecionado(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-6 md:p-8 border border-white z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setDiaSelecionado(null)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors z-20"
              >
                <X className="size-5" />
              </button>

              <h2 className="text-center text-lg font-black text-slate-800 mb-6 border-b border-slate-100 pb-4">
                Detalhes do dia {diaSelecionado.diaNumero}
              </h2>

              <div className="space-y-6">
                
                {diaSelecionado.sessao && (
                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <Video className="size-5" />
                      <h3 className="font-black text-sm uppercase tracking-widest">Sessão Agendada</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-slate-700 text-sm">
                        <ClockIcon className="size-4 text-blue-400" />
                        <span className="font-bold">{diaSelecionado.sessao.horario}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-700 text-sm">
                        <UserIcon className="size-4 text-blue-400 mt-0.5" />
                        <div>
                          <p className="font-bold">{diaSelecionado.sessao.psicologo}</p>
                          <p className="text-[11px] text-slate-500">{diaSelecionado.sessao.especialidade}</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate(diaSelecionado.sessao.linkSala)}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-sm shadow-md shadow-blue-500/30 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <Video className="size-4" /> Entrar na Chamada
                    </button>

                    <div className="pt-3 border-t border-blue-200/50 space-y-3">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setMostrarModalReagendar(true)}
                          className="flex-1 py-2.5 bg-white border border-blue-100 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CalendarClock size={14} /> Reagendar
                        </button>
                        <button 
                          onClick={() => handleCancelarSessao(diaSelecionado.sessao.id)}
                          className="flex-1 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <CalendarX size={14} /> Cancelar
                        </button>
                      </div>
                      <p className="text-[9px] font-medium text-blue-600/70 text-center leading-tight px-2">
                        * Alterações ou cancelamentos só podem ser feitos com pelo menos <span className="font-bold">12 horas de antecedência</span>.
                      </p>
                    </div>
                  </div>
                )}

                {diaSelecionado.registro && (
                  <div className="space-y-4 bg-slate-50 border border-slate-100 p-5 rounded-3xl">
                    <div className="text-center mb-4">
                      <div className="text-5xl mb-2">{diaSelecionado.registro.emoji}</div>
                      <h3 className="text-xl font-black text-slate-800">{diaSelecionado.registro.humor}</h3>
                    </div>

                    {diaSelecionado.registro.clima && (
                      <div className="flex items-center gap-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                        <Sun className="size-4 text-peach-400" />
                        <span className="font-medium">Clima:</span> {diaSelecionado.registro.clima.condicao}
                      </div>
                    )}
                    
                    {diaSelecionado.registro.fatores && diaSelecionado.registro.fatores.length > 0 && (
                      <div className="flex items-start gap-3 text-sm text-slate-600 bg-white p-3 rounded-xl border border-slate-100">
                        <Tag className="size-4 text-peach-400 mt-0.5" />
                        <div>
                          <span className="font-medium">Fatores:</span> 
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {diaSelecionado.registro.fatores.map(f => (
                              <span key={f} className="bg-slate-50 px-2 py-1 rounded-md text-[10px] font-bold border border-slate-100 text-slate-500">{f}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {diaSelecionado.registro.nota && (
                      <div className="pt-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 ml-1">Anotações:</p>
                        <p className="text-sm text-slate-600 italic bg-white p-4 rounded-2xl border border-slate-100">"{diaSelecionado.registro.nota}"</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button 
                        onClick={handleDeleteHumor}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 font-semibold transition-colors text-xs"
                      >
                        <Trash2 className="size-4" /> Apagar
                      </button>
                      
                      {verificarSeEhHoje(diaSelecionado.registro.dataRegistro) ? (
                        <button 
                          onClick={() => navigate("/humor", { state: { registroParaEditar: diaSelecionado.registro } })}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-peach-600 bg-peach-100 hover:bg-peach-200 font-semibold transition-colors text-xs"
                        >
                          <Edit3 className="size-4" /> Editar
                        </button>
                      ) : (
                        <div className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-slate-400 bg-slate-100 cursor-not-allowed font-medium text-xs">
                          <Lock className="size-3" /> Fechado
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Secundário de Reagendamento com Mini-Calendário */}
      <AnimatePresence>
        {mostrarModalReagendar && diaSelecionado?.sessao && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMostrarModalReagendar(false)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-6 border border-white z-10"
            >
              <button 
                onClick={() => setMostrarModalReagendar(false)}
                className="absolute top-5 right-5 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors z-20"
              >
                <X className="size-5" />
              </button>

              <div className="text-center mb-6 pt-2">
                <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 text-blue-500">
                  <CalendarDays size={24} />
                </div>
                <h2 className="text-lg font-black text-slate-900">Agenda do Profissional</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">{diaSelecionado.sessao.psicologo}</p>
              </div>

              <div className="space-y-5">
                
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="text-xs font-bold text-slate-700 capitalize">{nomeMes} {ano}</span>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase"><div className="size-2 bg-emerald-400 rounded-full"></div> Livre</span>
                      <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 uppercase"><div className="size-2 bg-red-400 rounded-full"></div> Ocupado</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {diasSemana.map(d => (
                      <div key={d} className="text-center text-[9px] font-bold text-slate-400 mb-1">{d.charAt(0)}</div>
                    ))}
                    {espacosVazios.map(e => (
                      <div key={`empty-${e}`} className="aspect-square" />
                    ))}
                    {diasArray.map(dia => {
                      const status = disponibilidadeDiasMock[dia];
                      
                      let btnClass = "bg-white text-slate-400 border-slate-100"; 
                      let isDisabled = true;

                      if (status === true) {
                        btnClass = "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer shadow-sm";
                        isDisabled = false;
                      } else if (status === false) {
                        btnClass = "bg-red-50/50 text-red-300 border-red-100 cursor-not-allowed";
                      }

                      const isSelected = novaDataReagendamento === dia;

                      return (
                        <button
                          key={dia}
                          disabled={isDisabled}
                          onClick={() => setNovaDataReagendamento(dia)}
                          className={`aspect-square rounded-lg flex items-center justify-center text-xs font-bold border transition-all ${btnClass} ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 text-blue-600 border-blue-200 shadow-md' : ''}`}
                        >
                          {dia}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <AnimatePresence>
                  {novaDataReagendamento && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest block mb-2">Horários para o dia {novaDataReagendamento}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {horariosDisponiveisMock.map((hora) => (
                          <button
                            key={hora}
                            onClick={() => setNovoHorarioReagendamento(hora)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                              novoHorarioReagendamento === hora 
                                ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20" 
                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="pt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      setMostrarModalReagendar(false);
                      setNovaDataReagendamento(null);
                      setNovoHorarioReagendamento("");
                    }}
                    className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
                  >
                    Voltar
                  </button>
                  <button 
                    onClick={confirmarReagendamento}
                    className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Check size={16} /> Confirmar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}