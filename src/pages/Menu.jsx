import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Sparkles, ChevronRight, Activity, TrendingUp, Clock, Settings, Brain, PartyPopper, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoReduzido from "../assets/LogoPessegoReduzido.png";
import BottomNav from "../components/BottomNav";

import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, query, orderBy, limit, onSnapshot, getDocs, getDoc } from "firebase/firestore";
import { gerarInsightDiario } from "../services/aiService";

const LogoPrincipal = () => (
  <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center w-10 h-10">
    <img src={logoReduzido} alt="MindQuest Logo" className="w-full h-full object-contain" />
  </div>
);

export default function Menu() {
  const navigate = useNavigate();
  const location = useLocation();

  // Modais Lógicas
  const [isFormModalOpen, setIsFormModalOpen] = useState(false); // Modal 1: Formulário
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false); // Modal 3: Boas-vindas pós-form
  const [isHumorModalOpen, setIsHumorModalOpen] = useState(false); // Modal 2: Check-in de Humor

  const [loading, setLoading] = useState(true);
  const [ultimoHumor, setUltimoHumor] = useState(null);
  const [userXP, setUserXP] = useState(0);

  // IA
  const [insightIA, setInsightIA] = useState("");
  const [carregandoInsight, setCarregandoInsight] = useState(false);

  const [humorSemanal, setHumorSemanal] = useState([
    { dia: "Dom", nivel: 0 }, { dia: "Seg", nivel: 0 }, { dia: "Ter", nivel: 0 },
    { dia: "Qua", nivel: 0 }, { dia: "Qui", nivel: 0 }, { dia: "Sex", nivel: 0 }, { dia: "Sab", nivel: 0 },
  ]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      let hasCompletedForm = false;

      try {
        if (location.state?.justCompletedForm) {
          setIsWelcomeModalOpen(true);
          setIsFormModalOpen(false);
          hasCompletedForm = true;
          window.history.replaceState({}, document.title);
        } else {
          const formDocRef = doc(db, "usuarios", user.uid, "respostasFormulario", "respostas");
          const formSnap = await getDoc(formDocRef);
          
          if (formSnap.exists()) {
            hasCompletedForm = true;
            setIsFormModalOpen(false);
          } else {
            hasCompletedForm = false;
            setIsFormModalOpen(true); // Exibe o modal do formulário
          }
        }
      } catch (err) {
        console.error("Erro ao checar formulário:", err);
      }

      // --- 2. ESCUTA O XP ---
      const userRef = doc(db, "usuarios", user.uid);
      const unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserXP(docSnap.data().xp || 0);
        }
      });

      // --- 3. ESCUTA O HUMOR (SÓ ABRE SE JÁ RESPONDEU O FORMULÁRIO) ---
      const humorRef = collection(db, "usuarios", user.uid, "registrosHumor");
      const q = query(humorRef, orderBy("data", "desc"), limit(7));

      const unsubHumor = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const registros = snapshot.docs.map(d => d.data());
          const hoje = new Date();
          let jaRegistrouHoje = false;
          let humorDeHojeOuRecente = registros[0];

          for (let reg of registros) {
            if (reg.data) {
              let dataRegistro;
              if (typeof reg.data.toDate === 'function') {
                dataRegistro = reg.data.toDate();
              } else if (reg.data.seconds) {
                dataRegistro = new Date(reg.data.seconds * 1000);
              } else {
                dataRegistro = new Date(reg.data);
              }

              const isHoje = 
                dataRegistro.getDate() === hoje.getDate() && 
                dataRegistro.getMonth() === hoje.getMonth() &&
                dataRegistro.getFullYear() === hoje.getFullYear();

              if (isHoje) {
                jaRegistrouHoje = true;
                humorDeHojeOuRecente = reg;
                break;
              }
            }
          }

          // REGRA DE OURO: Só abre o modal de humor se JÁ RESPONDEU o formulário, NÃO registrou hoje e NÃO veio de justCompletedForm
          if (hasCompletedForm && !jaRegistrouHoje && !location.state?.justCompletedForm) {
            setIsHumorModalOpen(true);
          } else {
            setIsHumorModalOpen(false);
          }

          setUltimoHumor(humorDeHojeOuRecente);

          // Atualiza Gráfico
          const novoGrafico = [
            { dia: "Dom", nivel: 0 }, { dia: "Seg", nivel: 0 }, { dia: "Ter", nivel: 0 },
            { dia: "Qua", nivel: 0 }, { dia: "Qui", nivel: 0 }, { dia: "Sex", nivel: 0 }, { dia: "Sab", nivel: 0 },
          ];

          registros.forEach(reg => {
            if(reg.data) {
              let d;
              if (typeof reg.data.toDate === 'function') d = reg.data.toDate();
              else if (reg.data.seconds) d = new Date(reg.data.seconds * 1000);
              else d = new Date(reg.data);
              
              const diaIndex = d.getDay(); 
              if(reg.nivel > novoGrafico[diaIndex].nivel) {
                novoGrafico[diaIndex].nivel = reg.nivel;
              }
            }
          });
          
          setHumorSemanal(novoGrafico);
        } else {
          // Nenhum humor registrado ainda -> Só abre o modal se JÁ RESPONDEU o formulário!
          if (hasCompletedForm && !location.state?.justCompletedForm) {
            setIsHumorModalOpen(true);
          } else {
            setIsHumorModalOpen(false);
          }
        }
        setLoading(false);
      });

      return () => { unsubUser(); unsubHumor(); };
    });

    return () => unsubscribeAuth();
  }, [navigate, location]);

  // EFEITO DA IA
  useEffect(() => {
    const buscarInsightIA = async () => {
      const isAnyModalActive = isFormModalOpen || isWelcomeModalOpen || isHumorModalOpen;
      
      if (ultimoHumor && !isAnyModalActive && !insightIA) {
        setCarregandoInsight(true);
        try {
          const user = auth.currentUser;
          if (!user) return;

          const subRef = collection(db, "usuarios", user.uid, "respostasFormulario");
          const subSnap = await getDocs(query(subRef, limit(1)));
          
          let respostas = {};
          if (!subSnap.empty) {
            respostas = subSnap.docs[0].data().respostas || {};
          }

          const dadosPerfil = {
            objetivoPrincipal: respostas["0"] || "Bem-estar",
            generoMusical: respostas["2"] || "Música relaxante",
            generoFilme: respostas["3"] || "Filme reconfortante",
            generoLivro: respostas["5"] || "Leitura agradável"
          };

          const mensagem = await gerarInsightDiario(dadosPerfil, ultimoHumor);
          setInsightIA(mensagem);

        } catch (error) {
          console.error("Erro ao processar IA:", error);
          setInsightIA("Que o seu dia seja repleto de paz e equilíbrio. Continue firme na sua jornada! ✨");
        } finally {
          setCarregandoInsight(false);
        }
      }
    };

    buscarInsightIA();
  }, [ultimoHumor, isFormModalOpen, isWelcomeModalOpen, isHumorModalOpen, insightIA]);

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
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FFFBF9]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">
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
                className="h-full bg-peach-400 rounded-full" 
                initial={{ width: 0 }} 
                animate={{ width: `${xpProgresso}%` }} 
              />
            </div>
          </div>

          <button 
            onClick={() => navigate("/perfil")}
            className="bg-white p-2 rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-peach-500 transition-colors"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* DASHBOARD PRINCIPAL */}
      <main className={`pt-24 px-6 space-y-8 transition-all duration-500 ${isAnyModalOpen ? 'blur-[1.5px] opacity-70' : 'blur-0'}`}>
        
        <div className="space-y-1">
          <p className="text-[#E97451] font-bold text-[10px] uppercase tracking-widest">Painel de Evolução</p>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {ultimoHumor && !isAnyModalOpen ? `Você está ${ultimoHumor.humor}` : "Sua Jornada"}
          </h1>
        </div>

        {/* CARD INSIGHT IA */}
        {ultimoHumor && !isAnyModalOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative bg-gradient-to-br from-peach-500/5 via-orange-400/5 to-transparent backdrop-blur-xl p-5 rounded-[2rem] border border-peach-200/40 shadow-[0_8px_30px_rgb(233,116,81,0.06)] overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-10">
              <Brain className="size-24 text-peach-500" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-peach-100 p-1.5 rounded-lg">
                <Sparkles className="size-3.5 text-peach-500" />
              </div>
              <span className="text-[10px] font-bold text-peach-600 uppercase tracking-widest">MindQuest IA</span>
            </div>

            {carregandoInsight ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-3 bg-peach-200/50 rounded-full w-full"></div>
                <div className="h-3 bg-peach-200/50 rounded-full w-5/6"></div>
                <div className="h-3 bg-peach-200/50 rounded-full w-4/6"></div>
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10">
                "{insightIA}"
              </p>
            )}
          </motion.div>
        )}

        {/* GRÁFICO DE HUMOR */}
        <section className="bg-white p-6 rounded-[2.5rem] border border-white shadow-sm space-y-6 text-center">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm">
              <TrendingUp size={16} className="text-peach-500" /> Humor Semanal
            </h3>
          </div>

          <div className="flex items-end justify-between h-32 px-2">
            {humorSemanal.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div className="w-2.5 bg-peach-50 rounded-full relative flex items-end overflow-hidden h-24">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.nivel}%` }}
                    transition={{ duration: 0.8 }}
                    className="w-full rounded-full bg-peach-400"
                  />
                </div>
                <span className={`text-[10px] font-bold ${item.nivel > 0 ? 'text-peach-500' : 'text-slate-300'}`}>{item.dia}</span>
              </div>
            ))}
          </div>
        </section>

        {/* CARDS SECUNDÁRIOS */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-peach-100 p-5 rounded-[2rem] flex flex-col justify-between h-36 relative shadow-md">
            <Activity className="text-peach-200 absolute -right-2 -top-2" size={60} />
            <p className="text-peach-400 text-[10px] font-bold uppercase tracking-wider">Humor Atual</p>
            <p className="text-peach-600 text-4xl font-black">{ultimoHumor ? ultimoHumor.emoji : "--"}</p>
          </div>
          <div className="bg-white p-5 rounded-[2rem] border border-peach-100 shadow-md flex flex-col justify-between h-36">
            <div className="flex justify-between"><Clock className="text-peach-200 size-5" /></div>
            <div>
              <p className="text-peach-400 text-[10px] font-bold uppercase tracking-wider">Meditação</p>
              <p className="text-peach-300 text-3xl font-black">0m</p>
            </div>
          </div>
        </div>
      </main>


      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center border border-white"
            >
              <div className="bg-[#FFF1EB] w-20 h-20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-inner">
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
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>VAMOS LÁ</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: BOAS-VINDAS PÓS-FORMULÁRIO */}
      <AnimatePresence>
        {isWelcomeModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center border border-white"
            >
              <div className="bg-[#FFF1EB] w-20 h-20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-inner">
                <PartyPopper className="text-[#E97451]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4 leading-tight">Tudo pronto! 🎉</h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-10 px-2">
                Aproveite o <strong className="text-[#E97451]">MindQuest</strong> para registrar suas atividades e pensamentos!
              </p>
              <button 
                onClick={() => {
                  setIsWelcomeModalOpen(false);
                  navigate("/humor"); // <--- Redireciona diretamente para a tela de humor!
                }}
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>REGISTRAR MEU HUMOR</span>
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: CHECK-IN DE HUMOR DIÁRIO */}
      <AnimatePresence>
        {isHumorModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" onClick={() => setIsHumorModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center border border-white z-10"
            >
              <button 
                onClick={() => setIsHumorModalOpen(false)}
                className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-colors"
              >
                <X size={18} />
              </button>

              <div className="bg-[#FFF1EB] w-20 h-20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8 border border-orange-100 shadow-inner">
                <Sparkles className="text-[#E97451]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Como você está hoje?</h2>
              <p className="text-slate-500 text-sm mb-10">Registre seu humor e ganhe XP!</p>
              <button 
                onClick={() => {
                  setIsHumorModalOpen(false);
                  navigate("/humor");
                }} 
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl flex justify-center items-center gap-2 active:scale-95 transition-all shadow-lg shadow-orange-500/20"
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