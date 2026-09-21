import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import logo from "../assets/LogoBrancoReduzido.png";

import { db, auth } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

const questions = [
  {
    id: "movies",
    category: "Filmes",
    question: "Qual tipo de filme você mais gosta?",
    options: [
      "Ação", "Comédia", "Terror", "Romance", 
      "Ficção Científica", "Drama", "Fantasia", "Documentário"
    ]
  },
  {
    id: "series",
    category: "Séries",
    question: "Qual gênero de série combina mais com você?",
    options: [
      "Suspense", "Crime", "Comédia", "Drama", 
      "Fantasia", "Anime", "Reality Show"
    ]
  },
    {
    id: "livro",
    category: "Livros",
    question: "Qual tipo de livro você mais gosta de ler?",
    options: [
      "Romance", "Ficção Científica", "Suspense", "Desenvolvimento Pessoal", 
      "Biografia", "Poesia", "HQ / Mangá", "Não costumo ler"
    ]
  },
  {
    id: "music",
    category: "Música",
    question: "Que tipo de música você mais gosta?",
    options: [
      "Pop", "Rock", "Rap", "Eletrônica", 
      "MPB", "Sertanejo", "Jazz", "Clássica"
    ]
  },
  {
    id: "relax",
    category: "Relaxamento",
    question: "Quando você quer relaxar, prefere:",
    options: [
      "Assistir filmes ou séries", "Ouvir música", "Jogar", 
      "Ler", "Fazer exercícios", "Descansar"
    ]
  },
  {
    id: "environment",
    category: "Ambiente",
    question: "Qual ambiente combina mais com você?",
    options: [
      "Lugar tranquilo", "Natureza", "Cidade movimentada", 
      "Minha casa", "Eventos sociais"
    ]
  },
  {
    id: "hobbies",
    category: "Hobbies",
    question: "Como você costuma passar seu tempo livre?",
    options: [
      "Filmes e séries", "Jogos", "Esportes", 
      "Tecnologia", "Música", "Aprender coisas novas"
    ]
  },
  {
    id: "activities",
    category: "Atividades",
    question: "Que tipo de atividade melhora seu humor?",
    options: [
      "Escutar música", "Caminhar", "Assistir algo", 
      "Conversar", "Criar algo", "Relaxar"
    ]
  },
  {
    id: "social",
    category: "Social",
    question: "Você prefere experiências:",
    options: [
      "Sozinho", "Com amigos", "Com família", "Com alguém especial"
    ]
  },
  {
    id: "personality",
    category: "Personalidade",
    question: "Como você se define?",
    options: [
      "Criativo", "Aventureiro", "Calmo", 
      "Curioso", "Competitivo", "Extrovertido"
    ]
  }
];

export default function ProfileQuestionnaire() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const current = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  function selectOption(option) {
    setAnswers({
      ...answers,
      [current.id]: option
    });
  }

  function nextQuestion() {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      saveProfile();
    }
  }

  function previousQuestion() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  async function saveProfile() {
    // Evita chamadas duplicadas se já estiver salvando
    if (loading) return;

    const user = auth.currentUser;

    if (!user) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      navigate("/login");
      return;
    }

    setLoading(true); // <-- Ativa o carregamento para travar o botão

    try {
      const userFormRef = doc(db, "usuarios", user.uid, "respostasFormulario", "respostas");

      await setDoc(userFormRef, {
        userId: user.uid,
        respostas: answers,
        dataPreenchimento: serverTimestamp(),
      });

      console.log("Respostas salvas com sucesso!");
      navigate("/menu", { state: { justCompletedForm: true } }); // <-- Redireciona para o menu após salvar
    } catch (error) {
      console.error("Erro ao salvar respostas no Firebase:", error);
      alert("Ocorreu um erro ao salvar suas preferências. Tente novamente.");
    } finally {
      setLoading(false); // <-- Libera o estado mesmo em caso de erro
    }
  }

  return (
    /* CONTAINER CENTRALIZADO NA TELA INTEIRA (SEM ESPAÇO VAZIO NO TOPO) */
    <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center p-4 sm:p-6 md:p-8 font-sans antialiased">
      
      {/* CARD PRINCIPAL COM SOMBRA ELEGANTE E BORDAS ARREDONDADAS */}
      <div className="w-full max-w-lg bg-white/95 backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(233,116,81,0.08)] border border-orange-100/60 p-6 sm:p-10 flex flex-col justify-between my-auto">
        
        {/* CABEÇALHO */}
        <div className="text-center space-y-2 mb-6">
          <div className="bg-[#E97451] w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-orange-200/50 mb-3">
            <img
              src={logo}
              alt="MindQuest"
              className="w-9 h-auto object-contain"
            />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-snug">
            Conheça seu MindQuest
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">
            Responda algumas perguntas para personalizarmos sua jornada de bem-estar.
          </p>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div className="mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>Pergunta {currentQuestion + 1} de {questions.length}</span>
            <span className="text-[#E97451]">{Math.round(progress)}%</span>
          </div>

          <div className="w-full h-2.5 bg-orange-100/60 rounded-full overflow-hidden p-0.5 border border-orange-100/40">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="h-full bg-[#E97451] rounded-full shadow-sm"
            />
          </div>
        </div>

        {/* CONTEÚDO DA PERGUNTA ANIMAÇÃO */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4 my-2"
          >
            <div>
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-[#E97451] bg-orange-50 px-3 py-1 rounded-full border border-orange-100/80 mb-2">
                {current.category}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
                {current.question}
              </h2>
            </div>

            {/* LISTA DE OPÇÕES (GRID RESPONSIVO E SELEÇÃO BONITA) */}
            <div className="grid grid-cols-1 gap-2.5 max-h-[320px] overflow-y-auto pr-1 custom-scrollbar pt-1">
              {current.options.map((option) => {
                const isSelected = answers[current.id] === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => selectOption(option)}
                    className={`w-full p-4 rounded-2xl text-left text-sm font-semibold transition-all duration-200 flex items-center justify-between border ${
                      isSelected
                        ? "bg-[#E97451] text-white border-[#E97451] shadow-lg shadow-orange-500/20 scale-[1.01]"
                        : "bg-white text-slate-700 border-slate-200/80 hover:border-orange-200 hover:bg-orange-50/40 active:scale-[0.99]"
                    }`}
                  >
                    <span>{option}</span>
                    {isSelected && (
                      <CheckCircle2 size={18} className="text-white shrink-0 ml-2" />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* RODAPÉ E BOTÕES DE NAVEGAÇÃO */}
        <div className="flex gap-3 mt-8 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={previousQuestion}
            disabled={currentQuestion === 0 || loading}
            className="flex-1 py-3.5 px-4 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center gap-1"
          >
            <ChevronLeft size={16} />
            <span>Voltar</span>
          </button>

          <button
            type="button"
            onClick={nextQuestion}
            disabled={!answers[current.id] || loading}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-[#E97451] hover:bg-[#c05e41] text-white font-bold text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1"
          >
            <span>
              {loading
                ? "Salvando..."
                : currentQuestion === questions.length - 1
                ? "Finalizar"
                : "Próximo"}
            </span>
            {currentQuestion < questions.length - 1 && <ChevronRight size={16} />}
          </button>
        </div>

      </div>
    </div>
  );
}