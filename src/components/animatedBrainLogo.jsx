import { motion } from "framer-motion";

export default function AnimatedBrainLogo() {
  return (
    <div className="relative flex items-center justify-center">
      <motion.svg
        viewBox="0 0 220 220"
        width="220"
        height="220"
        className="overflow-visible"
      >
        {/* =====================================================
            CABEÇA
        ====================================================== */}

        <motion.path
          d="
            M76 79
            C62 80 51 88 47 100
            C44 108 46 116 43 124
            C40 131 34 137 35 143
            C36 148 43 150 46 153
            C47 157 46 163 50 166
            C53 168 58 168 61 169
            L62 184
            C62 189 66 192 71 192
            L100 192
            C104 192 107 189 107 185
            L107 169
            C123 164 130 149 130 129
            C130 99 108 79 76 79
            Z
          "
          fill="#ff9879"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            duration: 1,
            ease: "easeInOut",
          }}
        />

        {/* =====================================================
            PARTE SUPERIOR DA CABEÇA
        ====================================================== */}

        <motion.path
          d="
            M52 104
            C52 91 62 85 77 85
            C93 85 106 89 112 97
            C104 91 96 89 86 89
            C74 89 65 94 60 102
          "
          fill="none"
          stroke="#ffb09a"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{
            pathLength: 0,
            opacity: 0,
          }}
          animate={{
            pathLength: 1,
            opacity: 1,
          }}
          transition={{
            delay: 0.5,
            duration: 0.6,
          }}
        />

        {/* =====================================================
            CAULE PRINCIPAL
        ====================================================== */}

        <motion.path
          d="M77 106 C76 91 77 73 78 57"
          fill="none"
          stroke="#80a873"
          strokeWidth="4"
          strokeLinecap="round"
          initial={{
            pathLength: 0,
          }}
          animate={{
            pathLength: 1,
          }}
          transition={{
            delay: 1,
            duration: 1.2,
            ease: "easeOut",
          }}
        />

        {/* =====================================================
            CAULE ESQUERDO
        ====================================================== */}

        <motion.path
          d="M77 82 C68 73 64 64 63 54"
          fill="none"
          stroke="#80a873"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{
            pathLength: 0,
          }}
          animate={{
            pathLength: 1,
          }}
          transition={{
            delay: 1.65,
            duration: 0.8,
            ease: "easeOut",
          }}
        />

        {/* =====================================================
            CAULE DIREITO
        ====================================================== */}

        <motion.path
          d="M77 75 C87 69 94 61 97 51"
          fill="none"
          stroke="#80a873"
          strokeWidth="3.5"
          strokeLinecap="round"
          initial={{
            pathLength: 0,
          }}
          animate={{
            pathLength: 1,
          }}
          transition={{
            delay: 1.8,
            duration: 0.8,
            ease: "easeOut",
          }}
        />

        {/* =====================================================
            FOLHA ESQUERDA
        ====================================================== */}

        <motion.g
          initial={{
            opacity: 0,
            scale: 0,
            rotate: -35,
          }}
          animate={{
            opacity: 1,
            scale: [0, 1.15, 1],
            rotate: [-35, 8, -3],
          }}
          transition={{
            delay: 2.15,
            duration: 1,
            ease: "easeOut",
          }}
          style={{
            transformOrigin: "63px 54px",
          }}
        >
          <path
            d="
              M63 54
              C51 49 44 39 46 29
              C58 30 67 39 63 54
              Z
            "
            fill="#ff9879"
          />

          <motion.path
            d="M62 52 C56 44 52 37 48 31"
            fill="none"
            stroke="#ffb39f"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* =====================================================
            FOLHA DIREITA
        ====================================================== */}

        <motion.g
          initial={{
            opacity: 0,
            scale: 0,
            rotate: 35,
          }}
          animate={{
            opacity: 1,
            scale: [0, 1.15, 1],
            rotate: [35, -8, 3],
          }}
          transition={{
            delay: 2.45,
            duration: 1,
            ease: "easeOut",
          }}
          style={{
            transformOrigin: "97px 51px",
          }}
        >
          <path
            d="
              M97 51
              C105 41 116 37 125 41
              C123 52 112 59 97 51
              Z
            "
            fill="#ff9879"
          />

          <motion.path
            d="M99 50 C107 46 114 43 121 42"
            fill="none"
            stroke="#ffb39f"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* =====================================================
            PEQUENA FOLHA CENTRAL
        ====================================================== */}

        <motion.g
          initial={{
            opacity: 0,
            scale: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            scale: [0, 1.2, 1],
            y: [8, -2, 0],
          }}
          transition={{
            delay: 2.8,
            duration: 0.9,
            ease: "easeOut",
          }}
          style={{
            transformOrigin: "78px 57px",
          }}
        >
          <path
            d="
              M78 57
              C70 47 71 36 78 29
              C86 38 86 48 78 57
              Z
            "
            fill="#ff9879"
          />

          <path
            d="M78 54 C77 45 77 38 78 32"
            fill="none"
            stroke="#ffb39f"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </motion.g>

        {/* =====================================================
            FLORES / PEQUENOS DETALHES
        ====================================================== */}

        {/* Flor esquerda */}
        <motion.g
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 1],
            scale: [0, 1.25, 1],
          }}
          transition={{
            delay: 3.35,
            duration: 0.8,
          }}
          style={{
            transformOrigin: "48px 30px",
          }}
        >
          <circle cx="48" cy="30" r="3.2" fill="#f8c56d" />
          <circle cx="43" cy="30" r="4" fill="#ffc3b1" />
          <circle cx="53" cy="30" r="4" fill="#ffc3b1" />
          <circle cx="48" cy="25" r="4" fill="#ffc3b1" />
          <circle cx="48" cy="35" r="4" fill="#ffc3b1" />
        </motion.g>

        {/* Flor direita */}
        <motion.g
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 1],
            scale: [0, 1.25, 1],
          }}
          transition={{
            delay: 3.65,
            duration: 0.8,
          }}
          style={{
            transformOrigin: "123px 42px",
          }}
        >
          <circle cx="123" cy="42" r="3.2" fill="#f8c56d" />
          <circle cx="118" cy="42" r="4" fill="#ffc3b1" />
          <circle cx="128" cy="42" r="4" fill="#ffc3b1" />
          <circle cx="123" cy="37" r="4" fill="#ffc3b1" />
          <circle cx="123" cy="47" r="4" fill="#ffc3b1" />
        </motion.g>

        {/* =====================================================
            BRILHINHO
        ====================================================== */}

        <motion.g
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: [0, 1, 0.6, 1],
            scale: [0, 1.2, 0.9, 1],
          }}
          transition={{
            delay: 4,
            duration: 1,
            repeat: Infinity,
            repeatDelay: 3,
          }}
        >
          <path
            d="M137 69 L140 77 L148 80 L140 83 L137 91 L134 83 L126 80 L134 77 Z"
            fill="#f2b39d"
          />
        </motion.g>
      </motion.svg>

      {/* =====================================================
          GLOW
      ====================================================== */}

      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ffb9a1]/25 blur-[55px]"
        animate={{
          opacity: [0.3, 0.55, 0.3],
          scale: [0.95, 1.08, 0.95],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}