import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function PopUpGenerico({ isOpen, onClose, titulo = "Ops! Algo deu errado", mensagem }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Fundo escuro que fecha ao clicar fora */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-6 md:p-8 border border-white z-10 text-center"
          >
            <div className="mx-auto w-16 h-16 bg-red-50 text-red-500 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-inner">
              <AlertCircle className="size-8" />
            </div>
            
            <h3 className="text-xl font-black text-slate-800 mb-2">{titulo}</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">{mensagem}</p>
            
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-slate-900/20"
            >
              Entendi
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}