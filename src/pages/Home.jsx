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
import { motion } from "framer-motion";
import AnimatedBrainLogo from "../components/AnimatedBrainLogo";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#fff8f5] via-white to-[#ffe8de] text-gray-800 antialiased">

      <motion.div
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-[#ffd7c8]/60 blur-[100px]"
      />

      <motion.div
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-[#ffc6b0]/40 blur-[110px]"
      />

      <motion.div
        animate={{
          opacity: [0.25, 0.5, 0.25],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-1/2 top-[40%] h-64 w-64 -translate-x-1/2 rounded-full bg-[#ffe5da]/50 blur-[90px]"
      />

      {/* =====================================================
          CONTEÚDO
      ====================================================== */}

      <main className="relative z-10 flex min-h-screen flex-col items-center px-5 py-8 sm:px-8 md:py-10">
        {/* =====================================================
            MINDQUEST
        ====================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: -30,
            scale: 0.92,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative mt-2 flex flex-col items-center"
        >
          {/* Glow do logo */}
          <motion.div
            animate={{
              opacity: [0.2, 0.4, 0.2],
              scale: [0.95, 1.08, 0.95],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f6b39b]/30 blur-3xl"
          />

          <div className="relative flex items-center gap-3">
            {/* Sparkle animado */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.4,
                rotate: -30,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                rotate: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.7,
                type: "spring",
                stiffness: 180,
              }}
            >
              <motion.div
                animate={{
                  rotate: [0, 8, -8, 0],
                  scale: [1, 1.08, 1],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <Sparkles className="h-9 w-9 text-[#e79778] sm:h-10 sm:w-10" />
              </motion.div>
            </motion.div>

            {/* Nome MindQuest */}
            <motion.h1
              initial={{
                opacity: 0,
                letterSpacing: "0.18em",
              }}
              animate={{
                opacity: 1,
                letterSpacing: "-0.035em",
              }}
              transition={{
                duration: 1,
                delay: 0.15,
                ease: "easeOut",
              }}
              className="relative overflow-hidden text-5xl font-extrabold text-[#d98263] sm:text-6xl md:text-7xl"
            >
              MindQuest
              {/* Brilho passando */}
              <motion.span
                initial={{
                  left: "-30%",
                  opacity: 0,
                }}
                animate={{
                  left: "120%",
                  opacity: [0, 0.8, 0],
                }}
                transition={{
                  delay: 1,
                  duration: 1.3,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute top-0 h-full w-8 skew-x-[-20deg] bg-white/60 blur-md"
              />
            </motion.h1>
          </div>

          <motion.p
            initial={{
              opacity: 0,
              y: 6,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.7,
              duration: 0.5,
            }}
            className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#c99684] sm:text-xs"
          >
            Bem-estar começa por dentro
          </motion.p>
        </motion.div>

        {/* =====================================================
            CENTRO
        ====================================================== */}

        <div className="flex w-full max-w-4xl flex-1 flex-col items-center justify-center">
          {/* Texto principal */}
          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
              duration: 0.7,
            }}
            className="mt-8 text-center md:mt-5"
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.9,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                delay: 0.5,
              }}
              className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-[#f6d5c9] bg-white/70 px-4 py-2 text-xs font-semibold text-[#c98268] shadow-sm backdrop-blur-md"
            >
              <motion.span
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="h-2 w-2 rounded-full bg-[#eaa083]"
              />
              Um espaço para você
            </motion.div>

            <h2 className="mx-auto max-w-3xl text-4xl font-extrabold leading-[1.08] tracking-tight text-gray-800 sm:text-5xl md:text-6xl">
              Cuide da sua mente.
              <span className="mt-1 block bg-gradient-to-r from-[#e79778] to-[#d87e60] bg-clip-text text-transparent">
                Um dia de cada vez.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base font-medium leading-relaxed text-gray-500 sm:text-lg">
              O MindQuest ajuda você a acompanhar suas emoções, compreender seus sentimentos e construir uma rotina de bem-estar mais leve.
            </p>
          </motion.section>

          {/* =====================================================
              CÉREBRO COM FOLHAS
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.8,
              y: 25,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            transition={{
              delay: 0.65,
              duration: 0.9,
              type: "spring",
              stiffness: 90,
              damping: 12,
            }}
            className="my-6 md:my-7"
          >
            <AnimatedBrainLogo />
          </motion.div>

          {/* =====================================================
              CARDS
          ====================================================== */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1,
              duration: 0.6,
            }}
            className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {/* Card 1 */}
            <motion.div
              whileHover={{
                y: -5,
              }}
              transition={{
                duration: 0.2,
              }}
              className="group flex items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/65 p-5 shadow-[0_15px_40px_rgba(225,145,115,0.10)] backdrop-blur-xl"
            >
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: -4,
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0eb]"
              >
                <HeartHandshake className="h-6 w-6 text-[#df8b6b]" />
              </motion.div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Acompanhe suas emoções
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Registre como você está se sentindo ao longo do tempo.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{
                y: -5,
              }}
              transition={{
                duration: 0.2,
              }}
              className="group flex items-center gap-4 rounded-[1.75rem] border border-white/80 bg-white/65 p-5 shadow-[0_15px_40px_rgba(225,145,115,0.10)] backdrop-blur-xl"
            >
              <motion.div
                whileHover={{
                  scale: 1.08,
                  rotate: 4,
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fff0eb]"
              >
                <Zap className="h-6 w-6 text-[#df8b6b]" />
              </motion.div>

              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Descubra novas possibilidades
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-gray-500">
                  Receba sugestões pensadas para o seu momento.
                </p>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 1.15,
              duration: 0.6,
            }}
            className="mt-7 w-full max-w-md space-y-4"
          >
            {/* Criar conta (Paciente) */}
            <motion.button
              whileHover={{
                y: -3,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/cadastro")}
              className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e99a7c] to-[#dc8668] py-4 font-bold text-white shadow-[0_12px_30px_rgba(220,134,104,0.28)] transition-all duration-300 hover:shadow-[0_16px_35px_rgba(220,134,104,0.35)]"
            >
              <motion.span
                initial={{
                  x: "-150%",
                }}
                whileHover={{
                  x: "150%",
                }}
                transition={{
                  duration: 0.7,
                }}
                className="absolute inset-y-0 w-20 skew-x-[-20deg] bg-white/20 blur-sm"
              />
              <Sparkles className="relative h-5 w-5" />
              <span className="relative">Começar minha jornada</span>
              <ArrowRight className="relative h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </motion.button>

            {/* Login (Paciente) */}
            <motion.button
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/login")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-[#c98268] transition-all duration-300 hover:bg-white/50"
            >
              Já tenho uma conta
            </motion.button>

            {/* Divisor Elegante para Área do Psicólogo */}
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-[#f6d5c9]/60"></div>
              <span className="flex-shrink mx-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">Área Profissional</span>
              <div className="flex-grow border-t border-[#f6d5c9]/60"></div>
            </div>

            {/* Botão de Acesso / Painel do Psicólogo */}
            <motion.button
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() => navigate("/login-psicologo")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#f6d5c9] bg-white/70 py-3.5 text-sm font-bold text-[#c98268] shadow-sm backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-md"
            >
              <Stethoscope className="h-4 w-4 text-[#e79778]" />
              <span>Acesso para Psicólogos (Login / Casastro)</span>
            </motion.button>
            
          </motion.div>


          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 1.35,
            }}
            className="mt-5 flex items-center gap-2 text-xs text-gray-400"
          >
            <ShieldCheck className="h-4 w-4 text-[#d99a84]" />
            <span>Um espaço acolhedor, privado e feito para você.</span>
          </motion.div>
        </div>

        <motion.footer
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            delay: 1.45,
          }}
          className="mt-8 flex items-center gap-2 text-xs text-gray-400"
        >
          <Brain className="h-3.5 w-3.5" />
          <span>MindQuest • Bem-estar começa por dentro</span>
        </motion.footer>
      </main>
    </div>
  );
}