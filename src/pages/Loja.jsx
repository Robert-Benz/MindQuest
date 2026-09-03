import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, ShoppingBag, Tag, 
  Gift, ExternalLink, CheckCircle2, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const produtos = [
  {
    id: 1,
    nome: "Sérum Facial Hidratante 30ml",
    marca: "Natura",
    loja: "Amazon",
    precoOriginal: 89.90,
    imagem: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80",
    corLoja: "bg-blue-50 text-blue-600",
  },
  {
    id: 2,
    nome: "Vela Aromática Lavanda & Camomila",
    marca: "Oceane",
    loja: "Mercado Livre",
    precoOriginal: 54.00,
    imagem: "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=400&q=80",
    corLoja: "bg-yellow-50 text-yellow-600",
  },
  {
    id: 3,
    nome: "Kit Óleos Essenciais Relaxantes",
    marca: "WNF",
    loja: "Época Cosméticos",
    precoOriginal: 120.00,
    imagem: "https://images.unsplash.com/photo-1608528577891-eb055944f2e7?auto=format&fit=crop&w=400&q=80",
    corLoja: "bg-pink-50 text-pink-600",
  },
  {
    id: 4,
    nome: "Máscara Facial Argila Rosa",
    marca: "O Boticário",
    loja: "Sephora",
    precoOriginal: 65.50,
    imagem: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=400&q=80",
    corLoja: "bg-black text-white",
  },
];

/* =========================================================
   COMPONENTE PRINCIPAL
========================================================= */
export default function Loja() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(0);
  
  // Estado para o Modal de Resgate
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setUserXP(userDocSnap.data().xp || 0);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Lógica de Desconto baseada no XP
  const nivelAtual = Math.floor(userXP / 100) + 1;
  // O desconto cresce 5% a cada nível, limitado ao máximo de 30%
  const descontoPercentual = Math.min(nivelAtual * 5, 30); 

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <div className="size-16 rounded-3xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="text-orange-400 size-8 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShoppingBag size={14} className="text-orange-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Loja Zen</span>
          </div>
        </div>

        {/* HEADER DA LOJA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-orange-100/50 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-pink-100/40 blur-3xl pointer-events-none" />

          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
            <Gift size={36} className="fill-white/20" />
            <Sparkles className="absolute -top-2 -right-2 size-6 text-yellow-300 animate-pulse" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Clube de Recompensas</h1>
          <p className="text-xs text-slate-500 mt-1 mb-6">Transforme seu autocuidado em descontos reais.</p>

          <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl flex items-center justify-between">
            <div className="text-left">
              <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-widest">Seu Nível Atual</span>
              <strong className="text-lg font-black text-orange-600">LVL {nivelAtual}</strong>
            </div>
            <div className="h-10 w-px bg-orange-200" />
            <div className="text-right">
              <span className="block text-[10px] font-bold text-orange-400 uppercase tracking-widest">Seu Desconto</span>
              <strong className="text-lg font-black text-emerald-500">{descontoPercentual}% OFF</strong>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-3 font-medium">Continue meditando para aumentar seu nível e ganhar até 30% de desconto!</p>
        </motion.div>

        {/* VITRINE DE PRODUTOS */}
        <div className="space-y-4">
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest pl-2">Resgatar Cosméticos</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {produtos.map((produto) => {
              const valorDesconto = (produto.precoOriginal * descontoPercentual) / 100;
              const precoFinal = produto.precoOriginal - valorDesconto;

              return (
                <motion.div 
                  key={produto.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="h-32 w-full relative overflow-hidden bg-slate-50">
                    <img src={produto.imagem} alt={produto.nome} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black uppercase px-2 py-1 rounded-lg shadow-sm">
                      -{descontoPercentual}%
                    </div>
                  </div>

                  <div className="p-4 flex flex-col flex-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{produto.marca}</span>
                    <h3 className="text-xs font-bold text-slate-800 mt-0.5 leading-tight line-clamp-2">{produto.nome}</h3>
                    
                    <div className="mt-auto pt-3">
                      <span className="text-[10px] text-slate-400 line-through">R$ {produto.precoOriginal.toFixed(2).replace('.', ',')}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-black text-emerald-600">R$ {precoFinal.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => setProdutoSelecionado({ ...produto, precoFinal })}
                      className="mt-3 w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Tag size={12} /> Resgatar
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL DE RESGATE DE CUPOM */}
      <AnimatePresence>
        {produtoSelecionado && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative text-center">
              <button onClick={() => setProdutoSelecionado(null)} className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
              
              <div className="size-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-500 shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              
              <h2 className="text-xl font-black text-slate-800 leading-tight">Desconto Liberado!</h2>
              <p className="text-xs text-slate-500 mt-2">Você usou seus benefícios de Nível {nivelAtual} para gerar este cupom exclusivo.</p>
              
              <div className="mt-5 p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 relative overflow-hidden">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Seu Cupom</span>
                <div className="text-2xl font-black text-orange-500 tracking-[0.2em] font-mono select-all">
                  MIND{descontoPercentual}ZEN
                </div>
              </div>

              <div className="mt-5 text-left bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center gap-3">
                <img src={produtoSelecionado.imagem} className="size-12 rounded-lg object-cover" />
                <div>
                  <h4 className="text-[11px] font-bold text-slate-800 line-clamp-1">{produtoSelecionado.nome}</h4>
                  <span className="text-[10px] text-slate-500">Valor final: <strong className="text-emerald-600">R$ {produtoSelecionado.precoFinal.toFixed(2).replace('.', ',')}</strong></span>
                </div>
              </div>

              <button 
                onClick={() => {
                  toast.success("Cupom copiado! Redirecionando para a loja...");
                  setProdutoSelecionado(null);
                }}
                className={`w-full mt-5 py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${produtoSelecionado.corLoja}`}
              >
                Resgatar na {produtoSelecionado.loja} <ExternalLink size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}