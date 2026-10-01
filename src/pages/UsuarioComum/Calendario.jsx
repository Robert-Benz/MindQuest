import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  X, Edit3, Sun, Tag, Lock, Sparkles 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { auth, db } from "../../firebaseConfig";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
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
    <div className="min-h-screen bg-app-bg p-3 sm:p-6 text-app-text antialiased font-sans pb-28 transition-colors duration-300">
      
      {/* Cabeçalho compartilhado do usuário */}
      <HeaderUsuario />

      <div className="max-w-xl mx-auto space-y-4 sm:space-y-6">

        {/* Card Principal do Calendário */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-app-card rounded-[2rem] sm:rounded-[2.75rem] border border-app-border shadow-xl p-4 sm:p-7 space-y-4 sm:space-y-6 relative overflow-hidden"
        >
          {/* Seletor do Mês */}
          <div className="flex items-center justify-between border-b border-app-border pb-3 sm:pb-4">
            <button 
              type="button"
              onClick={prevMonth} 
              className="p-2 sm:p-2.5 rounded-2xl bg-app-bg hover:bg-app-border text-app-muted hover:text-app-primary transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
            </button>

            <div className="text-center capitalize">
              <h2 className="text-lg sm:text-xl font-black text-app-text tracking-tight">{nomeMes} {ano}</h2>
              <span className="text-[9px] sm:text-[10px] text-app-primary font-bold uppercase tracking-widest block mt-0.5">
                Histórico de Humor
              </span>
            </div>

            <button 
              type="button"
              onClick={nextMonth} 
              className="p-2 sm:p-2.5 rounded-2xl bg-app-bg hover:bg-app-border text-app-muted hover:text-app-primary transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>

          {loading ? (
            <div className="h-56 sm:h-64 flex flex-col items-center justify-center text-app-muted gap-2">
              <Sparkles className="size-6 text-app-primary animate-pulse" />
              <span className="text-xs font-medium">Carregando o seu calendário...</span>
            </div>
          ) : (
            <>
              {/* Grade dos Dias Ajustada para Mobile */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {diasSemana.map((dia) => (
                  <div key={dia} className="text-center text-[10px] sm:text-[11px] font-black text-app-muted uppercase tracking-wider py-0.5">
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
                      className={`min-h-[46px] sm:min-h-[58px] aspect-square flex items-center justify-center rounded-xl sm:rounded-2xl text-xs font-semibold transition-all relative select-none ${
                        registroDoDia
                          ? "bg-app-border/40 border border-app-border shadow-xs hover:shadow-md cursor-pointer text-app-text"
                          : ehHoje
                            ? "bg-app-card border-2 border-dashed border-app-primary text-app-primary cursor-pointer hover:bg-app-border/30"
                            : "bg-app-bg/60 border border-app-border/40 text-app-muted/50 cursor-default"
                      }`}
                    >
                      {/* Número do dia fixo no canto superior esquerdo */}
                      <span className={`absolute top-1 left-1.5 text-[9px] sm:text-[10px] leading-none ${ehHoje ? "font-black text-app-primary" : "text-app-muted"}`}>
                        {dia}
                      </span>
                      
                      {/* Emoji ou sinal de + no centro do card */}
                      {registroDoDia ? (
                        <span className="text-xl sm:text-2xl drop-shadow-xs pt-1.5 sm:pt-2">{registroDoDia.emoji}</span>
                      ) : ehHoje ? (
                        <span className="text-sm sm:text-base font-black text-app-primary pt-1">+</span>
                      ) : null}
                    </motion.div>
                  );
                })}
              </div>

              {/* Resumo do Mês */}
              <div className="p-4 sm:p-5 rounded-2xl bg-app-primary text-white shadow-lg shadow-app-primary/20 flex items-start gap-3 sm:gap-3.5">
                <div className="bg-white/20 p-2 sm:p-2.5 rounded-xl backdrop-blur-md shrink-0">
                  <CalendarIcon className="size-4 sm:size-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black">Resumo de {nomeMes}</h3>
                  <p className="text-[11px] sm:text-xs text-white/90 mt-0.5 sm:mt-1 leading-relaxed">
                    Registrou <strong className="text-white">{diasFelizes} dias felizes</strong> este mês. 
                    {registros.length === 0 ? " Comece a registrar para obter análises detalhadas." : " Continue mantendo a regularidade do seu autocuidado!"}
                  </p>
                </div>
              </div>
            </>
          )}
        </motion.div>

      </div>

      {/* Modal de Detalhes do Registro */}
      <AnimatePresence>
        {registroSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setRegistroSelecionado(null)} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-app-card w-full max-w-sm rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl p-5 sm:p-7 border border-app-border z-10 text-app-text"
            >
              <button 
                type="button"
                onClick={() => setRegistroSelecionado(null)}
                className="absolute top-4 right-4 p-2 bg-app-bg text-app-muted rounded-full hover:bg-app-border transition-colors cursor-pointer"
              >
                <X className="size-5" />
              </button>

              <div className="text-center mb-4 sm:mb-5 mt-1">
                <div className="text-5xl sm:text-6xl mb-2 sm:mb-3">{registroSelecionado.emoji}</div>
                <h3 className="text-xl sm:text-2xl font-black text-app-text">{registroSelecionado.humor}</h3>
                <p className="text-xs text-app-muted font-medium mt-0.5 capitalize">
                  {registroSelecionado.dataRegistro.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </p>
              </div>

              <div className="space-y-3 bg-app-bg p-3.5 sm:p-4 rounded-2xl mb-5 sm:mb-6 border border-app-border">
                {registroSelecionado.clima && (
                  <div className="flex items-center gap-2.5 text-xs text-app-text">
                    <Sun className="size-4 text-app-primary" />
                    <span className="font-bold">Clima:</span> {registroSelecionado.clima.condicao}
                  </div>
                )}
                
                {registroSelecionado.fatores && registroSelecionado.fatores.length > 0 && (
                  <div className="flex items-start gap-2.5 text-xs text-app-text">
                    <Tag className="size-4 text-app-primary mt-0.5" />
                    <div>
                      <span className="font-bold">Fatores:</span> 
                      <div className="flex flex-wrap gap-1 mt-1">
                        {registroSelecionado.fatores.map(f => (
                          <span key={f} className="bg-app-card px-2 py-0.5 rounded-md text-[11px] border border-app-border font-medium text-app-text">{f}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {registroSelecionado.nota && (
                  <div className="pt-2 border-t border-app-border">
                    <p className="text-[10px] font-bold text-app-muted uppercase tracking-wider mb-1">Anotações:</p>
                    <p className="text-xs text-app-text italic">"{registroSelecionado.nota}"</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  
                  {verificarSeEhHoje(registroSelecionado.dataRegistro) ? (
                    <button 
                      type="button"
                      onClick={() => navigate("/humor", { state: { registroParaEditar: registroSelecionado } })}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-app-primary text-white font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-md shadow-app-primary/20"
                    >
                      <Edit3 className="size-4" /> Editar
                    </button>
                  ) : (
                    <div className="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-2xl text-app-muted bg-app-bg cursor-not-allowed font-bold text-xs border border-app-border">
                      <Lock className="size-3.5" />
                      Não editável
                    </div>
                  )}
                </div>
                
                {!verificarSeEhHoje(registroSelecionado.dataRegistro) && (
                  <p className="text-[10px] text-center text-app-muted mt-1 uppercase tracking-widest font-bold">
                    Apenas os registros de hoje podem ser alterados.
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