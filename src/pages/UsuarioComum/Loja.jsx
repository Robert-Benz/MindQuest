import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Palette, Coins, 
  Check, Lock, CheckCircle2 
} from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import { toast } from "sonner";
import HeaderUsuario from "../../components/HeaderUsuario";
import BottomNav from "../../components/BottomNav";
import { useTheme } from "../../utils/tema";
import { TEMAS_LOJA } from "../../utils/itensLoja";

export default function Loja() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [comprando, setComprando] = useState(false);
  const { aplicarTema } = useTheme();
  
  const [usuarioData, setUsuarioData] = useState({
    moedas: 0,
    itensDesbloqueados: ["tema_padrao"],
    temaAtivo: "tema_padrao",
  });

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
          const dados = userDocSnap.data();
          setUsuarioData({
            moedas: dados.moedas || 0,
            itensDesbloqueados: dados.itensDesbloqueados || ["tema_padrao"],
            temaAtivo: dados.temaAtivo || "tema_padrao",
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados da loja:", error);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleComprarOuEquipar = async (item) => {
    const user = auth.currentUser;
    if (!user || comprando) return;

    const jaPossui = usuarioData.itensDesbloqueados.includes(item.id);

    // Caso 1: Utilizador já possui o item -> Equipar
    if (jaPossui) {
      if (usuarioData.temaAtivo === item.id) return;
      try {
        setComprando(true);
        await updateDoc(doc(db, "usuarios", user.uid), {
          temaAtivo: item.id
        });
        setUsuarioData(prev => ({ ...prev, temaAtivo: item.id }));
        aplicarTema(item.id);
        localStorage.setItem("mindquest_tema", item.id);
        toast.success(`Tema ${item.nome} equipado com sucesso!`);
      } catch (error) {
        toast.error("Erro ao equipar personalização.");
      } finally {
        setComprando(false);
      }
      return;
    }

    // Caso 2: Utilizador vai adquirir o item com moedas
    if (usuarioData.moedas < item.preco) {
      toast.error(`Saldo insuficiente! Precisa de ${item.preco} moedas.`);
      return;
    }

    try {
      setComprando(true);
      await updateDoc(doc(db, "usuarios", user.uid), {
        moedas: increment(-item.preco),
        itensDesbloqueados: arrayUnion(item.id),
        temaAtivo: item.id
      });

      setUsuarioData(prev => ({
        ...prev,
        moedas: prev.moedas - item.preco,
        itensDesbloqueados: [...prev.itensDesbloqueados, item.id],
        temaAtivo: item.id
      }));
      
      aplicarTema(item.id);
      localStorage.setItem("mindquest_tema", item.id);
      toast.success(`Parabéns! ${item.nome} desbloqueado e equipado.`);
    } catch (error) {
      toast.error("Ocorreu um erro na compra.");
    } finally {
      setComprando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-app-bg flex items-center justify-center">
        <Sparkles className="text-app-primary size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg p-4 md:p-8 text-app-text transition-colors duration-300 antialiased font-sans pb-32">
      
      <HeaderUsuario />

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Barra de Navegação Superior */}
        <div className="flex items-center justify-between">
          <button 
            type="button"
            onClick={() => navigate("/Menu")} 
            className="flex items-center gap-2 text-sm font-semibold text-app-muted hover:text-app-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Painel Principal
          </button>
          
          {/* Contador de Moedas do Utilizador */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-full shadow-sm">
            <Coins size={15} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-black text-amber-700">
              {usuarioData.moedas} Moedas
            </span>
          </div>
        </div>

        {/* Cabeçalho da Loja */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-app-card rounded-[2.75rem] border border-app-border shadow-xl p-7 md:p-9 text-center"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-app-primary flex items-center justify-center shadow-lg text-white">
            <Palette size={36} />
            <Sparkles className="absolute -top-2 -right-2 size-6 text-yellow-300 animate-pulse" />
          </div>

          <h1 className="text-2xl font-black text-app-text tracking-tight">Loja de Estilo</h1>
          <p className="text-xs text-app-muted mt-1 mb-5">
            Use as moedas conquistadas nos seus check-ins para personalizar a aplicação.
          </p>

          <div className="bg-app-bg border border-app-border p-4 rounded-2xl flex items-center justify-between text-left">
            <div>
              <span className="block text-[10px] font-bold text-app-primary uppercase tracking-widest">Recompensa Diária</span>
              <p className="text-xs font-bold text-app-text mt-0.5">Faça check-ins e complete missões para obter mais moedas.</p>
            </div>
            <Coins size={28} className="text-app-primary shrink-0 ml-3" />
          </div>
        </motion.div>

        {/* Lista de Cosméticos / Temas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-app-muted uppercase tracking-widest">
              Paletas de Cores & Ambientes
            </span>
            <span className="text-[10px] font-bold text-app-primary">
              {TEMAS_LOJA.length} disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {TEMAS_LOJA.map((item) => {
              const desbloqueado = usuarioData.itensDesbloqueados.includes(item.id);
              const equipado = usuarioData.temaAtivo === item.id;

              return (
                <div 
                  key={item.id}
                  className={`bg-app-card rounded-[2rem] border p-5 shadow-sm transition-all flex flex-col justify-between ${
                    equipado 
                      ? "border-app-primary ring-2 ring-app-primary/30 shadow-md" 
                      : "border-app-border hover:border-app-primary/50"
                  }`}
                >
                  <div>
                    {/* Visualizador da Paleta */}
                    <div className={`h-24 w-full rounded-2xl bg-gradient-to-br ${item.previewBg} border border-app-border p-3 flex flex-col justify-between mb-3 shadow-inner`}>
                      <div className="flex justify-between items-center">
                        <span className="size-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: item.corPrimaria }} />
                        {equipado && (
                          <span className="bg-white/90 text-app-primary text-[9px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
                            Em Uso
                          </span>
                        )}
                      </div>
                      <div className="h-2 w-16 bg-white/70 rounded-full" />
                    </div>

                    <h3 className="text-sm font-black text-app-text leading-tight">
                      {item.nome}
                    </h3>
                    <p className="text-[11px] text-app-muted mt-1 leading-snug">
                      {item.descricao}
                    </p>
                  </div>

                  {/* Ação: Equipar ou Comprar */}
                  <div className="pt-4 mt-auto border-t border-app-border">
                    {desbloqueado ? (
                      <button
                        type="button"
                        onClick={() => handleComprarOuEquipar(item)}
                        disabled={equipado || comprando}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          equipado
                            ? "bg-app-bg text-app-muted cursor-default"
                            : "bg-app-primary hover:bg-app-hover text-white shadow-sm active:scale-95"
                        }`}
                      >
                        {equipado ? <><CheckCircle2 size={14} /> Ativo</> : "Equipar Tema"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleComprarOuEquipar(item)}
                        disabled={comprando}
                        className="w-full py-2.5 rounded-xl bg-app-bg hover:bg-app-border border border-app-border text-app-primary font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                      >
                        <Coins size={14} className="fill-app-primary" />
                        <span>Desbloquear ({item.preco})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}