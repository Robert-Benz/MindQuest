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
      const moodIndex = moods.findIndex(
        (m) => m.label === registroParaEditar.humor || m.emoji === registroParaEditar.emoji
      );
      if (moodIndex !== -1) {
        setSelectedMood(moodIndex);
      }

      if (registroParaEditar.clima?.condicao) {
        const climaIndex = climas.findIndex(
          (c) => c.label.toLowerCase() === registroParaEditar.clima.condicao.toLowerCase()
        );
        if (climaIndex !== -1) {
          setSelectedClima(climaIndex);
        }
      }

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

      if (registroParaEditar?.docId) {
        const docRef = doc(db, "usuarios", user.uid, "registrosHumor", registroParaEditar.docId);
        await updateDoc(docRef, dadosDoHumor);
        toast.success("Registro atualizado com sucesso! ✨");
      } else {
        const humorRef = doc(collection(db, "usuarios", user.uid, "registrosHumor"));
        await setDoc(humorRef, {
          ...dadosDoHumor,
          idHumor: humorRef.id,
          data: hoje,
        });

        const userRef = doc(db, "usuarios", user.uid);
        await updateDoc(userRef, { 
          xp: increment(10),
          moedas: increment(15)
        });

        toast.success("Check-in registrado! +10 XP e +15 Moedas 🪙");
      }

      navigate("/menu"); 
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro ao guardar o seu registro.");
    }
  };

  const currentMood = selectedMood !== null ? moods[selectedMood] : null;

  return (
    <div className="min-h-screen bg-app-bg flex items-center justify-center p-3 sm:p-6 antialiased text-app-text pb-24 relative overflow-hidden transition-colors duration-300">
      
      {/* Elementos decorativos (blobs) no fundo */}
      <div className="absolute -top-20 -right-20 size-64 rounded-full bg-app-border blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 size-64 rounded-full bg-app-border blur-3xl opacity-50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl bg-app-card p-4 sm:p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-app-border relative z-10"
      >
        <button 
          onClick={() => navigate(-1)} 
          className="p-2 rounded-full transition-colors cursor-pointer text-app-primary hover:bg-app-border/50"
        >
          <ArrowLeft className="size-6" />
        </button>

        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-app-primary">
            {registroParaEditar ? "Editar Sentir" : "Check-in do Sentir"}
          </h2>
          <p className="text-app-muted mt-1 sm:mt-2 text-sm sm:text-lg">
            {registroParaEditar ? "Altere as informações do seu registro de hoje" : "Como está agora?"}
          </p>
        </div>

        {/* Seleção de Humor Corrigida para Mobile */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-3 mb-8">
          {moods.map((mood, index) => {
            const isSelected = selectedMood === index;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedMood(index)}
                className={`flex flex-col items-center justify-center gap-1 px-1 py-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 cursor-pointer ${
                  isSelected 
                    ? `scale-105 shadow-md ${mood.color} bg-app-border/30 border-app-primary` 
                    : "bg-app-bg border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <span className="text-2xl sm:text-3xl md:text-4xl">{mood.emoji}</span>
                <span className={`text-[9px] sm:text-xs font-bold uppercase tracking-tight text-center leading-tight w-full ${isSelected ? "text-app-primary" : "text-app-muted"}`}>
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {currentMood && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
              
              <div className="flex items-center gap-2 font-semibold p-4 rounded-2xl border bg-app-border/30 text-app-primary border-app-border">
                <MessageCircle className="size-5 shrink-0" />
                <p className="text-xs sm:text-sm">{currentMood.question}</p>
              </div>

              {/* Pergunta do Clima */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase ml-2 tracking-widest text-app-primary">
                  Como está o clima lá fora?
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {climas.map((clima, index) => {
                    const Icone = clima.icon;
                    const isSelected = selectedClima === index;
                    return (
                      <button
                        key={clima.id}
                        type="button"
                        onClick={() => setSelectedClima(index)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected 
                            ? "shadow-md scale-105 bg-app-border/30 border-app-primary text-app-text" 
                            : "bg-app-bg border-transparent text-app-muted hover:bg-app-border/50"
                        }`}
                      >
                        <Icone className={`size-5 sm:size-6 ${isSelected ? clima.cor : "text-app-muted"}`} />
                        <span className={`text-[10px] sm:text-xs font-bold ${isSelected ? "text-app-text" : "text-app-muted"}`}>{clima.label}</span>
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
                className="w-full h-24 p-4 sm:p-5 rounded-3xl transition-all resize-none shadow-inner outline-none text-xs sm:text-sm bg-app-bg text-app-text border border-transparent focus:border-app-primary focus:ring-1 focus:ring-app-primary placeholder:text-app-muted/70"
              />

              {/* Fatores Categorizados */}
              <div className="space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold uppercase ml-2 tracking-widest text-app-primary">
                  <Tag className="size-3" /> O que impactou o seu dia?
                </label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {fatores.map((fator) => {
                    const isSelected = selectedFactors.includes(fator);
                    return (
                      <button
                        key={fator}
                        type="button"
                        onClick={() => toggleFactor(fator)}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all border cursor-pointer ${
                          isSelected 
                            ? "text-white shadow-md bg-app-primary border-app-primary" 
                            : "text-app-muted bg-app-bg border-app-border hover:border-app-primary/50"
                        }`}
                      >
                        {fator}
                      </button>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          disabled={selectedMood === null || selectedClima === null}
          onClick={handleSave}
          className="w-full mt-8 text-white font-bold py-3.5 sm:py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale active:scale-95 cursor-pointer hover:opacity-90 bg-app-primary shadow-app-primary/40 text-sm sm:text-base"
        >
          {registroParaEditar ? "Atualizar Check-in" : "Concluir Check-in"}
          <ArrowRight className="size-5" />
        </button>
      </motion.div>
    </div>
  );
}