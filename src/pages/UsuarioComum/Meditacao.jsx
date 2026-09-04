import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  Sparkles,
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  Moon,
  Sun,
  CloudRain,
  Wind,
  Activity,
} from "lucide-react";

import { motion } from "framer-motion";
import ReactPlayer from "react-player";

import BottomNav from "../../components/BottomNav";

import { auth, db } from "../../firebaseConfig";
import { doc, updateDoc, increment } from "firebase/firestore";

import { toast } from "sonner";

export default function Meditacao() {
  const navigate = useNavigate();

  const [tempoEscolhido, setTempoEscolhido] = useState(5);
  const [somSelecionado, setSomSelecionado] = useState("chuva");
  const [estaTocando, setEstaTocando] = useState(false);
  const [tempoRestante, setTempoRestante] = useState(5 * 60);

  const tempos = [
    { label: "1 min", minutos: 1 },
    { label: "5 min", minutos: 5 },
    { label: "10 min", minutos: 10 },
    { label: "20 min", minutos: 20 },
    { label: "30 min", minutos: 30 },
    { label: "40 min", minutos: 40 },
  ];

  const sons = [
    {
      id: "chuva",
      label: "Chuva Suave",
      icon: CloudRain,
      url: "https://www.youtube.com/watch?v=ljhbLia0-lk",
    },
    {
      id: "natureza",
      label: "Sons da Natureza",
      icon: Sun,
      url: "https://www.youtube.com/watch?v=_-dgtTTLa90",
    },
    {
      id: "vento",
      label: "Vento / Calmaria",
      icon: Wind,
      url: "https://www.youtube.com/watch?v=RsXaIT-eOsc",
    },
    {
      id: "branco",
      label: "Ruído Branco",
      icon: Volume2,
      url: "https://www.youtube.com/watch?v=mTehYo2OXFo",
    },
    {
      id: "escuro",
      label: "Ruído Escuro",
      icon: Moon,
      url: "https://www.youtube.com/watch?v=D0KMxRMfwxE",
    },
  ];

  const somAtual =
    sons.find((som) => som.id === somSelecionado) || sons[0];


  useEffect(() => {
    setTempoRestante(tempoEscolhido * 60);
    setEstaTocando(false);
  }, [tempoEscolhido]);

  const finalizarSessao = async () => {
    setEstaTocando(false);

    try {
      const user = auth.currentUser;

      if (user) {
        const userRef = doc(db, "usuarios", user.uid);

        await updateDoc(userRef, {
          xp: increment(15),
        });

        toast.success(
          "Sessão de meditação concluída! +15 XP 🧘‍♀️✨"
        );
      } else {
        toast.success(
          "Parabéns por concluir sua meditação! ✨"
        );
      }
    } catch (error) {
      console.error("Erro ao adicionar XP:", error);

      toast.success(
        "Parabéns por concluir sua meditação! ✨"
      );
    }
  };

  useEffect(() => {
    if (!estaTocando) {
      return;
    }

    // Quando chegar a zero, finaliza a sessão
    if (tempoRestante <= 0) {
      finalizarSessao();
      return;
    }

    const intervalo = setInterval(() => {
      setTempoRestante((prev) => {
        if (prev <= 1) {
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(intervalo);
    };
  }, [estaTocando, tempoRestante]);

  const alternarSessao = () => {
    // Se acabou, reinicia o timer
    if (tempoRestante === 0) {
      setTempoRestante(tempoEscolhido * 60);
      setEstaTocando(true);
      return;
    }

    setEstaTocando((prev) => !prev);
  };

  const formatarTempo = (segundosTotais) => {
    const minutos = Math.floor(segundosTotais / 60);
    const segundos = segundosTotais % 60;

    return `${String(minutos).padStart(2, "0")}:${String(
      segundos
    ).padStart(2, "0")}`;
  };

  const selecionarSom = (id) => {
    setSomSelecionado(id);
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col antialiased text-slate-800 pb-28">
      
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FFFBF9]/85 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">
        
        <button
          onClick={() => navigate("/menu")}
          className="bg-white p-2.5 rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-orange-500 transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100">
          <Sparkles className="size-3.5 text-orange-400" />

          <span className="text-xs font-black text-orange-500">
            Espaço Zen
          </span>
        </div>
      </header>

      {/* CONTEÚDO */}
      <main className="pt-28 px-6 space-y-8 max-w-xl mx-auto w-full">

        {/* TÍTULO */}
        <div className="text-center space-y-1">
          <p className="text-[#E97451] font-bold text-[10px] uppercase tracking-widest">
            Respira e Relaxa
          </p>

          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Momento de Meditação
          </h1>

          <p className="text-slate-400 text-sm">
            Escolha sua duração e som ambiente favorito.
          </p>
        </div>

        {/* CRONÔMETRO */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-orange-500/10 via-orange-400/5 to-white p-8 rounded-[3rem] border border-orange-200/50 shadow-xl shadow-orange-500/5 text-center relative overflow-hidden flex flex-col items-center justify-center space-y-6"
        >
          <div className="absolute -right-6 -bottom-6 opacity-5">
            <Activity className="size-48 text-orange-500" />
          </div>

          <div className="text-6xl md:text-7xl font-black text-slate-800 tracking-wider">
            {formatarTempo(tempoRestante)}
          </div>

          <button
            onClick={alternarSessao}
            className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all transform active:scale-95 ${
              estaTocando
                ? "bg-amber-500 shadow-amber-500/30 animate-pulse"
                : "bg-orange-500 hover:bg-orange-400 shadow-orange-500/30"
            }`}
          >
            {estaTocando ? (
              <Pause size={32} fill="currentColor" />
            ) : (
              <Play
                size={32}
                fill="currentColor"
                className="ml-1"
              />
            )}
          </button>

          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            {estaTocando
              ? `Sessão Ativa: ${somAtual.label}`
              : tempoRestante === 0
              ? "Sessão concluída • Toque para reiniciar"
              : "Toque para iniciar o timer"}
          </p>
        </motion.div>

        {/* PLAYER DO YOUTUBE */}
        <div className="bg-white p-4 rounded-[2.5rem] border border-orange-100 shadow-sm space-y-3">
          
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">
              Player do Som Ambiente
            </span>

            <span className="text-xs font-bold text-slate-600">
              {somAtual.label}
            </span>
          </div>

          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-inner border border-slate-100 bg-slate-900">
            
            <ReactPlayer
              key={somAtual.url}
              src={somAtual.url}
              playing={estaTocando}
              controls={true}
              width="100%"
              height="100%"
              loop={true}
              playsInline={true}
              volume={0.8}
              onReady={() => {
                console.log(
                  `Player pronto: ${somAtual.label}`
                );
              }}
              onPlay={() => {
                console.log(
                  `Reproduzindo: ${somAtual.label}`
                );
              }}
              onPause={() => {
                console.log(
                  `Pausado: ${somAtual.label}`
                );
              }}
              onError={(error) => {
                console.error(
                  "Erro no ReactPlayer:",
                  error
                );

                toast.error(
                  "Não foi possível reproduzir este som. Tente outro."
                );
              }}
            />
          </div>

          <p className="text-center text-[10px] text-slate-400 px-2">
            Caso o navegador bloqueie a reprodução automática,
            pressione o botão de play dentro do vídeo.
          </p>
        </div>

        {/* SELEÇÃO DE TEMPO */}
        <div className="space-y-3">
          
          <label className="text-[10px] font-bold text-orange-400 uppercase ml-2 tracking-widest">
            Duração da Sessão
          </label>

          <div className="grid grid-cols-3 gap-2.5">
            
            {tempos.map((tempo) => (
              <button
                key={tempo.minutos}
                onClick={() =>
                  setTempoEscolhido(tempo.minutos)
                }
                className={`py-3 rounded-2xl text-xs font-bold transition-all border ${
                  tempoEscolhido === tempo.minutos
                    ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-500/20"
                    : "bg-white text-slate-600 border-slate-100 hover:border-orange-300"
                }`}
              >
                {tempo.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          
          <label className="text-[10px] font-bold text-orange-400 uppercase ml-2 tracking-widest">
            Som Ambiente
          </label>

          <div className="space-y-2">
            
            {sons.map((som) => {
              const IconeSom = som.icon;
              const selecionado =
                somSelecionado === som.id;

              return (
                <button
                  key={som.id}
                  onClick={() =>
                    selecionarSom(som.id)
                  }
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    selecionado
                      ? "bg-orange-50 border-orange-400 shadow-sm text-orange-600"
                      : "bg-white border-slate-100 text-slate-600 hover:border-orange-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    
                    <div
                      className={`p-2 rounded-xl ${
                        selecionado
                          ? "bg-orange-500 text-white"
                          : "bg-slate-50 text-slate-400"
                      }`}
                    >
                      <IconeSom size={18} />
                    </div>

                    <span className="text-sm font-bold">
                      {som.label}
                    </span>
                  </div>

                  <span
                    className={`text-xs font-semibold ${
                      selecionado
                        ? "text-orange-500"
                        : "text-slate-300"
                    }`}
                  >
                    {selecionado
                      ? "Ativo"
                      : "Selecionar"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}