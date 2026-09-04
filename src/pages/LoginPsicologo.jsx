import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ShieldCheck, Mail, Lock, User, 
  BriefcaseMedical, Sparkles, LogIn, UserPlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";

export default function LoginPsicologo() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Alterna entre Login e Cadastro

  // Estados dos campos do formulário
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
        // Fluxo de Login
        await signInWithEmailAndPassword(auth, email, senha);
        toast.success("Login realizado com sucesso!");
        navigate("/painel-psicologo");
      } else {
        // Fluxo de Cadastro de Novo Psicólogo
        if (!nome || !crp) {
          toast.error("Por favor, preencha o Nome e o CRP.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Salva os dados iniciais na coleção "psicologos" do Firestore
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff_0%,_#f8fafc_38%,_#ffffff_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans flex flex-col justify-center items-center">
      <div className="w-full max-w-md space-y-6">
        
        {/* TOPO: VOLTAR */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Início
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">MindQuest Pro</span>
          </div>
        </div>

        {/* CONTAINER DO FORMULÁRIO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.75rem] border border-blue-100 shadow-xl shadow-blue-900/5 p-8 relative overflow-hidden"
        >
          <div className="absolute -top-16 -right-16 size-40 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

          {/* CABEÇALHO DA TELA */}
          <div className="text-center mb-8">
            <div className="relative size-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
              <BriefcaseMedical size={28} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {isLogin ? "Acesso Profissional" : "Cadastro Pro"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isLogin ? "Entre com sua conta para gerenciar pacientes." : "Cadastre-se para começar a atender no MindQuest."}
            </p>
          </div>

          {/* ABAS DE ALTERNÂNCIA (LOGIN / CADASTRO) */}
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

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* CAMPOS EXTRAS APENAS PARA CADASTRO */}
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
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50"
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