import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import AnimatedBrainLogo from "./AnimatedBrainLogo";

// Vários "borrões" levemente deslocados = a expansão fica orgânica em vez de
// um círculo perfeito. Todos nascem perto do ponto onde as folhas se abrem.
const BLOBS = [
  { left: "50%", top: "41%", delay: 0.0, size: 46 },
  { left: "46%", top: "38%", delay: 0.06, size: 40 },
  { left: "55%", top: "39%", delay: 0.03, size: 42 },
  { left: "49%", top: "46%", delay: 0.1, size: 52 },
  { left: "58%", top: "44%", delay: 0.08, size: 38 },
];

/**
 * BloomIntro
 * Tela cheia: a logo brota (cabeça -> caule -> folhas) e, na sequência,
 * a cor da marca se expande a partir das folhas até tomar conta da tela
 * inteira, revelando o conteúdo real da Home por baixo.
 *
 * Uso no Home.jsx:
 *   const [introDone, setIntroDone] = useState(false);
 *   {!introDone && <BloomIntro onComplete={() => setIntroDone(true)} />}
 */
export default function BloomIntro({ onComplete }) {
  const [phase, setPhase] = useState("bloom"); // bloom -> expand -> fadeout -> done

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("expand"), 3000),
      setTimeout(() => setPhase("fadeout"), 4150),
      setTimeout(() => {
        setPhase("done");
        onComplete?.();
      }, 4950),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (phase === "done") return null;

  const isExpanding = phase === "expand" || phase === "fadeout";

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#fff8f5]"
      animate={{ opacity: phase === "fadeout" ? 0 : 1 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{ pointerEvents: phase === "fadeout" ? "none" : "auto" }}
      aria-hidden="true"
    >
      {isExpanding &&
        BLOBS.map((b, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full bg-[#ff9b7d]"
            style={{
              left: b.left,
              top: b.top,
              width: b.size,
              height: b.size,
              marginLeft: -b.size / 2,
              marginTop: -b.size / 2,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 70 }}
            transition={{
              duration: 1.15,
              delay: b.delay,
              ease: [0.16, 1, 0.3, 1],
            }}
          />
        ))}

      <motion.div
        className="relative z-10"
        animate={{
          opacity: isExpanding ? 0 : 1,
          scale: phase === "expand" ? 1.12 : 1,
        }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <AnimatedBrainLogo size={200} />
      </motion.div>
    </motion.div>
  );
}
