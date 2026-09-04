import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, ChevronRight, Activity, TrendingUp, Clock, 
  Settings, Brain, Award, ShoppingBag, Search, BookOpen, HeartPulse 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";
import BottomNav from "../../components/BottomNav";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { gerarInsightDiario } from "../../services/aiService";

const LogoPrincipal = () => (
  <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center w-10 h-10">
    <img src={logoReduzido} alt="MindQuest Logo" className="w-full h-full object-contain" />
  </div>
);

export default function Menu() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ultimoHumor, setUltimoHumor] = useState(null);
  const [userXP, setUserXP] = useState(0);

  const [insightIA, setInsightIA] = useState("");
  const [carregandoInsight, setCarregandoInsight] = useState(false);

  const [relatorioSemanalIA] = useState(
    "Sua semana teve uma boa variedade! Nos dias em que choveu, você registrou um humor mais introspectivo e caseiro. Nos dias em que fez exercício físico e o clima estava ensolarado, sua energia e nível de humor subiram bastante comparado ao resto da semana."
  );

  const [humorSemanal, setHumorSemanal] = useState([
    { dia: "Dom", nivel: 0 }, { dia: "Seg", nivel: 0 }, { dia: "Ter", nivel: 0 },
    { dia: "Qua", nivel: 0 }, { dia: "Qui", nivel: 0 }, { dia: "Sex", nivel: 0 }, { dia: "Sab", nivel: 0 },
  ]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      const userRef = doc(db, "usuarios", user.uid);
      const unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserXP(docSnap.data().xp || 0);
        }
      });

      const humorRef = collection(db, "usuarios", user.uid, "registrosHumor");
      const q = query(humorRef, orderBy("data", "desc"), limit(7));

      const unsubHumor = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const registros = snapshot.docs.map(d => d.data());
          let humorDeHojeOuRecente = registros[0]; 

          setUltimoHumor(humorDeHojeOuRecente);

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
        }
        setLoading(false);
      });

      return () => { unsubUser(); unsubHumor(); };
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const buscarInsightIA = async () => {
      if (ultimoHumor && !insightIA) {
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
  }, [ultimoHumor, insightIA]);

  const nivelAtual = Math.floor(userXP / 100) + 1;
  const xpProgresso = userXP % 100;

  if (loading) return <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center"><Sparkles className="text-peach-500 animate-spin size-10" /></div>;

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col antialiased text-slate-800 pb-28">
      
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

      <main className="pt-24 px-6 space-y-8 max-w-2xl mx-auto w-full">
        
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[#E97451] font-bold text-[10px] uppercase tracking-widest">Painel de Evolução</p>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {ultimoHumor ? `Você está ${ultimoHumor.humor}` : "Sua Jornada"}
            </h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="text-xs bg-peach-100 text-peach-600 font-bold px-4 py-2.5 rounded-2xl shadow-sm hover:bg-peach-200 transition-all"
          >
            Abrir Check-in
          </button>
        </div>

        {ultimoHumor && (
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
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed font-medium relative z-10">
                "{insightIA}"
              </p>
            )}
          </motion.div>
        )}

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

        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-[2.5rem] border border-peach-100 shadow-sm space-y-3 relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-orange-100 p-2 rounded-xl">
                <Sparkles className="size-4 text-orange-500" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-sm">Relatório Semanal da IA</h3>
            </div>
            <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2.5 py-1 rounded-full border border-orange-100">Exemplo Prévio</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            "{relatorioSemanalIA}"
          </p>
        </motion.section>

        {/* Banner Buscar Profissionais */}
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/BuscarProfissionais")}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#E97451] p-6 rounded-[2.2rem] shadow-lg shadow-orange-500/25 cursor-pointer relative overflow-hidden flex items-center justify-between text-white group"
        >
          <div className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-500">
            <Search size={120} />
          </div>
          
          <div className="relative z-10 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100 block">Rede de Apoio</span>
            <h3 className="text-xl font-black leading-tight">Buscar Profissional<br />e Agendar Sessão</h3>
          </div>
          
          <div className="relative z-10 bg-white/20 p-3 rounded-2xl backdrop-blur-md group-hover:bg-white/30 transition-colors">
            <ChevronRight className="size-6 text-white" />
          </div>
        </motion.div>

        {/* Grid de Ações Rápidas - Todos em Amarelo Pastel bem clarinho */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Humor Atual */}
          <div onClick={() => navigate("/humor")} className="bg-[#FFFDF4] p-5 rounded-[2.2rem] border border-amber-100/90 flex flex-col justify-between h-40 relative shadow-sm hover:border-amber-200 transition-all cursor-pointer overflow-hidden group">
            <Activity className="text-amber-200/50 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" size={70} />
            <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest relative z-10">Humor Atual</span>
            <span className="text-slate-800 text-4xl font-black relative z-10">{ultimoHumor ? ultimoHumor.emoji : "--"}</span>
          </div>

          {/* Meditação */}
          <div onClick={() => navigate("/meditacao")} className="bg-[#FFFDF4] p-5 rounded-[2.2rem] border border-amber-100/90 flex flex-col justify-between h-40 relative shadow-sm hover:border-amber-200 transition-all cursor-pointer overflow-hidden group">
            <Clock className="text-amber-200/50 absolute -right-4 -bottom-4 group-hover:scale-110 transition-transform" size={70} />
            <div className="flex justify-between items-center relative z-10">
              <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest">Meditação</span>
            </div>
            <div className="relative z-10">
              <span className="block text-slate-800 text-2xl font-black leading-none mt-1">0m</span>
              <span className="text-[10px] text-slate-400 font-bold mt-1">Hoje</span>
            </div>
          </div>

          {/* Diário Emocional */}
          <div onClick={() => navigate("/diario")} className="bg-[#FFFDF4] p-5 rounded-[2.2rem] border border-amber-100/90 flex flex-col justify-between h-40 relative shadow-sm hover:border-amber-200 transition-all cursor-pointer overflow-hidden group">
            <BookOpen className="text-amber-200/50 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={70} />
            <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest relative z-10">Reflexão</span>
            <div className="relative z-10">
              <span className="block text-slate-800 text-xl font-black leading-tight">Diário<br/>Emocional</span>
            </div>
          </div>

          {/* SOS / Respiração */}
          <div onClick={() => navigate("/sos")} className="bg-[#FFFDF4] p-5 rounded-[2.2rem] border border-amber-100/90 flex flex-col justify-between h-40 relative shadow-sm hover:border-amber-200 transition-all cursor-pointer overflow-hidden group">
            <HeartPulse className="text-amber-200/50 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={70} />
            <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest relative z-10">Emergência</span>
            <div className="relative z-10">
              <span className="block text-slate-800 text-xl font-black leading-tight">Espaço<br/>SOS / Calma</span>
            </div>
          </div>

          {/* Troféus */}
          <div onClick={() => navigate("/conquistas")} className="bg-[#FFFDF4] p-5 rounded-[2.2rem] border border-amber-100/90 flex flex-col justify-between h-40 relative shadow-sm hover:border-amber-200 transition-all cursor-pointer overflow-hidden group">
            <Award className="text-amber-200/50 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={70} />
            <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest relative z-10">Troféus</span>
            <div className="relative z-10">
              <span className="block text-slate-800 text-xl font-black leading-tight">Ver<br/>Badges</span>
            </div>
          </div>

          {/* Loja Zen */}
          <div onClick={() => navigate("/loja")} className="bg-[#FFFDF4] p-5 rounded-[2.2rem] border border-amber-100/90 flex flex-col justify-between h-40 relative shadow-sm hover:border-amber-200 transition-all cursor-pointer overflow-hidden group">
            <ShoppingBag className="text-amber-200/50 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform" size={70} />
            <span className="text-amber-600 text-[10px] font-bold uppercase tracking-widest relative z-10">Recompensas</span>
            <div className="relative z-10">
              <span className="block text-slate-800 text-xl font-black leading-tight">Loja<br/>Zen</span>
            </div>
          </div>

        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1.5px]" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-white/95 w-full max-w-sm rounded-[3rem] shadow-2xl p-10 text-center border border-white"
            >
              <div className="bg-[#FFF1EB] w-20 h-20 rounded-[2.2rem] flex items-center justify-center mx-auto mb-8">
                <Sparkles className="text-[#E97451]" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-4">Como você está hoje?</h2>
              <p className="text-slate-500 text-sm mb-10">Registre seu humor e ganhe XP!</p>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  navigate("/humor");
                }} 
                className="w-full bg-[#E97451] hover:bg-[#C06043] text-white font-bold py-5 rounded-2xl flex justify-center gap-2 active:scale-95 transition-all"
              >
                REGISTRAR HUMOR <ChevronRight size={18} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}