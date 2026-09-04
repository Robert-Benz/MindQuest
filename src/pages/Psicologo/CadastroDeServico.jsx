import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, BriefcaseMedical, Clock, 
  DollarSign, Save, ChevronRight, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";

/* =========================================================
   COMPONENTE: SELECT PERSONALIZADO (TEMA PRO)
========================================================= */
function CustomSelectPro({ value, onChange, placeholder, options, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-11 pr-4 p-4 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-400"
      >
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />}
        <span className={`text-sm ${selectedOption ? "text-slate-700 font-bold" : "text-slate-400 font-medium"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronRight className={`size-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm rounded-xl transition-colors duration-150 block ${
                  value === opt.value
                    ? "bg-blue-50 text-blue-600 font-bold"
                    : "text-slate-600 font-medium hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   PÁGINA PRINCIPAL DE CADASTRO
========================================================= */
export default function CadastroServico() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);

  const [novoServico, setNovoServico] = useState({ 
    titulo: "", 
    duracao: "", 
    preco: "",
    descricao: "" 
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      setUserUid(user.uid);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!novoServico.titulo || !novoServico.preco || !novoServico.duracao) {
      toast.error("Preencha título, duração e valor do serviço.");
      return;
    }

    try {
      await addDoc(collection(db, "psicologos", userUid, "servicos"), {
        ...novoServico,
        preco: parseFloat(novoServico.preco),
        criadoEm: new Date().toISOString()
      });
      
      toast.success("Serviço cadastrado com sucesso!");
      navigate("/painel-psicologo"); // Volta pro painel automaticamente
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar serviço.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Sparkles className="text-blue-400 size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff_0%,_#f8fafc_38%,_#ffffff_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/painel-psicologo")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors">
            <ArrowLeft size={16} /> Voltar ao Painel
          </button>
        </div>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-white shadow-xl shadow-blue-900/5 p-7 md:p-9 text-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
          
          <div className="relative size-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
            <BriefcaseMedical size={28} />
          </div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Novo Serviço</h1>
          <p className="text-xs text-slate-500 mt-1">Adicione uma nova modalidade de atendimento ao seu catálogo.</p>
        </motion.div>

        {/* FORMULÁRIO */}
        <motion.form 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-50 shadow-sm space-y-5"
        >
          {/* TIPO DE SERVIÇO */}
          <div className="relative z-30">
            <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest mb-1.5 block">Tipo de Consulta/Serviço</label>
            <CustomSelectPro 
              value={novoServico.titulo}
              onChange={(val) => setNovoServico({...novoServico, titulo: val})}
              placeholder="Selecione o serviço..."
              icon={BriefcaseMedical}
              options={[
                { value: "Psicoterapia Individual (Online)", label: "Psicoterapia Individual (Online)" },
                { value: "Psicoterapia Individual (Presencial)", label: "Psicoterapia Individual (Presencial)" },
                { value: "Terapia de Casal", label: "Terapia de Casal" },
                { value: "Terapia Infantil", label: "Terapia Infantil" },
                { value: "Orientação Profissional", label: "Orientação Profissional" },
                { value: "Avaliação Psicológica", label: "Avaliação Psicológica" },
                { value: "Plantão Psicológico", label: "Plantão Psicológico" }
              ]}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4 relative z-20">
            {/* DURAÇÃO */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest mb-1.5 block">Duração</label>
              <CustomSelectPro 
                value={novoServico.duracao}
                onChange={(val) => setNovoServico({...novoServico, duracao: val})}
                placeholder="Tempo"
                icon={Clock}
                options={[
                  { value: "30 min", label: "30 min" },
                  { value: "45 min", label: "45 min" },
                  { value: "50 min", label: "50 min" },
                  { value: "60 min", label: "60 min" },
                  { value: "90 min", label: "90 min" }
                ]}
              />
            </div>
            
            {/* VALOR */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest mb-1.5 block">Valor (R$)</label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input 
                  type="number" 
                  step="0.01"
                  placeholder="Ex: 150.00" 
                  value={novoServico.preco} 
                  onChange={e => setNovoServico({...novoServico, preco: e.target.value})} 
                  className="w-full pl-11 pr-4 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all font-bold text-slate-700 placeholder:font-medium" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* DESCRIÇÃO OPCIONAL */}
          <div className="relative z-10 pt-2">
             <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest mb-1.5 block">Breve Descrição (Opcional)</label>
             <textarea 
               rows="3"
               placeholder="Detalhes sobre como funciona essa sessão..."
               value={novoServico.descricao}
               onChange={e => setNovoServico({...novoServico, descricao: e.target.value})}
               className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium text-slate-700 resize-none"
             />
          </div>

          <button type="submit" className="w-full py-4 mt-4 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2 relative z-10">
            <Save size={18} /> Publicar Serviço
          </button>
        </motion.form>

      </div>
    </div>
  );
}