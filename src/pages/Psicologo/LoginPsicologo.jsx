import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ShieldCheck, Mail, Lock, User, Sparkles, LogIn, UserPlus, Eye, EyeOff 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";

// Validação de formato CRP (2 dígitos da região + '/' + 4 a 6 dígitos do registro)
function validarCRP(crpStr) {
  const regexCRP = /^\d{2}\/\d{4,6}$/;
  return regexCRP.test(crpStr);
}

export default function LoginPsicologo() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [nome, setNome] = useState("");
  const [crp, setCrp] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para a Modal de Confirmação de Código
  const [modalCodigo, setModalCodigo] = useState(false);
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);
  const [erroCodigo, setErroCodigo] = useState("");
  const [loadingModal, setLoadingModal] = useState(false);

  // Estado temporário para reter os dados do formulário antes de criar a conta
  const [dadosCadastroPendente, setDadosCadastroPendente] = useState(null);

  const CODIGO_MOCKADO = "123456";
  const codigoCompleto = codigo.every((digit) => digit !== "");

  // Aplica a máscara do CRP dinamicamente (00/000000)
  const handleCrpChange = (e) => {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length > 2) {
      valor = valor.replace(/^(\d{2})(\d)/, "$1/$2");
    }

    setCrp(valor);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      setLoading(true);
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, senha);
        const user = userCredential.user;

        // Validação: Verifica se o UID existe na coleção de psicólogos
        const psicologoDocRef = doc(db, "psicologos", user.uid);
        const psicologoSnap = await getDoc(psicologoDocRef);

        if (!psicologoSnap.exists()) {
          await signOut(auth);
          toast.error("Acesso negado: Esta conta não pertence a um psicólogo cadastrado.");
          setLoading(false);
          return;
        }

        toast.success("Login realizado com sucesso!");
        navigate("/menuPsicologo");
      } catch (error) {
        console.error(error);
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
          toast.error("E-mail ou senha incorretos.");
        } else {
          toast.error("Ocorreu um erro ao realizar o login.");
        }
      } finally {
        setLoading(false);
      }
    } else {
      // VALIDAÇÕES DO CADASTRO (sem criar no banco ainda)
      if (!nome || !crp) {
        toast.error("Por favor, preencha o Nome e o CRP.");
        return;
      }

      if (!validarCRP(crp)) {
        toast.error("Por favor, informe um CRP válido (Ex: 06/123456).");
        return;
      }

      if (senha !== confirmarSenha) {
        toast.error("As senhas não coincidem.");
        return;
      }

      if (senha.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
      }

      // Guarda os dados temporariamente para uso pós-verificação de código
      setDadosCadastroPendente({ nome, crp, email, senha });
      setCodigo(["", "", "", "", "", ""]);
      setErroCodigo("");
      setModalCodigo(true);
      toast.info("Código de verificação enviado para seu e-mail!");
    }
  };

  // Manipulação do código de 6 dígitos
  const handleCodigoChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const novoCodigo = [...codigo];
    novoCodigo[index] = value;
    setCodigo(novoCodigo);
    setErroCodigo("");

    if (value && index < 5) {
      document.getElementById(`codigo-psicologo-${index + 1}`)?.focus();
    }
  };

  const handleReenviarCodigo = () => {
    toast.success("Código de verificação reenviado para o seu e-mail!");
  };

  // CONFIRMAÇÃO DO CÓDIGO E CRIAÇÃO REAL DA CONTA NO FIREBASE
  const handleConfirmarCodigo = async () => {
    const codigoDigitado = codigo.join("");

    if (codigoDigitado !== CODIGO_MOCKADO) {
      setErroCodigo("Código inválido. Tente novamente.");
      return;
    }

    setErroCodigo("");
    setLoadingModal(true);

    try {
      const { nome, crp, email, senha } = dadosCadastroPendente;

      // 1. Cria o utilizador no Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      // 2. Grava a conta na coleção do Firestore
      await setDoc(doc(db, "psicologos", user.uid), {
        nome,
        crp,
        email,
        criadoEm: new Date().toISOString(),
        emailVerificado: true
      });

      toast.success("E-mail verificado e conta criada com sucesso!");
      setModalCodigo(false);
      setDadosCadastroPendente(null);
      navigate("/menuPsicologo");

    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        setErroCodigo("Este e-mail já está em uso por outra conta.");
      } else {
        setErroCodigo("Falha ao criar conta. Tente novamente.");
      }
    } finally {
      setLoadingModal(false);
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
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-peach-500 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Voltar para a Tela Inicial
          </button>
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
              {isLogin ? "Acesso Profissional" : "Cadastro"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {isLogin ? "Entre com sua conta para gerenciar pacientes." : "Cadastre-se para começar a atender no MindQuest."}
            </p>
          </div>

          {/* Abas de Alternância */}
          <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1.5 rounded-2xl mb-6">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setMostrarSenha(false);
                setMostrarConfirmarSenha(false);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isLogin ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setMostrarSenha(false);
                setMostrarConfirmarSenha(false);
              }}
              className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                        inputMode="numeric"
                        placeholder="Ex: 06/123456" 
                        maxLength={9}
                        value={crp} 
                        onChange={handleCrpChange} 
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
                  type={mostrarSenha ? "text" : "password"} 
                  placeholder="••••••••" 
                  value={senha} 
                  onChange={(e) => setSenha(e.target.value)} 
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                  required 
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                  title={mostrarSenha ? "Ocultar senha" : "Ver senha"}
                >
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Confirmar Senha</label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input 
                      type={mostrarConfirmarSenha ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={confirmarSenha} 
                      onChange={(e) => setConfirmarSenha(e.target.value)} 
                      className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 transition-colors cursor-pointer"
                      title={mostrarConfirmarSenha ? "Ocultar senha" : "Ver senha"}
                    >
                      {mostrarConfirmarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 mt-2 rounded-2xl bg-[#E97451] hover:bg-[#C06043] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex justify-center items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Sparkles className="size-5 animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn size={18} /> Entrar no Painel
                </>
              ) : (
                <>
                  <UserPlus size={18} /> Verificar E-mail
                </>
              )}
            </button>
          </form>

        </motion.div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE CÓDIGO */}
      <AnimatePresence>
        {modalCodigo && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border border-peach-100 relative"
            >
              <button
                type="button"
                onClick={() => {
                  setModalCodigo(false);
                  setDadosCadastroPendente(null);
                }}
                className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-peach-50 border border-peach-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Mail className="text-[#E97451] size-7" />
              </div>

              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">
                Verificar E-mail Profissional
              </h2>

              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Digite o código de 6 dígitos enviado para <br />
                <strong className="text-slate-700">{email}</strong>
              </p>

              {/* Inputs dos 6 Dígitos */}
              <div className="flex justify-center gap-2 mb-4">
                {codigo.map((digit, index) => (
                  <input
                    key={index}
                    id={`codigo-psicologo-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodigoChange(e.target.value, index)}
                    className="w-10 h-12 text-center text-lg font-bold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-peach-300 focus:bg-white text-slate-800 transition-all"
                  />
                ))}
              </div>

              {erroCodigo && (
                <p className="text-rose-500 text-xs mb-4 font-semibold">
                  {erroCodigo}
                </p>
              )}

              <button
                type="button"
                onClick={handleConfirmarCodigo}
                disabled={!codigoCompleto || loadingModal}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-md flex items-center justify-center gap-2 ${
                  !codigoCompleto || loadingModal
                    ? "bg-slate-300 cursor-not-allowed shadow-none"
                    : "bg-[#E97451] hover:bg-[#C06043] shadow-orange-500/20 active:scale-95 cursor-pointer"
                }`}
              >
                {loadingModal ? (
                  <Sparkles className="size-4 animate-spin" />
                ) : (
                  "Confirmar e Criar Conta"
                )}
              </button>

              <button
                type="button"
                onClick={handleReenviarCodigo}
                className="mt-4 text-xs font-semibold text-[#E97451] hover:underline block mx-auto cursor-pointer"
              >
                Reenviar código
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}