import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  HeartHandshake,
  Zap,
  ArrowRight,
  ShieldCheck,
  Brain,
  Stethoscope,
} from "lucide-react";
import brainLogo from "../../assets/LogoPessegoReduzido.png";

export default function Home() {
  const navigate = useNavigate();

  // Enquanto isso é false, a BloomIntro fica por cima de tudo

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fff8f5] via-white to-[#ffe8de] text-gray-800 antialiased">

      {/* Orbes de fundo em CSS estático (sem loops de re-renderização em JS) */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#ffd7c8]/60 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#ffc6b0]/40 blur-[110px]" />
      <div className="pointer-events-none absolute left-1/2 top-[40%] h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffe5da]/50 blur-[90px]" />

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}
      <main className="relative z-10 flex min-h-screen flex-col items-center px-5 py-8 sm:px-8 md:py-10">
        
        {/* =====================================================
            MINDQUEST
        ====================================================== */}
        <div className="relative mt-2 flex flex-col items-center">
          {/* Glow suave estático */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f6b39b]/30 blur-3xl" />

          <div className="relative flex items-center gap-3">
            <div className="transition-transform duration-300 hover:rotate-6 hover:scale-105">
              <Sparkles className="h-9 w-9 text-[#e79778] sm:h-10 sm:w-10" />
            </div>

            {/* Nome MindQuest */}
            <h1 className="relative text-5xl font-extrabold tracking-tight text-[#d98263] sm:text-6xl md:text-7xl">
              MindQuest
            </h1>
          </div>

          <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c99684] sm:text-xs">
            Bem-estar começa por dentro
          </p>
        </div>

        {/* =====================================================
            CENTRO
        ====================================================== */}
        <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
          {/* Texto principal */}
          <section className="mt-8 text-center md:mt-5">
            <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#f6d5c9] bg-white/70 px-4 py-2 text-xs font-semibold text-[#c98268] shadow-sm backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#eaa083]" />
              Um espaço para você
            </div>

            <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
              Cuide da sua mente.
              <span className="mt-1 block bg-gradient-to-r from-[#e79778] to-[#d87e60] bg-clip-text text-transparent">
                Um dia de cada vez.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
              O MindQuest ajuda você a acompanhar suas emoções, compreender seus sentimentos e construir uma rotina de bem-estar mais leve.
            </p>
          </section>

          {/* =====================================================
              LOGO
          ====================================================== */}
          <div className="my-6 flex justify-center items-center w-full">
            <img 
              src={brainLogo} 
              alt="MindQuest Logo" 
              className="w-[45vw] max-w-[360px] min-w-[180px] h-auto object-contain drop-shadow-sm" 
            />
          </div>

          {/* =====================================================
              CARDS
          ====================================================== */}
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Card 1 */}
            <div className="group flex items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/65 p-5 shadow-[0_15px_40px_rgba(225,145,115,0.10)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0eb] transition-transform duration-200 group-hover:scale-105">
                <HeartHandshake className="h-6 w-6 text-[#df8b6b]" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Acompanhe suas emoções
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Registre como você está se sentindo ao longo do tempo.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group flex items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/65 p-5 shadow-[0_15px_40px_rgba(225,145,115,0.10)] backdrop-blur-xl transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0eb] transition-transform duration-200 group-hover:scale-105">
                <Zap className="h-6 w-6 text-[#df8b6b]" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Descubra novas possibilidades
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Receba sugestões pensadas para o seu momento.
                </p>
              </div>
            </div>
          </div>

          {/* =====================================================
              BOTÕES DE AÇÃO
          ====================================================== */}
          <div className="mt-7 w-full max-w-md space-y-4">
            {/* Criar conta (Paciente) */}
            <button
              onClick={() => navigate("/cadastro")}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e99a7c] to-[#dc8668] py-4 font-bold text-white shadow-[0_12px_30px_rgba(220,134,104,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(220,134,104,0.35)] active:scale-95 cursor-pointer"
            >
              <Sparkles className="relative h-5 w-5" />
              <span className="relative">Começar minha jornada</span>
              <ArrowRight className="relative h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            {/* Login (Paciente) */}
            <button
              onClick={() => navigate("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-[#c98268] transition-all duration-200 hover:bg-white/50 active:scale-95 cursor-pointer"
            >
              Já tenho uma conta
            </button>

            {/* Divisor Elegante para Área do Psicólogo */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#f6d5c9]/60"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Área Profissional</span>
              <div className="flex-grow border-t border-[#f6d5c9]/60"></div>
            </div>

            {/* Botão de Acesso / Painel do Psicólogo */}
            <button
              onClick={() => navigate("/loginPsicologo")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#f6d5c9] bg-white/70 py-3.5 text-sm font-bold text-[#c98268] shadow-sm backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:scale-95 cursor-pointer"
            >
              <Stethoscope className="h-4 w-4 text-[#e79778]" />
              <span>Acesso para Psicólogos (Login / Cadastro)</span>
            </button>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-[#d99a84]" />
            <span>Um espaço acolhedor, privado e feito para você.</span>
          </div>
        </div>

        <footer className="mt-8 flex items-center gap-2 text-xs text-gray-400">
          <Brain className="h-3.5 w-3.5" />
          <span>MindQuest • Bem-estar começa por dentro</span>
        </footer>
      </main>
    </div>
  );
}