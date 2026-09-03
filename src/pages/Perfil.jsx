import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  User, Mail, Heart, Film, Music, Sparkles, ArrowLeft, Save,
  CheckCircle2, Camera, Users, UserPlus, Trash2, Flame, Award,
  Bell, Lock, HelpCircle, Sun, Shield, ChevronRight, Pencil,
  Check, X, Clock3, Headphones, Smile, Send, Accessibility, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, updateEmail } from "firebase/auth";
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

/* =========================================================
   VALIDAÇÃO
========================================================= */
const schema = z.object({
  nome: z.string().min(3, "Como podemos te chamar?"),
  email: z.string().email("Insira um e-mail válido"),
  objetivoPrincipal: z.string().min(1, "Escolha seu objetivo"),
  generoMusical: z.string().min(1, "Escolha um estilo musical"),
  generoFilme: z.string().min(1, "Escolha um estilo de filme"),
  momentoFavorito: z.string().min(1, "Escolha seu momento favorito"),
});

/* =========================================================
   SELECT PERSONALIZADO
========================================================= */
function CustomSelect({ value, onChange, placeholder, options, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((option) => option.value === value);

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
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 size-5 ${selectedOption ? "text-orange-400" : "text-slate-400"}`} />
        )}
        <span className={`text-sm text-left ${selectedOption ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronRight className={`size-4 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden p-1.5 max-h-72 overflow-y-auto"
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  value === option.value ? "bg-orange-50 text-orange-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {option.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   CAMPO EDITÁVEL (NOME E EMAIL)
========================================================= */
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
            className="absolute right-3 top-1/2 -translate-y-1/2 size-9 rounded-xl flex items-center justify-center bg-white border border-slate-100 text-slate-400 shadow-sm hover:text-orange-500 hover:bg-orange-50 hover:border-orange-200 transition-all"
            title={`Editar ${label}`}
          >
            <Pencil size={15} />
          </button>
        ) : (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={onCancel}
              className="size-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
              title="Cancelar"
            >
              <X size={16} />
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="size-9 rounded-xl flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 transition-all"
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

/* =========================================================
   COMPONENTE TOGGLE (CHAVINHA)
========================================================= */
function ToggleSwitch({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center shrink-0 ${
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

/* =========================================================
   PERFIL PRINCIPAL
========================================================= */
export default function Perfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("perfil");
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [userXP, setUserXP] = useState(0);

  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);
  
  const [fotoURL, setFotoURL] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);
  
  const [nomeAmigoBusca, setNomeAmigoBusca] = useState("");
  const [listaAmigos, setListaAmigos] = useState([]);
  
  const [dadosOriginais, setDadosOriginais] = useState({ nome: "", email: "" });

  // ESTADOS DOS MODAIS (POP-UPS)
  const [modalNotificacoes, setModalNotificacoes] = useState(false);
  const [modalPrivacidade, setModalPrivacidade] = useState(false);
  const [modalAjuda, setModalAjuda] = useState(false);

  // ESTADOS INTERNOS DOS MODAIS (Simulação para o TCC)
  const [notifMeditacao, setNotifMeditacao] = useState(true);
  const [horarioMeditacao, setHorarioMeditacao] = useState("08:00"); 
  const [notifDiario, setNotifDiario] = useState(true);
  const [horarioDiario, setHorarioDiario] = useState("20:00"); 
  const [compartilharPsicologo, setCompartilharPsicologo] = useState(false);
  
  // ESTADO PARA O ASSUNTO DA CENTRAL DE AJUDA
  const [assuntoAjuda, setAssuntoAjuda] = useState("");

  const { register, handleSubmit, control, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "", email: "", objetivoPrincipal: "", generoMusical: "", generoFilme: "", momentoFavorito: "noite",
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
        let objetivoAtual = "";
        let musicaAtual = "";
        let filmeAtual = "";
        let momentoAtual = "noite";

        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const dados = userDocSnap.data();
          nomeAtual = dados.nome || "";
          emailAtual = dados.email || user.email || "";
          setUserXP(dados.xp || 0);
          if (dados.fotoURL) setFotoURL(dados.fotoURL);
          objetivoAtual = dados.objetivoPrincipal || "";
          musicaAtual = dados.generoMusical || "";
          filmeAtual = dados.generoFilme || "";
          momentoAtual = dados.momentoFavorito || "noite";
        }

        setDadosOriginais({ nome: nomeAtual, email: emailAtual });

        // Buscar Amigos
        const amigosRef = collection(db, "usuarios", user.uid, "amigos");
        const amigosSnap = await getDocs(amigosRef);
        const amigosCarregados = amigosSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setListaAmigos(amigosCarregados);

        reset({
          nome: nomeAtual,
          email: emailAtual,
          objetivoPrincipal: objetivoAtual,
          generoMusical: musicaAtual,
          generoFilme: filmeAtual,
          momentoFavorito: momentoAtual,
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

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArquivoFoto(file);
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
      
      let urlFinal = fotoURL;

      if (arquivoFoto) {
        const storage = getStorage();
        const imageRef = ref(storage, `perfil/${user.uid}`);
        await uploadBytes(imageRef, arquivoFoto);
        urlFinal = await getDownloadURL(imageRef);
      }

      if (data.email !== user.email) {
        try {
          await updateEmail(user, data.email);
        } catch (error) {
          toast.error("Para alterar o e-mail, faça login novamente antes de tentar.");
          return;
        }
      }

      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, {
        nome: data.nome,
        email: data.email,
        fotoURL: urlFinal,
        objetivoPrincipal: data.objetivoPrincipal,
        generoMusical: data.generoMusical,
        generoFilme: data.generoFilme,
        momentoFavorito: data.momentoFavorito,
      }, { merge: true });

      setDadosOriginais({ nome: data.nome, email: data.email });
      setEditandoNome(false);
      setEditandoEmail(false);
      setArquivoFoto(null);

      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 3000);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar alterações.");
    }
  };

  const adicionarAmigo = async (e) => {
    e.preventDefault();
    if (!nomeAmigoBusca.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const amigosRef = collection(db, "usuarios", user.uid, "amigos");
      const novoAmigoDoc = await addDoc(amigosRef, {
        nome: nomeAmigoBusca.trim(),
        adicionadoEm: new Date().toISOString(),
      });

      setListaAmigos((prev) => [...prev, { id: novoAmigoDoc.id, nome: nomeAmigoBusca.trim() }]);
      setNomeAmigoBusca("");
      toast.success("Amigo adicionado!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao adicionar amigo.");
    }
  };

  const removerAmigo = async (idAmigo) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(doc(db, "usuarios", user.uid, "amigos", idAmigo));
      setListaAmigos((prev) => prev.filter((amigo) => amigo.id !== idAmigo));
      toast.success("Amigo removido.");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao remover amigo.");
    }
  };

  // Função para simular o envio do formulário de ajuda
  const enviarMensagemAjuda = (e) => {
    e.preventDefault();
    if (!assuntoAjuda) {
      toast.error("Por favor, selecione um assunto no menu.");
      return;
    }
    toast.success("Mensagem enviada com sucesso! Retornaremos em breve.");
    setModalAjuda(false);
    setAssuntoAjuda(""); // Limpa o formulário
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28 relative">
      
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
        
        {/* TOPO */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/Menu")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Painel Principal
          </button>

          <div className="flex gap-1 p-1 rounded-2xl bg-white/80 border border-slate-100 shadow-sm backdrop-blur">
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${abaAtiva === "perfil" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              Perfil
            </button>
            <button
              onClick={() => setAbaAtiva("amigos")}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${abaAtiva === "amigos" ? "bg-orange-50 text-orange-600 shadow-sm" : "text-slate-400 hover:text-slate-700"}`}
            >
              <Users size={14} /> Amigos
            </button>
          </div>
        </div>

        {/* HEADER DO PERFIL */}
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

        {/* ==================== ABA PERFIL ==================== */}
        {abaAtiva === "perfil" && (
          <div className="space-y-6">
            
            {/* MINHA JORNADA */}
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

              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-orange-500">
                    <Award size={19} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Conquistas desbloqueadas</h3>
                    <p className="text-[10px] text-slate-500 mt-1">3 de 12 badges conquistadas</p>
                  </div>
                </div>
                <ChevronRight size={17} className="text-orange-300" />
              </div>
            </div>

            {/* DADOS PESSOAIS */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
              <div className="mb-6">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Seus dados</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Informações pessoais</h2>
                <p className="text-xs text-slate-400 mt-1">Clique no lápis para editar.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <input type="file" id="fotoInput" accept="image/*" className="hidden" onChange={handleFotoChange} />
                
                <EditableField icon={User} label="Seu Nome" editing={editandoNome} register={register("nome")} onEdit={iniciarEdicaoNome} onCancel={cancelarEdicaoNome} onConfirm={confirmarEdicaoNome} />
                {errors.nome && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.nome.message}</p>}

                <EditableField icon={Mail} label="E-mail de acesso" type="email" editing={editandoEmail} register={register("email")} onEdit={iniciarEdicaoEmail} onCancel={cancelarEdicaoEmail} onConfirm={confirmarEdicaoEmail} />
                {errors.email && <p className="text-xs text-red-400 ml-2 -mt-2">{errors.email.message}</p>}

                <div className="h-px bg-slate-100 my-7" />

                <div className="mb-5 flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-orange-50 flex items-center justify-center">
                    <Sparkles className="size-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800">Personalize sua experiência</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Escolha o que combina com você.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-[0.18em]">Foco da Jornada</label>
                  <Controller name="objetivoPrincipal" control={control} render={({ field }) => (
                    <CustomSelect {...field} placeholder="Qual é seu foco?" icon={Heart} options={[
                      { value: "ansiedade", label: "Reduzir Ansiedade" }, { value: "estresse", label: "Lidar com Estresse" },
                      { value: "sono", label: "Dormir Melhor" }, { value: "autoestima", label: "Trabalhar Autoestima" },
                      { value: "autoconhecimento", label: "Autoconhecimento" }, { value: "habitos", label: "Criar Hábitos Saudáveis" },
                      { value: "humor", label: "Acompanhar meu Humor" }, { value: "foco", label: "Melhorar Foco" },
                      { value: "relaxamento", label: "Encontrar Relaxamento" },
                    ]} />
                  )} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-[0.18em]">Estilo de Música</label>
                  <Controller name="generoMusical" control={control} render={({ field }) => (
                    <CustomSelect {...field} placeholder="Qual é sua vibe?" icon={Music} options={[
                      { value: "lofi", label: "Lofi / Relaxante" }, { value: "instrumental", label: "Instrumental" },
                      { value: "classica", label: "Clássica" }, { value: "piano", label: "Piano / Soft" },
                      { value: "acustico", label: "Acústico" }, { value: "pop", label: "Pop / Vibrante" },
                      { value: "jazz", label: "Jazz / Soul" }, { value: "ambiente", label: "Ambient / Atmosférica" },
                      { value: "natureza", label: "Sons da Natureza" }, { value: "chuva", label: "Chuva / Sons de Água" },
                    ]} />
                  )} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-[0.18em]">Tipo de Filme</label>
                  <Controller name="generoFilme" control={control} render={({ field }) => (
                    <CustomSelect {...field} placeholder="O que você gosta de assistir?" icon={Film} options={[
                      { value: "comfort", label: "Comfort Movie" }, { value: "comedia", label: "Comédia / Leve" },
                      { value: "romance", label: "Romance" }, { value: "animacao", label: "Animação / Fantasia" },
                      { value: "aventura", label: "Aventura" }, { value: "motivacional", label: "Motivacional" },
                      { value: "documentario", label: "Documentários" }, { value: "drama", label: "Drama Leve" },
                      { value: "musical", label: "Musicais" }, { value: "nostalgico", label: "Nostálgico" },
                    ]} />
                  )} />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-[0.18em]">Melhor Horário</label>
                  <Controller name="momentoFavorito" control={control} render={({ field }) => (
                    <CustomSelect {...field} placeholder="Quando você prefere?" icon={Clock3} options={[
                      { value: "manha", label: "☀️ Manhã" }, { value: "tarde", label: "🌤️ Tarde" }, { value: "noite", label: "🌙 Noite" },
                    ]} />
                  )} />
                </div>

                <button type="submit" className="w-full mt-7 py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-[#E97451] hover:from-orange-500 hover:to-orange-500 text-white font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <Save size={18} /> Salvar Alterações
                </button>
              </form>
            </div>

            {/* CONFIGURAÇÕES E AJUDA */}
            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
              <div className="mb-5">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Segurança</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Configurações</h2>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => setModalNotificacoes(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Bell size={17} className="text-slate-400" /></div>
                    <div className="text-left"><span className="block text-sm font-bold text-slate-700">Notificações e Horários</span><span className="text-[10px] text-slate-400">Personalize seus lembretes</span></div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
                <button type="button" onClick={() => setModalPrivacidade(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50/80 border border-slate-100 hover:bg-orange-50 hover:border-orange-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><Lock size={17} className="text-slate-400" /></div>
                    <div className="text-left"><span className="block text-sm font-bold text-slate-700">Privacidade (LGPD)</span><span className="text-[10px] text-slate-400">Gerenciamento de dados</span></div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
              <div className="mb-5">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Estamos aqui</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Precisa de Ajuda?</h2>
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => setModalAjuda(true)} className="w-full flex items-center justify-between p-4 rounded-2xl bg-orange-50/70 border border-orange-100 hover:bg-orange-100 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm"><HelpCircle size={17} className="text-orange-500" /></div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-orange-600">Central de Ajuda</span>
                      <span className="text-[10px] text-orange-400">Fale conosco e Acessibilidade</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-orange-300" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ABA AMIGOS ==================== */}
        {abaAtiva === "amigos" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white">
            <div className="mb-6">
              <span className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.18em]">Conexões</span>
              <h2 className="text-xl font-black text-slate-800 mt-1">Amigos & Rede de Apoio</h2>
              <p className="text-xs text-slate-400 mt-1">Adicione pessoas para fazer parte da sua jornada.</p>
            </div>

            <form onSubmit={adicionarAmigo} className="flex gap-2 mb-7">
              <div className="relative flex-1">
                <UserPlus className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <input type="text" value={nomeAmigoBusca} onChange={(e) => setNomeAmigoBusca(e.target.value)} placeholder="Nome de usuário..." className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-100 outline-none text-sm focus:bg-white focus:border-orange-300 focus:ring-4 focus:ring-orange-400/10 transition-all" />
              </div>
              <button type="submit" className="px-5 rounded-2xl bg-orange-400 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all">Adicionar</button>
            </form>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sua Rede de Apoio</span>
                <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2.5 py-1 rounded-full">{listaAmigos.length}</span>
              </div>

              {listaAmigos.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="size-9 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-400 font-medium">Nenhum amigo adicionado ainda.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {listaAmigos.map((amigo) => (
                    <div key={amigo.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-orange-100 text-orange-600 font-black flex items-center justify-center">
                          {amigo.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{amigo.nome}</span>
                      </div>
                      <button type="button" onClick={() => removerAmigo(amigo.id)} className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" title="Remover amigo">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* =========================================================
         MODAIS / POP-UPS
      ========================================================= */}
      <AnimatePresence>
        
        {/* 1. Modal Notificações com Horários */}
        {modalNotificacoes && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-6 shadow-2xl relative">
              <button onClick={() => setModalNotificacoes(false)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
              
              <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><Bell className="text-orange-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Notificações</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">Escolha os lembretes e o melhor horário.</p>
              
              <div className="space-y-4">
                
                {/* Lembrete de Meditação */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-700">Lembrete de Meditação</span>
                      <span className="text-[10px] text-slate-400">Avisos para pausar e respirar</span>
                    </div>
                    <ToggleSwitch checked={notifMeditacao} onChange={() => setNotifMeditacao(!notifMeditacao)} />
                  </div>
                  <AnimatePresence>
                    {notifMeditacao && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Horário do aviso:</span>
                          <input 
                            type="time" 
                            value={horarioMeditacao}
                            onChange={(e) => setHorarioMeditacao(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-orange-500 outline-none focus:ring-2 focus:ring-orange-300"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Check-in de Humor */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-sm font-bold text-slate-700">Check-in de Humor</span>
                      <span className="text-[10px] text-slate-400">Notificação para registrar o dia</span>
                    </div>
                    <ToggleSwitch checked={notifDiario} onChange={() => setNotifDiario(!notifDiario)} />
                  </div>
                  <AnimatePresence>
                    {notifDiario && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-500">Horário do aviso:</span>
                          <input 
                            type="time" 
                            value={horarioDiario}
                            onChange={(e) => setHorarioDiario(e.target.value)}
                            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-orange-500 outline-none focus:ring-2 focus:ring-orange-300"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 2. Modal Privacidade (LGPD) */}
        {modalPrivacidade && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative">
              <button onClick={() => setModalPrivacidade(false)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
              
              <div className="size-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4"><ShieldCheck className="text-emerald-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Privacidade e LGPD</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5 leading-relaxed">
                O MindQuest segue rigorosamente as diretrizes da <strong>Lei Geral de Proteção de Dados (LGPD)</strong>. Seus dados de humor, diários e preferências são criptografados e estritamente confidenciais.
              </p>
              
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between gap-3">
                <div className="text-left">
                  <span className="block text-xs font-bold text-orange-700">Compartilhar com Psicólogo</span>
                  <span className="block text-[9px] text-orange-500/80 mt-1 leading-tight">Ao ativar, relatórios anônimos de humor poderão ser acessados pelo seu profissional de saúde vinculado.</span>
                </div>
                <ToggleSwitch checked={compartilharPsicologo} onChange={() => setCompartilharPsicologo(!compartilharPsicologo)} />
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* 3. Modal Central de Ajuda com o CustomSelect */}
        {modalAjuda && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          >
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setModalAjuda(false)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
              
              <div className="size-12 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><HelpCircle className="text-orange-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Central de Ajuda</h2>
              <p className="text-xs text-slate-500 mt-1 mb-6">Envie um e-mail para nossa equipe com sua mensagem.</p>
              
              <form onSubmit={enviarMensagemAjuda} className="space-y-4">
                
                {/* AQUI ESTÁ O CUSTOM SELECT CORRIGIDO */}
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
                
                <textarea 
                  rows="3" 
                  placeholder="Escreva sua mensagem aqui..." 
                  required
                  className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-100 text-sm outline-none focus:ring-2 focus:ring-orange-300 resize-none text-slate-700 placeholder:text-slate-400 relative z-10"
                ></textarea>

                <button type="submit" className="w-full py-3.5 rounded-2xl bg-slate-900 text-white font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors relative z-10">
                  <Send size={16} /> Enviar Mensagem
                </button>
              </form>

              <div className="h-px bg-slate-100 my-6 relative z-10" />

              {/* Acessibilidade */}
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inclusão</span>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-3">
                  <Accessibility className="text-blue-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Apoio à Acessibilidade</h4>
                    <p className="text-[10px] text-blue-700/80 mt-1 leading-relaxed">
                      Se você é uma pessoa com deficiência e precisa de suporte especializado, leitor de tela ou ajustes de contraste, entre em contato pelo e-mail: <strong>acessibilidade@mindquest.com</strong>
                    </p>
                  </div>
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}