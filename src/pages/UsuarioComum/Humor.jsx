import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, ArrowRight, MessageCircle, Tag, CloudRain, Sun, Cloud } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { collection, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { toast } from "sonner";

export default function Humor() {
  const navigate = useNavigate();
  const location = useLocation();

  // Dados recebidos do Calendário (se for edição)
  const registroParaEditar = location.state?.registroParaEditar || null;

  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedClima, setSelectedClima] = useState(null); 
  const [note, setNote] = useState("");
  const [selectedFactors, setSelectedFactors] = useState([]);

  const moods = [
    { emoji: "😡", label: "Raiva", color: "text-rose-500", question: "O que te tirou do sério hoje?", nivel: 10 },
    { emoji: "😰", label: "Ansioso", color: "text-amber-500", question: "O que está gerando essa ansiedade?", nivel: 25 },
    { emoji: "😢", label: "Triste", color: "text-sky-400", question: "Sinto muito... quer contar o que houve?", nivel: 40 },
    { emoji: "😐", label: "Neutro", color: "text-gray-400", question: "Um dia comum? O que aconteceu?", nivel: 60 },
    { emoji: "😊", label: "Feliz", color: "text-peach-500", question: "Que bom! O que trouxe esse sorriso?", nivel: 90 },
  ];

  const climas = [
    { id: "ensolarado", label: "Ensolarado", icon: Sun, cor: "text-yellow-500" },
    { id: "nublado", label: "Nublado", icon: Cloud, cor: "text-gray-400" },
    { id: "chuvoso", label: "Chuvoso", icon: CloudRain, cor: "text-sky-400" }
  ];

  const fatores = [
    "Família",
    "Trabalho",
    "Saúde",
    "Relacionamento",
    "Estudos",
    "Finanças",
    "Lazer",
    "Sono",
    "Clima"
  ];

  // =========================================================================
  // CARREGAR INFORMAÇÕES DO REGISTRO RECEBIDO DO CALENDÁRIO
  // =========================================================================
  useEffect(() => {
    if (registroParaEditar) {
      // 1. Encontrar o índice do humor correto pelo emoji ou label
      const moodIndex = moods.findIndex(
        (m) => m.label === registroParaEditar.humor || m.emoji === registroParaEditar.emoji
      );
      if (moodIndex !== -1) {
        setSelectedMood(moodIndex);
      }

      // 2. Encontrar o clima
      if (registroParaEditar.clima?.condicao) {
        const climaIndex = climas.findIndex(
          (c) => c.label.toLowerCase() === registroParaEditar.clima.condicao.toLowerCase()
        );
        if (climaIndex !== -1) {
          setSelectedClima(climaIndex);
        }
      }

      // 3. Carregar notas e fatores
      if (registroParaEditar.nota) {
        setNote(registroParaEditar.nota);
      }

      if (registroParaEditar.fatores && Array.isArray(registroParaEditar.fatores)) {
        setSelectedFactors(registroParaEditar.fatores);
      }
    }
  }, [registroParaEditar]);

  const toggleFactor = (factor) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const handleSave = async () => {
    if (selectedMood === null || selectedClima === null) {
      toast.error("Por favor, selecione o seu humor e o clima lá fora!");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        toast.error("Precisa de iniciar sessão!");
        return;
      }

      const hoje = new Date();
      const numeroDia = hoje.getDay(); 
      const isFimDeSemana = numeroDia === 0 || numeroDia === 6;
      const tipoDeDia = isFimDeSemana ? "Fim de Semana" : "Dia de Semana";

      const climaMap = {
        condicao: climas[selectedClima].label 
      };

      const dadosDoHumor = {
        humor: moods[selectedMood].label,
        emoji: moods[selectedMood].emoji,
        nivel: moods[selectedMood].nivel,
        nota: note,
        fatores: selectedFactors,
        clima: climaMap,
        tipoDia: tipoDeDia,
      };

      // MODO EDIÇÃO: Atualiza o documento existente
      if (registroParaEditar?.docId) {
        const docRef = doc(db, "usuarios", user.uid, "registrosHumor", registroParaEditar.docId);
        await updateDoc(docRef, dadosDoHumor);
        toast.success("Registro atualizado com sucesso! ✨");
      } 
      // MODO CRIAÇÃO: Cria um novo documento e pontua XP
      else {
        const humorRef = doc(collection(db, "usuarios", user.uid, "registrosHumor"));
        await setDoc(humorRef, {
          ...dadosDoHumor,
          idHumor: humorRef.id,
          data: hoje,
        });

        const userRef = doc(db, "usuarios", user.uid);
        await updateDoc(userRef, { xp: increment(10) });

        toast.success("Check-in registrado! +10 XP ✨");
      }

      navigate("/menu"); 
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao guardar o seu registro.");
    }
  };

  const currentMood = selectedMood !== null ? moods[selectedMood] : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-100 via-white to-peach-300 flex items-center justify-center p-6 antialiased text-gray-800 pb-24">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-peach-300/40 border border-white"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 hover:bg-peach-100 rounded-full transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-6 text-peach-400" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-peach-500 tracking-tight">
            {registroParaEditar ? "Editar Sentir" : "Check-in do Sentir"}
          </h2>
          <p className="text-gray-500 mt-2 text-lg">
            {registroParaEditar ? "Altere as informações do seu registro de hoje" : "Como está agora?"}
          </p>
        </div>

        {/* Seleção de Humor com o Emote Selecionado Marcado */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          {moods.map((mood, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedMood(index)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-3xl border-2 transition-all duration-200 cursor-pointer
              ${selectedMood === index ? `bg-peach-100 border-peach-300 scale-105 shadow-md ${mood.color}` : "bg-peach-50/70 border-transparent opacity-60 hover:opacity-100"}`}
            >
              <span className="text-3xl md:text-4xl">{mood.emoji}</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter truncate w-full text-center">{mood.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {currentMood && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              <div className="flex items-center gap-2 text-peach-500 font-semibold bg-peach-100 p-4 rounded-2xl border border-peach-200">
                <MessageCircle className="size-5 shrink-0" />
                <p className="text-sm">{currentMood.question}</p>
              </div>

              {/* Pergunta do Clima */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-peach-400 uppercase ml-2 tracking-widest">
                  Como está o clima lá fora?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {climas.map((clima, index) => {
                    const Icone = clima.icon;
                    return (
                      <button
                        key={clima.id}
                        type="button"
                        onClick={() => setSelectedClima(index)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer
                        ${selectedClima === index ? "bg-peach-50 border-peach-400 shadow-md scale-105" : "bg-slate-50 border-transparent text-gray-400 hover:bg-peach-50/50"}`}
                      >
                        <Icone className={`size-6 ${selectedClima === index ? clima.cor : "text-gray-400"}`} />
                        <span className={`text-[10px] font-bold ${selectedClima === index ? "text-slate-700" : "text-gray-400"}`}>{clima.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                spellCheck={false}
                placeholder="Quer detalhar mais algum ponto do seu dia?"
                className="w-full h-24 p-5 bg-peach-50 border-none rounded-3xl focus:ring-2 focus:ring-peach-400 transition-all resize-none shadow-inner outline-none text-sm"
              />

              {/* Fatores Categorizados */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-peach-400 uppercase ml-2 tracking-widest">
                  <Tag className="size-3" /> O que impactou o seu dia?
                </label>
                <div className="flex flex-wrap gap-2">
                  {fatores.map((fator) => (
                    <button
                      key={fator}
                      type="button"
                      onClick={() => toggleFactor(fator)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all border cursor-pointer
                      ${selectedFactors.includes(fator) ? "bg-peach-500 text-white border-peach-500 shadow-md" : "bg-peach-50 text-gray-500 border-peach-100 hover:border-peach-300"}`}
                    >
                      {fator}
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          disabled={selectedMood === null || selectedClima === null}
          onClick={handleSave}
          className="w-full mt-8 bg-peach-500 hover:bg-peach-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-peach-300 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale active:scale-95 cursor-pointer"
        >
          {registroParaEditar ? "Atualizar Check-in" : "Concluir Check-in"}
          <ArrowRight className="size-5" />
        </button>
      </motion.div>
    </div>
  );
}