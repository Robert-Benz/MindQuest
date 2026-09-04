import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { 
  ArrowLeft, Calendar, Clock, Activity, 
  ShieldCheck, HeartPulse, FileText, Sparkles 
} from "lucide-react";
import { motion } from "framer-motion";

//[FUTURO FIREBASE] Importações prontas para o backend:
// import { db } from "../firebaseConfig";
// import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const historicoPacienteMock = {
  nome: "Ana Carolina M.",
  status: "Atenção",
  crpPaciente: "ID: pac_ana_992",
  registros: [
    { 
      id: "reg_1", 
      data: "Hoje, 09:30", 
      humor: "😔", 
      nivel: 2, 
      sentimento: "Tristeza / Ansiedade", 
      nota: "Relatou dificuldade para dormir e pensar excessivo sobre o trabalho." 
    },
    { 
      id: "reg_2", 
      data: "Ontem, 20:15", 
      humor: "😐", 
      nivel: 5, 
      sentimento: "Neutro / Cansado", 
      nota: "Conseguiu realizar as atividades básicas, mas sentiu muita fadiga no final do dia." 
    },
    { 
      id: "reg_3", 
      data: "Há 3 dias", 
      humor: "😊", 
      nivel: 8, 
      sentimento: "Produtivo / Calmo", 
      nota: "Passou o dia com a família e relatou melhora significativa no ânimo." 
    }
  ]
};

export default function HistoricoPaciente() {
  const navigate = useNavigate();
  // Caso queira usar rotas dinâmicas com ID (ex: /HistoricoPaciente/:id)
  // const { id } = useParams();

  // Estado que hoje recebe o Mock, mas receberá os dados reais do Firestore
  const [paciente, setPaciente] = useState(historicoPacienteMock);
  const [loading, setLoading] = useState(false); // Mude para true quando ativar o Firebase

  /* 
    [FUTURO FIREBASE - BUSCAR DADOS REAIS DO PACIENTE]
    Descomente o useEffect abaixo quando for buscar do Firestore:

    useEffect(() => {
      const carregarHistoricoFirebase = async () => {
        try {
          setLoading(true);
          // Exemplo de busca no Firestore:
          // const docRef = doc(db, "pacientes", id || "usuario_exemplo_id");
          // const docSnap = await getDoc(docRef);
          // if (docSnap.exists()) {
          //   setPaciente(docSnap.data());
          // }
        } catch (error) {
          console.error("Erro ao carregar histórico:", error);
        } finally {
          setLoading(false);
        }
      };
      carregarHistoricoFirebase();
    }, []);
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Sparkles className="text-blue-400 size-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff_0%,_#f8fafc_38%,_#ffffff_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO / VOLTAR */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/painel-psicologo")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Sigilo Profissional</span>
          </div>
        </div>

        {/* HEADER DO PACIENTE */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-blue-900/5 p-7 md:p-9 text-center"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
          
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center text-3xl shadow-inner">
            <span>👩‍🰰</span>
          </div>

          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1">Prontuário de Acompanhamento</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{paciente.nome}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Acompanhamento contínuo de humor e check-ins diários.</p>
        </motion.div>

        {/* LINHA DO TEMPO DOS REGISTROS */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 pt-2"
        >
          <div className="flex items-center gap-2 px-1">
             <Activity size={16} className="text-slate-400" />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Histórico de Check-ins</span>
          </div>

          {paciente.registros && paciente.registros.map((reg, index) => (
             <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                key={reg.id || index} 
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 hover:border-blue-100 transition-all"
             >
                <div className="flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <div className="size-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-inner">
                         {reg.humor}
                      </div>
                      <div>
                         <h3 className="text-sm font-bold text-slate-800">{reg.sentimento}</h3>
                         <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock size={10} /> {reg.data}
                         </p>
                      </div>
                   </div>
                   
                   <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-bold text-slate-600">
                      Nível: {reg.nivel}/10
                   </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 flex items-start gap-2.5">
                   <FileText size={16} className="text-blue-400 shrink-0 mt-0.5" />
                   <p className="text-xs font-medium text-slate-600 leading-relaxed">
                      "{reg.nota}"
                   </p>
                </div>
             </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
}