import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, Mail, Camera, ShieldCheck, KeyRound, 
  LogOut, Save, Sparkles, ChevronRight, X, Check, Pencil 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { 
  onAuthStateChanged, signOut, updateEmail, updatePassword, 
  EmailAuthProvider, reauthenticateWithCredential 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import BottomNavPsicologo from "../../components/BottomNavPsicologo";

const schema = z.object({
  nome: z.string().min(3, "Digite um nome válido"),
  email: z.string().email("Insira um e-mail válido"),
});

function EditableField({ icon: Icon, label, type = "text", editing, register, onEdit, onCancel, onConfirm }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
          {label}
        </label>
        {editing && (
          <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider">
            Editando
          </span>
        )}
      </div>

      <div className="relative">
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 z-10 ${editing ? "text-orange-400" : "text-slate-400"}`} />
        <input
          type={type}
          disabled={!editing}
          {...register}
          className={`w-full pl-12 py-4 rounded-2xl border outline-none text-sm font-medium transition-all ${
            editing
              ? "bg-white border-orange-300 ring-4 ring-orange-400/10 text-slate-700 pr-24"
              : "bg-slate-50/80 border-slate-100 text-slate-700 pr-14"
          }`}
        />

        {!editing ? (
          <button
            type="button"
            onClick={onEdit}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 shadow-sm hover:text-orange-500 hover:bg-orange-50 hover:border-orange-200 transition-all cursor-pointer"
            title={`Editar ${label}`}
          >
            <Pencil size={15} />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={onCancel}
              className="size-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
              title="Cancelar"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="size-9 rounded-xl flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 transition-all cursor-pointer"
              title="Concluir"
            >
              <Check size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerfilPsicologo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  const [editandoCrp, setEditandoCrp] = useState(false);

  const [fotoURL, setFotoURL] = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState({ nome: "", email: "", crp: "" });

  // Modais
  const [modalSenha, setModalSenha] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  // Alteração de Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      crp: ""
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/home");
        return;
      }

      try {
        let nomeAtual = "";
        let emailAtual = user.email || "";
        let crpAtual = "";

        const docRef = doc(db, "psicologos", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dados = docSnap.data();
          nomeAtual = dados.nome || "";
          emailAtual = dados.email || user.email || "";
          crpAtual = dados.crp || "";
          if (dados.fotoURL) setFotoURL(dados.fotoURL);
        }

        setDadosOriginais({ nome: nomeAtual, email: emailAtual, crp: crpAtual });
        reset({ nome: nomeAtual, email: emailAtual, crp: crpAtual });
      } catch (err) {
        console.error(err);
        toast.error("Erro ao carregar dados do perfil.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, reset]);

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoURL(reader.result);
    reader.readAsDataURL(file);
  };

  const onSubmit = async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setSalvandoPerfil(true);

      // Atualiza o e-mail no Authentication caso tenha sido alterado
      if (data.email.trim() !== user.email) {
        try {
          await updateEmail(user, data.email.trim());
        } catch (authErr) {
          if (authErr.code === "auth/requires-recent-login") {
            toast.error("Por segurança, saia e entre novamente para alterar o e-mail.");
            setSalvandoPerfil(false);
            return;
          }
          throw authErr;
        }
      }

      // Atualiza no Firestore
      await setDoc(doc(db, "psicologos", user.uid), {
        nome: data.nome.trim(),
        email: data.email.trim(),
        crp: data.crp.trim(),
        fotoURL: fotoURL || "",
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      setDadosOriginais({
        nome: data.nome.trim(),
        email: data.email.trim(),
        crp: data.crp.trim()
      });

      setEditandoNome(false);
      setEditandoEmail(false);
      setEditandoCrp(false);

      toast.success("Perfil profissional atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar alterações.");
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();

    if (!senhaAtual) {
      toast.error("Por favor, digite sua senha atual.");
      return;
    }
    if (novaSenha.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As novas senhas não coincidem.");
      return;
    }

    setSalvandoSenha(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) return;

      const credencial = EmailAuthProvider.credential(user.email, senhaAtual);
      await reauthenticateWithCredential(user, credencial);

      await updatePassword(user, novaSenha);

      toast.success("Senha alterada com sucesso!");
      setModalSenha(false);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        toast.error("A senha atual digitada está incorreta.");
      } else if (err.code === "auth/requires-recent-login") {
        toast.error("Por segurança, faça login novamente antes de trocar a senha.");
      } else {
        toast.error("Erro ao alterar senha. Tente novamente.");
      }
    } finally {
      setSalvandoSenha(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      toast.success("Sessão encerrada com sucesso.");
      navigate("/home");
    } catch {
      toast.error("Erro ao sair da conta.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-[#E97451] size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32 relative">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo com botão Sair */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Painel Clínico</span>
          <button 
            type="button"
            onClick={() => setModalLogout(true)}
            className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
            title="Sair da conta"
          >
            <LogOut size={14} /> Sair
          </button>
        </div>

        {/* Card do Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-peach-50 shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div
            className="relative size-28 mx-auto mb-4 cursor-pointer group"
            onClick={() => document.getElementById("fotoProInput").click()}
          >
            <div className="size-full rounded-[2.25rem] bg-gradient-to-br from-orange-300 to-[#E97451] flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shadow-orange-900/10">
              {fotoURL ? (
                <img src={fotoURL} alt="Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="size-12 text-white" />
              )}
            </div>
            <div className="absolute inset-0 bg-slate-900/40 rounded-[2.25rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <Camera className="size-8 text-white" />
            </div>
          </div>
          <input type="file" id="fotoProInput" accept="image/*" className="hidden" onChange={handleFotoChange} />

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{dadosOriginais.nome || "Seu Nome"}</h1>
        </motion.div>

        {/* Formulário: Dados Profissionais e Acesso */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white space-y-5">
          <div>
            <span className="text-[10px] font-bold text-[#E97451] uppercase tracking-[0.18em]">Identidade</span>
            <h2 className="text-lg font-black text-slate-800 mt-1">Dados Profissionais</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <EditableField 
              icon={User}
              label="Nome Completo"
              editing={editandoNome}
              register={register("nome")}
              onEdit={() => setEditandoNome(true)}
              onCancel={() => {
                setValue("nome", dadosOriginais.nome);
                setEditandoNome(false);
              }}
              onConfirm={() => setEditandoNome(false)}
            />
            {errors.nome && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.nome.message}</p>}

            <EditableField 
              icon={Mail}
              label="E-mail de Acesso"
              type="email"
              editing={editandoEmail}
              register={register("email")}
              onEdit={() => setEditandoEmail(true)}
              onCancel={() => {
                setValue("email", dadosOriginais.email);
                setEditandoEmail(false);
              }}
              onConfirm={() => setEditandoEmail(false)}
            />
            {errors.email && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.email.message}</p>}

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
                  Registro Profissional (CRP)
                </label>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck size={11} /> Registro Ativo
                </span>
              </div>

              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                <input
                  type="text"
                  value={dadosOriginais.crp}
                  disabled
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 bg-slate-100/60 text-slate-500 font-semibold text-sm cursor-not-allowed select-none"
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={salvandoPerfil}
              className="w-full mt-4 py-4 rounded-2xl bg-[#E97451] hover:bg-[#C06043] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {salvandoPerfil ? <Sparkles className="size-5 animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
            </button>
          </form>
        </div>

        {/* Segurança: Alterar Senha */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
          <div className="mb-4">
            <span className="text-[10px] font-bold text-[#E97451] uppercase tracking-[0.18em]">Acesso</span>
            <h2 className="text-lg font-black text-slate-800 mt-1">Segurança</h2>
          </div>

          <button 
            type="button" 
            onClick={() => setModalSenha(true)} 
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                <KeyRound size={17} className="text-slate-400" />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-white">Alterar Senha</span>
                <span className="text-[10px] text-white">Atualize sua senha de acesso</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-slate-300" />
          </button>
        </div>

      </div>

      {/* Modal: Alterar Senha */}
      <AnimatePresence>
        {modalSenha && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setModalSenha(false)} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="size-12 rounded-2xl bg-orange-50 text-[#E97451] flex items-center justify-center mb-4">
                <KeyRound size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-800">Alterar Senha</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">Confirme sua senha atual antes de definir uma nova.</p>
              
              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Senha Atual</label>
                  <input 
                    type="password" 
                    placeholder="Digite sua senha atual" 
                    value={senhaAtual} 
                    onChange={(e) => setSenhaAtual(e.target.value)} 
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-300"
                    required 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)} 
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-300"
                    required 
                    minLength={6} 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Repita a nova senha" 
                    value={confirmarSenha} 
                    onChange={(e) => setConfirmarSenha(e.target.value)} 
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-300"
                    required 
                    minLength={6} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={salvandoSenha}
                  className="w-full py-4 rounded-2xl bg-[#E97451] hover:bg-[#C06043] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {salvandoSenha ? <Sparkles className="size-5 animate-spin" /> : <><Check size={16} /> Salvar Nova Senha</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* Modal: Confirmar Logout */}
        {modalLogout && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 30, scale: 0.95 }} 
              animate={{ y: 0, scale: 1 }} 
              exit={{ y: 30, scale: 0.95 }} 
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative text-center"
            >
              <button 
                type="button"
                onClick={() => setModalLogout(false)} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="size-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                <LogOut size={26} />
              </div>

              <h2 className="text-xl font-black text-slate-800">Encerrar Sessão</h2>
              <p className="text-xs text-slate-500 mt-1.5 mb-6 leading-relaxed">
                Deseja realmente sair da sua conta de psicólogo?
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalLogout(false)}
                  className="flex-1 py-3.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalLogout(false);
                    handleLogOut();
                  }}
                  className="flex-1 py-3.5 text-xs font-bold text-white bg-red-500 hover:bg-red-600 rounded-2xl shadow-md shadow-red-500/20 transition-all cursor-pointer"
                >
                  Sim, Sair
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavPsicologo />
    </div>
  );
}