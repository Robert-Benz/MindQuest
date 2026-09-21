import { useNavigate } from "react-router-dom";
import { Sparkles, HeartHandshake, Zap } from "lucide-react";
import { motion } from "framer-motion";
import AnimatedBrainLogo from "../components/AnimatedBrainLogo";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-peach-100 via-white to-peach-300 flex flex-col items-center justify-center p-6 md:p-10 text-gray-800 antialiased overflow-hidden">
      
      {/* Elementos Decorativos de Fundo (Vidro Fosco) */}
      <motion.div 
        animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-white/40 rounded-full blur-[80px] -z-10 pointer-events-none" 
      />
      
      {/* CONTAINER PRINCIPAL: Mantém tudo centralizado na tela */}
      <div className="flex flex-col items-center justify-center w-full max-w-2xl gap-8 md:gap-12 z-10">
        
        {/* TOPO */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <div className="flex justify-center items-center gap-2 mb-2">
            <Sparkles className="text-peach-500 size-8" />
            <h1 className="text-5xl font-extrabold text-peach-500 tracking-tight">
              MindQuest
            </h1>
          </div>
          <p className="text-lg md:text-xl text-gray-600 max-w-lg mx-auto font-medium">
            Sua jornada para o bem-estar começa aqui. Um espaço seguro para cultivar equilíbrio e paz interior.
          </p>
        </motion.div>

        {/* CENTRO: Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <AnimatedBrainLogo />
        </motion.div>

        {/* CARDS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
        >
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-peach-200/50 flex items-center gap-4 border border-white hover:-translate-y-1 transition-transform cursor-default">
            <HeartHandshake className="text-peach-500 size-10 flex-shrink-0" />
            <p className="text-sm text-gray-700 font-medium">
              Acompanhamento diário do seu humor e sentimentos.
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-6 rounded-[2rem] shadow-xl shadow-peach-200/50 flex items-center gap-4 border border-white hover:-translate-y-1 transition-transform cursor-default">
            <Zap className="text-peach-500 size-10 flex-shrink-0" />
            <p className="text-sm text-gray-700 font-medium">
              Recomendações personalizadas baseadas no seu perfil.
            </p>
          </div>
        </motion.div>

        {/* BASE: Botões */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="w-full max-w-md space-y-4"
        >
          <button
            onClick={() => navigate("/cadastro")}
            className="w-full bg-peach-500 hover:bg-peach-400 text-white font-bold py-4 rounded-2xl shadow-lg shadow-peach-300 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="size-5" />
            Criar Minha Conta Grátis
          </button>

          <button
            onClick={() => navigate("/login")}
            className="w-full border-2 border-peach-300 text-peach-600 font-bold py-4 rounded-2xl bg-white/60 backdrop-blur-sm hover:bg-white transition-all active:scale-95"
          >
            Já tenho conta, fazer Login
          </button>
        </motion.div>

      </div>
    </div>
  );
}