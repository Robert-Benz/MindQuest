import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User, Mail, Sparkles, ArrowLeft, Save, CheckCircle2, Camera, Flame, Award,
  Bell, Lock, HelpCircle, ChevronRight, Pencil, KeyRound, Check, X, Headphones,
  Smile, Send, Accessibility, ShieldCheck, Stethoscope, MessageSquare, Paperclip,
  FileText, LogOut, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, updateEmail, updatePassword, signOut, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";

import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";

// Validação com Zod
const schema = z.object({
  nome: z.string().min(3, "Como podemos te chamar?"),
  email: z.string().email("Insira um e-mail válido"),
});

// Componente CustomSelect com suporte a Múltipla Escolha (isMulti)
function CustomSelect({ value = [], onChange, placeholder, options, icon: Icon, isMulti = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    if (isMulti) {
      const currentArray = Array.isArray(value) ? value : [];
      if (currentArray.includes(optionValue)) {
        onChange(currentArray.filter((v) => v !== optionValue));
      } else {
        onChange([...currentArray, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayLabel = () => {
    if (isMulti) {
      const currentArray = Array.isArray(value) ? value : [];
      if (currentArray.length === 0) return placeholder;
      if (currentArray.length === 1) return options.find((o) => o.value === currentArray[0])?.label;
      return `${currentArray.length} opções selecionadas`;
    } else {
      const selectedOption = options.find((o) => o.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const temSelecao = isMulti ? (Array.isArray(value) && value.length > 0) : !!value;

  return (
    <div className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-full flex items-center justify-between pl-12 pr-4 py-4 rounded-2xl border bg-slate-50/80 hover:bg-white transition-all duration-200 outline-none ${
          isOpen ? "border-orange-300 bg-white shadow-md ring-4 ring-orange-400/10" : "border-slate-100"
        }`}
      >
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 ${temSelecao ? "text-orange-400" : "text-slate-400"}`} />
        )}
        <span className={`text-sm text-left truncate pr-2 ${temSelecao ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
          {getDisplayLabel()}
        </span>
        <ChevronRight className={`size-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden p-1.5 max-h-56 overflow-y-auto custom-scrollbar"
          >
            {options.map((option) => {
              const currentArray = Array.isArray(value) ? value : [];
              const isSelected = isMulti ? currentArray.includes(option.value) : value === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all ${
                    isSelected ? "bg-orange-50 text-orange-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && isMulti && <Check size={14} className="text-orange-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Campo editável
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
              title="Concluir edição"
            >
              <Check size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente Toggle
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 cursor-pointer ${
        checked ? "bg-orange-400" : "bg-slate-200"
      }`}
    >
      <div
        className={`bg-white size-4 rounded-full shadow-sm transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("perfil"); 
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [userXP, setUserXP] = useState(0);
  
  // Código de identificação do paciente
  const [codigoUnico, setcodigoUnico] = useState("");

  // Estados de Salvamento do Perfil
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);
  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  
  const [fotoURL, setFotoURL] = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState({ nome: "", email: "" });

  // Estados do Terapeuta e Chat
  const [terapeutaVinculado, setTerapeutaVinculado] = useState(null);
  const [mensagensChat, setMensagensChat] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  // Modais
  const [modalNotificacoes, setModalNotificacoes] = useState(false);
  const [modalPrivacidade, setModalPrivacidade] = useState(false);
  const [modalAjuda, setModalAjuda] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  // Estados de Alteração de Senha
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Configurações e Notificações
  const [notifMeditacao, setNotifMeditacao] = useState(true);
  const [horarioMeditacao, setHorarioMeditacao] = useState("08:00"); 
  const [notifDiario, setNotifDiario] = useState(true);
  const [horarioDiario, setHorarioDiario] = useState("20:00"); 
  const [compartilharPsicologo, setCompartilharPsicologo] = useState(false);
  const [assuntoAjuda, setAssuntoAjuda] = useState("");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "", 
      email: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        let nomeAtual = "";
        let emailAtual = user.email || "";

        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const dados = userDocSnap.data();
          nomeAtual = dados.nome || "";
          emailAtual = dados.email || user.email || "";
          setUserXP(dados.xp || 0);
          if (dados.fotoURL) setFotoURL(dados.fotoURL);
          if (dados.terapeuta) setTerapeutaVinculado(dados.terapeuta);

          // Verifica se já existe código de identificação ou gera um novo
          if (dados.codigoUnico) {
            setcodigoUnico(dados.codigoUnico);
          } else {
            const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let novoCodigo = "MQ-";
            for (let i = 0; i < 5; i++) {
              novoCodigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            await setDoc(userDocRef, { codigoUnico: novoCodigo }, { merge: true });
            setcodigoUnico(novoCodigo);
          }
        }

        setDadosOriginais({ nome: nomeAtual, email: emailAtual });

        reset({
          nome: nomeAtual,
          email: emailAtual,
        });

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Não foi possível carregar seu perfil.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, reset]);

  // Carregar mensagens do Chat em tempo real
  useEffect(() => {
    const user = auth.currentUser;
    if (!user || !terapeutaVinculado) return;

    const chatRef = collection(db, "usuarios", user.uid, "chatTerapeuta");
    const q = query(chatRef, orderBy("data", "asc"));

    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setMensagensChat(msgs);
    });

    return () => unsubscribeChat();
  }, [terapeutaVinculado]);

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      toast.success("Sessão encerrada com sucesso.");
      navigate("/home");
    } catch {
      toast.error("Erro ao sair da conta.");
    }
  };

  const enviarMensagemChat = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      await addDoc(collection(db, "usuarios", user.uid, "chatTerapeuta"), {
        texto: novaMensagem.trim(),
        remetente: "paciente",
        data: new Date().toISOString()
      });

      setNovaMensagem("");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao enviar mensagem.");
    }
  };

  const handleEnviarDocumento = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".pdf,.doc,.docx,.png,.jpg";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const user = auth.currentUser;
        await addDoc(collection(db, "usuarios", user.uid, "chatTerapeuta"), {
          texto: `[Documento anexado: ${file.name}]`,
          remetente: "paciente",
          documento: true,
          data: new Date().toISOString()
        });
        toast.success("Documento enviado para o terapeuta!");
      } catch {
        toast.error("Erro ao enviar documento.");
      }
    };
    input.click();
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setFotoURL(reader.result);
    reader.readAsDataURL(file);
  };

  const iniciarEdicaoNome = () => setEditandoNome(true);
  const cancelarEdicaoNome = () => {
    setValue("nome", dadosOriginais.nome);
    setEditandoNome(false);
  };
  const confirmarEdicaoNome = () => setEditandoNome(false);

  const iniciarEdicaoEmail = () => setEditandoEmail(true);
  const cancelarEdicaoEmail = () => {
    setValue("email", dadosOriginais.email);
    setEditandoEmail(false);
  };
  const confirmarEdicaoEmail = () => setEditandoEmail(false);

  const onSubmit = async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setSalvandoPerfil(true);

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

      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, {
        nome: data.nome.trim(),
        email: data.email.trim(),
        fotoURL: fotoURL || "",
        atualizadoEm: new Date().toISOString()
      }, { merge: true });

      setDadosOriginais({ 
        nome: data.nome.trim(), 
        email: data.email.trim() 
      });
      setEditandoNome(false);
      setEditandoEmail(false);

      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 3000);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
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
    if (senhaAtual === novaSenha) {
      toast.error("A nova senha deve ser diferente da senha atual.");
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
    } catch (error) {
      console.error("Erro na alteração de senha:", error);
      if (error.code === "auth/wrong-password" || error.code === "auth/invalid-credential") {
        toast.error("A senha atual digitada está incorreta.");
      } else if (error.code === "auth/requires-recent-login") {
        toast.error("Por segurança, saia e entre novamente antes de trocar a senha.");
      } else {
        toast.error("Não foi possível alterar a senha. Tente novamente.");
      }
    } finally {
      setSalvandoSenha(false);
    }
  };

  const enviarMensagemAjuda = (e) => {
    e.preventDefault();
    if (!assuntoAjuda) {
      toast.error("Por favor, selecione um assunto no menu.");
      return;
    }
    toast.success("Mensagem enviada com sucesso! Retornaremos em breve.");
    setModalAjuda(false);
    setAssuntoAjuda(""); 
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <div className="size-16 rounded-3xl bg-orange-50 flex items-center justify-center">
          <Sparkles className="text-orange-400 size-8 animate-pulse" />
        </div>
      </div>
    );
  }

  const nivelAtual = Math.floor(userXP / 100) + 1;
  const xpProgresso = userXP % 100;
  const proximoNivelXP = nivelAtual * 100;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32 relative">
      
      <AnimatePresence>
        {showSuccessBadge && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-emerald-100 px-5 py-3 rounded-full shadow-xl shadow-emerald-900/10 text-sm font-semibold text-emerald-600"
          >
            <CheckCircle2 className="size-5 text-emerald-500" />
            Perfil atualizado!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo com Botão de Sair e Abas */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              type="button"
              onClick={() => navigate("/Menu")} 
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <button 
              type="button"
              onClick={() => setModalLogout(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
              title="Sair da conta"
            >
              <LogOut size={14} /> Sair
            </button>
          </div>

          <div className="flex gap-1 p-1 rounded-2xl bg-white/80 border border-slate-100 shadow-sm backdrop-blur w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setAbaAtiva("perfil")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${abaAtiva === "perfil" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              Perfil
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("terapeuta")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${abaAtiva === "terapeuta" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              <Stethoscope size={13} /> Terapeuta
            </button>
          </div>
        </div>

        {/* Header do Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-orange-100/50 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 size-48 rounded-full bg-pink-100/40 blur-3xl" />

          <div
            className="relative size-28 mx-auto mb-5 cursor-pointer group"
            onClick={() => document.getElementById("fotoInput").click()}
          >
            <div className="size-full rounded-[2.25rem] bg-gradient-to-br from-orange-200 via-pink-200 to-orange-300 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg shadow-orange-900/10">
              {fotoURL ? (
                <img src={fotoURL} alt="Seu perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="size-12 text-white" />
              )}
            </div>
            
            <div className="absolute inset-0 bg-slate-900/40 rounded-[2.25rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <Camera className="size-8 text-white" />
            </div>

            <div className="absolute -bottom-2 -right-4 bg-white px-3 py-1.5 rounded-full shadow-md border border-orange-100 flex items-center gap-1.5">
              <Sparkles className="size-3 text-orange-400" />
              <span className="text-[10px] font-black text-orange-500 tracking-wide">LVL {nivelAtual}</span>
            </div>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Seu Perfil</h1>
          <p className="text-xs text-slate-400 mt-1">Seu espaço para acompanhar sua jornada de autocuidado</p>

          <div className="max-w-[270px] mx-auto mt-6">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">
              <span>{userXP} XP</span>
              <span>{proximoNivelXP - userXP} XP restantes</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden p-[1px]">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-orange-300 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgresso}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Aba Perfil */}
        {abaAtiva === "perfil" && (
          <div className="space-y-6">
            
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Seus dados</span>
                  <h2 className="text-lg font-black text-slate-800 mt-1">Informações pessoais</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input type="file" id="fotoInput" accept="image/*" className="hidden" onChange={handleFotoChange} />
                
                <EditableField 
                  icon={User} 
                  label="Seu Nome" 
                  editing={editandoNome} 
                  register={register("nome")} 
                  onEdit={iniciarEdicaoNome} 
                  onCancel={cancelarEdicaoNome} 
                  onConfirm={confirmarEdicaoNome} 
                />
                {errors.nome && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.nome.message}</p>}

                <EditableField 
                  icon={Mail} 
                  label="E-mail de acesso" 
                  type="email" 
                  editing={editandoEmail} 
                  register={register("email")} 
                  onEdit={iniciarEdicaoEmail} 
                  onCancel={cancelarEdicaoEmail} 
                  onConfirm={confirmarEdicaoEmail} 
                />
                {errors.email && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.email.message}</p>}

                <div className="h-px bg-slate-100 my-7" />

                <button 
                  type="submit" 
                  disabled={salvandoPerfil}
                  className="w-full mt-7 py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-[#E97451] hover:from-orange-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {salvandoPerfil ? <Sparkles className="size-5 animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Seu progresso</span>
                  <h2 className="text-lg font-black text-slate-800 mt-1">Minha Jornada</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold">
                  <CheckCircle2 size={12} /> Ativo
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-4 text-center">
                  <div className="size-9 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center text-orange-500 shadow-sm">
                    <Headphones size={16} />
                  </div>
                  <strong className="block text-xl font-black text-slate-800">12</strong>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Meditações</span>
                </div>
                <div className="bg-pink-50/70 border border-pink-100 rounded-2xl p-4 text-center">
                  <div className="size-9 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center text-pink-400 shadow-sm">
                    <Smile size={16} />
                  </div>
                  <strong className="block text-xl font-black text-slate-800">8</strong>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Diários</span>
                </div>
                <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 text-center">
                  <div className="size-9 mx-auto mb-2 rounded-xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                    <Flame size={16} />
                  </div>
                  <strong className="block text-xl font-black text-slate-800">5</strong>
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Sequência</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/conquistas")}
                className="w-full mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 flex items-center justify-between text-left transition-all hover:border-orange-200 active:scale-[0.99] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500 group-hover:scale-105 transition-transform">
                    <Award size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Conquistas desbloqueadas</h3>
                    <p className="text-[10px] text-slate-500 mt-1">3 de 12 badges conquistadas</p>
                  </div>
                </div>
                <ChevronRight size={17} className="text-orange-300 group-hover:text-orange-500 transition-colors" />
              </button>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
              <div className="mb-5">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Segurança</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Configurações</h2>
              </div>
              <div className="space-y-2">
                <button 
                  type="button" 
                  onClick={() => setModalNotificacoes(true)} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Bell size={17} className="text-slate-400" /></div>
                    <div className="text-left"><span className="block text-sm font-bold text-slate-700">Notificações e Horários</span><span className="text-[10px] text-slate-400">Personalize seus lembretes</span></div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalSenha(true)} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><KeyRound size={17} className="text-slate-400" /></div>
                    <div className="text-left"><span className="block text-sm font-bold text-slate-700">Alterar Senha</span><span className="text-[10px] text-slate-400">Atualize sua senha de acesso</span></div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalPrivacidade(true)} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Lock size={17} className="text-slate-400" /></div>
                    <div className="text-left"><span className="block text-sm font-bold text-slate-700">Privacidade (LGPD)</span><span className="text-[10px] text-slate-400">Gerenciamento de dados</span></div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Aba Terapeuta */}
        {abaAtiva === "terapeuta" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.18em]">Acompanhamento Clínico</span>
                <h2 className="text-xl font-black text-slate-800 mt-1">Seu Terapeuta</h2>
                <p className="text-xs text-slate-400 mt-0.5">Canal de comunicação seguro e confidencial.</p>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl">
                <Stethoscope size={20} />
              </div>
            </div>

            {!terapeutaVinculado ? (
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] text-center space-y-5">
                <div className="size-12 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-sm text-blue-500">
                  <Stethoscope size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Conecte seu Psicólogo</h3>
                  <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
                    Compartilhe seu código com seu terapeuta para que ele possa acompanhar sua evolução.
                  </p>
                </div>

                {/* BLOCO DO CÓDIGO DO PACIENTE */}
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl max-w-xs mx-auto shadow-sm space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-orange-500 block">
                    Seu Código de Paciente
                  </span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xl font-mono font-black tracking-widest text-slate-800">
                      {codigoUnico || "Carregando..."}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (codigoUnico) {
                          navigator.clipboard.writeText(codigoUnico);
                          toast.success("Código copiado!");
                        }
                      }}
                      className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-all cursor-pointer"
                      title="Copiar código"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center shadow-md shadow-blue-500/20">
                      👨‍⚕️
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800">{terapeutaVinculado.nome}</h3>
                      <p className="text-[10px] text-blue-600 font-bold">{terapeutaVinculado.crp} • Vinculado</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      if (window.confirm("Deseja desconectar deste terapeuta?")) {
                        setTerapeutaVinculado(null);
                        setDoc(doc(db, "usuarios", auth.currentUser.uid), { terapeuta: null }, { merge: true });
                        toast.success("Desconectado do terapeuta.");
                      }
                    }}
                    className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                  >
                    Desconectar
                  </button>
                </div>

                <div className="border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col h-80">
                  <div className="p-3 bg-white border-b border-slate-100 rounded-t-2xl flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <MessageSquare size={12} className="text-blue-500" /> Chat Direto e Seguro
                    </span>
                    <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">Criptografado</span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                    {mensagensChat.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                        <p>Nenhuma mensagem ainda.</p>
                        <p className="text-[10px] mt-0.5">Envie uma mensagem ou compartilhe documentos com seu terapeuta.</p>
                      </div>
                    ) : (
                      mensagensChat.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.remetente === "paciente" ? "items-end" : "items-start"}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                            msg.remetente === "paciente" 
                              ? "bg-blue-600 text-white rounded-br-none shadow-sm" 
                              : "bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm"
                          }`}>
                            {msg.documento ? (
                              <div className="flex items-center gap-2">
                                <FileText size={16} />
                                <span className="underline font-bold">{msg.texto}</span>
                              </div>
                            ) : (
                              msg.texto
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={enviarMensagemChat} className="p-3 bg-white border-t border-slate-100 rounded-b-2xl flex gap-2 items-center">
                    <button 
                      type="button" 
                      onClick={handleEnviarDocumento}
                      className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                      title="Enviar documento (PDF, Imagem)"
                    >
                      <Paperclip size={18} />
                    </button>
                    <input 
                      type="text" 
                      placeholder="Digite sua mensagem..." 
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <button type="submit" className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-sm cursor-pointer">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modais de Senha, Notificações, Privacidade e Ajuda */}
      <AnimatePresence>
        {modalSenha && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => {
                  setModalSenha(false);
                  setSenhaAtual("");
                  setNovaSenha("");
                  setConfirmarSenha("");
                }} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><KeyRound className="text-orange-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Alterar Senha</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">Confirme sua senha atual para cadastrar uma nova.</p>
              
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
                  className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {salvandoSenha ? <Sparkles className="size-5 animate-spin" /> : <><Check size={16} /> Salvar Nova Senha</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {modalNotificacoes && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setModalNotificacoes(false)} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><Bell className="text-orange-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Notificações</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">Escolha os lembretes e o melhor horário.</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-700">Lembrete de Meditação</span>
                      <span className="text-[10px] text-slate-400">Avisos para pausar e respirar</span>
                    </div>
                    <ToggleSwitch checked={notifMeditacao} onChange={() => setNotifMeditacao(!notifMeditacao)} />
                  </div>
                  {notifMeditacao && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Horário:</span>
                      <input type="time" value={horarioMeditacao} onChange={(e) => setHorarioMeditacao(e.target.value)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-orange-500 outline-none" />
                    </div>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-700">Check-in de Humor</span>
                      <span className="text-[10px] text-slate-400">Notificação para registrar o dia</span>
                    </div>
                    <ToggleSwitch checked={notifDiario} onChange={() => setNotifDiario(!notifDiario)} />
                  </div>
                  {notifDiario && (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">Horário:</span>
                      <input type="time" value={horarioDiario} onChange={(e) => setHorarioDiario(e.target.value)} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-orange-500 outline-none" />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {modalPrivacidade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setModalPrivacidade(false)} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><ShieldCheck className="text-emerald-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Privacidade e LGPD</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                O MindQuest segue rigorosamente as diretrizes da <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Seus dados de humor e preferências são criptografados.
              </p>
              
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="block text-xs font-bold text-orange-700">Compartilhar com Psicólogo</span>
                  <span className="block text-[9px] text-orange-500/80 mt-1 leading-tight">Relatórios anônimos de humor acessíveis pelo profissional vinculado.</span>
                </div>
                <ToggleSwitch checked={compartilharPsicologo} onChange={() => setCompartilharPsicologo(!compartilharPsicologo)} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {modalAjuda && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button 
                type="button"
                onClick={() => setModalAjuda(false)} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><HelpCircle className="text-orange-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Central de Ajuda</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">Envie uma mensagem para nossa equipe.</p>
              
              <form onSubmit={enviarMensagemAjuda} className="space-y-4">
                <div className="relative z-50">
                  <CustomSelect 
                    value={assuntoAjuda}
                    onChange={setAssuntoAjuda}
                    placeholder="Selecione o assunto..."
                    icon={HelpCircle}
                    options={[
                      { value: "duvida", label: "Dúvida" },
                      { value: "solicitacao", label: "Solicitação" },
                      { value: "elogio", label: "Elogio" },
                      { value: "sugestao", label: "Sugestão" }
                    ]}
                  />
                </div>
                
                <textarea rows="3" placeholder="Escreva sua mensagem aqui..." required className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none text-slate-700 relative z-10" />

                <button type="submit" className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors relative z-10 cursor-pointer">
                  <Send size={16} /> Enviar Mensagem
                </button>
              </form>

              <div className="h-px bg-slate-100 my-6 relative z-10" />

              <div className="relative z-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusão</span>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                  <Accessibility className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Apoio à Acessibilidade</h4>
                    <p className="text-[10px] text-blue-700/80 mt-1 leading-relaxed">
                      Suporte especializado pelo e-mail: <strong>acessibilidade@mindquest.com</strong>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* MODAL DE CONFIRMAÇÃO DE LOGOUT */}
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
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative text-center border border-white"
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
                Tem certeza que deseja finalizar a sessão?
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

      <BottomNav />
    </div>
  );
}