import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ArrowLeft, X, 
  Clock, Plus, CalendarOff, Users, Video
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import BottomNavPsicologo from "../../components/BottomNavPsicologo";

// Mocks para a apresentação
const sessoesMock = [
  { id: "s1", dia: 15, horario: "14:30", paciente: "Ana Carolina M.", tipo: "Terapia Cognitivo-Comportamental" },
  { id: "s2", dia: 15, horario: "16:00", paciente: "Lucas Rafael", tipo: "Sessão Individual" },
  { id: "s3", dia: 28, horario: "10:00", paciente: "Mariana Silva", tipo: "Avaliação Inicial" }
];

const disponibilidadeMockInicial = {
  10: ["09:00", "10:00", "14:00", "15:00"],
  11: ["09:00", "10:00", "14:00"],
  20: ["14:00", "15:30", "17:00"]
};

export default function CalendarioPsicologo() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const [sessoes, setSessoes] = useState(sessoesMock);
  const [disponibilidade, setDisponibilidade] = useState(disponibilidadeMockInicial);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [novoHorarioInput, setNovoHorarioInput] = useState("");

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
  const diasNoMes = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const primeiroDiaDoMes = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const nomeMes = currentDate.toLocaleString('pt-BR', { month: 'long' });
  const ano = currentDate.getFullYear();

  const espacosVazios = Array.from({ length: primeiroDiaDoMes }, (_, i) => i);
  const diasArray = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const bloquearFinaisDeSemana = () => {
    if (!window.confirm("Deseja remover todos os horários livres dos finais de semana deste mês?")) return;

    const novaDisp = { ...disponibilidade };
    let bloqueados = 0;

    diasArray.forEach(dia => {
      const dataReal = new Date(ano, currentDate.getMonth(), dia);
      const diaDaSemana = dataReal.getDay();
      
      if (diaDaSemana === 0 || diaDaSemana === 6) {
        if (novaDisp[dia]) {
          delete novaDisp[dia];
          bloqueados++;
        }
      }
    });

    setDisponibilidade(novaDisp);
    if (bloqueados > 0) {
      toast.success("Finais de semana bloqueados com sucesso!");
    } else {
      toast.info("Os finais de semana já estavam sem horários livres.");
    }
  };

  const adicionarHorarioLivre = (e) => {
    e.preventDefault();
    if (!novoHorarioInput) return;

    const dia = diaSelecionado.diaNumero;
    const horariosDoDia = disponibilidade[dia] || [];

    if (horariosDoDia.includes(novoHorarioInput)) {
      toast.error("Este horário já está configurado.");
      return;
    }

    const novaLista = [...horariosDoDia, novoHorarioInput].sort();
    setDisponibilidade({ ...disponibilidade, [dia]: novaLista });
    setNovoHorarioInput("");
    toast.success("Horário liberado na agenda!");
  };

  const bloquearHorario = (horarioRemover) => {
    const dia = diaSelecionado.diaNumero;
    const horariosDoDia = disponibilidade[dia] || [];
    
    const novaLista = horariosDoDia.filter(h => h !== horarioRemover);
    
    const novaDisp = { ...disponibilidade };
    if (novaLista.length === 0) {
      delete novaDisp[dia];
    } else {
      novaDisp[dia] = novaLista;
    }

    setDisponibilidade(novaDisp);
    toast.success("Horário bloqueado com sucesso!");
  };

  const abrirModalDia = (dia) => {
    const sessoesDoDia = sessoes.filter(s => s.dia === dia);
    setDiaSelecionado({
      diaNumero: dia,
      sessoes: sessoesDoDia
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 antialiased text-slate-800 pb-32 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-peach-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-3xl mx-auto space-y-6 relative z-10">
        
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/painel-psicologo")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-peach-500 transition-colors">
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-900/5 border border-peach-50 p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">Agenda do Profissional</h1>
              <p className="text-sm text-slate-500 mt-1">Defina seus horários livres para agendamento e consulte suas sessões.</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={bloquearFinaisDeSemana}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all"
              >
                <CalendarOff size={14} /> Bloquear Finais de Semana
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-peach-600 capitalize">{nomeMes} {ano}</h2>
            <div className="flex gap-1">
              <button onClick={prevMonth} className="p-2.5 text-slate-400 bg-slate-50 rounded-xl hover:text-peach-500 transition-colors"><ChevronLeft size={18} /></button>
              <button onClick={nextMonth} className="p-2.5 text-slate-400 bg-slate-50 rounded-xl hover:text-peach-500 transition-colors"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="flex gap-4 mb-4 px-2">
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><div className="size-2.5 rounded-full bg-peach-500" /> Sessão Agendada</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest"><div className="size-2.5 rounded-full bg-emerald-400" /> Horários Livres</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {diasSemana.map((dia) => (
              <div key={dia} className="text-center text-[11px] font-bold text-slate-400 uppercase mb-2">
                {dia}
              </div>
            ))}

            {espacosVazios.map((espaco) => (
              <div key={`empty-${espaco}`} className="aspect-square" />
            ))}

            {diasArray.map((dia) => {
              const sessoesDoDia = sessoes.filter(s => s.dia === dia);
              const temSessao = sessoesDoDia.length > 0;
              const temDisponibilidade = disponibilidade[dia] && disponibilidade[dia].length > 0;

              return (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  key={dia}
                  onClick={() => abrirModalDia(dia)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-2xl cursor-pointer relative border transition-all
                  ${temSessao ? "bg-peach-50 border-peach-200" : (temDisponibilidade ? "bg-emerald-50/50 border-emerald-100" : "bg-slate-50 border-slate-100 hover:border-peach-300")}
                  `}
                >
                  <span className={`text-sm font-bold ${temSessao ? "text-peach-700" : "text-slate-600"}`}>{dia}</span>
                  
                  <div className="absolute bottom-2 flex gap-1">
                    {temSessao && <div className="size-1.5 rounded-full bg-peach-500 shadow-sm" />}
                    {temDisponibilidade && !temSessao && <div className="size-1.5 rounded-full bg-emerald-400 shadow-sm" />}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {diaSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDiaSelecionado(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-6 md:p-8 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <button 
                onClick={() => setDiaSelecionado(null)}
                className="absolute top-6 right-6 p-2 bg-slate-50 text-slate-400 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="size-5" />
              </button>

              <h2 className="text-xl font-black text-slate-800 border-b border-slate-100 pb-4 mb-6">
                Dia {diaSelecionado.diaNumero} de {nomeMes}
              </h2>

              <div className="space-y-8">
                
                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <Users size={14} /> Sessões Confirmadas
                  </h3>
                  
                  {diaSelecionado.sessoes.length === 0 ? (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center text-sm text-slate-500 font-medium">
                      Nenhuma sessão agendada para este dia.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {diaSelecionado.sessoes.map(sessao => (
                        <div key={sessao.id} className="bg-peach-50 border border-peach-100 p-4 rounded-2xl flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black bg-peach-200 text-peach-700 px-2 py-0.5 rounded flex items-center gap-1 w-fit mb-1.5">
                              <Clock size={10} /> {sessao.horario}
                            </span>
                            <p className="font-bold text-slate-800 text-sm">{sessao.paciente}</p>
                            <p className="text-[10px] text-peach-600/80 font-medium">{sessao.tipo}</p>
                          </div>
                          <button 
                            onClick={() => navigate(sessao.linkSala || "/sala-sessao")}
                            className="size-10 bg-[#E97451] text-white rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 hover:bg-[#C06043] transition-colors"
                            title="Entrar na Sala"
                          >
                            <Video size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    <Clock size={14} /> Horários Disponíveis para Agendamento
                  </h3>
                  
                  <form onSubmit={adicionarHorarioLivre} className="flex gap-2 mb-4">
                    <input 
                      type="time" 
                      value={novoHorarioInput}
                      onChange={(e) => setNovoHorarioInput(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-peach-200"
                    />
                    <button 
                      type="submit"
                      className="px-5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <Plus size={16} /> Liberar Horário
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2">
                    {(!disponibilidade[diaSelecionado.diaNumero] || disponibilidade[diaSelecionado.diaNumero].length === 0) ? (
                      <p className="text-xs text-slate-400 w-full text-center py-2">Nenhum horário liberado neste dia.</p>
                    ) : (
                      disponibilidade[diaSelecionado.diaNumero].map(horario => (
                        <div key={horario} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          <span className="text-sm font-bold text-emerald-700">{horario}</span>
                          <button 
                            onClick={() => bloquearHorario(horario)}
                            className="text-emerald-600/50 hover:text-red-500 transition-colors"
                            title="Bloquear este horário"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNavPsicologo />
    </div>
  );
}