import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, ChevronRight, TrendingUp, 
  Settings, Award, ShoppingBag, BarChart3, 
  PartyPopper, X, Brain 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";
import BottomNav from "../../components/BottomNav";

import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { 
  doc, collection, query, orderBy, 
  onSnapshot, getDocs, getDoc, where 
} from "firebase/firestore";
import { gerarInsightDiario } from "../../services/aiService";
import { analiseSemanal } from "../../services/analiseHumorService";

// Helper para obter variáveis do tema com fallback no Pêssego clássico (#E97451)
const getThemeColor = (varName, fallbackHex) => `var(${varName}, ${fallbackHex})`;

const LogoPrincipal = () => (
  <div 
    style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.2)') }}
    className="bg-white/80 p-1 rounded-2xl border shadow-xs flex items-center justify-center w-11 h-11"
  >
    <img src={logoReduzido} alt="MindQuest Logo" className="w-full h-full object-contain" />
  </div>
);

const getIndiceSegundaFeira = (date) => {
  const day = date.getDay();
  return day === 0 ? 6 : day - 1;
};

const getInicioDaSemanaAtual = () => {
  const agora = new Date();
  const diaSemana = agora.getDay();
  const diasParaSubtrair = diaSemana === 0 ? 6 : diaSemana - 1;
  
  const segunda = new Date(agora);
  segunda.setDate(agora.getDate() - diasParaSubtrair);
  segunda.setHours(0, 0, 0, 0);
  
  return segunda;
};

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isHumorModalOpen, setIsHumorModalOpen] = useState(false);
  const [avisoNovaAnalise, setAvisoNovaAnalise] = useState(null);

  const [loading, setLoading] = useState(true);
  const [ultimoHumor, setUltimoHumor] = useState(null);
  const [registrouHoje, setRegistrouHoje] = useState(false);
  const [userXP, setUserXP] = useState(0);

  const [insightIA, setInsightIA] = useState("");
  const [carregandoInsight, setCarregandoInsight] = useState(false);

  const [humorSemanal, setHumorSemanal] = useState([
    { dia: "Seg", nivel: 0, cor: "bg-slate-200" },
    { dia: "Ter", nivel: 0, cor: "bg-slate-200" },
    { dia: "Qua", nivel: 0, cor: "bg-slate-200" },
    { dia: "Qui", nivel: 0, cor: "bg-slate-200" },
    { dia: "Sex", nivel: 0, cor: "bg-slate-200" },
    { dia: "Sab", nivel: 0, cor: "bg-slate-200" },
    { dia: "Dom", nivel: 0, cor: "bg-slate-200" },
  ]);

  const obterCorHumor = (humorNome) => {
    switch (humorNome) {
      case "Raiva":
        return "bg-rose-500";
      case "Ansioso":
        return "bg-purple-500";
      case "Triste":
        return "bg-sky-400";
      case "Neutro":
        return "bg-amber-300";
      case "Feliz":
        return "bg-amber-500";
      default:
        return "bg-[#E97451]";
    }
  };

  useEffect(() => {
    let unsubUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        await user.getIdToken();
        analiseSemanal(user.uid).then((resultado) => {
          if (resultado?.gerouNova && resultado?.analise) {
            setAvisoNovaAnalise(resultado.analise);
          }
        });
      } catch (authErr) {
        console.warn("Aguardando confirmação de sessão...", authErr);
      }

      try {
        let hasCompletedForm = false;
        if (location.state?.justCompletedForm) {
          setIsWelcomeModalOpen(true);
          setIsFormModalOpen(false);
          hasCompletedForm = true;
          window.history.replaceState({}, document.title);
        } else {
          const formDocRef = doc(db, "usuarios", user.uid, "respostasFormulario", "respostas");
          const formSnap = await getDoc(formDocRef);
          hasCompletedForm = formSnap.exists();
          setIsFormModalOpen(!hasCompletedForm);
        }

        const userRef = doc(db, "usuarios", user.uid);
        unsubUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserXP(data.xp || 0);

            // Carrega e aplica o tema guardado no perfil do utilizador (se existir)
            if (data.temaEquipado) {
              const root = document.documentElement;
              if (data.temaEquipado === "lavanda") {
                root.style.setProperty('--primary', '#9333EA');
                root.style.setProperty('--primary-light', 'rgba(147, 51, 234, 0.15)');
              } else if (data.temaEquipado === "pessego") {
                root.style.setProperty('--primary', '#E97451');
                root.style.setProperty('--primary-light', 'rgba(233, 116, 81, 0.15)');
              }
            }
          }
        });

        const humorRef = collection(db, "usuarios", user.uid, "registrosHumor");
        const inicioSemana = getInicioDaSemanaAtual();

        const q = query(
          humorRef, 
          where("data", ">=", inicioSemana),
          orderBy("data", "desc")
        );
        const humorSnapshot = await getDocs(q);

        let humorDeHoje = null;
        let jaRegistrouHoje = false;

        const hoje = new Date();
        const diaHoje = hoje.getDate();
        const mesHoje = hoje.getMonth();
        const anoHoje = hoje.getFullYear();

        const novoGrafico = [
          { dia: "Seg", nivel: 0, cor: "bg-slate-100" },
          { dia: "Ter", nivel: 0, cor: "bg-slate-100" },
          { dia: "Qua", nivel: 0, cor: "bg-slate-100" },
          { dia: "Qui", nivel: 0, cor: "bg-slate-100" },
          { dia: "Sex", nivel: 0, cor: "bg-slate-100" },
          { dia: "Sab", nivel: 0, cor: "bg-slate-100" },
          { dia: "Dom", nivel: 0, cor: "bg-slate-100" },
        ];

        if (!humorSnapshot.empty) {
          const registros = humorSnapshot.docs.map(d => ({ ...d.data(), docId: d.id }));

          registros.forEach(reg => {
            if (reg.data) {
              const d = typeof reg.data.toDate === "function" 
                ? reg.data.toDate() 
                : reg.data.seconds 
                  ? new Date(reg.data.seconds * 1000) 
                  : new Date(reg.data);

              if (d >= inicioSemana) {
                const diaIndex = getIndiceSegundaFeira(d);

                if (reg.nivel > novoGrafico[diaIndex].nivel) {
                  novoGrafico[diaIndex].nivel = reg.nivel;
                  novoGrafico[diaIndex].cor = obterCorHumor(reg.humor);
                }

                if (
                  d.getDate() === diaHoje &&
                  d.getMonth() === mesHoje &&
                  d.getFullYear() === anoHoje &&
                  !humorDeHoje
                ) {
                  jaRegistrouHoje = true;
                  humorDeHoje = reg;
                }
              }
            }
          });
        }

        setHumorSemanal(novoGrafico);
        setUltimoHumor(humorDeHoje);
        setRegistrouHoje(jaRegistrouHoje);

        if (hasCompletedForm && !jaRegistrouHoje && !location.state?.justCompletedForm) {
          setIsHumorModalOpen(true);
        } else {
          setIsHumorModalOpen(false);
        }

        if (humorDeHoje && jaRegistrouHoje) {
          const formDocRef = doc(db, "usuarios", user.uid, "respostasFormulario", "respostas");
          const formSnap = await getDoc(formDocRef);
          const respostas = formSnap.exists() ? (formSnap.data().respostas || {}) : {};

          const ativRef = collection(db, "usuarios", user.uid, "atividadesRealizadas");
          const ativSnap = await getDocs(ativRef);
          const totalAtivHoje = ativSnap.docs.filter(d => {
            const dataAtiv = d.data().data?.toDate?.() || new Date(d.data().data);
            return dataAtiv.getDate() === diaHoje && 
                   dataAtiv.getMonth() === mesHoje && 
                   dataAtiv.getFullYear() === anoHoje;
          }).length;

          setCarregandoInsight(true);

          let ignorar = false;

          gerarInsightDiario(respostas, humorDeHoje, totalAtivHoje)
            .then((res) => {
              if (!ignorar) setInsightIA(res);
            })
            .catch((erroIA) => {
              if (!ignorar) {
                console.error("Erro na API da IA:", erroIA);
                setInsightIA("Que o seu dia encontre momentos de calma e clareza. Siga em frente no seu próprio ritmo! ✨");
              }
            })
            .finally(() => {
              if (!ignorar) setCarregandoInsight(false);
            });

          return () => {
            ignorar = true;
          };
        } else {
          setInsightIA("");
        }

      } catch (error) {
        console.error("Erro ao carregar dados do Menu:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubUser();
      unsubscribeAuth();
    };
  }, [navigate, location]);

  const nivelAtual = Math.floor(userXP / 100) + 1;
  const xpProgresso = userXP % 100;
  const isAnyModalOpen = isFormModalOpen || isWelcomeModalOpen || isHumorModalOpen;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} className="animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col antialiased text-slate-700 pb-28">
      
      {/* HEADER */}
      <header 
        style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') }}
        className="fixed top-0 left-0 right-0 z-40 bg-[#FFFBF9]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b"
      >
        <div className="flex items-center gap-3">
          <LogoPrincipal />
          <div>
            <p style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] uppercase tracking-widest font-bold leading-none mb-1">
              MindQuest
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div 
              style={{ 
                backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)'),
                borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.2)') 
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border shadow-xs"
            >
              <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} className="size-3.5" />
              <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-xs font-black">Nível {nivelAtual}</span>
            </div>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <motion.div 
                style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                className="h-full rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${xpProgresso}%` }} 
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={() => navigate("/perfil")}
            style={{ 
              color: getThemeColor('--primary', '#E97451'),
              borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.2)')
            }}
            className="bg-white p-2.5 rounded-2xl shadow-xs border hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* DASHBOARD PRINCIPAL */}
      <main className={`pt-24 px-6 space-y-6 max-w-2xl mx-auto w-full transition-all duration-500 ${isAnyModalOpen ? "blur-[1.5px] opacity-70" : "blur-0"}`}>
        
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p style={{ color: getThemeColor('--primary', '#E97451') }} className="font-bold text-[10px] uppercase tracking-widest">
              Painel de Evolução
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              {registrouHoje && ultimoHumor ? `Você está ${ultimoHumor.humor}` : "Sua Jornada"}
            </h1>
          </div>
          <button 
            type="button"
            onClick={() => {
              if (registrouHoje && ultimoHumor) {
                navigate("/humor", { state: { registroParaEditar: ultimoHumor, origem: "/menu" } });
              } else {
                setIsHumorModalOpen(true);
              }
            }}
            style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
            className="text-sm text-white font-bold px-6 py-3.5 rounded-2xl shadow-md hover:brightness-105 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            {registrouHoje ? "Editar Sentir" : "Check-in Diário"}
          </button>
        </div>

        {/* CARD INSIGHT DIÁRIO */}
        {registrouHoje && ultimoHumor && !isAnyModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.3)') }}
            className="relative bg-gradient-to-br from-white via-orange-50/20 to-white backdrop-blur-xl p-5 rounded-3xl border shadow-sm overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-10">
              <Brain style={{ color: getThemeColor('--primary', '#E97451') }} className="size-24" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') }} className="p-1.5 rounded-lg">
                <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} className="size-3.5" />
              </div>
              <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-widest">MindQuest IA</span>
            </div>

            {carregandoInsight ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-slate-200 rounded-full w-full"></div>
                <div className="h-3 bg-slate-200 rounded-full w-5/6"></div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed font-semibold text-slate-700 relative z-10">
                {insightIA || "Que seu dia seja repleto de tranquilidade e foco em suas conquistas! ✨"}
              </p>
            )}
          </motion.div>
        )}

        {/* GRÁFICO SEMANAL */}
        <section 
          style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border shadow-xs space-y-6 text-center"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-sm text-slate-800">
              <TrendingUp size={16} style={{ color: getThemeColor('--primary', '#E97451') }} /> Humor Semanal
            </h3>
          </div>

          <div className="flex items-end justify-between h-32 px-2">
            {humorSemanal.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div className="w-2.5 bg-slate-100 rounded-full relative flex items-end overflow-hidden h-24">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.nivel}%` }}
                    transition={{ duration: 0.8 }}
                    className={`w-full rounded-full ${item.cor}`}
                  />
                </div>
                <span className={`text-[10px] font-bold ${item.nivel > 0 ? "text-slate-700" : "text-slate-400"}`}>
                  {item.dia}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* BANNER PRINCIPAL DE ATIVIDADES */}
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/atividades")}
          style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
          className="p-6 rounded-3xl shadow-lg cursor-pointer relative overflow-hidden flex items-center justify-between text-white group"
        >
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Sparkles size={130} />
          </div>
          
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-90 flex items-center gap-1.5 text-white">
              <Sparkles className="size-3" /> Plano de Bem-Estar
            </span>
            <h3 className="text-xl font-black leading-tight text-white">
              Atividades Personalizadas<br />para o seu Momento
            </h3>
          </div>
          
          <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:bg-white/30 transition-colors">
            <ChevronRight className="size-6 text-white" />
          </div>
        </motion.div>

        {/* LISTA DE AÇÕES RÁPIDAS */}
        <div className="space-y-4">
          
          {/* Análises de Humor */}
          <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/analiseHumor")}
            style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') }}
            className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border flex items-center justify-between relative shadow-xs transition-all cursor-pointer overflow-hidden group"
          >
            <BarChart3 style={{ color: getThemeColor('--primary', '#E97451'), opacity: 0.15 }} className="absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={64} />
            <div className="relative z-10 space-y-0.5">
              <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-widest block">Estatísticas</span>
              <span className="text-slate-800 text-lg font-black block leading-tight">Análises de Humor</span>
            </div>
            <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)'), color: getThemeColor('--primary', '#E97451') }} className="relative z-10 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
              <ChevronRight size={18} />
            </div>
          </motion.div>

          {/* Troféus */}
          <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/conquistas")} 
            style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') }}
            className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border flex items-center justify-between relative shadow-xs transition-all cursor-pointer overflow-hidden group"
          >
            <Award style={{ color: getThemeColor('--primary', '#E97451'), opacity: 0.15 }} className="absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={64} />
            <div className="relative z-10 space-y-0.5">
              <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-widest block">Troféus</span>
              <span className="text-slate-800 text-lg font-black block leading-tight">Ver Badges</span>
            </div>
            <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)'), color: getThemeColor('--primary', '#E97451') }} className="relative z-10 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
              <ChevronRight size={18} />
            </div>
          </motion.div>

          {/* Loja Zen */}
          <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/loja")} 
            style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') }}
            className="bg-white/80 backdrop-blur-sm p-5 rounded-3xl border flex items-center justify-between relative shadow-xs transition-all cursor-pointer overflow-hidden group"
          >
            <ShoppingBag style={{ color: getThemeColor('--primary', '#E97451'), opacity: 0.15 }} className="absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={64} />
            <div className="relative z-10 space-y-0.5">
              <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-widest block">Recompensas</span>
              <span className="text-slate-800 text-lg font-black block leading-tight">Loja Zen</span>
            </div>
            <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)'), color: getThemeColor('--primary', '#E97451') }} className="relative z-10 p-2.5 rounded-2xl group-hover:translate-x-1 transition-transform">
              <ChevronRight size={18} />
            </div>
          </motion.div>

        </div>
      </main>

      {/* MODAIS */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center border border-slate-100"
            >
              <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)') }} className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} size={36} />
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight text-slate-800">Personalize sua Jornada</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
                Para que o MindQuest ofereça a melhor experiência, precisamos te conhecer um pouco melhor.
              </p>
              <button 
                onClick={() => {
                  setIsFormModalOpen(false);
                  navigate("/formulario");
                }}
                style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                className="w-full text-white font-bold py-4 rounded-2xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>VAMOS LÁ</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isWelcomeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center border border-slate-100"
            >
              <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)') }} className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <PartyPopper style={{ color: getThemeColor('--primary', '#E97451') }} size={36} />
              </div>
              <h2 className="text-2xl font-black mb-3 leading-tight text-slate-800">Tudo pronto! 🎉</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 px-2">
                Aproveite o <strong style={{ color: getThemeColor('--primary', '#E97451') }}>MindQuest</strong> para registrar suas atividades e pensamentos!
              </p>
              <button 
                onClick={() => {
                  setIsWelcomeModalOpen(false);
                  navigate("/humor");
                }}
                style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                className="w-full text-white font-bold py-4 rounded-2xl shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>REGISTRAR MEU HUMOR</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isHumorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[1.5px]" onClick={() => setIsHumorModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center border border-slate-100 z-10"
            >
              <button 
                onClick={() => setIsHumorModalOpen(false)}
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 text-slate-400 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)') }} className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} size={36} />
              </div>
              <h2 className="text-2xl font-black mb-2 text-slate-800">Como você está hoje?</h2>
              <p className="text-slate-500 text-sm mb-8">Registre seu humor e ganhe XP!</p>
              <button 
                onClick={() => {
                  setIsHumorModalOpen(false);
                  navigate("/humor");
                }} 
                style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                className="w-full text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                <span>REGISTRAR HUMOR</span>
                <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {avisoNovaAnalise && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <button
                type="button"
                onClick={() => setAvisoNovaAnalise(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:bg-slate-50 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)') }} className="size-14 mx-auto rounded-2xl flex items-center justify-center text-3xl select-none">
                {avisoNovaAnalise.emojiPredominante || "✨"}
              </div>

              <div className="space-y-1">
                <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-black uppercase tracking-wider">Novo Relatório</span>
                <h3 className="text-lg font-black leading-tight text-slate-800">Análise Emocional Pronta!</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  A IA avaliou os seus registros do dia anterior. Deseja ver os seus insights agora?
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAvisoNovaAnalise(null)}
                  className="flex-1 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Depois
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAvisoNovaAnalise(null);
                    navigate("/analiseHumor");
                  }}
                  style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                  className="flex-1 py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Ver Análise
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}