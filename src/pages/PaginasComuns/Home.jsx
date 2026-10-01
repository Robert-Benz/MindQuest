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

  return (
    <div className="relative min-h-screen sm:h-screen overflow-x-hidden sm:overflow-hidden bg-gradient-to-br from-[#fff8f5] via-white to-[#ffe8de] text-gray-800 antialiased flex flex-col justify-between select-none">

      {/* Orbes de fundo adaptativas */}
      <div className="pointer-events-none absolute -left-28 -top-28 h-[40vh] w-[40vh] max-w-[400px] max-h-[400px] rounded-full bg-[#ffd7c8]/50 blur-[90px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-[45vh] w-[45vh] max-w-[450px] max-h-[450px] rounded-full bg-[#ffc6b0]/35 blur-[100px]" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-52 w-52 -translate-x-1/2 rounded-full bg-[#ffe5da]/40 blur-[80px]" />

      {/* ÁREA CENTRAL PRINCIPAL */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-4 sm:py-6 max-w-2xl mx-auto w-full">
        
        {/* TOPO: LOGOTIPO MINDQUEST */}
        <div className="flex flex-col items-center mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-[#e79778]" />
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#d98263]">
              MindQuest
            </h1>
          </div>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.25em] text-[#c99684] mt-0.5">
            Bem-estar começa por dentro
          </span>
        </div>

        {/* HERO / TÍTULO PRINCIPAL */}
        <section className="text-center space-y-2 mb-2 sm:mb-4">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#f6d5c9] bg-white/75 px-3 py-1 text-[11px] font-semibold text-[#c98268] shadow-sm backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#eaa083]" />
            Um espaço para você
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight tracking-tight text-gray-800">
            Cuide da sua mente.{" "}<br></br>
            <span className="bg-gradient-to-r from-[#e79778] to-[#d87e60] bg-clip-text text-transparent block sm:inline">
              Um dia de cada vez.
            </span>
          </h2>

          <p className="max-w-lg mx-auto text-xs sm:text-sm font-medium leading-relaxed text-gray-500 hidden xs:block">
            Acompanhe suas emoções, compreenda seus sentimentos e construa uma rotina de bem-estar mais leve.
          </p>
        </section>

        {/* ILUSTRAÇÃO CENTRAL */}
        <div className="my-1 sm:my-3 flex justify-center items-center">
          <img 
            src={brainLogo} 
            alt="MindQuest Logo" 
            className="w-24 xs:w-28 sm:w-36 lg:w-40 h-auto object-contain drop-shadow-sm transition-transform hover:scale-105 duration-300" 
          />
        </div>

        {/* CARDS DE DESTAQUE */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 my-2 max-w-lg">
          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3 sm:p-3.5 shadow-sm backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0eb]">
              <HeartHandshake className="h-5 w-5 text-[#df8b6b]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">
                Acompanhe suas emoções
              </h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                Registre e compreenda como você se sente a cada dia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/70 p-3 sm:p-3.5 shadow-sm backdrop-blur-md">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0eb]">
              <Zap className="h-5 w-5 text-[#df8b6b]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">
                Novas possibilidades
              </h3>
              <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                Receba sugestões e missões para o seu momento.
              </p>
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO INFERIORES */}
        <div className="mt-3 sm:mt-4 w-full max-w-sm space-y-2">
          {/* Botão de Cadastro */}
          <button
            type="button"
            onClick={() => navigate("/cadastro")}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#e99a7c] to-[#dc8668] py-3 sm:py-3.5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:brightness-105 active:scale-95 cursor-pointer text-xs sm:text-sm"
          >
            <Sparkles className="h-4 w-4" />
            <span>Começar minha jornada</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {/* Botão de Login */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex w-full items-center justify-center py-1.5 sm:py-2 text-xs font-bold text-[#c98268] hover:text-[#b46b51] transition-colors cursor-pointer"
          >
            Já tenho uma conta
          </button>

          {/* Divisor */}
          <div className="relative flex py-0.5 items-center">
            <div className="flex-grow border-t border-[#f6d5c9]/60"></div>
            <span className="mx-2 text-[9px] font-bold uppercase tracking-wider text-gray-400">Área Profissional</span>
            <div className="flex-grow border-t border-[#f6d5c9]/60"></div>
          </div>

          {/* Acesso Psicólogo */}
          <button
            type="button"
            onClick={() => navigate("/loginPsicologo")}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#f6d5c9] bg-white/70 py-2 sm:py-2.5 text-xs font-bold text-[#c98268] shadow-sm backdrop-blur-md hover:bg-white transition-all active:scale-95 cursor-pointer"
          >
            <Stethoscope className="h-3.5 w-3.5 text-[#e79778]" />
            <span>Acesso para Psicólogos</span>
          </button>
        </div>

        {/* Sigilo */}
        <div className="mt-2.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400">
          <ShieldCheck className="h-3.5 w-3.5 text-[#d99a84]" />
          <span>Ambiente seguro, privado e protegido por LGPD.</span>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 py-2 sm:py-3 flex items-center justify-center gap-1.5 text-[10px] text-gray-400">
        <Brain className="h-3 w-3" />
        <span>MindQuest • Bem-estar começa por dentro</span>
      </footer>

    </div>
  );
}