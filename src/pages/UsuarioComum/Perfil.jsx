import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {User, Mail, Sparkles, ArrowLeft, Save, CheckCircle2, Camera, Award,Lock, ChevronRight, Pencil, KeyRound, Check, X,ShieldCheck, Stethoscope, LogOut, Copy} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, updateEmail, updatePassword, signOut, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, getDoc, setDoc} from "firebase/firestore";

import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";

import { useTheme } from "../../utils/tema";
import { buscaMetricas, calcularResumoConquistas } from "../../utils/resumoConquistas";
import { textoTermos } from "../../utils/termos";


const getThemeColor = (varName, fallbackHex) => `var(${varName}, ${fallbackHex})`;

// Validação com Zod
const schema = z.object({
  nome: z.string().min(3, "Como podemos te chamar?"),
  email: z.string().email("Insira um e-mail válido"),
});

// Campo editável adaptável
function EditableField({ icon: Icon, label, type = "text", editing, register, onEdit, onCancel, onConfirm }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">
          {label}
        </label>
        {editing && (
          <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[9px] font-bold uppercase tracking-wider">
            Editando
          </span>
        )}
      </div>

      <div className="relative">
        <Icon 
          style={{ color: editing ? getThemeColor('--primary', '#E97451') : undefined }}
          className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 z-10 ${!editing ? "text-slate-400" : ""}`} 
        />
        <input
          type={type}
          disabled={!editing}
          {...register}
          style={{
            borderColor: editing ? getThemeColor('--primary', '#E97451') : undefined
          }}
          className={`w-full pl-12 py-4 rounded-2xl border outline-none text-sm font-medium transition-all ${
            editing
              ? "bg-white ring-4 text-slate-700 pr-24 shadow-sm"
              : "bg-slate-50/80 border-slate-100 text-slate-700 pr-14"
          }`}
        />

        {!editing ? (
          <button
            type="button"
            onClick={onEdit}
            style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.2)') }}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-xl flex items-center justify-center bg-white border text-slate-400 shadow-xs hover:text-[--primary] hover:bg-orange-50 transition-all cursor-pointer"
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
              style={{ 
                color: getThemeColor('--primary', '#E97451'),
                backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)')
              }}
              className="size-9 rounded-xl flex items-center justify-center hover:opacity-80 transition-all cursor-pointer"
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

export default function Perfil() {
  const navigate = useNavigate();
  const { aplicarTema } = useTheme();
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("perfil"); 
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [userXP, setUserXP] = useState(0);
  const [resumoConquistas, setResumoConquistas] = useState({ ganhos: 0, total: 0, percent: 0 });
  
  const [codigoUnico, setcodigoUnico] = useState("");

  const [salvaPerfil, setsalvaPerfil] = useState(false);
  const [editaNome, seteditaNome] = useState(false);
  const [editaEmail, seteditaEmail] = useState(false);
  
  const [fotoURL, setFotoURL] = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState({ nome: "", email: "" });

  const [terapeutaVinculado, setTerapeutaVinculado] = useState(null);

  const [modalPrivacidade, setModalPrivacidade] = useState(false);
  const [modalSenha, setModalSenha] = useState(false);
  const [modalLogout, setModalLogout] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setconfirmaSenha] = useState("");
  const [salvaSenha, setsalvaSenha] = useState(false);

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

          const temaSalvo = dados.temaAtivo || dados.temaEquipado || dados.tema;
          if (temaSalvo) {
            aplicarTema(temaSalvo);
          }

          if (dados.codigoUnico) {
            setcodigoUnico(dados.codigoUnico);
          } else {
            const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            let novoCodigo = "PAC-";
            for (let i = 0; i < 5; i++) {
              novoCodigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
            }
            await setDoc(userDocRef, { codigoUnico: novoCodigo }, { merge: true });
            setcodigoUnico(novoCodigo);
          }

          // Conquistas: níveis conquistados / níveis totais
          try {
            const metricas = await buscaMetricas(db, user.uid, dados);
            setResumoConquistas(calcularResumoConquistas(metricas));
          } catch (err) {
            console.error("Erro ao calcular conquistas:", err);
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
      }, [navigate, reset, aplicarTema]);

      const handleLogOut = async () => {
        try {
          await signOut(auth);
          toast.success("Sessão encerrada com sucesso.");
          navigate("/");
        } catch {
          toast.error("Erro ao sair da conta.");
        }
      };

      const handleFotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setFotoURL(reader.result);
        reader.readAsDataURL(file);
      };

      const iniciarEdicaoNome = () => seteditaNome(true);
      const cancelarEdicaoNome = () => {
        setValue("nome", dadosOriginais.nome);
        seteditaNome(false);
      };
      const confirmarEdicaoNome = () => seteditaNome(false);

      const iniciarEdicaoEmail = () => seteditaEmail(true);
      const cancelarEdicaoEmail = () => {
        setValue("email", dadosOriginais.email);
        seteditaEmail(false);
      };
      const confirmarEdicaoEmail = () => seteditaEmail(false);

      const onSubmit = async (data) => {
        try {
          const user = auth.currentUser;
          if (!user) return;

          setsalvaPerfil(true);

          if (data.email.trim() !== user.email) {
            try {
              await updateEmail(user, data.email.trim());
            } catch (authErr) {
              if (authErr.code === "auth/requires-recent-login") {
                toast.error("Por segurança, saia e entre novamente para alterar o e-mail.");
                setsalvaPerfil(false);
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
          seteditaNome(false);
          seteditaEmail(false);

          setShowSuccessBadge(true);
          setTimeout(() => setShowSuccessBadge(false), 3000);
          toast.success("Perfil atualizado com sucesso!");
        } catch (error) {
          console.error("Erro ao salvar perfil:", error);
          toast.error("Erro ao salvar alterações.");
        } finally {
          setsalvaPerfil(false);
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
        if (novaSenha !== confirmaSenha) {
          toast.error("As novas senhas não coincidem.");
          return;
        }
        if (senhaAtual === novaSenha) {
          toast.error("A nova senha deve ser diferente da senha atual.");
          return;
        }

        setsalvaSenha(true);
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
          setconfirmaSenha("");
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
          setsalvaSenha(false);
        }
      };

      if (loading) {
        return (
          <div 
            style={{ backgroundColor: getThemeColor('--bg-main', 'var(--bg-main, #FFFBF9)') }} 
            className="min-h-screen flex items-center justify-center"
          >
            <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} className="animate-spin size-10" />
          </div>
        );
      }

      const nivelAtual = Math.floor(userXP / 100) + 1;
      const xpProgresso = userXP % 100;
      const proximoNivelXP = nivelAtual * 100;

  return (
    <div 
      style={{ backgroundColor: getThemeColor('--bg-main', 'var(--bg-main, #FFFBF9)') }}
      className="min-h-screen p-4 md:p-8 text-slate-800 antialiased font-sans pb-32 relative transition-colors duration-300"
    >
      
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
        
        {/* Topo com Botão de Voltar, Sair e Abas */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <button 
              type="button"
              onClick={() => navigate("/Menu")} 
              style={{ color: getThemeColor('--primary', '#E97451') }}
              className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-colors cursor-pointer"
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

          <div className="flex gap-1 p-1 rounded-2xl bg-white/80 border border-slate-100 shadow-xs backdrop-blur w-full sm:w-auto justify-center">
            <button
              type="button"
              onClick={() => setAbaAtiva("perfil")}
              style={{
                backgroundColor: abaAtiva === "perfil" ? getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') : undefined,
                color: abaAtiva === "perfil" ? getThemeColor('--primary', '#E97451') : undefined
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${abaAtiva !== "perfil" ? "text-slate-400 hover:text-slate-700" : ""}`}
            >
              Perfil
            </button>
            <button
              type="button"
              onClick={() => setAbaAtiva("terapeuta")}
              style={{
                backgroundColor: abaAtiva === "terapeuta" ? getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.15)') : undefined,
                color: abaAtiva === "terapeuta" ? getThemeColor('--primary', '#E97451') : undefined
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${abaAtiva !== "terapeuta" ? "text-slate-400 hover:text-slate-700" : ""}`}
            >
              <Stethoscope size={13} /> Terapeuta
            </button>
          </div>
        </div>

        {/* Header do Perfil */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-slate-900/5 p-7 md:p-9 text-center"
        >
          <div
            className="relative size-28 mx-auto mb-5 cursor-pointer group"
            onClick={() => document.getElementById("fotoInput").click()}
          >
            <div 
              style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.3)') }}
              className="size-full rounded-[2.25rem] bg-gradient-to-br from-orange-200 via-pink-200 to-orange-300 flex items-center justify-center overflow-hidden border-4 shadow-lg shadow-orange-900/10"
            >
              {fotoURL ? (
                <img src={fotoURL} alt="Seu perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="size-12 text-white" />
              )}
            </div>
            
            <div className="absolute inset-0 bg-slate-900/40 rounded-[2.25rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
              <Camera className="size-8 text-white" />
            </div>

            <div 
              style={{ borderColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.2)') }}
              className="absolute -bottom-2 -right-4 bg-white px-3 py-1.5 rounded-full shadow-md border flex items-center gap-1.5"
            >
              <Sparkles style={{ color: getThemeColor('--primary', '#E97451') }} className="size-3" />
              <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-black tracking-wide">LVL {nivelAtual}</span>
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
                style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                className="h-full rounded-full"
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
            
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xs border border-white">
              <div className="mb-6 flex justify-between items-end">
                <div>
                  <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-[0.18em]">Seus dados</span>
                  <h2 className="text-lg font-black text-slate-800 mt-1">Informações pessoais</h2>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input type="file" id="fotoInput" accept="image/*" className="hidden" onChange={handleFotoChange} />
                
                <EditableField 
                  icon={User} 
                  label="Seu Nome" 
                  editing={editaNome} 
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
                  editing={editaEmail} 
                  register={register("email")} 
                  onEdit={iniciarEdicaoEmail} 
                  onCancel={cancelarEdicaoEmail} 
                  onConfirm={confirmarEdicaoEmail} 
                />
                {errors.email && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.email.message}</p>}

                <div className="h-px bg-slate-100 my-7" />

                <button 
                  type="submit" 
                  disabled={salvaPerfil}
                  style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                  className="w-full mt-7 py-4 rounded-2xl hover:brightness-105 text-white font-bold shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {salvaPerfil ? <Sparkles className="size-5 animate-spin" /> : <><Save size={18} /> Salvar Alterações</>}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xs border border-white">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-[0.18em]">Seu progresso</span>
                  <h2 className="text-lg font-black text-slate-800 mt-1">Minha Jornada</h2>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-[10px] font-bold">
                  <CheckCircle2 size={12} /> Ativo
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate("/conquistas")}
                style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.05)') }}
                className="w-full mt-4 p-4 rounded-2xl border border-orange-100/60 flex items-center justify-between text-left transition-all hover:border-orange-200 active:scale-[0.99] cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    style={{ color: getThemeColor('--primary', '#E97451') }}
                    className="size-11 rounded-xl bg-white shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform"
                  >
                    <Award size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Conquistas desbloqueadas</h3>
                    <p className="text-[10px] text-slate-500 mt-1">
                      {resumoConquistas.ganhos} de {resumoConquistas.total} níveis conquistados
                    </p>
                    <div className="h-1.5 mt-2 w-32 rounded-full bg-white/70 overflow-hidden">
                      <div
                        style={{
                          width: `${resumoConquistas.percent}%`,
                          backgroundColor: getThemeColor('--primary', '#E97451'),
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
                <ChevronRight style={{ color: getThemeColor('--primary', '#E97451') }} className="size-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Secção de Configurações Corrigida */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xs border border-white">
              <div className="mb-5">
                <span style={{ color: getThemeColor('--primary', '#E97451') }} className="text-[10px] font-bold uppercase tracking-[0.18em]">Segurança</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Configurações</h2>
              </div>
              <div className="space-y-2">
                <button 
                  type="button" 
                  onClick={() => setModalSenha(true)} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                      <KeyRound size={17} style={{ color: getThemeColor('--primary', '#E97451') }} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-white">Alterar Senha</span>
                      <span className="text-[10px] text-white">Atualize sua senha de acesso</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalPrivacidade(true)} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50/40 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-xs">
                      <Lock size={17} style={{ color: getThemeColor('--primary', '#E97451') }} />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-white">Privacidade (LGPD)</span>
                      <span className="text-[10px] text-white">Gerenciamento de dados</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Aba Terapeuta */}
        {abaAtiva === "terapeuta" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-xs border border-white space-y-6">
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.18em]">Acompanhamento Clínico</span>
                <h2 className="text-xl font-black text-slate-800 mt-1">Seu Terapeuta</h2>
              </div>
              <div className="bg-blue-50 text-blue-600 p-2.5 rounded-2xl">
                <Stethoscope size={20} />
              </div>
            </div>

            {/* Código sempre visível (independente de ter vínculo) */}
            <div className="p-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-center space-y-3">
              <h3 className="text-sm font-bold text-slate-800">Seu Código de Paciente</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-xs mx-auto">
                Compartilhe este código com os profissionais que acompanham sua evolução para que eles tenham acesso ao seu histórico.
              </p>
              
              <div className="flex items-center justify-center gap-3 mt-2">
                <div className="px-5 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="text-xl font-mono font-black tracking-widest text-slate-800">
                    {codigoUnico || "Carregando..."}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (codigoUnico) {
                      navigator.clipboard.writeText(codigoUnico);
                      toast.success("Código copiado!");
                    }
                  }}
                  style={{ 
                    backgroundColor: getThemeColor('--primary', '#E97451'),
                    color: "white"
                  }}
                  className="p-3 rounded-xl transition-all cursor-pointer shadow-md hover:brightness-105 active:scale-95"
                  title="Copiar código"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            {/* Exibição do vínculo atual (se houver) */}
            {terapeutaVinculado ? (
              <div className="pt-2 space-y-3">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em] ml-1">
                  Profissional Conectado
                </h4>
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
              </div>
            ) : (
              <div className="pt-2 text-center">
                <p className="text-[11px] font-medium text-slate-400">
                  Nenhum profissional vinculado no momento.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modais de Senha e Privacidade */}
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
                  setconfirmaSenha("");
                }} 
                className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              
              <div style={{ backgroundColor: getThemeColor('--primary-light', 'rgba(233, 116, 81, 0.1)') }} className="size-12 rounded-2xl flex items-center justify-center mb-4">
                <KeyRound style={{ color: getThemeColor('--primary', '#E97451') }} size={24} />
              </div>
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
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2"
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
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2"
                    required 
                    minLength={6} 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Repita a nova senha" 
                    value={confirmaSenha} 
                    onChange={(e) => setconfirmaSenha(e.target.value)} 
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2"
                    required 
                    minLength={6} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={salvaSenha}
                  style={{ backgroundColor: getThemeColor('--primary', '#E97451') }}
                  className="w-full py-4 rounded-2xl hover:brightness-105 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {salvaSenha ? <Sparkles className="size-5 animate-spin" /> : <><Check size={16} /> Salvar Nova Senha</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {modalPrivacidade && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 50, scale: 0.95 }} 
              animate={{ y: 0, scale: 1 }} 
              exit={{ y: 50, scale: 0.95 }} 
              className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <ShieldCheck className="text-emerald-500 size-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Privacidade e LGPD</h2>
                    <p className="text-[10px] text-slate-400">Documento Oficial MindQuest</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setModalPrivacidade(false)} 
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto custom-scrollbar pr-2 pb-2">
                {textoTermos}
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

              <div className="size-14 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-xs">
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