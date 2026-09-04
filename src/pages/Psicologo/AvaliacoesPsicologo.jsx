import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Star, MessageSquareHeart, ThumbsUp, 
  Reply, CornerDownRight, Check, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const avaliacoesMockIniciais = [
  { 
    id: "aval_1", 
    paciente: "Ana Carolina M.", 
    nota: 5, 
    data: "Há 2 dias", 
    texto: "Excelente profissional! As sessões online têm me ajudado muito.",
    resposta: null 
  },
  { 
    id: "aval_2", 
    paciente: "Lucas R.", 
    nota: 5, 
    data: "Semana passada", 
    texto: "Muito atencioso e empático. Recomendo demais!",
    resposta: "Olá Lucas! Fico muito feliz com o seu feedback. Conte comigo!" 
  }
];

export default function AvaliacoesPsicologo() {
  const navigate = useNavigate();
  const [avaliacoes, setAvaliacoes] = useState(avaliacoesMockIniciais);
  const [respondendoId, setRespondendoId] = useState(null);
  const [textoResposta, setTextoResposta] = useState("");

  const handleEnviarResposta = async (idAvaliacao) => {
    if (!textoResposta.trim()) {
      toast.error("A resposta não pode estar vazia.");
      return;
    }

    try {
      /* 
        =========================================================
        🚀 [FUTURO FIREBASE - ATUALIZAR RESPOSTA]
        Descomente abaixo para salvar a resposta diretamente no Firestore:
        =========================================================
        const avaliacaoRef = doc(db, "avaliacoes", idAvaliacao);
        await updateDoc(avaliacaoRef, { 
          resposta: textoResposta, 
          respondidaEm: new Date().toISOString() 
        });
      */

      // Atualização simulada em tempo real (Mock ativo)
      setAvaliacoes(prev => 
        prev.map(aval => aval.id === idAvaliacao ? { ...aval, resposta: textoResposta } : aval)
      );

      toast.success("Resposta enviada com sucesso!");
      setRespondendoId(null);
      setTextoResposta("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar a resposta.");
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffbeb_0%,_#f8fafc_40%,_#ffffff_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/painel-psicologo")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors">
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-amber-50 shadow-xl p-7 md:p-9 text-center">
          <div className="size-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <MessageSquareHeart size={28} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Avaliações dos Pacientes</h1>
          <p className="text-xs text-slate-500 mt-1">Gerencie os depoimentos e interaja com os pacientes.</p>
        </div>

        <div className="space-y-4">
          {avaliacoes.map((aval) => (
             <div key={aval.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                   <h3 className="text-sm font-bold text-slate-800">{aval.paciente}</h3>
                   <div className="flex gap-0.5 text-amber-400">
                      {[...Array(aval.nota)].map((_, i) => <Star key={i} size={12} className="fill-amber-400" />)}
                   </div>
                </div>
                
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-2xl">"{aval.texto}"</p>

                <div className="pt-2">
                  {aval.resposta ? (
                    <div className="ml-4 pl-4 border-l-2 border-blue-100 space-y-1">
                      <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Sua Resposta</span>
                      <p className="text-xs text-slate-500 bg-blue-50/50 p-3 rounded-2xl">{aval.resposta}</p>
                    </div>
                  ) : (
                    <AnimatePresence mode="wait">
                      {respondendoId === aval.id ? (
                        <div className="space-y-3">
                          <textarea 
                            rows="3"
                            placeholder="Escreva sua resposta..."
                            value={textoResposta}
                            onChange={(e) => setTextoResposta(e.target.value)}
                            className="w-full p-4 bg-white border border-blue-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setRespondendoId(null)} className="px-4 py-2 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl flex items-center gap-1"><X size={14} /> Cancelar</button>
                            <button onClick={() => handleEnviarResposta(aval.id)} className="px-4 py-2 text-xs font-bold text-white bg-blue-500 rounded-xl flex items-center gap-1"><Check size={14} /> Enviar</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setRespondendoId(aval.id)} className="flex items-center gap-1.5 text-[11px] font-bold text-blue-500 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors">
                          <Reply size={14} /> Responder
                        </button>
                      )}
                    </AnimatePresence>
                  )}
                </div>
             </div>
          ))}
        </div>

      </div>
    </div>
  );
}