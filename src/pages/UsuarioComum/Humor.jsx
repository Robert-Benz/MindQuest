import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageCircle, Tag, CloudRain, Sun, Cloud, Moon, Users, Activity, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { collection, doc, setDoc, updateDoc, increment } from "firebase/firestore";
import { toast } from "sonner";

export default function Humor() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedClima, setSelectedClima] = useState(null); 
  const [note, setNote] = useState("");
  const [selectedFactors, setSelectedFactors] = useState([]);

  const moods = [
    { emoji: "😡", label: "Raiva", color: "text-rose-500", question: "O que te tirou do sério hoje?", nivel: 10 },
    { emoji: "😰", label: "Ansioso", color: "text-amber-500", question: "O que está gerando essa ansiedade?", nivel: 25 },
    { emoji: "😢", label: "Triste", color: "text-sky-400", question: "Sinto muito... quer contar o que houve?", nivel: 40 },
    { emoji: "🥱", label: "Cansado", color: "text-purple-400", question: "Dia puxado? Precisa de descanso?", nivel: 50 },
    { emoji: "😐", label: "Neutro", color: "text-gray-400", question: "Um dia comum? O que aconteceu?", nivel: 60 },
    { emoji: "🍃", label: "Tranquilo", color: "text-emerald-500", question: "Que ótimo! O que trouxe essa paz?", nivel: 75 },
    { emoji: "😊", label: "Feliz", color: "text-peach-500", question: "Que bom! O que trouxe esse sorriso?", nivel: 90 },
    { emoji: "✨", label: "Radiante", color: "text-yellow-500", question: "Incrível! Qual a melhor notícia?", nivel: 100 },
  ];

  const climas = [
    { id: "ensolarado", label: "Ensolarado", icon: Sun, cor: "text-yellow-500" },
    { id: "nublado", label: "Nublado", icon: Cloud, cor: "text-gray-400" },
    { id: "chuvoso", label: "Chuvoso", icon: CloudRain, cor: "text-sky-400" }
  ];

const categoriasFatores = [
    {
      titulo: "Sono & Corpo",
      icone: Moon,
      itens: ["Sono Ruim", "Sono Reparador", "Insônia", "Tensão Muscular", "Dor de Cabeça", "Dor Física", "Cólicas"]
    },
    {
      titulo: "Mente & Emoções",
       icone: Activity,
      itens: ["Mente Acelerada", "Estresse Alto", "Sensível / Emotivo", "Foco Produtivo", "Falta de Foco", "Motivado"]
    },
    {
      titulo: "Vida Social",
       icone: Users,
      itens: ["Socializei Bastante", "Encontro com Amigos", "Tempo em Família", "Isolado / Sozinho", "Atrito Social", "Conversa Agradável"]
    },
    {
      titulo: "Hábitos & Rotina",
       icone: Coffee,
      itens: ["Exercício Físico", "Boa Alimentação", "Junk Food / Doces", "Café em Excesso", "Álcool", "Estudos Intensos", "Trabalho Pesado"]
    }
  ];

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
        condicao: climas[selectedClima].label, 
        temperatura: 22, 
      };

      const humorRef = doc(collection(db, "usuarios", user.uid, "registrosHumor"));
      
      await setDoc(humorRef, {
        idHumor: humorRef.id,
        humor: moods[selectedMood].label,
        emoji: moods[selectedMood].emoji,
        nivel: moods[selectedMood].nivel,
        nota: note,
        fatores: selectedFactors,
        data: hoje,
        clima: climaMap,
        tipoDia: tipoDeDia,
      });

      const userRef = doc(db, "usuarios", user.uid);
      await updateDoc(userRef, { xp: increment(10) });

      toast.success("Check-in registado! +10 XP ✨");
      navigate("/menu"); 
      
    } catch (error) {
      toast.error("Erro ao guardar o seu registo.");
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-peach-500 tracking-tight">Check-in do Sentir</h2>
          <p className="text-gray-500 mt-2 text-lg">Como está agora?</p>
        </div>

        {/* Seleção de Humor */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {moods.map((mood, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedMood(index)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-3xl border-2 transition-all duration-200
              ${selectedMood === index ? `bg-peach-100 border-peach-200 scale-105 shadow-md ${mood.color}` : "bg-peach-50/70 border-transparent opacity-60 hover:opacity-100"}`}
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
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border-2 transition-all
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
                placeholder="Quer detalhar mais algum ponto do seu dia?"
                className="w-full h-24 p-5 bg-peach-50 border-none rounded-3xl focus:ring-2 focus:ring-peach-400 transition-all resize-none shadow-inner outline-none text-sm"
              />

              {/* Fatores Categorizados */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-xs font-bold text-peach-400 uppercase ml-2 tracking-widest">
                  <Tag className="size-3" /> O que impactou o seu dia?
                </label>
                
                <div className="space-y-3 bg-peach-50/50 p-4 rounded-3xl border border-peach-100">
                  {categoriasFatores.map((cat, catIdx) => {
                    const IconCat = cat.icone;
                    return (
                      <div key={catIdx} className="space-y-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 ml-1">
                          <IconCat className="size-3.5 text-peach-500" />
                          <span>{cat.titulo}</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.itens.map((fator) => (
                            <button
                              key={fator}
                              type="button"
                              onClick={() => toggleFactor(fator)}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                              ${selectedFactors.includes(fator) ? "bg-peach-500 text-white border-peach-500 shadow-sm" : "bg-white text-gray-600 border-slate-200 hover:border-peach-300"}`}
                            >
                              {fator}
                            </button>
                          ))}
                        </div>
                      </div>
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
          className="w-full mt-8 bg-peach-500 hover:bg-peach-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-peach-300 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale active:scale-95"
        >
          Concluir Check-in
          <ArrowRight className="size-5" />
        </button>
      </motion.div>
    </div>
  );
}