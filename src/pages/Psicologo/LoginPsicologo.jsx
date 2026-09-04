import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ShieldCheck, Mail, Lock, User, 
  BriefcaseMedical, Sparkles, LogIn, UserPlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";

export default function LoginPsicologo() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [crp, setCrp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, senha);
        toast.success("Login realizado com sucesso!");
        navigate("/painel-psicologo");
      } else {
        if (!nome || !crp) {
          toast.error("Por favor, preencha o Nome e o CRP.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        await setDoc(doc(db, "psicologos", user.uid), {
          nome,
          crp,
          email,
          especialidade: "Psicologia Clínica",
          bio: "Olá! Sou profissional cadastrado no MindQuest Pro.",
          criadoEm: new Date().toISOString()
        });

        toast.success("Conta profissional criada com sucesso!");
        navigate("/painel-psicologo");
      }
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está cadastrado.");
      } else if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        toast.error("E-mail ou senha incorretos.");
      } else if (error.code === "auth/weak-password") {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
      } else {
        toast.error("Ocorreu um erro na autenticação.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans flex flex-col justify-center items-center relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-peach-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Topo: Voltar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/home")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-peach-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Início
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/80 border border-peach-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">MindQuest Pro</span>
          </div>
        </div>

        {/* Container do Formulário */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.75rem] border border-peach-100 shadow-xl shadow-orange-900/5 p-8 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 size-40 rounded-full bg-peach-100/50 blur-3xl pointer-events-none" />

          {/* Cabeçalho da Tela */}
          <div className="text-center mb-8">
            <div className="relative size-16 mx-auto mb-4 rounded-2xl bg-peach-50 flex items-center justify-center text-peach-500 shadow-inner border border-peach-100">
              <img src={logoReduzido} alt="MindQuest Logo" className="w-8 h-8 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isLogin ? "Acesso Profissional" : "Cadastro Pro"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isLogin ? "Entre com sua conta para gerenciar pacientes." : "Cadastre-se para começar a atender no MindQuest."}
            </p>
          </div>

          {/* Abas de Alternância */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <AnimatePresence>
              {!isLogin && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Nome Completo</label>
                    <div className="relative mt-1">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Dr(a). Nome Sobrenome" 
                        value={nome} 
                        onChange={(e) => setNome(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                        required={!isLogin}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Registro Profissional (CRP)</label>
                    <div className="relative mt-1">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Ex: 06/123456" 
                        value={crp} 
                        onChange={(e) => setCrp(e.target.value)} 
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                        required={!isLogin}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">E-mail Profissional</label>
              <div className="relative mt-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                  type="email" 
                  placeholder="psicologo@email.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                  required 
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Senha</label>
              <div className="relative mt-1">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)} 
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl bg-[#E97451] hover:bg-[#C06043] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Sparkles className="size-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn size={18} /> Entrar no Painel
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Concluir Cadastro
                </>
              )}
            </button>
          </form>

        </motion.div>
      </div>
    </div>
  );
}