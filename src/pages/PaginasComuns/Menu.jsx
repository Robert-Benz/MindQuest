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
  doc, collection, query, orderBy, limit, 
  onSnapshot, getDocs, getDoc 
} from "firebase/firestore";
import { gerarInsightDiario } from "../../services/aiService";

const LogoPrincipal = () => (
  <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center w-10 h-10">
    <img src={logoReduzido} alt="MindQuest Logo" className="w-full h-full object-contain" />
  </div>
);

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  // Modais de Controle
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  const [isHumorModalOpen, setIsHumorModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [ultimoHumor, setUltimoHumor] = useState(null);
  const [registrouHoje, setRegistrouHoje] = useState(false);
  const [userXP, setUserXP] = useState(0);

  // IA - Insight Diário
  const [insightIA, setInsightIA] = useState("");
  const [carregandoInsight, setCarregandoInsight] = useState(false);

  const [humorSemanal, setHumorSemanal] = useState([
    { dia: "Dom", nivel: 0, cor: "bg-slate-200" },
    { dia: "Seg", nivel: 0, cor: "bg-slate-200" },
    { dia: "Ter", nivel: 0, cor: "bg-slate-200" },
    { dia: "Qua", nivel: 0, cor: "bg-slate-200" },
    { dia: "Qui", nivel: 0, cor: "bg-slate-200" },
    { dia: "Sex", nivel: 0, cor: "bg-slate-200" },
    { dia: "Sab", nivel: 0, cor: "bg-slate-200" },
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
        return "bg-slate-400";
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
            setUserXP(docSnap.data().xp || 0);
          }
        });

        const humorRef = collection(db, "usuarios", user.uid, "registrosHumor");
        const q = query(humorRef, orderBy("data", "desc"), limit(7));
        const humorSnapshot = await getDocs(q);

        let humorDeHoje = null;
        let jaRegistrouHoje = false;

        const hoje = new Date();
        const diaHoje = hoje.getDate();
        const mesHoje = hoje.getMonth();
        const anoHoje = hoje.getFullYear();

        const novoGrafico = [
          { dia: "Dom", nivel: 0, cor: "bg-slate-200" },
          { dia: "Seg", nivel: 0, cor: "bg-slate-200" },
          { dia: "Ter", nivel: 0, cor: "bg-slate-200" },
          { dia: "Qua", nivel: 0, cor: "bg-slate-200" },
          { dia: "Qui", nivel: 0, cor: "bg-slate-200" },
          { dia: "Sex", nivel: 0, cor: "bg-slate-200" },
          { dia: "Sab", nivel: 0, cor: "bg-slate-200" },
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

              const diaIndex = d.getDay();
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
        <Sparkles className="text-[#E97451] animate-spin size-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col antialiased text-slate-800 pb-28">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FFFBF9]/85 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
          <LogoPrincipal />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#E97451] font-bold leading-none mb-1">MindQuest</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
              <Sparkles className="size-3 text-orange-400" />
              <span className="text-xs font-black text-orange-500">Nível {nivelAtual}</span>
            </div>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
              <motion.div 
                className="h-full bg-orange-400 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${xpProgresso}%` }} 
              />
            </div>
          </div>

          <button 
            type="button"
            onClick={() => navigate("/perfil")}
            className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-[#E97451] transition-colors cursor-pointer"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* DASHBOARD PRINCIPAL */}
      <main className={`pt-24 px-6 space-y-6 max-w-2xl mx-auto w-full transition-all duration-500 ${isAnyModalOpen ? "blur-[1.5px] opacity-70" : "blur-0"}`}>
        
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[#E97451] font-bold text-[10px] uppercase tracking-widest">Painel de Evolução</p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
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
            className="text-sm bg-orange-50 hover:bg-orange-100 text-[#E97451] font-bold px-5 py-3 rounded-2xl border border-orange-200/80 shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-2"
          >
            {registrouHoje ? "Editar Sentir" : "Check-in Diário"}
          </button>
        </div>

        {/* CARD INSIGHT DIÁRIO */}
        {registrouHoje && ultimoHumor && !isAnyModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-peach-500/5 via-orange-400/5 to-transparent backdrop-blur-xl p-5 rounded-2xl border border-peach-200/40 shadow-[0_8px_30px_rgb(233,116,81,0.06)] overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-10">
              <Brain className="size-24 text-[#E97451]" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-orange-100 p-1.5 rounded-lg">
                <Sparkles className="size-3.5 text-[#E97451]" />
              </div>
              <span className="text-[10px] font-bold text-[#E97451] uppercase tracking-widest">MindQuest IA</span>
            </div>

            {carregandoInsight ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-peach-200/50 rounded-full w-full"></div>
                <div className="h-3 bg-peach-200/50 rounded-full w-5/6"></div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10">
                {insightIA || "Que seu dia seja repleto de tranquilidade e foco em suas conquistas! ✨"}
              </p>
            )}
          </motion.div>
        )}

        {/* GRÁFICO SEMANAL COM CORES DINÂMICAS */}
        <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-center">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-[#E97451]" /> Humor Semanal
            </h3>
          </div>

          <div className="flex items-end justify-between h-32 px-2">
            {humorSemanal.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div className="w-2.5 bg-orange-50 rounded-full relative flex items-end overflow-hidden h-24">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.nivel}%` }}
                    transition={{ duration: 0.8 }}
                    className={`w-full rounded-full ${item.cor}`}
                  />
                </div>
                <span className={`text-[10px] font-bold ${item.nivel > 0 ? "text-slate-700" : "text-slate-300"}`}>
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
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#E97451] p-6 rounded-2xl shadow-lg shadow-orange-500/25 cursor-pointer relative overflow-hidden flex items-center justify-between text-white group"
        >
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
            <Sparkles size={130} />
          </div>
          
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100 flex items-center gap-1.5">
              <Sparkles className="size-3" /> Plano de Bem-Estar
            </span>
            <h3 className="text-xl font-black leading-tight">
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
            className="bg-[#FFFDF4] p-5 rounded-2xl border border-amber-100/90 flex items-center justify-between relative shadow-sm hover:border-amber-200 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
          >
            <BarChart3 className="text-amber-200/40 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={64} />
            <div className="relative z-10 space-y-0.5">
              <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest block">Estatísticas</span>
              <span className="text-slate-800 text-lg font-black block leading-tight">Análises de Humor</span>
            </div>
            <div className="relative z-10 bg-amber-100/50 p-2 rounded-xl text-amber-600 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={20} />
            </div>
          </motion.div>

          {/* Troféus */}
          <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/conquistas")} 
            className="bg-[#FFFDF4] p-5 rounded-2xl border border-amber-100/90 flex items-center justify-between relative shadow-sm hover:border-amber-200 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
          >
            <Award className="text-amber-200/40 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={64} />
            <div className="relative z-10 space-y-0.5">
              <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest block">Troféus</span>
              <span className="text-slate-800 text-lg font-black block leading-tight">Ver Badges</span>
            </div>
            <div className="relative z-10 bg-amber-100/50 p-2 rounded-xl text-amber-600 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={20} />
            </div>
          </motion.div>

          {/* Loja Zen */}
          <motion.div 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/loja")} 
            className="bg-[#FFFDF4] p-5 rounded-2xl border border-amber-100/90 flex items-center justify-between relative shadow-sm hover:border-amber-200 hover:shadow-md transition-all cursor-pointer overflow-hidden group"
          >
            <ShoppingBag className="text-amber-200/40 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={64} />
            <div className="relative z-10 space-y-0.5">
              <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest block">Recompensas</span>
              <span className="text-slate-800 text-lg font-black block leading-tight">Loja Zen</span>
            </div>
            <div className="relative z-10 bg-amber-100/50 p-2 rounded-xl text-amber-600 group-hover:translate-x-1 transition-transform">
              <ChevronRight size={20} />
            </div>
          </motion.div>

        </div>
      </main>

      {/* MODAL: FORMULÁRIO OBRIGATÓRIO */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-2xl shadow-2xl p-10 text-center border border-white"
            >
              <div className="bg-[#FFF1EB] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-inner">
                <Sparkles className="text-[#E97451]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight">Personalize sua Jornada</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 px-2">
                Para que o MindQuest ofereça a melhor experiência, precisamos te conhecer um pouco melhor.
              </p>
              <button 
                onClick={() => {
                  setIsFormModalOpen(false);
                  navigate("/formulario");
                }}
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>VAMOS LÁ</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: BOAS-VINDAS PÓS-FORMULÁRIO */}
      <AnimatePresence>
        {isWelcomeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-2xl shadow-2xl p-10 text-center border border-white"
            >
              <div className="bg-[#FFF1EB] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-inner">
                <PartyPopper className="text-[#E97451]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight">Tudo pronto! 🎉</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 px-2">
                Aproveite o <strong className="text-[#E97451]">MindQuest</strong> para registrar suas atividades e pensamentos!
              </p>
              <button 
                onClick={() => {
                  setIsWelcomeModalOpen(false);
                  navigate("/humor");
                }}
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>REGISTRAR MEU HUMOR</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: CHECK-IN DE HUMOR DIÁRIO */}
      <AnimatePresence>
        {isHumorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" onClick={() => setIsHumorModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-2xl shadow-2xl p-10 text-center border border-white z-10"
            >
              <button 
                onClick={() => setIsHumorModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="bg-[#FFF1EB] w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-inner">
                <Sparkles className="text-[#E97451]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Como você está hoje?</h2>
              <p className="text-slate-500 text-sm mb-10">Registre seu humor e ganhe XP!</p>
              <button 
                onClick={() => {
                  setIsHumorModalOpen(false);
                  navigate("/humor");
                }} 
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                <span>REGISTRAR HUMOR</span>
                <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}